import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import CoachProfile from "@/models/CoachProfile";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch all courses belonging to this coach
    const courses = await Course.find({ coach: user.userId })
      .select("title status price level enrollmentCount createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Verify coach is actually approved before they can create a course
    const profile = await CoachProfile.findOne({ userId: user.userId }).lean();
    if (!profile || profile.verificationStatus !== "approved") {
      return NextResponse.json(
        { error: "Coach account is pending verification or rejected" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { title, description, price, level, tags } = body;

    if (!title || !description || price === undefined || !level) {
      return NextResponse.json(
        {
          error: "Missing required fields: title, description, price, or level",
        },
        { status: 400 },
      );
    }

    // Create a new draft course
    const newCourse = await Course.create({
      coach: user.userId,
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      level,
      tags: Array.isArray(tags) ? tags : [],
      status: "draft",
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
