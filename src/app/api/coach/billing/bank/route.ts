import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CoachProfile from "@/models/CoachProfile";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();

    if (!session || session.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { accountOwnerName, bankName, bankLocation, accountNumber } = body;

    if (!accountOwnerName || !bankName || !bankLocation || !accountNumber) {
      return NextResponse.json(
        { error: "All bank details are required" },
        { status: 400 },
      );
    }

    await connectDB();

    const updatedProfile = await CoachProfile.findOneAndUpdate(
      { userId: session.userId },
      {
        $set: {
          bankDetails: {
            accountOwnerName,
            bankName,
            bankLocation,
            accountNumber,
          },
        },
      },
      { new: true },
    );

    if (!updatedProfile) {
      return NextResponse.json(
        { error: "Coach profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      bankDetails: updatedProfile.bankDetails,
    });
  } catch (error) {
    console.error("Error saving coach bank details:", error);
    return NextResponse.json(
      { error: "Failed to save bank details" },
      { status: 500 },
    );
  }
}
