import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import PayoutRequest from "@/models/PayoutRequest";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { coachId, payoutRequestId } = await req.json();

    if (!coachId || !payoutRequestId) {
      return NextResponse.json(
        { error: "Coach ID and Payout Request ID are required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Find the approved payout request
    const payoutRequest = await PayoutRequest.findOne({
      _id: payoutRequestId,
      coachId,
      status: "coach_approved",
    });

    if (!payoutRequest) {
      return NextResponse.json(
        {
          error:
            "No approved payout request found. The coach must approve the request before payment can be processed.",
        },
        { status: 400 },
      );
    }

    // Get coach data for WhatsApp notification
    const coach = await User.findById(coachId);

    // Execute Database Updates — mark enrollments as paid
    await Enrollment.updateMany(
      { _id: { $in: payoutRequest.enrollmentIds } },
      {
        $set: {
          coachPayoutStatus: "paid",
          coachPaidAt: new Date(),
        },
      },
    );

    // Update payout request status to paid
    payoutRequest.status = "paid";
    await payoutRequest.save();

    // Send WhatsApp Notification to Coach
    if (coach?.whatsappNumber && payoutRequest.totalAmount > 0) {
      const message = `Hello ${coach.name || "Coach"}!\n\nGreat news! Your payout of *Rs. ${payoutRequest.totalAmount.toLocaleString()}* has been successfully processed via bank transfer.\n\nThank you for teaching on Caissa Chess Academy.`;

      try {
        await sendWhatsAppMessage(coach.whatsappNumber, message);
      } catch (waError) {
        console.error("Failed to send WhatsApp payout notification:", waError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payout completed successfully.",
      enrollmentsUpdated: payoutRequest.enrollmentIds.length,
      payoutAmount: payoutRequest.totalAmount,
    });
  } catch (error) {
    console.error("Error executing coach payout:", error);
    return NextResponse.json(
      { error: "Failed to process payout" },
      { status: 500 },
    );
  }
}
