import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { notifyManagerNewReceipt } from "@/lib/whatsapp";
import User from "@/models/User";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const formData = await request.formData();
    const courseId = formData.get("courseId") as string;
    const referenceNumber = formData.get("referenceNumber") as string;
    const receiptFile = formData.get("receipt") as File | null;

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 },
      );
    }

    if (!referenceNumber?.trim()) {
      return NextResponse.json(
        { error: "referenceNumber is required" },
        { status: 400 },
      );
    }

    if (!receiptFile) {
      return NextResponse.json(
        { error: "Receipt image is required" },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(receiptFile.type)) {
      return NextResponse.json(
        { error: "Receipt must be a JPG, PNG, WebP, or PDF file" },
        { status: 400 },
      );
    }

    // Check course exists and is published
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    if (course.status !== "published") {
      return NextResponse.json(
        { error: "Course is not available for enrollment" },
        { status: 400 },
      );
    }

    // Check for existing enrollment
    const existingEnrollment = await Enrollment.findOne({
      studentId: session.userId,
      courseId,
      paymentStatus: { $in: ["pending_review", "approved"] },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        {
          error:
            existingEnrollment.paymentStatus === "approved"
              ? "You are already enrolled in this course"
              : "Your enrollment is pending review",
        },
        { status: 409 },
      );
    }

    // Save receipt file
    const ext = receiptFile.name.split(".").pop() || "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const receiptsDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "receipts",
    );
    await mkdir(receiptsDir, { recursive: true });

    const buffer = Buffer.from(await receiptFile.arrayBuffer());
    const filePath = path.join(receiptsDir, filename);
    await writeFile(filePath, buffer);

    const receiptImageUrl = `/api/files/receipts/${filename}`;

    // Create enrollment
    const enrollment = await Enrollment.create({
      studentId: session.userId,
      courseId,
      receiptImageUrl,
      referenceNumber: referenceNumber.trim(),
      amountPaid: course.price,
      paymentStatus: "pending_review",
    });

    // Notify manager
    const managerPhone = process.env.MANAGER_WHATSAPP_NUMBER;
    if (managerPhone) {
      const student = await User.findById(session.userId).select("name").lean();
      await notifyManagerNewReceipt(
        managerPhone,
        student?.name || "Student",
        course.title,
      );
    }

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const enrollments = await Enrollment.find({ studentId: session.userId })
      .populate("courseId", "title status price level thumbnailUrl")
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
