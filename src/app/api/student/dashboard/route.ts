import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Chapter from "@/models/Chapter";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get student name & nickname & photo
    const student = await User.findById(session.userId)
      .select("name nickname profilePhotoThumbnail")
      .lean();

    // Get all enrollments
    const enrollments = await Enrollment.find({ studentId: session.userId })
      .populate("courseId", "title thumbnailUrl price level status")
      .sort({ createdAt: -1 })
      .lean();

    // Group by status
    const pending = enrollments.filter(
      (e) => e.paymentStatus === "pending_review",
    );
    const approved = enrollments.filter((e) => e.paymentStatus === "approved");
    const rejected = enrollments.filter((e) => e.paymentStatus === "rejected");

    // For approved enrollments, get progress data
    const approvedWithProgress = await Promise.all(
      approved.map(async (enrollment) => {
        const courseId = (enrollment.courseId as unknown as { _id: string })
          ?._id;
        if (!courseId)
          return { ...enrollment, totalLessons: 0, completedLessons: 0 };

        // Count total lessons
        const chapters = await Chapter.find({ courseId }).select("_id").lean();
        const chapterIds = chapters.map((ch) => ch._id);
        const totalLessons = await Lesson.countDocuments({
          chapterId: { $in: chapterIds },
        });

        // Count completed lessons
        const completedLessons = await Progress.countDocuments({
          studentId: session.userId,
          courseId,
        });

        return {
          ...enrollment,
          totalLessons,
          completedLessons,
        };
      }),
    );

    return NextResponse.json({
      studentName: student?.nickname || student?.name || "Student",
      studentAvatar: student?.profilePhotoThumbnail,
      pending,
      approved: approvedWithProgress,
      rejected,
    });
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
