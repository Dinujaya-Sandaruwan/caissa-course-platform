import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import User from "@/models/User";
import CoachProfile from "@/models/CoachProfile";
import StudentProfile from "@/models/StudentProfile";
import { signToken } from "@/lib/jwt";
import { setSessionCookie } from "@/lib/cookies";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the incoming session — must be a new-user token
    const session = await getSessionUser();

    if (!session || !session.isNewUser) {
      return NextResponse.json(
        { error: "Unauthorized. Please verify your OTP first." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { name, email, role } = body;

    // 2. Validate input
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!role || !["student", "coach"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be either 'student' or 'coach'" },
        { status: 400 },
      );
    }

    await connectDB();

    // 3. Check if user already exists (edge case)
    const existingUser = await User.findOne({
      whatsappNumber: session.whatsappNumber,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already registered" },
        { status: 409 },
      );
    }

    // 4. Create the User document
    const user = await User.create({
      whatsappNumber: session.whatsappNumber,
      name: name.trim(),
      email: email?.trim() || undefined,
      role,
      lastLoginAt: new Date(),
    });

    // 5. Create role-specific profile
    if (role === "coach") {
      await CoachProfile.create({
        userId: user._id,
        dateOfBirth: body.dateOfBirth,
        address: body.address,
        fideId: body.fideId,
        fideRating: body.fideRating,
        cvUrl: body.cvUrl,
        coachAchievements: body.coachAchievements || [],
        playerAchievements: body.playerAchievements || [],
        verificationStatus: "pending",
      });
    } else if (role === "student") {
      await StudentProfile.create({
        userId: user._id,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        fideId: body.fideId,
        skillLevel: body.skillLevel || "beginner",
        city: body.city,
        preferredLanguage: body.preferredLanguage || "en",
        parentName: body.parentName,
        parentDateOfBirth: body.parentDateOfBirth,
      });
    }

    // 6. Generate a full session JWT and replace the temporary cookie
    const token = await signToken({
      userId: user._id!.toString(),
      role: user.role,
      whatsappNumber: user.whatsappNumber,
    });

    await setSessionCookie(token);

    // 7. Return success with role for frontend redirect
    return NextResponse.json(
      { message: "Registration complete", role: user.role },
      { status: 201 },
    );
  } catch (error) {
    console.error("Complete registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
