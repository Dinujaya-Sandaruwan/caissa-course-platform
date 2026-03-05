import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createBunnyVideo } from "@/lib/bunny";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();

    // Only coaches and managers can create/upload videos
    if (!session || (session.role !== "coach" && session.role !== "manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await req.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Video title is required" },
        { status: 400 },
      );
    }

    const result = await createBunnyVideo(title);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating Bunny video:", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 },
    );
  }
}
