import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import User from "@/models/User";
import OTPSession from "@/models/OTPSession";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { signToken } from "@/lib/jwt";
import { setSessionCookie } from "@/lib/cookies";

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

    const { newWhatsappNumber, otp } = await request.json();

    if (!newWhatsappNumber || !otp) {
      return NextResponse.json(
        { error: "New WhatsApp number and OTP are required" },
        { status: 400 },
      );
    }

    const cleanNewNumber = newWhatsappNumber.trim();

    await connectDB();

    // 2. Double-check if the new number belongs to another user
    const existingUser = await User.findOne({
      whatsappNumber: cleanNewNumber,
    }).lean();
    if (existingUser && existingUser._id.toString() !== session.userId) {
      return NextResponse.json(
        {
          error:
            "This WhatsApp number is already registered to another account",
        },
        { status: 409 },
      );
    }

    // 3. Find recent OTP session
    const otpSession = await OTPSession.findOne({
      whatsappNumber: cleanNewNumber,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpSession) {
      return NextResponse.json(
        { error: "No valid OTP found. Please request a new one." },
        { status: 400 },
      );
    }

    // 4. Check attempts
    otpSession.attempts += 1;
    if (otpSession.attempts > 5) {
      const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      await OTPSession.updateMany(
        { whatsappNumber: cleanNewNumber },
        { $set: { lockedUntil } },
      );
      await OTPSession.deleteOne({ _id: otpSession._id });
      return NextResponse.json(
        { error: "Too many failed attempts. Number locked for 30 minutes." },
        { status: 429 },
      );
    }

    // 5. Verify OTP
    const isValid = await bcrypt.compare(otp, otpSession.otpHash);
    if (!isValid) {
      await otpSession.save();
      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 },
      );
    }

    // 6. Delete the OTP session
    await OTPSession.deleteOne({ _id: otpSession._id });

    // 7. Update User document with the new number
    const updatedUser = await User.findByIdAndUpdate(
      session.userId,
      { $set: { whatsappNumber: cleanNewNumber } },
      { new: true },
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 8. Generate a new session JWT because the old one contains the old whatsappNumber
    const token = await signToken({
      userId: updatedUser._id!.toString(),
      role: updatedUser.role,
      whatsappNumber: updatedUser.whatsappNumber,
    });

    // Set the new session cookie
    await setSessionCookie(token);

    // 9. Clear the temporary phone change cookie
    cookieStore.delete("phone_change_token");

    return NextResponse.json(
      { success: true, newWhatsappNumber: cleanNewNumber },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verify New OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
