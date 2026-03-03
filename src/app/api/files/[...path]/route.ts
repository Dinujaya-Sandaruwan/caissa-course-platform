import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import { readFile, stat } from "fs/promises";
import path from "path";
import { lookup } from "mime-types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { path: segments } = await params;
    const filePath = segments.join("/");
    const searchParams = request.nextUrl.searchParams;
    const forceDownload = searchParams.get("download") === "true";

    // Prevent directory traversal attacks
    if (filePath.includes("..") || filePath.includes("~")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Resolve the absolute path safely
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const absolutePath = path.resolve(uploadsDir, filePath);

    // Ensure the resolved path stays within uploads directory
    if (!absolutePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if file exists
    try {
      await stat(absolutePath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await connectDB();

    // Permission checks based on file type / path
    const isReceipt = filePath.startsWith("receipts/");
    const isCourseFile = filePath.startsWith("courses/");
    const isProfilePhoto =
      !isReceipt && !isCourseFile && !filePath.includes("/");

    if (isReceipt) {
      // Receipts: only managers can view
      if (session.role !== "manager") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    } else if (isCourseFile) {
      // Course files (videos): only enrolled students, the coach, or a manager
      const courseId = segments[1]; // courses/{courseId}/...
      if (session.role === "student") {
        const enrollment = await Enrollment.findOne({
          studentId: session.userId,
          courseId,
          paymentStatus: "approved",
        });
        if (!enrollment) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
      } else if (session.role !== "coach" && session.role !== "manager") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    } else if (isProfilePhoto) {
      // Profile photos: any authenticated user can view
      // (already checked session above)
    }

    // Read and stream the file
    const fileBuffer = await readFile(absolutePath);
    const mimeType = lookup(absolutePath) || "application/octet-stream";

    const headers: Record<string, string> = {
      "Content-Type": mimeType,
      "Cache-Control": "private, max-age=3600",
      "Content-Length": fileBuffer.length.toString(),
    };

    if (forceDownload) {
      const ext = path.extname(absolutePath) || ".jpg";
      headers["Content-Disposition"] =
        `attachment; filename="profile_picture${ext}"`;
    }

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
