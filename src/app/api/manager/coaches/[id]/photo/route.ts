import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CoachProfile from "@/models/CoachProfile";
import User from "@/models/User";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    User.schema;

    const coach = await CoachProfile.findById(id).populate(
      "userId",
      "profilePhoto",
    );

    if (!coach || !coach.userId) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    // Return the URL explicitly, or null if they don't have one
    const profilePhotoUrl = (coach.userId as any).profilePhoto || null;
    return NextResponse.json({ url: profilePhotoUrl });
  } catch (error) {
    console.error("Error fetching coach photo:", error);
    return NextResponse.json(
      { error: "Failed to fetch coach photo" },
      { status: 500 },
    );
  }
}
