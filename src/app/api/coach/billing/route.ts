import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();

    if (!session || session.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // 1. Fetch all courses belonging to this coach
    const coachCourses = await Course.find({ coach: session.userId })
      .select("_id title price platformFee allowDiscounts discountedPrice")
      .lean();

    if (!coachCourses.length) {
      return NextResponse.json({
        summary: {
          lifetimeRevenue: 0,
          pendingPayout: 0,
          totalEnrolledStudents: 0,
        },
        courseBreakdowns: [],
      });
    }

    const courseIds = coachCourses.map((c) => c._id);

    // 2. Fetch all approved enrollments tied to the coach's courses
    const enrollments = await Enrollment.find({
      courseId: { $in: courseIds },
      paymentStatus: "approved",
    }).lean();

    let lifetimeRevenue = 0;
    let pendingPayout = 0;
    let totalEnrolledStudents = enrollments.length;

    // Dictionary to group financial stats by course
    const courseStatsMap: Record<
      string,
      {
        courseId: string;
        title: string;
        enrolledStudents: number;
        revenueGenerated: number; // Pure revenue (coach cut)
      }
    > = {};

    // Initialize mapping with all the coach's courses (even if 0 students)
    coachCourses.forEach((course) => {
      courseStatsMap[course._id.toString()] = {
        courseId: course._id.toString(),
        title: course.title,
        enrolledStudents: 0,
        revenueGenerated: 0,
      };
    });

    // 3. Mathematical tabulation of individual enrollment cuts
    enrollments.forEach((enrollment: any) => {
      const courseIdStr = enrollment.courseId.toString();
      const course = coachCourses.find((c) => c._id.toString() === courseIdStr);

      if (!course) return;

      const actualCoursePrice =
        course.allowDiscounts && course.discountedPrice
          ? course.discountedPrice
          : course.price;
      const amountPaid = enrollment.amountPaid || actualCoursePrice;
      const platformFeePercent = course.platformFee || 0;

      const platformCut = amountPaid * (platformFeePercent / 100);
      const coachCut = amountPaid - platformCut;

      // Global Stats Aggregator
      lifetimeRevenue += coachCut;
      if (enrollment.coachPayoutStatus === "pending") {
        pendingPayout += coachCut;
      }

      // Individual Course Table Aggregator
      courseStatsMap[courseIdStr].enrolledStudents += 1;
      courseStatsMap[courseIdStr].revenueGenerated += coachCut;
    });

    // Sort courses by revenue generated (Highest first)
    const courseBreakdowns = Object.values(courseStatsMap).sort(
      (a, b) => b.revenueGenerated - a.revenueGenerated,
    );

    return NextResponse.json({
      summary: {
        lifetimeRevenue,
        pendingPayout,
        totalEnrolledStudents,
      },
      courseBreakdowns,
    });
  } catch (error) {
    console.error("Error fetching coach billing analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing analytics" },
      { status: 500 },
    );
  }
}
