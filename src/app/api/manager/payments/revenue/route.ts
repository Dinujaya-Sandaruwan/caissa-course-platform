import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const enrollments = await Enrollment.find({ paymentStatus: "approved" })
      .populate({
        path: "courseId",
        select: "title price platformFee coach allowDiscounts discountedPrice",
        populate: {
          path: "coach",
          select: "name",
        },
      })
      .lean();

    // Group by month
    const monthsMap: Record<
      string,
      {
        key: string;
        label: string;
        year: number;
        month: number;
        grossRevenue: number;
        platformRevenue: number;
        coachPayouts: number;
        developerPayouts: number;
        netProfit: number;
        enrollmentCount: number;
        coursesMap: Record<
          string,
          {
            courseId: string;
            title: string;
            coachName: string;
            enrollmentCount: number;
            grossRevenue: number;
            platformRevenue: number;
          }
        >;
      }
    > = {};

    // Lifetime totals
    let lifetimeGross = 0;
    let lifetimePlatform = 0;
    let lifetimeCoachPayouts = 0;
    let lifetimeDeveloperPayouts = 0;
    let lifetimeEnrollments = 0;

    enrollments.forEach((enrollment: any) => {
      if (!enrollment.courseId) return;

      const course = enrollment.courseId;
      const actualCoursePrice =
        course.allowDiscounts && course.discountedPrice
          ? course.discountedPrice
          : course.price;
      const amountPaid = enrollment.amountPaid || actualCoursePrice;
      const platformFeePercent = course.platformFee || 0;

      const platformCut = amountPaid * (platformFeePercent / 100);
      const coachCut = amountPaid - platformCut;
      const developerCut = platformCut * 0.05;

      // Group by month using enrolledAt or createdAt
      const date = new Date(
        enrollment.enrolledAt || enrollment.createdAt || Date.now(),
      );
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-indexed
      const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
      const monthLabel = date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });

      if (!monthsMap[monthKey]) {
        monthsMap[monthKey] = {
          key: monthKey,
          label: monthLabel,
          year,
          month,
          grossRevenue: 0,
          platformRevenue: 0,
          coachPayouts: 0,
          developerPayouts: 0,
          netProfit: 0,
          enrollmentCount: 0,
          coursesMap: {},
        };
      }

      const m = monthsMap[monthKey];
      m.grossRevenue += amountPaid;
      m.platformRevenue += platformCut;
      m.coachPayouts += coachCut;
      m.developerPayouts += developerCut;
      m.enrollmentCount += 1;

      // Track per-course stats within the month
      const courseIdStr = course._id.toString();
      if (!m.coursesMap[courseIdStr]) {
        m.coursesMap[courseIdStr] = {
          courseId: courseIdStr,
          title: course.title || "Untitled Course",
          coachName: course.coach?.name || "Unknown Coach",
          enrollmentCount: 0,
          grossRevenue: 0,
          platformRevenue: 0,
        };
      }
      m.coursesMap[courseIdStr].enrollmentCount += 1;
      m.coursesMap[courseIdStr].grossRevenue += amountPaid;
      m.coursesMap[courseIdStr].platformRevenue += platformCut;

      // Lifetime
      lifetimeGross += amountPaid;
      lifetimePlatform += platformCut;
      lifetimeCoachPayouts += coachCut;
      lifetimeDeveloperPayouts += developerCut;
      lifetimeEnrollments += 1;
    });

    // Flatten and sort months newest-first
    const months = Object.values(monthsMap)
      .map((m) => ({
        ...m,
        netProfit: m.platformRevenue - m.developerPayouts,
        courses: Object.values(m.coursesMap)
          .sort((a, b) => b.platformRevenue - a.platformRevenue)
          .slice(0, 10), // Top 10 courses per month
        coursesMap: undefined,
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

    return NextResponse.json({
      lifetime: {
        grossRevenue: lifetimeGross,
        platformRevenue: lifetimePlatform,
        coachPayouts: lifetimeCoachPayouts,
        developerPayouts: lifetimeDeveloperPayouts,
        netProfit: lifetimePlatform - lifetimeDeveloperPayouts,
        totalEnrollments: lifetimeEnrollments,
      },
      months,
    });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue data" },
      { status: 500 },
    );
  }
}
