import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import { Types } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "";
    const sort = searchParams.get("sort") || "newest";
    const cursor = searchParams.get("cursor") || "";
    const limit = 20;

    // Build query
    const query: Record<string, unknown> = { status: "published" };

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (level && ["beginner", "intermediate", "advanced"].includes(level)) {
      query.level = level;
    }

    // Cursor-based pagination
    if (cursor) {
      try {
        query._id = { $lt: new Types.ObjectId(cursor) };
      } catch {
        // Invalid cursor — ignore
      }
    }

    // Build sort
    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    switch (sort) {
      case "popular":
        sortObj = { enrollmentCount: -1, _id: -1 };
        break;
      case "price_asc":
        sortObj = { price: 1, _id: -1 };
        break;
      case "price_desc":
        sortObj = { price: -1, _id: -1 };
        break;
      case "newest":
      default:
        sortObj = { createdAt: -1, _id: -1 };
        break;
    }

    const courses = await Course.find(query)
      .populate("coach", "name")
      .select(
        "title thumbnailUrl previewVideoUrl price level enrollmentCount tags createdAt coach",
      )
      .sort(sortObj)
      .limit(limit + 1)
      .lean();

    // Determine if there's a next page
    const hasMore = courses.length > limit;
    const results = hasMore ? courses.slice(0, limit) : courses;
    const nextCursor = hasMore
      ? (results[results.length - 1]._id as Types.ObjectId).toString()
      : null;

    return NextResponse.json({
      courses: results,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching public courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
