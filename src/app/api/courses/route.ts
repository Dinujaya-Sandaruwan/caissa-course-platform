import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import "@/models/User"; // Ensure User schema is registered for populate
import "@/models/Category"; // Ensure Category schema is registered for populate
import { Types } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "newest";
    const age = searchParams.get("age") || "";
    const cursor = searchParams.get("cursor") || "";
    const limit = 20;

    // Build query
    const query: Record<string, unknown> = { status: "published" };

    if (search.trim()) {
      query.$text = { $search: search.trim() };
    }

    if (level && ["beginner", "intermediate", "advanced"].includes(level)) {
      query.level = level;
    }

    if (category) {
      if (category === "none") {
        query.category = null;
      } else {
        query.category = new Types.ObjectId(category);
      }
    }

    // Age filter: find courses whose age range includes the student's age
    if (age) {
      const ageNum = Number(age);
      if (!isNaN(ageNum) && ageNum >= 3 && ageNum <= 100) {
        query.ageMin = { $lte: ageNum };
        query.ageMax = { $gte: ageNum };
      }
    }

    // Cursor-based pagination
    if (cursor) {
      try {
        query._id = { $lt: new Types.ObjectId(cursor) };
      } catch {
        // Invalid cursor — ignore
      }
    }

    // Build sort — use text relevance when searching
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortObj: Record<string, any> = { createdAt: -1, _id: -1 };
    if (search.trim()) {
      sortObj = { score: { $meta: "textScore" }, _id: -1 };
    } else {
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
    }

    const courses = await Course.find(query)
      .populate("coach", "name profilePhotoThumbnail")
      .populate("category", "name")
      .select(
        "title thumbnailUrl bunnyPreviewVideoId price discountedPrice level enrollmentCount tags createdAt coach category durationHours durationMinutes ageMin ageMax",
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
