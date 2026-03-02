import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: studentId } = await params;
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ _id: studentId, role: "student" }).lean();
    if (!user) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const profile = await StudentProfile.findOne({ userId: studentId }).lean();

    return NextResponse.json({
      ...user,
      profile: profile || {},
    });
  } catch (error) {
    console.error("Error fetching single student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: studentId } = await params;
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectDB();

    const user = await User.findOne({ _id: studentId, role: "student" });
    if (!user) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Update User fields
    if (data.name) user.name = data.name;
    if (data.email !== undefined) user.email = data.email;
    if (data.whatsappNumber) user.whatsappNumber = data.whatsappNumber;
    if (data.status) user.status = data.status;

    await user.save();

    // Update StudentProfile fields
    let profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) {
      // Create if it doesn't exist just to prevent crashes
      profile = new StudentProfile({
        userId: studentId,
        dateOfBirth: new Date(),
        gender: "other",
      });
    }

    if (data.skillLevel) profile.skillLevel = data.skillLevel;
    if (data.city !== undefined) profile.city = data.city;
    if (data.fideId !== undefined) profile.fideId = data.fideId;
    if (data.preferredLanguage)
      profile.preferredLanguage = data.preferredLanguage;
    if (data.gender) profile.gender = data.gender;
    if (data.parentName !== undefined) profile.parentName = data.parentName;

    if (data.dateOfBirth) {
      profile.dateOfBirth = new Date(data.dateOfBirth);
    }
    if (data.parentDateOfBirth) {
      profile.parentDateOfBirth = new Date(data.parentDateOfBirth);
    }

    await profile.save();

    return NextResponse.json({ message: "Student updated successfully" });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: studentId } = await params;
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ _id: studentId, role: "student" });
    if (!user) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Soft delete: set status to suspended
    user.status = "suspended";
    await user.save();

    return NextResponse.json({ message: "Student suspended successfully" });
  } catch (error) {
    console.error("Error suspending student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
