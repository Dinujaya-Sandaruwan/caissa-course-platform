import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch all courses that are NOT trashed
    const courses = await Course.find({ status: { $ne: "trashed" } })
      .populate("coach", "name")
      .select(
        "_id title price status platformFee coach allowDiscounts discountedPrice",
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses for platform fees:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}
