import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import User from "@/models/User";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: studentId } = await params;
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
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

    const profilePhotoUrl = await processFile(
      formData.get("profilePicture") as File | null,
    );
    const profilePhotoThumbnailUrl = await processFile(
      formData.get("profilePictureThumbnail") as File | null,
    );

    if (!profilePhotoUrl || !profilePhotoThumbnailUrl) {
      return NextResponse.json({ error: "No photo provided" }, { status: 400 });
    }

    await connectDB();

    const updatedUser = await User.findOneAndUpdate(
      { _id: studentId, role: "student" },
      {
        $set: {
          profilePhoto: profilePhotoUrl,
          profilePhotoThumbnail: profilePhotoThumbnailUrl,
        },
      },
      { new: true },
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profilePhoto: updatedUser.profilePhoto,
      profilePhotoThumbnail: updatedUser.profilePhotoThumbnail,
    });
  } catch (error: Error | unknown) {
    console.error("Failed to upload student photo by manager:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
