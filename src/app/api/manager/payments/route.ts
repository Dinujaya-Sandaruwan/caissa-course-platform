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

    // Fetch all approved enrollments, populate course info (price, fee) and coach info
    const enrollments = await Enrollment.find({ paymentStatus: "approved" })
      .populate({
        path: "courseId",
        select: "title price platformFee coach allowDiscounts discountedPrice",
        populate: {
          path: "coach",
          select: "name whatsappNumber profilePhoto profilePhotoThumbnail",
        },
      })
      .lean();

    let totalOwedToCoaches = 0;
    let totalPlatformRevenue = 0;
    let developerCut = 0;

    // Dictionary to group pending amounts by coach
    const coachesMap: Record<
      string,
      {
        coachId: string;
        name: string;
        whatsappNumber: string;
        profilePicture?: string;
        profilePictureThumbnail?: string;
        pendingAmount: number;
        unpaidEnrollments: number;
      }
    > = {};

    enrollments.forEach((enrollment: any) => {
      // Safety check in case a course or coach was deleted
      if (!enrollment.courseId || !enrollment.courseId.coach) return;

      const course = enrollment.courseId;
      const actualCoursePrice =
        course.allowDiscounts && course.discountedPrice
          ? course.discountedPrice
          : course.price;
      const amountPaid = enrollment.amountPaid || actualCoursePrice; // Fallback to course price if amountPaid is missing
      const platformFeePercent = course.platformFee || 0;

      const platformCut = amountPaid * (platformFeePercent / 100);
      const coachCut = amountPaid - platformCut;

      totalPlatformRevenue += platformCut;

      if (enrollment.developerPayoutStatus === "pending") {
        developerCut += platformCut * 0.05;
      }

      const coach = course.coach;
      const coachIdStr = coach._id.toString();

      // Ensure every coach with approved enrollments is in the map so we can show them even if owed 0
      if (!coachesMap[coachIdStr]) {
        coachesMap[coachIdStr] = {
          coachId: coachIdStr,
          name: coach.name || "Unknown Coach",
          whatsappNumber: coach.whatsappNumber || "",
          profilePicture: coach.profilePhoto || undefined,
          profilePictureThumbnail: coach.profilePhotoThumbnail || undefined,
          pendingAmount: 0,
          unpaidEnrollments: 0,
        };
      }

      if (enrollment.coachPayoutStatus === "pending") {
        totalOwedToCoaches += coachCut;
        coachesMap[coachIdStr].pendingAmount += coachCut;
        coachesMap[coachIdStr].unpaidEnrollments += 1;
      }
    });

    // Convert the dictionary map to a flat array for the frontend table
    const coachBreakdowns = Object.values(coachesMap).sort(
      (a, b) => b.pendingAmount - a.pendingAmount,
    );

    return NextResponse.json({
      summary: {
        totalOwedToCoaches,
        totalPlatformRevenue,
        developerCut,
      },
      coachBreakdowns,
    });
  } catch (error) {
    console.error("Error fetching manager payment analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment analytics" },
      { status: 500 },
    );
  }
}
