import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import User from "@/models/User";
import OTPSession from "@/models/OTPSession";
import bcrypt from "bcryptjs";
import { setCookie } from "@/lib/cookies";
import { SignJWT } from "jose";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { otp } = await request.json();

    if (!otp) {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.userId).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cleanNumber = user.whatsappNumber.trim();

    // 1. Find recent OTP session
    const otpSession = await OTPSession.findOne({
      whatsappNumber: cleanNumber,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpSession) {
      return NextResponse.json(
        { error: "No valid OTP found. Please request a new one." },
        { status: 400 },
      );
    }

    // 2. Check attempts
    otpSession.attempts += 1;
    if (otpSession.attempts > 5) {
      const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      await OTPSession.updateMany(
        { whatsappNumber: cleanNumber },
        { $set: { lockedUntil } },
      );
      await OTPSession.deleteOne({ _id: otpSession._id });
      return NextResponse.json(
        { error: "Too many failed attempts. Number locked for 30 minutes." },
        { status: 429 },
      );
    }

    // 3. Verify OTP
    const isValid = await bcrypt.compare(otp, otpSession.otpHash);
    if (!isValid) {
      await otpSession.save();
      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 },
      );
    }

    // 4. Delete the OTP session
    await OTPSession.deleteOne({ _id: otpSession._id });

    // 5. Generate a secure token to proceed to step 2 (change number)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      userId: session.userId,
      action: "change_phone",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m") // 15 mins to complete the flow
      .sign(secret);

    // 6. Set the cookie
    // We import and use a custom helper if available, or manually set it.
    // Looking at lib/cookies.ts, we use the standard Next.js approach or cookies() from next/headers.
    // Let's use next/headers
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.set("phone_change_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Verify Current OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
