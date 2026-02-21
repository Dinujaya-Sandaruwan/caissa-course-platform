import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json();

    if (!["suspend", "activate"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'suspend' or 'activate'." },
        { status: 400 },
      );
    }

    // Prevent suspending self
    if (session.userId === id) {
      return NextResponse.json(
        { error: "You cannot suspend your own account" },
        { status: 403 },
      );
    }

    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status: action === "suspend" ? "suspended" : "active" },
      { new: true },
    ).select("_id name whatsappNumber status createdAt");

    if (!updatedUser) {
      return NextResponse.json({ error: "Manager not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating manager status:", error);
    return NextResponse.json(
      { error: "Failed to update manager status" },
      { status: 500 },
    );
  }
}
