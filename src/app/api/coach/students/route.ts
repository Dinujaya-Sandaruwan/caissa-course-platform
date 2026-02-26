import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    // Get coach's published courses for the selector
    const courses = await Course.find({
      coach: session.userId,
      status: "published",
    })
      .select("title enrollmentCount")
      .sort({ createdAt: -1 })
      .lean();

    // If a courseId is provided, get its enrolled students
    let students: unknown[] = [];
    if (courseId) {
      // Verify the course belongs to this coach
      const course = courses.find((c) => c._id.toString() === courseId);
      if (course) {
        const enrollments = await Enrollment.find({
          courseId,
          paymentStatus: "approved",
        })
          .populate("studentId", "name phone")
          .sort({ enrolledAt: -1 })
          .lean();

        students = enrollments.map((e) => ({
          _id: e._id,
          name:
            (e.studentId as unknown as { name?: string })?.name || "Student",
          phone: (e.studentId as unknown as { phone?: string })?.phone || "",
          enrolledAt: e.enrolledAt,
        }));
      }
    }

    return NextResponse.json({ courses, students });
  } catch (error) {
    console.error("Error fetching coach students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
