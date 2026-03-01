import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import fs from "fs/promises";
import path from "path";

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; chapterId: string; lessonId: string }> },
) {
  try {
    const { id: courseId, chapterId, lessonId } = await params;
    const user = await getSessionUser();

    if (!user || user.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Verify course belongs to coach
    const course = await Course.findOne({
      _id: courseId,
      coach: user.userId,
    }).lean();

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or unauthorized" },
        { status: 404 },
      );
    }

    if (!["draft", "pending_review", "rejected"].includes(course.status)) {
      return NextResponse.json(
        { error: "Cannot modify lessons in this course in its current status" },
        { status: 403 },
      );
    }

    const {
      title,
      description,
      links,
      tempVideoPath,
      tempMaterials,
      existingMaterials,
    } = await request.json();

    const lesson = await Lesson.findOne({ _id: lessonId, chapterId, courseId });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { error: "Lesson title cannot be empty" },
          { status: 400 },
        );
      }
      lesson.title = title.trim();
    }

    if (description !== undefined) {
      lesson.description = description.trim();
    }

    if (links !== undefined) {
      lesson.links = Array.isArray(links)
        ? links.map((l: string) => l.trim()).filter(Boolean)
        : [];
    }

    const uploadDir = process.env.UPLOAD_DIR || "public/uploads";

    if (tempVideoPath && typeof tempVideoPath === "string") {
      try {
        const tempFileName = tempVideoPath.split("/").pop();
        if (tempFileName) {
          const tempFilePath = path.join(
            process.cwd(),
            uploadDir,
            "temp",
            tempFileName,
          );
          const courseUploadPath = path.join(
            process.cwd(),
            uploadDir,
            "courses",
            courseId,
          );
          await fs.mkdir(courseUploadPath, { recursive: true });

          const finalFileName = `${lesson._id}-${tempFileName}`;
          const finalFilePath = path.join(courseUploadPath, finalFileName);

          await fs.rename(tempFilePath, finalFilePath);

          // If there was an old video, delete it
          if (lesson.tempVideoPath) {
            try {
              const oldPath = path.join(
                process.cwd(),
                "public",
                lesson.tempVideoPath,
              );
              await fs.unlink(oldPath);
            } catch (e) {
              console.warn("Could not delete old video file:", e);
            }
          }

          const relativeUrl = `/api/files/courses/${courseId}/${finalFileName}`;
          lesson.tempVideoPath = relativeUrl;
          lesson.videoStatus = "uploaded";
        }
      } catch (moveError) {
        console.error("Error moving temp video:", moveError);
      }
    }

    // Handle materials combining existing ones and processing new ones
    if (existingMaterials !== undefined || tempMaterials !== undefined) {
      const finalMaterials = Array.isArray(existingMaterials)
        ? [...existingMaterials]
        : lesson.materials || [];

      if (Array.isArray(tempMaterials) && tempMaterials.length > 0) {
        for (const material of tempMaterials) {
          if (material.tempPath && typeof material.tempPath === "string") {
            try {
              const tempFileName = material.tempPath.split("/").pop();
              if (tempFileName) {
                const tempFilePath = path.join(
                  process.cwd(),
                  uploadDir,
                  "temp",
                  tempFileName,
                );
                const courseUploadPath = path.join(
                  process.cwd(),
                  uploadDir,
                  "courses",
                  courseId,
                );
                await fs.mkdir(courseUploadPath, { recursive: true });

                const id = crypto.randomUUID();
                const ext = tempFileName.split(".").pop();
                const finalFileName = `${lesson._id}-mat-${id}.${ext}`;
                const finalFilePath = path.join(
                  courseUploadPath,
                  finalFileName,
                );

                await fs.rename(tempFilePath, finalFilePath);

                finalMaterials.push({
                  title: material.title || "Untitled Material",
                  url: `/api/files/courses/${courseId}/${finalFileName}`,
                });
              }
            } catch (err) {
              console.error("Error moving temp material:", err);
            }
          }
        }
      }
      // Note: We don't actively perform cleanup of removed existing materials from the VPS quite yet
      // to avoid complicating the logic, but the DB references will be properly dropped.
      lesson.materials = finalMaterials;
    }

    await lesson.save();

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; chapterId: string; lessonId: string }> },
) {
  try {
    const { id: courseId, chapterId, lessonId } = await params;
    const user = await getSessionUser();

    if (!user || user.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Verify course belongs to coach
    const course = await Course.findOne({
      _id: courseId,
      coach: user.userId,
    }).lean();

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or unauthorized" },
        { status: 404 },
      );
    }

    if (!["draft", "pending_review", "rejected"].includes(course.status)) {
      return NextResponse.json(
        { error: "Cannot delete lessons in this course in its current status" },
        { status: 403 },
      );
    }

    const lesson = await Lesson.findOne({ _id: lessonId, chapterId, courseId });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Always delete the temp file from VPS if it exists to strictly limit storage bloat
    if (lesson.tempVideoPath) {
      try {
        const fullPath = path.join(
          process.cwd(),
          "public",
          lesson.tempVideoPath,
        );
        await fs.unlink(fullPath);
      } catch (fsError) {
        console.warn(
          `Could not delete video file for lesson ${lessonId}:`,
          fsError,
        );
        // We log it as a warning but continue because DB deletion is more critical to complete
      }
    }

    // Delete the lesson
    await lesson.deleteOne();

    return NextResponse.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
