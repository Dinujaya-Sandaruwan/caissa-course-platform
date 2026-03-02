import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Tag from "@/models/Tag";
import Chapter from "@/models/Chapter";
import Lesson from "@/models/Lesson";
import { stripHtml, validateOptionalString } from "@/lib/validation";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user || user.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const course = await Course.findOne({
      _id: id,
      coach: user.userId,
    }).lean();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch chapters and lessons efficiently
    const chapters = await Chapter.find({ courseId: course._id })
      .sort({ order: 1 })
      .lean();

    const lessons = await Lesson.find({ courseId: course._id })
      .sort({ order: 1 })
      .lean();

    // Group lessons into their respective chapters
    const chaptersWithLessons = chapters.map((chapter) => ({
      ...chapter,
      lessons: lessons.filter(
        (lesson) => String(lesson.chapterId) === String(chapter._id),
      ),
    }));

    return NextResponse.json({
      ...course,
      chapters: chaptersWithLessons,
    });
  } catch (error) {
    console.error("Error fetching course details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user || user.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const course = await Course.findOne({
      _id: id,
      coach: user.userId,
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (!["draft", "pending_review", "rejected"].includes(course.status)) {
      return NextResponse.json(
        { error: "Only draft, pending, or rejected courses can be updated" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      level,
      tags,
      thumbnailUrl,
      tempThumbnailPath,
      tempPreviewVideoPath,
      allowDiscounts,
      maxDiscountPercent,
      discountedPrice,
    } = body;

    if (title !== undefined) course.title = stripHtml(String(title));
    if (description !== undefined)
      course.description = stripHtml(String(description));
    if (price !== undefined) {
      const p = Number(price);
      if (isNaN(p) || p < 0)
        return NextResponse.json({ error: "Invalid price" }, { status: 400 });
      course.price = p;
    }
    if (level !== undefined) {
      if (!["beginner", "intermediate", "advanced"].includes(level))
        return NextResponse.json({ error: "Invalid level" }, { status: 400 });
      course.level = level;
    }
    if (tags !== undefined) {
      const oldTags: string[] = course.tags || [];
      const newTags: string[] = Array.isArray(tags)
        ? tags
            .filter((t: unknown) => typeof t === "string")
            .map((t: string) => stripHtml(t))
        : [];

      // Diff: find added and removed tags
      const addedTags = newTags.filter((t) => !oldTags.includes(t));
      const removedTags = oldTags.filter((t) => !newTags.includes(t));

      // Increment usageCount for new tags (upsert)
      if (addedTags.length > 0) {
        await Promise.all(
          addedTags.map((tagName) =>
            Tag.findOneAndUpdate(
              { name: tagName },
              { $inc: { usageCount: 1 } },
              { upsert: true, new: true },
            ),
          ),
        );
      }

      // Decrement usageCount for removed tags
      if (removedTags.length > 0) {
        await Promise.all(
          removedTags.map((tagName) =>
            Tag.findOneAndUpdate(
              { name: tagName, usageCount: { $gt: 0 } },
              { $inc: { usageCount: -1 } },
            ),
          ),
        );
      }

      course.tags = newTags;
    }
    if (thumbnailUrl !== undefined)
      course.thumbnailUrl = validateOptionalString(thumbnailUrl) || "";

    if (tempThumbnailPath && typeof tempThumbnailPath === "string") {
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

        const courseDir = path.join(
          process.cwd(),
          UPLOAD_DIR,
          "courses",
          course._id.toString(),
        );
        await fs.mkdir(courseDir, { recursive: true });

        const ext = path.extname(tempThumbnailPath);
        const originalFileName = `thumbnail-original-${crypto.randomBytes(4).toString("hex")}${ext}`;
        const fullOriginalPath = path.join(courseDir, originalFileName);

        await fs.rename(fullTempThumbnailPath, fullOriginalPath);
        // Format frontend URL to omit 'public/'
        const cleanUploadDir = UPLOAD_DIR.replace(/^\.\//, "");
        const basePath = cleanUploadDir.startsWith("public/")
          ? `/${cleanUploadDir.slice(7)}`
          : `/${cleanUploadDir}`;
        const thumbnailOriginalUrl = `${basePath}/courses/${course._id.toString()}/${originalFileName}`;

        const compressedFileName = `thumbnail-${crypto.randomBytes(4).toString("hex")}.webp`;
        const fullCompressedPath = path.join(courseDir, compressedFileName);

        await sharp(fullOriginalPath)
          .resize(1280, 720, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 80, effort: 6 })
          .toFile(fullCompressedPath);

        const newThumbnailUrl = `${basePath}/courses/${course._id.toString()}/${compressedFileName}`;

        course.thumbnailUrl = newThumbnailUrl;
        course.thumbnailOriginalUrl = thumbnailOriginalUrl;
      } catch (err) {
        console.error("Error processing updated thumbnail:", err);
      }
    }

    // Handle preview video temp file
    if (tempPreviewVideoPath && typeof tempPreviewVideoPath === "string") {
      const UPLOAD_DIR = process.env.UPLOAD_DIR || "public/uploads";
      const tempFileName = tempPreviewVideoPath.split("/").pop();
      if (tempFileName) {
        const fullTempPath = path.join(
          process.cwd(),
          UPLOAD_DIR,
          "temp",
          tempFileName,
        );

        try {
          await fs.access(fullTempPath);

          const courseDir = path.join(
            process.cwd(),
            UPLOAD_DIR,
            "courses",
            course._id.toString(),
          );
          await fs.mkdir(courseDir, { recursive: true });

          const ext = path.extname(tempPreviewVideoPath);
          const videoFileName = `preview-video-${crypto.randomBytes(4).toString("hex")}${ext}`;
          const fullVideoPath = path.join(courseDir, videoFileName);

          await fs.rename(fullTempPath, fullVideoPath);

          // Format frontend URL to omit 'public/'
          const cleanUploadDir = UPLOAD_DIR.replace(/^\.\//, "");
          const basePath = cleanUploadDir.startsWith("public/")
            ? `/${cleanUploadDir.slice(7)}`
            : `/${cleanUploadDir}`;
          const relativeUrl = `${basePath}/courses/${course._id.toString()}/${videoFileName}`;

          course.tempPreviewVideoPath = relativeUrl;
        } catch (err) {
          console.error("Error processing preview video:", err);
        }
      }
    }

    // Handle discount fields
    if (allowDiscounts !== undefined) {
      course.allowDiscounts = !!allowDiscounts;
      if (!allowDiscounts) {
        // Discounts disabled — clear discount fields
        course.maxDiscountPercent = 0;
        course.discountedPrice = undefined;
      }
    }
    if (maxDiscountPercent !== undefined && course.allowDiscounts) {
      course.maxDiscountPercent = Math.min(
        Math.max(Number(maxDiscountPercent) || 0, 1),
        100,
      );
    }
    if (discountedPrice !== undefined && course.allowDiscounts) {
      if (
        discountedPrice === null ||
        discountedPrice === "" ||
        Number(discountedPrice) <= 0
      ) {
        course.discountedPrice = undefined;
      } else {
        const dp = Number(discountedPrice);
        const currentPrice = course.price;
        const maxPercent = course.maxDiscountPercent || 0;
        const minAllowed = currentPrice * (1 - maxPercent / 100);
        if (dp < minAllowed) {
          return NextResponse.json(
            {
              error: `Discounted price cannot be lower than Rs. ${Math.ceil(minAllowed)} (${maxPercent}% max discount)`,
            },
            { status: 400 },
          );
        }
        if (dp >= currentPrice) {
          return NextResponse.json(
            { error: "Discounted price must be less than the regular price" },
            { status: 400 },
          );
        }
        course.discountedPrice = dp;
      }
    }

    // Auto-reset rejected courses back to pending review when saved
    if (course.status === "rejected") {
      course.status = "pending_review";
    }

    await course.save();

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user || user.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const course = await Course.findOne({
      _id: id,
      coach: user.userId,
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.status === "trashed") {
      return NextResponse.json(
        { error: "Course is already trashed" },
        { status: 400 },
      );
    }

    // Soft delete: mark as trashed instead of permanently removing
    course.status = "trashed";
    course.trashedAt = new Date();
    await course.save();

    return NextResponse.json({ message: "Course moved to trash" });
  } catch (error) {
    console.error("Error trashing course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
