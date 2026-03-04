import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

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
    const body = await req.json();
    const { pendingAmount } = body;

    if (!coachId) {
      return NextResponse.json(
        { error: "Coach ID is required" },
        { status: 400 },
      );
    }

    if (pendingAmount === undefined || pendingAmount === null) {
      return NextResponse.json(
        { error: "Pending amount is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const coachUser = await User.findById(coachId).lean();

    if (!coachUser || !coachUser.whatsappNumber) {
      return NextResponse.json(
        { error: "Coach or WhatsApp number not found" },
        { status: 404 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://caissa.lk/";
    const billingUrl = `${baseUrl}coach/settings/billing`;

    const message = `Hello ${coachUser.name || "Coach"},\n\nYou have a pending payout of *Rs. ${Number(pendingAmount).toLocaleString()}*. However, we cannot process this payment because your bank details are missing.\n\nPlease update your billing information here: ${billingUrl}`;

    await sendWhatsAppMessage(coachUser.whatsappNumber, message);

    return NextResponse.json({
      success: true,
      message: "WhatsApp notification sent successfully",
    });
  } catch (error) {
    console.error("Error sending WhatsApp bank details notification:", error);
    return NextResponse.json(
      { error: "Failed to send WhatsApp notification" },
      { status: 500 },
    );
  }
}
