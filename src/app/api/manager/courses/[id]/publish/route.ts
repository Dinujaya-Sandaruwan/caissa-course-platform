import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Chapter from "@/models/Chapter";
import Lesson from "@/models/Lesson";
import { notifyCoachCoursePublished } from "@/lib/whatsapp";

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

    const course = await Course.findById(courseId).populate(
      "coach",
      "name phone",
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.status !== "approved") {
      return NextResponse.json(
        { error: "Only approved courses can be published" },
        { status: 400 },
      );
    }

    // Check that all lessons have videoStatus: "ready"
    const chapters = await Chapter.find({ courseId }).lean();
    const chapterIds = chapters.map((ch) => ch._id);
    const lessons = await Lesson.find({
      chapterId: { $in: chapterIds },
    }).lean();

    const notReadyLessons = lessons.filter((l) => l.videoStatus !== "ready");
    if (notReadyLessons.length > 0) {
      return NextResponse.json(
        {
          error: `${notReadyLessons.length} lesson(s) do not have their video ready. Please set video URLs for all lessons before publishing.`,
        },
        { status: 400 },
      );
    }

    // Check previewVideoUrl
    if (!course.previewVideoUrl) {
      return NextResponse.json(
        { error: "Course must have a preview video URL before publishing" },
        { status: 400 },
      );
    }

    // Publish the course
    course.status = "published";
    await course.save();

    // Notify the coach
    const populatedCoach = course.coach as unknown as {
      phone?: string;
    };
    if (populatedCoach?.phone) {
      await notifyCoachCoursePublished(populatedCoach.phone, course.title);
    }

    return NextResponse.json({
      message: "Course published successfully",
      course,
    });
  } catch (error) {
    console.error("Error publishing course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
