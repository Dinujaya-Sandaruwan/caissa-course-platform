import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Chapter from "@/models/Chapter";
import Lesson from "@/models/Lesson";

export async function POST(
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

    if (course.status !== "draft") {
      return NextResponse.json(
        { error: "Cannot add lessons to a non-draft course" },
        { status: 403 },
      );
    }

    // Verify chapter exists and belongs to this course
    const chapter = await Chapter.findOne({
      _id: chapterId,
      courseId,
    }).lean();

    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found in this course" },
        { status: 404 },
      );
    }

    const { title } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Lesson title is required" },
        { status: 400 },
      );
    }

    // Determine the next order number for this chapter
    const existingLessonsCount = await Lesson.countDocuments({ chapterId });
    const order = existingLessonsCount + 1;

    const newLesson = await Lesson.create({
      chapterId,
      courseId,
      title: title.trim(),
      order,
      videoStatus: "pending", // Default status before upload
    });

    return NextResponse.json(newLesson, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
