import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { coachId } = await req.json();

    if (!coachId) {
      return NextResponse.json(
        { error: "Coach ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Find all courses by this coach
    const coachCourses = await Course.find({ coach: coachId })
      .select(
        "_id title price platformFee coach allowDiscounts discountedPrice",
      )
      .populate("coach");

    if (coachCourses.length === 0) {
      return NextResponse.json(
        { error: "No courses found for this coach" },
        { status: 404 },
      );
    }

    const courseIds = coachCourses.map((c) => c._id);
    const coachData = coachCourses[0].coach as any;

    if (!coachData || !coachData.whatsappNumber) {
      return NextResponse.json(
        { error: "Coach contact information not found" },
        { status: 404 },
      );
    }

    // Find all pending payout enrollments for these courses
    const pendingEnrollments = await Enrollment.find({
      courseId: { $in: courseIds },
      paymentStatus: "approved",
      coachPayoutStatus: "pending",
    });

    if (pendingEnrollments.length === 0) {
      return NextResponse.json(
        { error: "No pending payouts found for this coach" },
        { status: 400 },
      );
    }

    let totalPayout = 0;

    // Calculate total layout amount to include in WhatsApp message
    for (const enrollment of pendingEnrollments) {
      // Find matching course object
      const course = coachCourses.find(
        (c) => c._id.toString() === enrollment.courseId.toString(),
      );
      if (!course) continue;

      const actualCoursePrice =
        course.allowDiscounts && course.discountedPrice
          ? course.discountedPrice
          : course.price;
      const amountPaid = enrollment.amountPaid || actualCoursePrice;
      const platformFeePercent = course.platformFee || 0;

      const platformCut = amountPaid * (platformFeePercent / 100);
      const coachCut = amountPaid - platformCut;

      totalPayout += coachCut;
    }

    // Execute Database Updates
    const enrollmentIds = pendingEnrollments.map((e) => e._id);
    await Enrollment.updateMany(
      { _id: { $in: enrollmentIds } },
      {
        $set: {
          coachPayoutStatus: "paid",
          coachPaidAt: new Date(),
        },
      },
    );

    // Send WhatsApp Notification to Coach
    if (totalPayout > 0) {
      const message = `Hello ${coachData.name || "Coach"}!\n\nGreat news! Your payout of *Rs. ${totalPayout.toLocaleString()}* for your recent course enrollments has been successfully processed via bank transfer.\n\nThank you for teaching on Caissa Chess Academy.`;

      try {
        await sendWhatsAppMessage(coachData.whatsappNumber, message);
      } catch (waError) {
        console.error("Failed to send WhatsApp payout notification:", waError);
        // We still return 200 because the payment *did* process successfully in the DB
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payout completed successfully.",
      enrollmentsUpdated: enrollmentIds.length,
      payoutAmount: totalPayout,
    });
  } catch (error) {
    console.error("Error executing coach payout:", error);
    return NextResponse.json(
      { error: "Failed to process payout" },
      { status: 500 },
    );
  }
}
