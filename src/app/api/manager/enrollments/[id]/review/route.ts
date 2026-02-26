import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

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

    if (!action || !["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approved' or 'rejected'" },
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

    if (enrollment.paymentStatus !== "pending_review") {
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

    if (student?.phone) {
      let message = "";
      if (action === "approved") {
        message = `🎉 Congratulations, ${student.name || "Student"}!\n\nYour enrollment for *"${course?.title}"* has been *approved*!\n\nYou can now access all course content. Happy learning! 📚`;
      } else {
        message = `Hello ${student.name || "Student"},\n\nYour enrollment for *"${course?.title}"* could not be approved.\n\n📝 *Reason:* ${notes || "Payment could not be verified."}\n\nPlease resubmit with a valid payment receipt.`;
      }
      await sendWhatsAppMessage(student.phone, message);
    }

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
