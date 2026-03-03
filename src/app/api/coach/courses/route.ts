import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Tag from "@/models/Tag";
import CoachProfile from "@/models/CoachProfile";
import mongoose from "mongoose";
import {
  validateRequiredString,
  validateNumber,
  validateEnum,
  stripHtml,
} from "@/lib/validation";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch all courses belonging to this coach
    const courses = await Course.find({
      coach: user.userId,
      status: { $ne: "trashed" },
    })
      .select(
        "title status price discountedPrice allowDiscounts level enrollmentCount createdAt thumbnailUrl durationHours durationMinutes reviewNotes",
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Verify coach is actually approved before they can create a course
    const profile = await CoachProfile.findOne({ userId: user.userId }).lean();
    if (!profile || profile.verificationStatus !== "approved") {
      return NextResponse.json(
        { error: "Coach account is pending verification or rejected" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      level,
      category,
      tags,
      tempThumbnailPath,
      allowDiscounts,
      maxDiscountPercent,
      discountedPrice,
      durationHours,
      durationMinutes,
    } = body;

    // Validate required fields
    const titleResult = validateRequiredString(title, "Title", {
      maxLength: 60,
    });
    if ("error" in titleResult)
      return NextResponse.json({ error: titleResult.error }, { status: 400 });

    const descResult = validateRequiredString(description, "Description");
    if ("error" in descResult)
      return NextResponse.json({ error: descResult.error }, { status: 400 });

    const priceResult = validateNumber(price, "Price", {
      required: true,
      min: 0,
      max: 1000000,
    });
    if ("error" in priceResult)
      return NextResponse.json({ error: priceResult.error }, { status: 400 });

    const levelResult = validateEnum(level, "Level", [
      "beginner",
      "intermediate",
      "advanced",
    ]);
    if ("error" in levelResult)
      return NextResponse.json({ error: levelResult.error }, { status: 400 });

    const durationHrsResult = validateNumber(durationHours, "Duration Hours", {
      required: true,
      min: 0,
      max: 1000,
    });
    if ("error" in durationHrsResult)
      return NextResponse.json(
        { error: durationHrsResult.error },
        { status: 400 },
      );

    const durationMinsResult = validateNumber(
      durationMinutes,
      "Duration Minutes",
      {
        required: true,
        min: 0,
        max: 59,
      },
    );
    if ("error" in durationMinsResult)
      return NextResponse.json(
        { error: durationMinsResult.error },
        { status: 400 },
      );

    // Sanitize tags
    const safeTags = Array.isArray(tags)
      ? tags
          .filter((t: unknown) => typeof t === "string")
          .map((t: string) => stripHtml(t))
      : [];

    if (!tempThumbnailPath || typeof tempThumbnailPath !== "string") {
      return NextResponse.json(
        { error: "Course thumbnail is required." },
        { status: 400 },
      );
    }

    // Process Thumbnail File
    const UPLOAD_DIR = process.env.UPLOAD_DIR || "public/uploads";
    const tempFileName = tempThumbnailPath.split("/").pop();
    if (!tempFileName) {
      return NextResponse.json(
        { error: "Invalid thumbnail path." },
        { status: 400 },
      );
    }
    const fullTempThumbnailPath = path.join(
      process.cwd(),
      UPLOAD_DIR,
      "temp",
      tempFileName,
    );

    try {
      await fs.access(fullTempThumbnailPath);
    } catch {
      return NextResponse.json(
        { error: "Thumbnail file not found in temporary storage." },
        { status: 400 },
      );
    }

    // We haven't created the course yet, but we need an ID for the directory structure to be consistent
    const tempCourseId = new mongoose.Types.ObjectId();
    const courseDir = path.join(
      process.cwd(),
      UPLOAD_DIR,
      "courses",
      tempCourseId.toString(),
    );
    await fs.mkdir(courseDir, { recursive: true });

    // Move the original image
    const ext = path.extname(tempThumbnailPath);
    const originalFileName = `thumbnail-original-${crypto.randomBytes(4).toString("hex")}${ext}`;
    const fullOriginalPath = path.join(courseDir, originalFileName);
    await fs.rename(fullTempThumbnailPath, fullOriginalPath);

    // Format frontend URL to omit 'public/'
    const cleanUploadDir = UPLOAD_DIR.replace(/^\.\//, "");
    const basePath = cleanUploadDir.startsWith("public/")
      ? `/${cleanUploadDir.slice(7)}`
      : `/${cleanUploadDir}`;
    const thumbnailOriginalUrl = `${basePath}/courses/${tempCourseId.toString()}/${originalFileName}`;

    // Compress using Sharp to WebP
    const compressedFileName = `thumbnail-${crypto.randomBytes(4).toString("hex")}.webp`;
    const fullCompressedPath = path.join(courseDir, compressedFileName);

    await sharp(fullOriginalPath)
      .resize(1280, 720, {
        fit: "inside", // Ensures the whole image fits within 1280x720 without cropping
        withoutEnlargement: true,
      })
      .webp({ quality: 80, effort: 6 }) // high quality, max effort compression
      .toFile(fullCompressedPath);

    const thumbnailUrl = `${basePath}/courses/${tempCourseId.toString()}/${compressedFileName}`;

    // Create a new draft course
    const newCourse = await Course.create({
      _id: tempCourseId,
      coach: user.userId,
      title: titleResult.value,
      description: descResult.value,
      price: priceResult.value,
      level: levelResult.value,
      category: category || null,
      tags: safeTags,
      durationHours: durationHrsResult.value,
      durationMinutes: durationMinsResult.value,
      thumbnailUrl,
      thumbnailOriginalUrl,
      status: "draft",
      platformFee: 30, // Default to 30% for new courses
      allowDiscounts: !!allowDiscounts,
      maxDiscountPercent: allowDiscounts
        ? Math.min(Math.max(Number(maxDiscountPercent) || 0, 1), 100)
        : 0,
      ...(allowDiscounts &&
      discountedPrice != null &&
      Number(discountedPrice) > 0
        ? { discountedPrice: Number(discountedPrice) }
        : {}),
    });

    // Register tags in the global Tag collection for autocomplete
    if (safeTags.length > 0) {
      await Promise.all(
        safeTags.map((tagName: string) =>
          Tag.findOneAndUpdate(
            { name: tagName },
            { $inc: { usageCount: 1 } },
            { upsert: true, new: true },
          ),
        ),
      );
    }

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
