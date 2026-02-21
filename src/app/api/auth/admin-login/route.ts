import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import OTPSession from "@/models/OTPSession";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Find the user by username, only allow managers
    const user = await User.findOne({
      username: username.trim(),
      role: "manager",
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials or unauthorized" },
        { status: 401 },
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { error: "Your manager account has been suspended" },
        { status: 403 },
      );
    }

    if (!user.password) {
      return NextResponse.json(
        {
          error: "This manager account has not been set up for password login",
        },
        { status: 401 },
      );
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Rate limiting — max 3 OTPs in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentAttempts = await OTPSession.countDocuments({
      whatsappNumber: user.whatsappNumber,
      createdAt: { $gte: tenMinutesAgo },
    });

    if (recentAttempts >= 3) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in 10 minutes." },
        { status: 429 },
      );
    }

    // Generate a random 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);

    // Save OTPSession with 5-minute expiry
    await OTPSession.create({
      whatsappNumber: user.whatsappNumber,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Send OTP via WhatsApp
    await sendWhatsAppMessage(
      user.whatsappNumber,
      `Your Caissa Manager login verification code is: *${otp}*\n\nThis code expires in 5 minutes. Do not share it with anyone.`,
    );

    // Return success without logging them in yet, returning the whatsapp number for the next step UI
    return NextResponse.json({
      success: true,
      requireOtp: true,
      whatsappNumber: user.whatsappNumber,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again later." },
      { status: 500 },
    );
  }
}
