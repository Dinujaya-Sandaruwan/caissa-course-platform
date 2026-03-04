import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import PayoutRequest from "@/models/PayoutRequest";
import User from "@/models/User";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await params;
    const { action, note } = await req.json();

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'." },
        { status: 400 },
      );
    }

    await connectDB();

    const payoutRequest = await PayoutRequest.findOne({
      _id: requestId,
      coachId: session.userId,
      status: "pending_coach",
    });

    if (!payoutRequest) {
      return NextResponse.json(
        { error: "Payout request not found or already responded to" },
        { status: 404 },
      );
    }

    if (action === "approve") {
      payoutRequest.status = "coach_approved";
    } else {
      payoutRequest.status = "coach_rejected";
      payoutRequest.coachNote = note || "No reason provided";
    }

    await payoutRequest.save();

    // Notify manager via WhatsApp
    const manager = await User.findById(payoutRequest.managerId);
    const coach = await User.findById(session.userId);

    if (manager?.whatsappNumber) {
      const statusText = action === "approve" ? "✅ APPROVED" : "❌ REJECTED";
      const message = `Payout Update:\n\nCoach *${coach?.name || "Unknown"}* has ${statusText} the payout request of *Rs. ${payoutRequest.totalAmount.toLocaleString()}*.${action === "reject" && note ? `\n\nReason: ${note}` : ""}\n\nPlease check the payments dashboard for details.`;

      try {
        await sendWhatsAppMessage(manager.whatsappNumber, message);
      } catch (waError) {
        console.error("Failed to send WhatsApp notification:", waError);
      }
    }

    return NextResponse.json({
      success: true,
      message:
        action === "approve"
          ? "Payout request approved. The manager will process your payment."
          : "Payout request rejected. The manager has been notified.",
    });
  } catch (error) {
    console.error("Error responding to payout request:", error);
    return NextResponse.json(
      { error: "Failed to respond to payout request" },
      { status: 500 },
    );
  }
}
