import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CoachProfile from "@/models/CoachProfile";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Ensure User model is registered before populating
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    User.schema;

    const approvedCoaches = await CoachProfile.find({
      verificationStatus: { $in: ["approved", "paused"] },
    })
      .populate("userId", "name whatsappNumber email profilePhotoThumbnail")
      .sort({ verifiedAt: -1 });

    return NextResponse.json(approvedCoaches);
  } catch (error) {
    console.error("Error fetching approved coaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch approved coaches" },
      { status: 500 },
    );
  }
}
