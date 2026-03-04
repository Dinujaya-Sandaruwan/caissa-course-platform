import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Course from "@/models/Course";
import { logAction } from "@/lib/auditLog";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const categories = await Category.find().sort({ name: 1 }).lean();

    // Get course counts for each category
    const courseCounts = await Course.aggregate([
      { $match: { category: { $exists: true }, status: { $ne: "trashed" } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      courseCounts.map((c: { _id: string; count: number }) => [
        c._id.toString(),
        c.count,
      ]),
    );

    const result = categories.map((cat) => ({
      ...cat,
      courseCount: countMap.get(cat._id.toString()) || 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 },
      );
    }

    await connectDB();

    // Check for duplicates (case-insensitive)
    const existing = await Category.findOne({
      name: {
        $regex: new RegExp(
          `^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i",
        ),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A category with this name already exists." },
        { status: 409 },
      );
    }

    const category = await Category.create({ name: name.trim() });

    logAction({
      managerId: session.userId,
      action: `Created category "${name.trim()}"`,
      category: "categories",
      targetId: category._id.toString(),
      targetName: name.trim(),
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required." },
        { status: 400 },
      );
    }

    await connectDB();

    // Check if any courses use this category
    const courseCount = await Course.countDocuments({
      category: id,
      status: { $ne: "trashed" },
    });

    if (courseCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete this category — it is used by ${courseCount} course${courseCount > 1 ? "s" : ""}.`,
        },
        { status: 400 },
      );
    }

    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 404 },
      );
    }

    logAction({
      managerId: session.userId,
      action: `Deleted category "${(deleted as any).name}"`,
      category: "categories",
      targetId: id,
      targetName: (deleted as any).name,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
