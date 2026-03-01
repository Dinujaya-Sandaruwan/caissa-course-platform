import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find({}).lean();
    return NextResponse.json({ courses });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
