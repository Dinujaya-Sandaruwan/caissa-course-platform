import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import PayoutRequest from "@/models/PayoutRequest";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ coachId: string }> },
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { coachId } = await params;
    await connectDB();

    // Find the most recent payout request for this coach (any status)
    const latestRequest = await PayoutRequest.findOne({
      coachId,
    }).sort({ createdAt: -1 });

    // If no request exists, or the latest one is already paid, there's no active request
    if (!latestRequest || latestRequest.status === "paid") {
      return NextResponse.json({ activeRequest: null });
    }

    const activeRequest = latestRequest;

    return NextResponse.json({
      activeRequest: {
        _id: activeRequest._id,
        status: activeRequest.status,
        totalAmount: activeRequest.totalAmount,
        breakdown: activeRequest.breakdown,
        coachNote: activeRequest.coachNote,
        createdAt: activeRequest.createdAt,
        updatedAt: activeRequest.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching payout status:", error);
    return NextResponse.json(
      { error: "Failed to fetch payout status" },
      { status: 500 },
    );
  }
}
