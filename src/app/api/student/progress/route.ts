import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Progress from "@/models/Progress";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { lessonId, courseId } = body;

    if (!lessonId || !courseId) {
      return NextResponse.json(
        { error: "lessonId and courseId are required" },
        { status: 400 },
      );
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

    // Upsert progress record
    await Progress.findOneAndUpdate(
      { studentId: session.userId, lessonId },
      {
        studentId: session.userId,
        lessonId,
        courseId,
        completedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    return NextResponse.json({ message: "Progress recorded" });
  } catch (error) {
    console.error("Error recording progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
