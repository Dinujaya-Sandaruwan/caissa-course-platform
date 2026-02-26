import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Specify that this route should NOT be parsed by the default body parser,
// so we can read the raw form data ourselves for large files.
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; chapterId: string; lessonId: string }> },
) {
  try {
    const { id: courseId, chapterId, lessonId } = await params;
    const user = await getSessionUser();

    if (!user || user.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Verify course belongs to coach and is in draft status
    const course = await Course.findOne({
      _id: courseId,
      coach: user.userId,
    }).lean();

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or unauthorized" },
        { status: 404 },
      );
    }

    if (course.status !== "draft") {
      return NextResponse.json(
        { error: "Cannot upload videos to a non-draft course" },
        { status: 403 },
      );
    }

    // Verify lesson exists for this course
    const lesson = await Lesson.findOne({ _id: lessonId, chapterId, courseId });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Process the multipart form data using standard Next.js 13+ Request APIs
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

    // We convert it to a buffer to utilize `file-type` safely
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dynamic import of `file-type` as it's an pure ESM package
    const { fileTypeFromBuffer } = await import("file-type");
    const mimeInfo = await fileTypeFromBuffer(buffer);

    if (!mimeInfo || !mimeInfo.mime.startsWith("video/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only video files are allowed." },
        { status: 415 },
      );
    }

    // Determine target directory: public/uploads/courses/{courseId}
    const uploadDir = process.env.UPLOAD_DIR || "public/uploads";
    const courseUploadPath = path.join(
      process.cwd(),
      uploadDir,
      "courses",
      courseId,
    );

    // Ensure the directory actually exists dynamically
    await mkdir(courseUploadPath, { recursive: true });

    // Generate unique file name
    const id = crypto.randomUUID();
    const ext = mimeInfo.ext;
    const fileName = `${lessonId}-${id}.${ext}`;
    const fullFilePath = path.join(courseUploadPath, fileName);

    // Write file directly to disk
    await writeFile(fullFilePath, buffer);

    // Generate the public web URL path to save to the DB
    const relativeUrl = `/api/files/courses/${courseId}/${fileName}`;

    // Update the lesson
    lesson.tempVideoPath = relativeUrl;
    lesson.videoStatus = "uploaded";
    await lesson.save();

    return NextResponse.json({
      message: "Video uploaded successfully",
      lesson,
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    return NextResponse.json(
      { error: "Internal server error during upload" },
      { status: 500 },
    );
  }
}
