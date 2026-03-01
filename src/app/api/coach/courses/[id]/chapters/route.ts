import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Chapter from "@/models/Chapter";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: courseId } = await params;
    const user = await getSessionUser();

    if (!user || user.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Verify the course exists and belongs to the coach
    const course = await Course.findOne({
      _id: courseId,
      coach: user.userId,
    }).lean();

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or unauthorized" },
        { status: 404 },
      );
    }

    if (!["draft", "pending_review", "rejected"].includes(course.status)) {
      return NextResponse.json(
        { error: "Cannot add chapters to this course in its current status" },
        { status: 403 },
      );
    }

    const { title } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Chapter title is required" },
        { status: 400 },
      );
    }

    // Determine the next order number
    const existingChaptersCount = await Chapter.countDocuments({ courseId });
    const order = existingChaptersCount + 1;

    const newChapter = await Chapter.create({
      courseId,
      title: title.trim(),
      order,
    });

    return NextResponse.json(newChapter, { status: 201 });
  } catch (error) {
    console.error("Error creating chapter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
