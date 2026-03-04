import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import CoachProfile from "@/models/CoachProfile";
import User from "@/models/User";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ coachId: string }> },
) {
  try {
    const session = await getSessionUser();

    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { coachId } = await params;

    if (!coachId) {
      return NextResponse.json(
        { error: "Coach ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // 1. Get the coach user and profile
    const coachUser = await User.findById(coachId)
      .select("name whatsappNumber profilePhoto profilePhotoThumbnail")
      .lean();

    if (!coachUser) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    const coachProfile = await CoachProfile.findOne({ userId: coachId })
      .select("bankDetails")
      .lean();

    // 2. Fetch all unpaid (pending) enrollments for this coach
    const pendingEnrollmentsQuery = {
      paymentStatus: "approved",
      coachPayoutStatus: "pending",
    };

    const pendingEnrollments = await Enrollment.find(pendingEnrollmentsQuery)
      .populate({
        path: "courseId",
        match: { coach: coachId }, // Ensure course belongs to this coach
        select: "title price platformFee allowDiscounts discountedPrice",
      })
      .populate({
        path: "studentId",
        select: "name",
      })
      .lean();

    // Filter out enrollments where the course doesn't match the coach (due to populate match)
    // or if the course was completely deleted.
    const coachEnrollments = pendingEnrollments.filter((e: any) => e.courseId);

    // 3. Process the breakdown
    let totalPendingAmount = 0;
    const breakdown = coachEnrollments.map((e: any) => {
      const course = e.courseId;
      const student = e.studentId;

      const actualCoursePrice =
        course.allowDiscounts && course.discountedPrice
          ? course.discountedPrice
          : course.price;

      // The amount paid by the student
      const amountPaid = e.amountPaid || actualCoursePrice;
      const platformFeePercent = course.platformFee || 0;

      const platformCut = amountPaid * (platformFeePercent / 100);
      const coachCut = amountPaid - platformCut;

      totalPendingAmount += coachCut;

      return {
        _id: e._id,
        enrollmentId: e.enrollmentId,
        enrolledAt: e.enrolledAt,
        studentName: student?.name || "Unknown Student",
        courseId: course._id,
        courseTitle: course.title,
        amountPaid,
        platformFeePercent,
        platformCut,
        coachCut,
      };
    });

    return NextResponse.json({
      coach: {
        id: coachUser._id,
        name: coachUser.name,
        whatsappNumber: coachUser.whatsappNumber,
        profilePicture: coachUser.profilePhoto,
        profilePictureThumbnail: coachUser.profilePhotoThumbnail,
        bankDetails: coachProfile?.bankDetails || null,
      },
      summary: {
        totalPendingAmount,
        totalEnrollments: breakdown.length,
      },
      breakdown,
    });
  } catch (error) {
    console.error("Error fetching detailed coach payout data:", error);
    return NextResponse.json(
      { error: "Failed to fetch payout details" },
      { status: 500 },
    );
  }
}
