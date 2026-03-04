import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import PayoutRequest from "@/models/PayoutRequest";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find active payout requests for this coach
    const requests = await PayoutRequest.find({
      coachId: session.userId,
      status: { $in: ["pending_coach", "coach_approved"] },
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching payout requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch payout requests" },
      { status: 500 },
    );
  }
}
