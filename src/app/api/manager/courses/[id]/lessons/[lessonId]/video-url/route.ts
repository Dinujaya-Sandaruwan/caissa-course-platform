import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Lesson from "@/models/Lesson";
import { unlink } from "fs/promises";
import path from "path";
import { logAction } from "@/lib/auditLog";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> },
) {
  try {
    const { lessonId } = await params;
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { videoUrl } = body;

    if (!videoUrl || typeof videoUrl !== "string") {
      return NextResponse.json(
        { error: "videoUrl is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Save the video URL and mark as ready
    const oldTempPath = lesson.tempVideoPath;
    lesson.videoUrl = videoUrl;
    lesson.videoStatus = "ready";
    lesson.tempVideoPath = "";
    await lesson.save();

    // Delete the temp file from the VPS
    if (oldTempPath) {
      try {
        const fullPath = path.join(process.cwd(), "public", oldTempPath);
        await unlink(fullPath);
      } catch {
        // File may already be deleted or not exist — that's fine
        console.warn(`Could not delete temp video at: ${oldTempPath}`);
      }
    }

    logAction({
      managerId: session.userId,
      action: `Updated video URL for lesson "${lesson.title}"`,
      category: "courses",
      targetId: lesson._id.toString(),
    });

    return NextResponse.json({
      message: "Video URL set and lesson marked as ready",
      lesson,
    });
  } catch (error) {
    console.error("Error setting video URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
