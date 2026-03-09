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

    const courses = await Course.find({ status: "approved" })
      .populate("coach", "name phone")
      .select("title price level createdAt coach ageMin ageMax")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching draft courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
