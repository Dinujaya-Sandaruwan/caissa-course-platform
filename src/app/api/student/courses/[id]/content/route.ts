import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Chapter from "@/models/Chapter";
import Lesson from "@/models/Lesson";
import Enrollment from "@/models/Enrollment";
import Progress from "@/models/Progress";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: courseId } = await params;
    const session = await getSessionUser();

    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Verify approved enrollment
    const enrollment = await Enrollment.findOne({
      studentId: session.userId,
      courseId,
      paymentStatus: "approved",
    }).lean();

    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
        { status: 403 },
      );
    }

    // Fetch course
    const course = await Course.findById(courseId)
      .populate("coach", "name")
      .lean();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch chapters and lessons with videoUrl
    const chapters = await Chapter.find({ courseId }).sort({ order: 1 }).lean();

    const chapterIds = chapters.map((ch) => ch._id);
    const lessons = await Lesson.find({ chapterId: { $in: chapterIds } })
      .select("title chapterId videoUrl duration order")
      .sort({ order: 1 })
      .lean();

    // Group lessons by chapter
    const chaptersWithLessons = chapters.map((ch) => ({
      _id: ch._id,
      title: ch.title,
      order: ch.order,
      lessons: lessons.filter(
        (l) => l.chapterId.toString() === ch._id.toString(),
      ),
    }));

    // Fetch progress records
    const progress = await Progress.find({
      studentId: session.userId,
      courseId,
    })
      .select("lessonId completedAt")
      .lean();

    const completedLessonIds = progress.map((p) => p.lessonId.toString());

    return NextResponse.json({
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        level: course.level,
        coach: course.coach,
      },
      chapters: chaptersWithLessons,
      completedLessonIds,
    });
  } catch (error) {
    console.error("Error fetching enrolled course content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
