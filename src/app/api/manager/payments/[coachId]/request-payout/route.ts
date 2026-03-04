import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import PayoutRequest from "@/models/PayoutRequest";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import User from "@/models/User";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ coachId: string }> },
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { coachId } = await params;
    if (!coachId) {
      return NextResponse.json(
        { error: "Coach ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Check for existing active payout request
    const existingRequest = await PayoutRequest.findOne({
      coachId,
      status: { $in: ["pending_coach", "coach_approved"] },
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          error:
            "There is already an active payout request for this coach. Please wait for the coach to respond or cancel the existing request.",
        },
        { status: 400 },
      );
    }

    // Get coach data
    const coach = await User.findById(coachId);
    if (!coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    // Find all courses by this coach
    const coachCourses = await Course.find({ coach: coachId }).select(
      "_id title price platformFee allowDiscounts discountedPrice",
    );

    if (coachCourses.length === 0) {
      return NextResponse.json(
        { error: "No courses found for this coach" },
        { status: 404 },
      );
    }

    const courseIds = coachCourses.map((c) => c._id);

    // Find all pending payout enrollments
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

    // Build breakdown per course
    const courseMap: Record<
      string,
      {
        courseId: string;
        courseTitle: string;
        enrollmentCount: number;
        grossRevenue: number;
        platformFeePercent: number;
        platformCut: number;
        coachCut: number;
      }
    > = {};

    const enrollmentIds: string[] = [];

    for (const enrollment of pendingEnrollments) {
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

      const cid = course._id.toString();
      if (!courseMap[cid]) {
        courseMap[cid] = {
          courseId: cid,
          courseTitle: course.title || "Untitled Course",
          enrollmentCount: 0,
          grossRevenue: 0,
          platformFeePercent,
          platformCut: 0,
          coachCut: 0,
        };
      }

      courseMap[cid].enrollmentCount += 1;
      courseMap[cid].grossRevenue += amountPaid;
      courseMap[cid].platformCut += platformCut;
      courseMap[cid].coachCut += coachCut;

      enrollmentIds.push(enrollment._id.toString());
    }

    const breakdown = Object.values(courseMap);
    const totalAmount = breakdown.reduce((sum, b) => sum + b.coachCut, 0);

    // Create the payout request
    const payoutRequest = await PayoutRequest.create({
      coachId,
      managerId: session.userId,
      status: "pending_coach",
      totalAmount,
      breakdown,
      enrollmentIds,
    });

    // Send WhatsApp notification to coach
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const reviewUrl = `${baseUrl}coach/billing/payout-review/${payoutRequest._id}`;

    if (coach.whatsappNumber) {
      const courseList = breakdown
        .map((b) => `• ${b.courseTitle}: Rs. ${b.coachCut.toLocaleString()}`)
        .join("\n");

      const message = `Hello ${coach.name || "Coach"}!\n\nYour payout of *Rs. ${totalAmount.toLocaleString()}* is ready for review.\n\n*Course Breakdown:*\n${courseList}\n\nPlease review and confirm the payout on your billing page:\n${reviewUrl}\n\nThank you!`;

      try {
        await sendWhatsAppMessage(coach.whatsappNumber, message);
      } catch (waError) {
        console.error("Failed to send WhatsApp notification:", waError);
      }
    }

    return NextResponse.json({
      success: true,
      payoutRequestId: payoutRequest._id,
      message: "Payout request sent to coach for approval.",
    });
  } catch (error) {
    console.error("Error creating payout request:", error);
    return NextResponse.json(
      { error: "Failed to create payout request" },
      { status: 500 },
    );
  }
}
