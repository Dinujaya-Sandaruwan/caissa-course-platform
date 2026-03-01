import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Tag from "@/models/Tag";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query || query.length < 1) {
      return NextResponse.json([]);
    }

    await connectDB();

    // Escape special regex characters to prevent injection
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const tags = await Tag.find({
      name: { $regex: escaped, $options: "i" },
    })
      .sort({ usageCount: -1 })
      .limit(10)
      .select("name usageCount")
      .lean();

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error searching tags:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
