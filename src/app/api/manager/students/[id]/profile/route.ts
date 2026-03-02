import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const resolvedParams = await params;
    const studentId = resolvedParams.id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json(
        { error: "Invalid student ID" },
        { status: 400 },
      );
    }

    const user = await User.findById(studentId)
      .select(
        "name nickname email whatsappNumber profilePhoto profilePhotoThumbnail status createdAt",
      )
      .lean();

    if (!user) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const studentProfile = await StudentProfile.findOne({
      userId: studentId,
    }).lean();

    return NextResponse.json({
      ...user,
      profile: studentProfile || null,
    });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
