import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Tag from "@/models/Tag";
import CoachProfile from "@/models/CoachProfile";
import {
  validateRequiredString,
  validateNumber,
  validateEnum,
  stripHtml,
} from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch all courses belonging to this coach
    const courses = await Course.find({ coach: user.userId })
      .select("title status price level enrollmentCount createdAt")
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
    const { title, description, price, level, tags } = body;

    // Validate required fields
    const titleResult = validateRequiredString(title, "Title");
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

    // Sanitize tags
    const safeTags = Array.isArray(tags)
      ? tags
          .filter((t: unknown) => typeof t === "string")
          .map((t: string) => stripHtml(t))
      : [];

    // Create a new draft course
    const newCourse = await Course.create({
      coach: user.userId,
      title: titleResult.value,
      description: descResult.value,
      price: priceResult.value,
      level: levelResult.value,
      tags: safeTags,
      status: "draft",
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
