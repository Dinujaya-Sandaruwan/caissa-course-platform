import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find all pending developer payout enrollments
    const pendingEnrollments = await Enrollment.find({
      paymentStatus: "approved",
      developerPayoutStatus: "pending",
    }).populate({
      path: "courseId",
      select: "price platformFee",
    });

    if (pendingEnrollments.length === 0) {
      return NextResponse.json(
        { error: "No pending developer payouts found" },
        { status: 400 },
      );
    }

    let totalPayout = 0;

    // Calculate total payout amount
    for (const enrollment of pendingEnrollments) {
      const course = enrollment.courseId as any;
      if (!course) continue;

      const amountPaid = enrollment.amountPaid || course.price;
      const platformFeePercent = course.platformFee || 0;

      const platformCut = amountPaid * (platformFeePercent / 100);
      const developerCut = platformCut * 0.05;

      totalPayout += developerCut;
    }

    // Execute Database Updates
    const enrollmentIds = pendingEnrollments.map((e) => e._id);
    await Enrollment.updateMany(
      { _id: { $in: enrollmentIds } },
      {
        $set: {
          developerPayoutStatus: "paid",
          developerPaidAt: new Date(),
        },
      },
    );

    return NextResponse.json({
      success: true,
      message: "Developer payout recorded successfully.",
      enrollmentsUpdated: enrollmentIds.length,
      payoutAmount: totalPayout,
    });
  } catch (error) {
    console.error("Error executing developer payout:", error);
    return NextResponse.json(
      { error: "Failed to process developer payout" },
      { status: 500 },
    );
  }
}
