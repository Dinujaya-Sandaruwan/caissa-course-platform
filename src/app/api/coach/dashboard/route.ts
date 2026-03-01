import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all coach's courses
    const courses = await Course.find({
      coach: session.userId,
      status: { $ne: "trashed" },
    })
      .select("_id title status enrollmentCount")
      .lean();

    const courseIds = courses.map((c) => c._id);

    // Stats
    const publishedCourses = courses.filter(
      (c) => (c.status || "").toLowerCase() === "published",
    );
    const totalPublished = publishedCourses.length;
    const totalPending = courses.filter(
      (c) =>
        (c.status || "").toLowerCase() === "pending_review" ||
        (c.status || "").toLowerCase() === "approved",
    ).length;
    const totalDraft = courses.filter(
      (c) => !c.status || (c.status || "").toLowerCase() === "draft",
    ).length;
    const totalStudents = publishedCourses.reduce(
      (acc, c) => acc + (c.enrollmentCount || 0),
      0,
    );

    // Recent enrollments (last 10)
    const recentEnrollments = await Enrollment.find({
      courseId: { $in: courseIds },
      paymentStatus: "approved",
    })
      .populate("studentId", "name")
      .populate("courseId", "title")
      .sort({ enrolledAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      totalStudents,
      totalPublished,
      totalPending,
      totalDraft,
      recentEnrollments: recentEnrollments.map((e) => ({
        _id: e._id,
        studentName:
          (e.studentId as unknown as { name?: string })?.name || "Student",
        courseTitle:
          (e.courseId as unknown as { title?: string })?.title || "Course",
        enrolledAt: e.enrolledAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching coach dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
