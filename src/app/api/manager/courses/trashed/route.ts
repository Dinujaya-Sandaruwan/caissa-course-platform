import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const trashedCourses = await Course.find({ status: "trashed" })
      .populate("coach", "name phone")
      .select("title level price coach trashedAt createdAt")
      .sort({ trashedAt: -1 })
      .lean();

    return NextResponse.json(trashedCourses);
  } catch (error) {
    console.error("Error fetching trashed courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
