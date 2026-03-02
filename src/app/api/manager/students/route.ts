import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile"; // Ensure it gets registered

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const skillLevel = searchParams.get("skillLevel");

    await connectDB();

    const query: any = { role: "student" };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { whatsappNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const pipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: "studentprofiles",
          localField: "_id",
          foreignField: "userId",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (skillLevel) {
      pipeline.push({
        $match: {
          "profile.skillLevel": skillLevel,
        },
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    const students = await User.aggregate(pipeline);

    const formattedStudents = students.map((student) => ({
      _id: student._id.toString(),
      name: student.name,
      whatsappNumber: student.whatsappNumber,
      email: student.email,
      status: student.status,
      profilePhoto: student.profilePhoto,
      profilePhotoThumbnail: student.profilePhotoThumbnail,
      createdAt: student.createdAt,
      lastLoginAt: student.lastLoginAt,
      skillLevel: student.profile?.skillLevel || "beginner",
      city: student.profile?.city,
      gender: student.profile?.gender,
      fideId: student.profile?.fideId,
      totalStudyHours: student.profile?.totalStudyHours || 0,
      totalCoursesCompleted: student.profile?.totalCoursesCompleted || 0,
    }));

    return NextResponse.json(formattedStudents);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
