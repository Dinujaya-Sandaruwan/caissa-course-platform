import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CoachProfile from "@/models/CoachProfile";
import User from "@/models/User";
import {
  notifyCoachAccountApproved,
  notifyCoachAccountRejected,
} from "@/lib/whatsapp";

import mongoose from "mongoose";
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

    const { action, notes } = await req.json();

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approved' or 'rejected'." },
        { status: 400 },
      );
    }

    if (action === "rejected" && !notes?.trim()) {
      return NextResponse.json(
        { error: "Notes are required when rejecting an application." },
        { status: 400 },
      );
    }

    await connectDB();

    const coachProfile = await CoachProfile.findById(id).populate(
      "userId",
      "name whatsappNumber role",
    );

    if (!coachProfile) {
      return NextResponse.json(
        { error: "Coach profile not found" },
        { status: 404 },
      );
    }

    // Update profile
    coachProfile.verificationStatus = action;
    coachProfile.verificationNotes = notes?.trim() || undefined;
    coachProfile.verifiedBy =
      session.userId as unknown as mongoose.Types.ObjectId;
    coachProfile.verifiedAt = new Date();

    await coachProfile.save();

    // Update base user status if necessary (e.g. they are officially a coach now)
    const user = await User.findById(coachProfile.userId._id);
    if (user && action === "approved") {
      user.role = "coach";
      await user.save();
    }

    // Send WhatsApp notification
    try {
      if (user?.whatsappNumber) {
        if (action === "approved") {
          await notifyCoachAccountApproved(user.whatsappNumber);
        } else {
          await notifyCoachAccountRejected(user.whatsappNumber, notes);
        }
      }
    } catch (waError) {
      console.error("Failed to send WhatsApp verification update:", waError);
    }

    const coachName = (coachProfile.userId as any)?.name || "Unknown Coach";
    logAction({
      managerId: session.userId,
      action:
        action === "approved"
          ? `Verified coach "${coachName}"`
          : `Rejected coach "${coachName}"`,
      category: "coaches",
      targetId: id,
      targetName: coachName,
      details: notes?.trim() || undefined,
    });

    return NextResponse.json({ success: true, profile: coachProfile });
  } catch (error) {
    console.error("Error verifying coach:", error);
    return NextResponse.json(
      { error: "Failed to verify coach" },
      { status: 500 },
    );
  }
}
