import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Chapter from "@/models/Chapter";
import Lesson from "@/models/Lesson";
import { rename, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> },
) {
  try {
    const { id: courseId, chapterId } = await params;
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

    if (course.status !== "draft") {
      return NextResponse.json(
        { error: "Cannot add lessons to a non-draft course" },
        { status: 403 },
      );
    }

    // Verify chapter exists and belongs to this course
    const chapter = await Chapter.findOne({
      _id: chapterId,
      courseId,
    }).lean();

    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found in this course" },
        { status: 404 },
      );
    }

    const { title, description, links, tempVideoPath, tempMaterials } =
      await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Lesson title is required" },
        { status: 400 },
      );
    }

    // Determine the next order number for this chapter
    const existingLessonsCount = await Lesson.countDocuments({ chapterId });
    const order = existingLessonsCount + 1;

    const newLesson = await Lesson.create({
      chapterId,
      courseId,
      title: title.trim(),
      description: description?.trim() || "",
      links: Array.isArray(links)
        ? links.map((l: string) => l.trim()).filter(Boolean)
        : [],
      order,
      videoStatus: tempVideoPath ? "uploaded" : "pending",
      materials: [],
    });

    const uploadDir = process.env.UPLOAD_DIR || "public/uploads";

    // If a temp video was pre-uploaded, move it to the course directory
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
          await mkdir(courseUploadPath, { recursive: true });

          const finalFileName = `${newLesson._id}-${tempFileName}`;
          const finalFilePath = path.join(courseUploadPath, finalFileName);

          await rename(tempFilePath, finalFilePath);

          const relativeUrl = `/api/files/courses/${courseId}/${finalFileName}`;
          newLesson.tempVideoPath = relativeUrl;
          newLesson.videoStatus = "uploaded";
        }
      } catch (moveError) {
        console.error("Error moving temp video:", moveError);
      }
    }

    // If temp materials (PDFs/Images) were pre-uploaded, move them
    if (Array.isArray(tempMaterials) && tempMaterials.length > 0) {
      const finalMaterials = [];
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
              await mkdir(courseUploadPath, { recursive: true });

              // Create unique name for material
              const id = crypto.randomUUID();
              const ext = tempFileName.split(".").pop();
              const finalFileName = `${newLesson._id}-mat-${id}.${ext}`;
              const finalFilePath = path.join(courseUploadPath, finalFileName);

              await rename(tempFilePath, finalFilePath);

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
      newLesson.materials = finalMaterials;
    }

    await newLesson.save();

    return NextResponse.json(newLesson, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
