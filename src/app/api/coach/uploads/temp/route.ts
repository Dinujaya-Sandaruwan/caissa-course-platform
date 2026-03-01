import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("video") as object as File;

    if (!file) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 },
      );
    }

    // Validate size (2GB Max)
    const MAX_SIZE = 2 * 1024 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds maximum size of 2GB" },
        { status: 413 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file type
    const { fileTypeFromBuffer } = await import("file-type");
    const mimeInfo = await fileTypeFromBuffer(buffer);

    const allowedMimePrefixes = ["video/", "image/"];
    const allowedExactMimes = ["application/pdf"];

    if (
      !mimeInfo ||
      (!allowedMimePrefixes.some((prefix) =>
        mimeInfo.mime.startsWith(prefix),
      ) &&
        !allowedExactMimes.includes(mimeInfo.mime))
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only videos, images, and PDFs are allowed.",
        },
        { status: 415 },
      );
    }

    // Store in uploads/temp/
    const uploadDir = process.env.UPLOAD_DIR || "public/uploads";
    const tempDir = path.join(process.cwd(), uploadDir, "temp");
    await mkdir(tempDir, { recursive: true });

    const id = crypto.randomUUID();
    const ext = mimeInfo.ext;
    const fileName = `${id}.${ext}`;
    const fullPath = path.join(tempDir, fileName);

    await writeFile(fullPath, buffer);

    const tempPath = `/api/files/temp/${fileName}`;

    // Fire-and-forget lazy cleanup of abandoned temp files
    import("@/lib/cleanupTempFiles").then(({ cleanupTempFiles }) => {
      cleanupTempFiles().catch(console.error);
    });

    return NextResponse.json({
      message: "Video uploaded successfully",
      tempPath,
      fileName: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("Error uploading temp video:", error);
    return NextResponse.json(
      { error: "Internal server error during upload" },
      { status: 500 },
    );
  }
}
