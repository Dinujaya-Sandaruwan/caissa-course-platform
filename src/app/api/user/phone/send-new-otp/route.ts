import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import User from "@/models/User";
import OTPSession from "@/models/OTPSession";
import bcrypt from "bcryptjs";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Verify the phone change token
    const cookieStore = await cookies();
    const phoneTokenCookie = cookieStore.get("phone_change_token");

    if (!phoneTokenCookie?.value) {
      return NextResponse.json(
        { error: "Session expired. Please verify your current number again." },
        { status: 401 },
      );
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(phoneTokenCookie.value, secret);

      if (
        payload.userId !== session.userId ||
        payload.action !== "change_phone"
      ) {
        throw new Error("Invalid token payload");
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired session. Please start over." },
        { status: 401 },
      );
    }

    const { newWhatsappNumber } = await request.json();

    if (
      !newWhatsappNumber ||
      typeof newWhatsappNumber !== "string" ||
      !newWhatsappNumber.trim()
    ) {
      return NextResponse.json(
        { error: "New WhatsApp number is required" },
        { status: 400 },
      );
    }

    const cleanNewNumber = newWhatsappNumber.trim();

    await connectDB();

    // 2. Check if the new number belongs to another user
    const existingUser = await User.findOne({
      whatsappNumber: cleanNewNumber,
    }).lean();
    if (existingUser) {
      if (existingUser._id.toString() === session.userId) {
        return NextResponse.json(
          { error: "This is already your current mobile number" },
          { status: 400 },
        );
      }
      return NextResponse.json(
        {
          error:
            "This WhatsApp number is already registered to another account",
        },
        { status: 409 },
      );
    }

    // 3. Check lockout
    const lockedSession = await OTPSession.findOne({
      whatsappNumber: cleanNewNumber,
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

    // 4. Rate limiting (max 3 OTPs in 10 mins)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentAttempts = await OTPSession.countDocuments({
      whatsappNumber: cleanNewNumber,
      createdAt: { $gte: tenMinutesAgo },
    });

    if (recentAttempts >= 3) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in 10 minutes." },
        { status: 429 },
      );
    }

    // 5. Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    console.log(
      `\n=================================\n[TESTING] OTP for ${cleanNewNumber} (New Number): ${otp}\n=================================\n`,
    );

    // 6. Hash OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // 7. Save OTPSession
    await OTPSession.create({
      whatsappNumber: cleanNewNumber,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
    });

    // 8. Send OTP via WhatsApp
    await sendWhatsAppMessage(
      cleanNewNumber,
      `Your code to verify your new WhatsApp number is: *${otp}*\n\nThis code expires in 5 minutes. Do not share it with anyone.`,
    );

    return NextResponse.json(
      { message: "OTP sent to new number successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Send New OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
