import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CoachProfile from "@/models/CoachProfile";
import { logAction } from "@/lib/auditLog";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json();

    if (!["pause", "unpause"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'pause' or 'unpause'." },
        { status: 400 },
      );
    }

    await connectDB();

    const coachProfile = await CoachProfile.findById(id);

    if (!coachProfile) {
      return NextResponse.json(
        { error: "Coach profile not found" },
        { status: 404 },
      );
    }

    if (action === "pause" && coachProfile.verificationStatus !== "approved") {
      return NextResponse.json(
        { error: "Only approved coaches can be paused." },
        { status: 400 },
      );
    }

    if (action === "unpause" && coachProfile.verificationStatus !== "paused") {
      return NextResponse.json(
        { error: "Only paused coaches can be unpaused." },
        { status: 400 },
      );
    }

    coachProfile.verificationStatus =
      action === "pause" ? "paused" : "approved";
    await coachProfile.save();

    logAction({
      managerId: session.userId,
      action:
        action === "pause" ? `Paused coach account` : `Resumed coach account`,
      category: "coaches",
      targetId: id,
    });

    return NextResponse.json({ success: true, profile: coachProfile });
  } catch (error) {
    console.error("Error toggling coach pause:", error);
    return NextResponse.json(
      { error: "Failed to update coach status" },
      { status: 500 },
    );
  }
}
