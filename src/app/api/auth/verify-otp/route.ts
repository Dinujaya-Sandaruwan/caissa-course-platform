import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import OTPSession from "@/models/OTPSession";
import User from "@/models/User";
import { signToken } from "@/lib/jwt";
import { setSessionCookie } from "@/lib/cookies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { whatsappNumber, otp } = body;

    // 1. Validate input
    if (!whatsappNumber || !otp) {
      return NextResponse.json(
        { error: "WhatsApp number and OTP are required" },
        { status: 400 },
      );
    }

    await connectDB();

    // 2. Find the most recent valid OTPSession
    const session = await OTPSession.findOne({
      whatsappNumber: whatsappNumber.trim(),
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!session) {
      return NextResponse.json(
        { error: "No valid OTP found. Please request a new one." },
        { status: 400 },
      );
    }

    // 3. Check attempts — max 5
    session.attempts += 1;

    if (session.attempts > 5) {
      await OTPSession.deleteOne({ _id: session._id });
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 429 },
      );
    }

    // 4. Compare OTP with stored hash
    const isValid = await bcrypt.compare(otp, session.otpHash);

    if (!isValid) {
      await session.save();
      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 },
      );
    }

    // 5. OTP is valid — delete the session
    await OTPSession.deleteOne({ _id: session._id });

    // 6. Look up User by whatsappNumber
    const user = await User.findOne({
      whatsappNumber: whatsappNumber.trim(),
    });

    // 7. New user — temporary token
    if (!user) {
      const token = await signToken({
        whatsappNumber: whatsappNumber.trim(),
        isNewUser: true,
      });

      await setSessionCookie(token);

      return NextResponse.json({ isNewUser: true }, { status: 200 });
    }

    // 8. Existing user — full session token
    user.lastLoginAt = new Date();
    await user.save();

    const token = await signToken({
      userId: user._id!.toString(),
      role: user.role,
      whatsappNumber: user.whatsappNumber,
    });

    await setSessionCookie(token);

    return NextResponse.json(
      { isNewUser: false, role: user.role },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
