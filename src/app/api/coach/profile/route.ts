import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import User from "@/models/User";
import CoachProfile from "@/models/CoachProfile";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.userId).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const coachProfile = await CoachProfile.findOne({
      userId: session.userId,
    }).lean();
    if (!coachProfile) {
      return NextResponse.json(
        { error: "Coach profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ user, coachProfile }, { status: 200 });
  } catch (error: Error | unknown) {
    console.error("Failed to load coach profile:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const name = formData.get("name") as string | null;
    const nickname = formData.get("nickname") as string | null;
    const email = formData.get("email") as string | null;
    const address = formData.get("address") as string | null;
    const bio = formData.get("bio") as string | null;
    let specializations: string[] = [];

    const specData = formData.get("specializations");
    if (specData && typeof specData === "string") {
      try {
        specializations = JSON.parse(specData);
      } catch {
        // Fallback if not stringified JSON: split by comma
        specializations = specData
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const processFile = async (
      file: File | null,
    ): Promise<string | undefined> => {
      if (!file || file.size === 0) return undefined;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir =
        process.env.UPLOAD_DIR || path.join(process.cwd(), "public/uploads");
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch {} // Ignore error if directory already exists
      const fileName = `${crypto.randomUUID()}-${file.name.replace(/\s+/g, "_")}`;
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      return `/api/files/${fileName}`;
    };

    const profilePicture = formData.get("profilePicture") as File | null;
    const profilePictureThumbnail = formData.get(
      "profilePictureThumbnail",
    ) as File | null;

    let profilePhotoUrl;
    let profilePhotoThumbnailUrl;

    if (profilePicture && profilePictureThumbnail) {
      profilePhotoUrl = await processFile(profilePicture);
      profilePhotoThumbnailUrl = await processFile(profilePictureThumbnail);
    }

    await connectDB();

    // Update User
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userUpdateData: any = {
      name: name.trim(),
    };
    if (nickname !== null) {
      userUpdateData.nickname = nickname.trim();
    }
    if (email !== null) {
      userUpdateData.email = email.trim().toLowerCase();
    }
    if (profilePhotoUrl && profilePhotoThumbnailUrl) {
      userUpdateData.profilePhoto = profilePhotoUrl;
      userUpdateData.profilePhotoThumbnail = profilePhotoThumbnailUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.userId,
      { $set: userUpdateData },
      { new: true },
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update CoachProfile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coachUpdateData: any = {};
    if (address !== null) {
      coachUpdateData.address = address.trim();
    }
    if (bio !== null) {
      coachUpdateData.bio = bio.trim();
    }
    if (specializations.length > 0) {
      coachUpdateData.specializations = specializations;
    }

    if (Object.keys(coachUpdateData).length > 0) {
      await CoachProfile.findOneAndUpdate(
        { userId: session.userId },
        { $set: coachUpdateData },
      );
    }

    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 },
    );
  } catch (error: Error | unknown) {
    console.error("Failed to update coach profile:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
