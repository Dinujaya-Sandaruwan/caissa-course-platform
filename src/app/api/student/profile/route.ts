import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId)
      .select("name nickname email whatsappNumber profilePhotoThumbnail")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to fetch student profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "student") {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      name: name.trim(),
    };
    if (nickname !== null) {
      updateData.nickname = nickname.trim();
    }

    if (profilePhotoUrl && profilePhotoThumbnailUrl) {
      updateData.profilePhoto = profilePhotoUrl;
      updateData.profilePhotoThumbnail = profilePhotoThumbnailUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.userId,
      { $set: updateData },
      { new: true },
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 },
    );
  } catch (error: Error | unknown) {
    console.error("Failed to update student profile:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
