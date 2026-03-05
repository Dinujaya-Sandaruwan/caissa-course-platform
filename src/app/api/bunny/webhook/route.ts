import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Lesson from "@/models/Lesson";
import Course from "@/models/Course";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Bunny sends Status: 3 when encoding is complete, 4 when encoding fails
    // Status values: 0 = Created, 1 = Uploaded, 2 = Processing, 3 = Finished, 4 = Error
    if (body.Status === 3) {
      const bunnyVideoId = body.VideoGuid;

      if (!bunnyVideoId) {
        return NextResponse.json(
          { error: "Missing VideoGuid" },
          { status: 400 },
        );
      }

      await connectDB();

      // Try to find a lesson with this bunnyVideoId and mark it as ready
      const lesson = await Lesson.findOneAndUpdate(
        { bunnyVideoId },
        { videoStatus: "ready" },
      );

      // If not a lesson video, check if it's a course preview video
      if (!lesson) {
        await Course.findOneAndUpdate(
          { bunnyPreviewVideoId: bunnyVideoId },
          {}, // No status field to update for courses — just acknowledge
        );
      }

      console.log(
        `[Bunny Webhook] Video ${bunnyVideoId} encoding complete. ${lesson ? `Lesson "${lesson.title}" marked ready.` : "Course preview updated."}`,
      );
    } else if (body.Status === 4) {
      const bunnyVideoId = body.VideoGuid;
      console.error(`[Bunny Webhook] Video ${bunnyVideoId} encoding FAILED.`);

      // Optionally reset the lesson status back to pending
      if (bunnyVideoId) {
        await connectDB();
        await Lesson.findOneAndUpdate(
          { bunnyVideoId },
          { videoStatus: "pending", bunnyVideoId: null },
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Bunny webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
