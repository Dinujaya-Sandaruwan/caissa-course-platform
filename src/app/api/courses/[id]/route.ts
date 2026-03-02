import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import "@/models/User";
import Chapter from "@/models/Chapter";
import Lesson from "@/models/Lesson";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: courseId } = await params;

    await connectDB();

    const course = await Course.findOne({
      _id: courseId,
      status: "published",
    })
      .populate("coach", "name bio")
      .lean();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch chapters sorted by order
    const chapters = await Chapter.find({ courseId }).sort({ order: 1 }).lean();

    // Fetch lessons (public view: title and order only — no videoUrl)
    const chapterIds = chapters.map((ch) => ch._id);
    const lessons = await Lesson.find({ chapterId: { $in: chapterIds } })
      .select("title chapterId order duration")
      .sort({ order: 1 })
      .lean();

    // Group lessons by chapter
    const chaptersWithLessons = chapters.map((ch) => ({
      _id: ch._id,
      title: ch.title,
      order: ch.order,
      lessons: lessons
        .filter((l) => l.chapterId.toString() === ch._id.toString())
        .map((l) => ({
          _id: l._id,
          title: l.title,
          order: l.order,
          duration: l.duration,
        })),
    }));

    return NextResponse.json({
      _id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      level: course.level,
      tags: course.tags,
      thumbnailUrl: course.thumbnailUrl,
      previewVideoUrl: course.previewVideoUrl,
      enrollmentCount: course.enrollmentCount,
      createdAt: course.createdAt,
      coach: course.coach,
      chapters: chaptersWithLessons,
    });
  } catch (error) {
    console.error("Error fetching public course detail:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
