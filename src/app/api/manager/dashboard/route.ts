import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CoachProfile from "@/models/CoachProfile";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [
      pendingCoaches,
      pendingCourses,
      pendingEnrollments,
      publishedCourses,
    ] = await Promise.all([
      CoachProfile.countDocuments({ verificationStatus: "pending" }),
      Course.countDocuments({ status: "pending_review" }),
      Enrollment.countDocuments({ paymentStatus: "pending_review" }),
      Course.countDocuments({ status: "published" }),
    ]);

    return NextResponse.json({
      pendingCoaches,
      pendingCourses,
      pendingEnrollments,
      publishedCourses,
    });
  } catch (error) {
    console.error("Error fetching manager dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
