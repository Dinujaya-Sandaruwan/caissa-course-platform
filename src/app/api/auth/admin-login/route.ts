import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { setSessionCookie } from "@/lib/cookies";

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

    // Create session token
    const payload = {
      userId: user._id.toString(),
      whatsappNumber: user.whatsappNumber,
      role: user.role,
    };

    const token = await signToken(payload);
    await setSessionCookie(token);

    return NextResponse.json({ success: true, redirect: "/manager/dashboard" });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again later." },
      { status: 500 },
    );
  }
}
