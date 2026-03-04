import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ContactMessage } from "@/models/ContactMessage";
import { getSessionUser } from "@/lib/auth";
import mongoose from "mongoose";

// PATCH: Mark a message as read or replied
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid message ID." },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { status } = body; // expecting "read" or "replied"

    if (!["read", "replied"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value." },
        { status: 400 },
      );
    }

    await connectDB();

    const updatedMessage = await ContactMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).lean();

    if (!updatedMessage) {
      return NextResponse.json(
        { error: "Message not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a message permanently
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid message ID." },
        { status: 400 },
      );
    }

    await connectDB();

    const deletedMessage = await ContactMessage.findByIdAndDelete(id).lean();

    if (!deletedMessage) {
      return NextResponse.json(
        { error: "Message not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, id: deletedMessage._id });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
