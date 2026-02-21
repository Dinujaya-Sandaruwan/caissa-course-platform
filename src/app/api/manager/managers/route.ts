import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const managers = await User.find({ role: "manager" })
      .select("_id name whatsappNumber status createdAt")
      .sort({ createdAt: -1 });

    return NextResponse.json(managers);
  } catch (error) {
    console.error("Error fetching managers:", error);
    return NextResponse.json(
      { error: "Failed to fetch managers" },
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

    const { name, whatsappNumber } = await req.json();

    if (!name || !whatsappNumber) {
      return NextResponse.json(
        { error: "Name and WhatsApp number are required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Clean number
    const cleaned = whatsappNumber.replace(/\s/g, "");
    const fullNumber = cleaned.startsWith("0")
      ? `94${cleaned.slice(1)}`
      : cleaned.startsWith("94")
        ? cleaned
        : `94${cleaned}`;

    const existingUser = await User.findOne({ whatsappNumber: fullNumber });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this WhatsApp number already exists" },
        { status: 400 },
      );
    }

    const newManager = await User.create({
      name,
      whatsappNumber: fullNumber,
      role: "manager",
      status: "active",
    });

    return NextResponse.json(newManager, { status: 201 });
  } catch (error) {
    console.error("Error creating manager:", error);
    return NextResponse.json(
      { error: "Failed to create manager" },
      { status: 500 },
    );
  }
}
