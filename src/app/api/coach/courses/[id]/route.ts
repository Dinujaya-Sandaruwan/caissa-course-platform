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
    const { id } = await params;
    const user = await getSessionUser();
    if (!user || user.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const course = await Course.findOne({
      _id: id,
      coach: user.userId,
    }).lean();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch chapters and lessons efficiently
    const chapters = await Chapter.find({ courseId: course._id })
      .sort({ order: 1 })
      .lean();

    const lessons = await Lesson.find({ courseId: course._id })
      .sort({ order: 1 })
      .lean();

    // Group lessons into their respective chapters
    const chaptersWithLessons = chapters.map((chapter) => ({
      ...chapter,
      lessons: lessons.filter(
        (lesson) => String(lesson.chapterId) === String(chapter._id),
      ),
    }));

    return NextResponse.json({
      ...course,
      chapters: chaptersWithLessons,
    });
  } catch (error) {
    console.error("Error fetching course details:", error);
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
    const { id } = await params;
    const user = await getSessionUser();
    if (!user || user.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const course = await Course.findOne({
      _id: id,
      coach: user.userId,
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft courses can be updated directly" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { title, description, price, level, tags, thumbnailUrl } = body;

    if (title !== undefined) course.title = title.trim();
    if (description !== undefined) course.description = description.trim();
    if (price !== undefined) course.price = Number(price);
    if (level !== undefined) course.level = level;
    if (tags !== undefined) course.tags = Array.isArray(tags) ? tags : [];
    if (thumbnailUrl !== undefined) course.thumbnailUrl = thumbnailUrl;

    await course.save();

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error updating course:", error);
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
    const { id } = await params;
    const user = await getSessionUser();
    if (!user || user.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const course = await Course.findOne({
      _id: id,
      coach: user.userId,
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft courses can be deleted" },
        { status: 403 },
      );
    }

    // Delete associated chapters and lessons first
    await Promise.all([
      Lesson.deleteMany({ courseId: course._id }),
      Chapter.deleteMany({ courseId: course._id }),
    ]);

    // Finally delete the course
    await course.deleteOne();

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
