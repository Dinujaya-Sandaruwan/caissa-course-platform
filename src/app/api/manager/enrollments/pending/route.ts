import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const enrollments = await Enrollment.find({
      paymentStatus: { $in: ["pending_review", "on_hold"] },
    })
      .populate("studentId", "name whatsappNumber profilePhotoThumbnail")
      .populate("courseId", "title price")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("Error fetching pending enrollments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
