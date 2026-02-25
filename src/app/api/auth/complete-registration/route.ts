/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
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

    const contentType = request.headers.get("content-type") || "";
    const body: Record<string, any> = {};
    let profilePhotoUrl: string | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        if (key !== "profilePicture") {
          body[key] = value;
        }
      });

      const file = formData.get("profilePicture") as File | null;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir =
          process.env.UPLOAD_DIR || path.join(process.cwd(), "public/uploads");

        // Ensure directory exists
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch {
          // ignore if exists
        }

        const fileName = `${crypto.randomUUID()}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        // The URL should be relative for next/image or standard img tag
        // assuming UPLOAD_DIR is inside public/
        profilePhotoUrl = `/uploads/${fileName}`;
      }
    } else {
      const jsonBody = await request.json();
      Object.assign(body, jsonBody);
    }

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
      profilePhoto: profilePhotoUrl,
      lastLoginAt: new Date(),
    });

    // 5. Create role-specific profile
    if (role === "coach") {
      await CoachProfile.create({
        userId: user._id,
        dateOfBirth: body.dateOfBirth,
        address: body.address,
        fideId: body.fideId,
        fideRating: Number(body.fideRating) || 0,
        cvUrl: body.cvUrl,
        bio: body.bio,
        specializations:
          typeof body.specializations === "string"
            ? JSON.parse(body.specializations)
            : body.specializations || [],
        coachAchievements:
          typeof body.coachAchievements === "string"
            ? JSON.parse(body.coachAchievements)
            : body.coachAchievements || [],
        playerAchievements:
          typeof body.playerAchievements === "string"
            ? JSON.parse(body.playerAchievements)
            : body.playerAchievements || [],
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
