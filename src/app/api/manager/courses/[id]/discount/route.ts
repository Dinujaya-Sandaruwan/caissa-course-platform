import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";

// PATCH — Manager sets discounted price
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    await connectDB();

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (!course.allowDiscounts) {
      return NextResponse.json(
        { error: "This course does not allow discounts" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { discountedPrice } = body;

    if (discountedPrice == null || Number(discountedPrice) <= 0) {
      return NextResponse.json(
        { error: "A valid discounted price is required" },
        { status: 400 },
      );
    }

    const dp = Number(discountedPrice);
    const maxPercent = course.maxDiscountPercent || 0;
    const minAllowed = course.price * (1 - maxPercent / 100);

    if (dp < minAllowed) {
      return NextResponse.json(
        {
          error: `Discounted price cannot be lower than Rs. ${Math.ceil(minAllowed)} (${maxPercent}% max discount)`,
        },
        { status: 400 },
      );
    }

    if (dp >= course.price) {
      return NextResponse.json(
        { error: "Discounted price must be less than the regular price" },
        { status: 400 },
      );
    }

    course.discountedPrice = dp;
    await course.save();

    return NextResponse.json({ success: true, discountedPrice: dp });
  } catch (error) {
    console.error("Error setting discount:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE — Manager removes discount
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    await connectDB();

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    course.discountedPrice = undefined;
    await course.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing discount:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
