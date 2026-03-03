import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import User from "@/models/User";
import OTPSession from "@/models/OTPSession";
import bcrypt from "bcryptjs";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.userId).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cleanNumber = user.whatsappNumber.trim();

    // 1. Check lockout
    const lockedSession = await OTPSession.findOne({
      whatsappNumber: cleanNumber,
      lockedUntil: { $gt: new Date() },
    });

    if (lockedSession) {
      const minutesLeft = Math.ceil(
        (lockedSession.lockedUntil!.getTime() - Date.now()) / 60000,
      );
      return NextResponse.json(
        {
          error: `Too many failed attempts. Please try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`,
        },
        { status: 429 },
      );
    }

    // 2. Rate limiting (max 3 OTPs in 10 mins)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentAttempts = await OTPSession.countDocuments({
      whatsappNumber: cleanNumber,
      createdAt: { $gte: tenMinutesAgo },
    });

    if (recentAttempts >= 3) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in 10 minutes." },
        { status: 429 },
      );
    }

    // 3. Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    console.log(
      `\n=================================\n[TESTING] OTP for ${cleanNumber} (Current Number): ${otp}\n=================================\n`,
    );

    // 4. Hash OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // 5. Save OTPSession
    await OTPSession.create({
      whatsappNumber: cleanNumber,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
    });

    // 6. Send OTP
    await sendWhatsAppMessage(
      cleanNumber,
      `Your code to change your WhatsApp number is: *${otp}*\n\nThis code expires in 5 minutes. Do not share it with anyone.`,
    );

    return NextResponse.json(
      { message: "OTP sent to current number successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Send Current OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
