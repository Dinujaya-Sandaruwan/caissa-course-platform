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

    await connectDB();

    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.status !== "published") {
      return NextResponse.json(
        { error: "Only published courses can be unpublished" },
        { status: 400 },
      );
    }

    course.status = "unpublished";
    await course.save();

    logAction({
      managerId: session.userId,
      action: `Unpublished course "${course.title}"`,
      category: "courses",
      targetId: courseId,
      targetName: course.title,
    });

    return NextResponse.json({
      message: "Course unpublished successfully",
      course,
    });
  } catch (error) {
    console.error("Error unpublishing course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
