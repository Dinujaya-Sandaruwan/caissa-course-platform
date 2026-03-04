import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import PayoutRequest from "@/models/PayoutRequest";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await params;
    await connectDB();

    const payoutRequest = await PayoutRequest.findOne({
      _id: requestId,
      coachId: session.userId,
    }).lean();

    if (!payoutRequest) {
      return NextResponse.json(
        { error: "Payout request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ payoutRequest });
  } catch (error) {
    console.error("Error fetching payout request:", error);
    return NextResponse.json(
      { error: "Failed to fetch payout request" },
      { status: 500 },
    );
  }
}
