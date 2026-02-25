import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import fs from "fs/promises";
import path from "path";

export async function PATCH(
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

    // Verify course belongs to coach
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
        { error: "Cannot modify lessons in a non-draft course" },
        { status: 403 },
      );
    }

    const { title } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Lesson title is required" },
        { status: 400 },
      );
    }

    const lesson = await Lesson.findOneAndUpdate(
      { _id: lessonId, chapterId, courseId },
      { $set: { title: title.trim() } },
      { new: true },
    );

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    // Verify course belongs to coach
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
        { error: "Cannot delete lessons in a non-draft course" },
        { status: 403 },
      );
    }

    const lesson = await Lesson.findOne({ _id: lessonId, chapterId, courseId });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Always delete the temp file from VPS if it exists to strictly limit storage bloat
    if (lesson.tempVideoPath) {
      try {
        const fullPath = path.join(
          process.cwd(),
          "public",
          lesson.tempVideoPath,
        );
        await fs.unlink(fullPath);
      } catch (fsError) {
        console.warn(
          `Could not delete video file for lesson ${lessonId}:`,
          fsError,
        );
        // We log it as a warning but continue because DB deletion is more critical to complete
      }
    }

    // Delete the lesson
    await lesson.deleteOne();

    return NextResponse.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
