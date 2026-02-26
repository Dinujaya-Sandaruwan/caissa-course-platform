import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

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

    if (course.status !== "pending_review") {
      return NextResponse.json(
        { error: "Course is not pending review" },
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
      name?: string;
      phone?: string;
    };
    const coachPhone = populatedCoach?.phone;
    const coachName = populatedCoach?.name || "Coach";
    const courseTitle = course.title;

    if (coachPhone) {
      let message = "";
      if (action === "approved") {
        message = `🎉 Great news, ${coachName}!\n\nYour course *"${courseTitle}"* has been *approved* by our review team!\n\nIt is now ready to be published. You will be notified once it goes live.`;
      } else if (action === "rejected") {
        message = `Hello ${coachName},\n\nYour course *"${courseTitle}"* has been *reviewed* and requires some changes.\n\n📝 *Feedback:* ${notes || "No specific notes provided."}\n\nPlease revise and resubmit when ready.`;
      } else if (action === "held") {
        message = `Hello ${coachName},\n\nYour course *"${courseTitle}"* is still under review. The reviewer has left a note:\n\n📝 *Note:* ${notes || "No specific notes provided."}\n\nNo action is needed from you at this time.`;
      }

      if (message) {
        await sendWhatsAppMessage(coachPhone, message);
      }
    }

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
