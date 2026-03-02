import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import "@/models/User"; // Ensure schema is registered
import "@/models/Course"; // Ensure schema is registered

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";

    await connectDB();

    const query: Record<string, unknown> = {};
    if (filter === "pending") {
      query.paymentStatus = { $in: ["pending_review", "on_hold"] };
    } else if (filter === "approved") {
      query.paymentStatus = "approved";
    }

    const enrollments = await Enrollment.find(query)
      .populate("studentId", "name whatsappNumber profilePhotoThumbnail")
      .populate("courseId", "title price")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
