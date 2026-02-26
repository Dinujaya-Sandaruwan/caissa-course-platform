import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Chapter from "@/models/Chapter";
import Lesson from "@/models/Lesson";
import { notifyManagerNewCourseSubmission } from "@/lib/whatsapp";
import User from "@/models/User";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: courseId } = await params;
    const user = await getSessionUser();

    if (!user || user.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // 1. Verify the course belongs to this coach
    const course = await Course.findOne({
      _id: courseId,
      coach: user.userId,
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or unauthorized" },
        { status: 404 },
      );
    }

    // 3. Check that the course status is currently "draft"
    if (course.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft courses can be submitted for review" },
        { status: 400 },
      );
    }

    // 2. Check that the course has at least one chapter with at least one lesson
    const chapters = await Chapter.find({ courseId }).lean();

    if (chapters.length === 0) {
      return NextResponse.json(
        { error: "Course must have at least one chapter before submission" },
        { status: 400 },
      );
    }

    const chapterIds = chapters.map((ch) => ch._id);
    const lessonCount = await Lesson.countDocuments({
      chapterId: { $in: chapterIds },
    });

    if (lessonCount === 0) {
      return NextResponse.json(
        { error: "Course must have at least one lesson before submission" },
        { status: 400 },
      );
    }

    // 4. Update the course status to "pending_review"
    course.status = "pending_review";
    await course.save();

    // 5. Send a WhatsApp notification to the manager
    const managerNumber = process.env.MANAGER_WHATSAPP_NUMBER;
    if (managerNumber) {
      const coach = await User.findById(user.userId).select("name").lean();
      await notifyManagerNewCourseSubmission(
        managerNumber,
        course.title,
        coach?.name || "Coach",
      );
    }

    // 6. Return the updated course
    return NextResponse.json({
      message: "Course submitted for review successfully",
      course,
    });
  } catch (error) {
    console.error("Error submitting course for review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
