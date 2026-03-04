import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import { notifyStudentEnrollmentRevoked } from "@/lib/whatsapp";
import { logAction } from "@/lib/auditLog";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: enrollmentId } = await params;
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { notes } = body;

    await connectDB();

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("studentId", "name phone")
      .populate("courseId", "title");

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 },
      );
    }

    // Only decrement if it was approved previously
    if (enrollment.paymentStatus === "approved") {
      await Course.findByIdAndUpdate(enrollment.courseId, {
        $inc: { enrollmentCount: -1 },
      });
    }

    // Capture details before deletion for WhatsApp
    const student = enrollment.studentId as unknown as { phone?: string };
    const course = enrollment.courseId as unknown as { title?: string };

    // Completely delete the enrollment string so the student can buy it again
    await Enrollment.findByIdAndDelete(enrollmentId);

    // Send WhatsApp notification to the student
    if (student?.phone && course?.title) {
      await notifyStudentEnrollmentRevoked(student.phone, course.title, notes);
    }

    logAction({
      managerId: session.userId,
      action: `Revoked enrollment by student on course`,
      category: "enrollments",
      targetId: enrollmentId,
    });

    return NextResponse.json({
      message: "Enrollment successfully revoked and removed.",
    });
  } catch (error) {
    console.error("Error revoking enrollment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
