import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import { logAction } from "@/lib/auditLog";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: courseId } = await params;
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { previewVideoUrl } = body;

    if (!previewVideoUrl || typeof previewVideoUrl !== "string") {
      return NextResponse.json(
        { error: "previewVideoUrl is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const course = await Course.findByIdAndUpdate(
      courseId,
      { previewVideoUrl },
      { new: true },
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    logAction({
      managerId: session.userId,
      action: `Updated preview URL for course "${course.title}"`,
      category: "courses",
      targetId: courseId,
      targetName: course.title,
    });

    return NextResponse.json({
      message: "Preview video URL updated",
      course,
    });
  } catch (error) {
    console.error("Error updating preview URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
