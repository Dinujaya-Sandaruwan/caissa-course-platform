import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import {
  notifyCoachCourseApproved,
  notifyCoachCourseRejected,
  notifyCoachCourseOnHold,
} from "@/lib/whatsapp";
import { logAction } from "@/lib/auditLog";

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

    const body = await request.json();
    const { action, notes } = body;

    if (!action || !["approved", "rejected", "held"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approved', 'rejected', or 'held'" },
        { status: 400 },
      );
    }

    await connectDB();

    const course = await Course.findById(courseId).populate(
      "coach",
      "name phone",
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (
      course.status !== "pending_review" &&
      course.status !== "approved" &&
      course.status !== "published" &&
      course.status !== "unpublished"
    ) {
      return NextResponse.json(
        { error: "Course is not pending review, published, or unpublished" },
        { status: 400 },
      );
    }

    // Map action to status
    if (action === "approved") {
      course.status = "approved";
    } else if (action === "rejected") {
      course.status = "rejected";
    }
    // "held" keeps status as "pending_review" but saves notes

    course.reviewNotes = notes || "";
    course.reviewedBy = session.userId as never;
    course.reviewedAt = new Date();

    await course.save();

    // Send WhatsApp notification to the coach
    const populatedCoach = course.coach as unknown as {
      phone?: string;
    };
    const coachPhone = populatedCoach?.phone;

    if (coachPhone) {
      if (action === "approved") {
        await notifyCoachCourseApproved(coachPhone, course.title);
      } else if (action === "rejected") {
        await notifyCoachCourseRejected(coachPhone, course.title, notes);
      } else if (action === "held") {
        await notifyCoachCourseOnHold(coachPhone, course.title, notes);
      }
    }

    const actionLabel =
      action === "approved"
        ? "Approved"
        : action === "rejected"
          ? "Rejected"
          : "Put on hold";
    logAction({
      managerId: session.userId,
      action: `${actionLabel} course "${course.title}"`,
      category: "courses",
      targetId: courseId,
      targetName: course.title,
      details: notes || undefined,
    });

    return NextResponse.json({
      message: `Course ${action} successfully`,
      course,
    });
  } catch (error) {
    console.error("Error reviewing course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
