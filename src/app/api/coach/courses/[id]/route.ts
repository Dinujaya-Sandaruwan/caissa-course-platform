import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Tag from "@/models/Tag";
import Chapter from "@/models/Chapter";
import Lesson from "@/models/Lesson";
import { stripHtml, validateOptionalString } from "@/lib/validation";

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

    if (title !== undefined) course.title = stripHtml(String(title));
    if (description !== undefined)
      course.description = stripHtml(String(description));
    if (price !== undefined) {
      const p = Number(price);
      if (isNaN(p) || p < 0)
        return NextResponse.json({ error: "Invalid price" }, { status: 400 });
      course.price = p;
    }
    if (level !== undefined) {
      if (!["beginner", "intermediate", "advanced"].includes(level))
        return NextResponse.json({ error: "Invalid level" }, { status: 400 });
      course.level = level;
    }
    if (tags !== undefined) {
      const oldTags: string[] = course.tags || [];
      const newTags: string[] = Array.isArray(tags)
        ? tags
            .filter((t: unknown) => typeof t === "string")
            .map((t: string) => stripHtml(t))
        : [];

      // Diff: find added and removed tags
      const addedTags = newTags.filter((t) => !oldTags.includes(t));
      const removedTags = oldTags.filter((t) => !newTags.includes(t));

      // Increment usageCount for new tags (upsert)
      if (addedTags.length > 0) {
        await Promise.all(
          addedTags.map((tagName) =>
            Tag.findOneAndUpdate(
              { name: tagName },
              { $inc: { usageCount: 1 } },
              { upsert: true, new: true },
            ),
          ),
        );
      }

      // Decrement usageCount for removed tags
      if (removedTags.length > 0) {
        await Promise.all(
          removedTags.map((tagName) =>
            Tag.findOneAndUpdate(
              { name: tagName, usageCount: { $gt: 0 } },
              { $inc: { usageCount: -1 } },
            ),
          ),
        );
      }

      course.tags = newTags;
    }
    if (thumbnailUrl !== undefined)
      course.thumbnailUrl = validateOptionalString(thumbnailUrl) || "";

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
