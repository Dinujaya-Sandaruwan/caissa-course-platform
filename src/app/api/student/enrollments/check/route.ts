import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "student") {
      return NextResponse.json({ enrolled: false });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ enrolled: false });
    }

    await connectDB();

    const enrollment = await Enrollment.findOne({
      studentId: session.userId,
      courseId,
      paymentStatus: { $in: ["pending_review", "approved"] },
    }).lean();

    return NextResponse.json({
      enrolled: !!enrollment,
      status: enrollment?.paymentStatus || null,
    });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return NextResponse.json({ enrolled: false });
  }
}
