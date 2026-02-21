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

    // 2. Rate limiting — max 3 OTPs in the last 10 minutes
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

    // 3. Generate a random 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    console.log(`[DEV OTP LOGGER] OTP for ${cleanNumber} is: ${otp}`);

    // 4. Hash the OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // 5. Save OTPSession with 5-minute expiry
    await OTPSession.create({
      whatsappNumber: cleanNumber,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // 6. Send OTP via WhatsApp
    await sendWhatsAppMessage(
      cleanNumber,
      `Your Caissa Chess Academy verification code is: *${otp}*\n\nThis code expires in 5 minutes. Do not share it with anyone.`,
    );

    // 7. Return success (never return the OTP in the response)
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
