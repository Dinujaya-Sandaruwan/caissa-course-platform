import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import OTPSession from "@/models/OTPSession";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { whatsappNumber } = body;

    // 1. Validate input
    if (
      !whatsappNumber ||
      typeof whatsappNumber !== "string" ||
      !whatsappNumber.trim()
    ) {
      return NextResponse.json(
        { error: "WhatsApp number is required" },
        { status: 400 },
      );
    }

    const cleanNumber = whatsappNumber.trim();

    await connectDB();

    // 2. Check lockout — if any session for this number has lockedUntil in the future, block
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

    // 3. Rate limiting — max 3 OTPs in the last 10 minutes
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

    // 4. Generate a random 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    console.log(`[DEV OTP LOGGER] OTP for ${cleanNumber} is: ${otp}`);

    // 5. Hash the OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // 6. Save OTPSession with 5-minute expiry
    await OTPSession.create({
      whatsappNumber: cleanNumber,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // 7. Send OTP via WhatsApp
    await sendWhatsAppMessage(
      cleanNumber,
      `Your Caissa Chess Academy verification code is: *${otp}*\n\nThis code expires in 5 minutes. Do not share it with anyone.`,
    );

    // 8. Return success (never return the OTP in the response)
    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
