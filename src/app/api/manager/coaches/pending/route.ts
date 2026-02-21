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
    // This is sometimes necessary in serverless environments
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    User.schema;

    const pendingCoaches = await CoachProfile.find({
      verificationStatus: "pending",
    })
      .populate("userId", "name whatsappNumber")
      .sort({ createdAt: 1 }); // Oldest first

    return NextResponse.json(pendingCoaches);
  } catch (error) {
    console.error("Error fetching pending coaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending coaches" },
      { status: 500 },
    );
  }
}
