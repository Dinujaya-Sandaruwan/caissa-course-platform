import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Chapter from "@/models/Chapter";
import Lesson from "@/models/Lesson";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: courseId } = await params;
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch the course with populated coach info
    const course = await Course.findById(courseId)
      .populate("coach", "name phone")
      .lean();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch all chapters for this course, sorted by order
    const chapters = await Chapter.find({ courseId }).sort({ order: 1 }).lean();

    // Fetch all lessons for all chapters, sorted by order
    const chapterIds = chapters.map((ch) => ch._id);
    const lessons = await Lesson.find({ chapterId: { $in: chapterIds } })
      .select("title chapterId videoUrl tempVideoPath videoStatus order")
      .sort({ order: 1 })
      .lean();

    // Group lessons by chapter
    const chaptersWithLessons = chapters.map((ch) => ({
      ...ch,
      lessons: lessons.filter(
        (l) => l.chapterId.toString() === ch._id.toString(),
      ),
    }));

    return NextResponse.json({
      ...course,
      chapters: chaptersWithLessons,
    });
  } catch (error) {
    console.error("Error fetching course for manager:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
