import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import CoachProfile from "@/models/CoachProfile";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: userId } = await params;
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch the user (coach) basic info
    const user = await User.findById(userId)
      .select("name email whatsappNumber profilePhoto profilePhotoThumbnail")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    // Fetch the coach profile by userId
    const coachProfile = await CoachProfile.findOne({ userId })
      .select(
        "fideId fideRating bio specializations coachAchievements playerAchievements dateOfBirth address cvUrl verificationStatus bankDetails verifiedAt",
      )
      .lean();

    return NextResponse.json({
      user,
      profile: coachProfile || null,
    });
  } catch (error) {
    console.error("Error fetching coach details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
