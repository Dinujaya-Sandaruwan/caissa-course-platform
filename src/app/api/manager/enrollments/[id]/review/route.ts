import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import {
  notifyStudentEnrollmentApproved,
  notifyStudentEnrollmentRejected,
  notifyStudentEnrollmentOnHold,
} from "@/lib/whatsapp";
import { logAction } from "@/lib/auditLog";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: enrollmentId } = await params;
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, notes } = body;

    if (!action || !["approved", "rejected", "on_hold"].includes(action)) {
      return NextResponse.json(
        {
          error: "Invalid action. Must be 'approved', 'rejected', or 'on_hold'",
        },
        { status: 400 },
      );
    }

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

    if (
      enrollment.paymentStatus !== "pending_review" &&
      enrollment.paymentStatus !== "on_hold"
    ) {
      return NextResponse.json(
        { error: "Enrollment has already been reviewed" },
        { status: 400 },
      );
    }

    // Update enrollment
    enrollment.paymentStatus = action;
    enrollment.reviewNotes = notes || "";
    enrollment.reviewedBy = session.userId as never;
    enrollment.reviewedAt = new Date();

    if (action === "approved") {
      enrollment.enrolledAt = new Date();
      // Increment course enrollment count
      await Course.findByIdAndUpdate(enrollment.courseId, {
        $inc: { enrollmentCount: 1 },
      });
    }

    await enrollment.save();

    // Send WhatsApp notification to the student
    const student = enrollment.studentId as unknown as {
      name?: string;
      phone?: string;
    };
    const course = enrollment.courseId as unknown as { title?: string };

    if (student?.phone && course?.title) {
      if (action === "approved") {
        await notifyStudentEnrollmentApproved(student.phone, course.title);
      } else if (action === "rejected") {
        await notifyStudentEnrollmentRejected(
          student.phone,
          course.title,
          notes,
        );
      } else if (action === "on_hold") {
        await notifyStudentEnrollmentOnHold(student.phone, course.title, notes);
      }
    }

    const studentName = student?.name || "Unknown Student";
    const courseTitle = course?.title || "Unknown Course";
    const actionLabel =
      action === "approved"
        ? "Approved"
        : action === "rejected"
          ? "Rejected"
          : "Put on hold";
    logAction({
      managerId: session.userId,
      action: `${actionLabel} enrollment for "${studentName}" in "${courseTitle}"`,
      category: "enrollments",
      targetId: enrollmentId,
      targetName: studentName,
      details: notes?.trim() || undefined,
    });

    return NextResponse.json({
      message: `Enrollment ${action} successfully`,
      enrollment,
    });
  } catch (error) {
    console.error("Error reviewing enrollment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
