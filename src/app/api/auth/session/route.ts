import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const session = await getSessionUser();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json(
    {
      userId: session.userId,
      role: session.role,
      whatsappNumber: session.whatsappNumber,
    },
    { status: 200 },
  );
}
