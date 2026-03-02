import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json({ session: null }, { status: 500 });
  }
}
