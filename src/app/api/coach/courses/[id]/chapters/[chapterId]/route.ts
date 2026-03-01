import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Chapter from "@/models/Chapter";
import Lesson from "@/models/Lesson";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> },
) {
  try {
    const { id: courseId, chapterId } = await params;
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

    if (!["draft", "pending_review", "rejected"].includes(course.status)) {
      return NextResponse.json(
        {
          error: "Cannot modify chapters in this course in its current status",
        },
        { status: 403 },
      );
    }

    const { title } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Chapter title is required" },
        { status: 400 },
      );
    }

    const chapter = await Chapter.findOneAndUpdate(
      { _id: chapterId, courseId },
      { $set: { title: title.trim() } },
      { new: true },
    );

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("Error updating chapter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> },
) {
  try {
    const { id: courseId, chapterId } = await params;
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

    if (!["draft", "pending_review", "rejected"].includes(course.status)) {
      return NextResponse.json(
        {
          error: "Cannot delete chapters in this course in its current status",
        },
        { status: 403 },
      );
    }

    const chapter = await Chapter.findOne({ _id: chapterId, courseId });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Delete all associated lessons
    await Lesson.deleteMany({ chapterId });

    // Delete the chapter
    await chapter.deleteOne();

    return NextResponse.json({ message: "Chapter and its lessons deleted" });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
