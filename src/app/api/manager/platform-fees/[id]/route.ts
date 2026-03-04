import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import { logAction } from "@/lib/auditLog";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platformFee } = await req.json();

    if (
      platformFee === undefined ||
      typeof platformFee !== "number" ||
      platformFee < 5 ||
      platformFee > 100
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid platform fee percentage. It must be a number between 5 and 100.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { platformFee },
      { new: true },
    );

    if (!updatedCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    logAction({
      managerId: session.userId,
      action: `Updated platform fee to ${platformFee}%`,
      category: "platform-fees",
      targetId: id,
      targetName: updatedCourse.title,
    });

    return NextResponse.json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating platform fee:", error);
    return NextResponse.json(
      { error: "Failed to update platform fee" },
      { status: 500 },
    );
  }
}
