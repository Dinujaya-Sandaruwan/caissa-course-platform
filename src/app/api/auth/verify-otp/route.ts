import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import OTPSession from "@/models/OTPSession";
import User from "@/models/User";
import CoachProfile from "@/models/CoachProfile";
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
      // Lock this number for 30 minutes
      const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      await OTPSession.updateMany(
        { whatsappNumber: whatsappNumber.trim() },
        { $set: { lockedUntil } },
      );
      await OTPSession.deleteOne({ _id: session._id });
      return NextResponse.json(
        {
          error:
            "Too many failed attempts. This number is locked for 30 minutes.",
        },
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

    // 6. Look up ALL Users by whatsappNumber
    const users = await User.find({
      whatsappNumber: whatsappNumber.trim(),
    });

    const requestedRole = body.loginType || "student";
    const targetUser = users.find((u) => u.role === requestedRole);

    if (targetUser && targetUser.status === "suspended") {
      return NextResponse.json(
        {
          error: `Your ${requestedRole} account has been suspended. Please contact support.`,
        },
        { status: 403 },
      );
    }

    // 7. New user for this specific role — temporary token
    if (!targetUser) {
      // We might have other roles, but for the requested role, they are new.
      const token = await signToken({
        whatsappNumber: whatsappNumber.trim(),
        isNewUser: true,
      });

      await setSessionCookie(token);

      return NextResponse.json({ isNewUser: true }, { status: 200 });
    }

    // 8. Existing user for requested role — full session token
    targetUser.lastLoginAt = new Date();
    await targetUser.save();

    const availableRoles: Record<string, string> = {};
    users.forEach((u) => {
      if (u.status === "active") {
        availableRoles[u.role] = u._id!.toString();
      }
    });

    const token = await signToken({
      userId: targetUser._id!.toString(),
      role: targetUser.role,
      whatsappNumber: targetUser.whatsappNumber,
      status: targetUser.status,
      availableRoles,
    });

    await setSessionCookie(token);

    // 9. For coaches, include verification status
    let verificationStatus: string | undefined;
    if (targetUser.role === "coach") {
      const coachProfile = await CoachProfile.findOne({
        userId: targetUser._id,
      });
      verificationStatus = coachProfile?.verificationStatus || "pending";
    }

    return NextResponse.json(
      { isNewUser: false, role: targetUser.role, verificationStatus },
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
