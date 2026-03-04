import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Chapter from "@/models/Chapter";
import Lesson from "@/models/Lesson";
import { logAction } from "@/lib/auditLog";

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
      .populate(
        "coach",
        "name whatsappNumber email profilePhoto profilePhotoThumbnail",
      )
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

export async function DELETE(
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

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.status !== "trashed") {
      return NextResponse.json(
        { error: "Only trashed courses can be permanently deleted" },
        { status: 403 },
      );
    }

    // Permanently delete chapters, lessons, and the course
    await Promise.all([
      Lesson.deleteMany({ courseId: course._id }),
      Chapter.deleteMany({ courseId: course._id }),
    ]);
    await course.deleteOne();

    logAction({ managerId: session.userId, action: `Permanently deleted course "${course.title}"`, category: "courses", targetId: courseId, targetName: course.title });

    return NextResponse.json({ message: "Course permanently deleted" });
  } catch (error) {
    console.error("Error permanently deleting course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
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

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.status !== "trashed") {
      return NextResponse.json(
        { error: "Only trashed courses can be reactivated" },
        { status: 403 },
      );
    }

    // Reactivate: set back to draft
    course.status = "draft";
    course.trashedAt = undefined;
    await course.save();

    logAction({ managerId: session.userId, action: `Reactivated course "${course.title}" as draft`, category: "courses", targetId: courseId, targetName: course.title });

    return NextResponse.json({ message: "Course reactivated as draft" });
  } catch (error) {
    console.error("Error reactivating course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
