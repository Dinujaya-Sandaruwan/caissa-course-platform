import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import { setSessionCookie } from "@/lib/cookies";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetRole } = await req.json();

    if (!targetRole || !["student", "coach", "manager"].includes(targetRole)) {
      return NextResponse.json(
        { error: "Invalid target role specified" },
        { status: 400 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const availableRoles = (session as any).availableRoles;

    if (!availableRoles || !availableRoles[targetRole]) {
      return NextResponse.json(
        { error: `You do not have a registered ${targetRole} account.` },
        { status: 403 },
      );
    }

    await connectDB();

    const targetUserId = availableRoles[targetRole];
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (targetUser.status === "suspended") {
      return NextResponse.json(
        { error: "Your account is suspended." },
        { status: 403 },
      );
    }

    targetUser.lastLoginAt = new Date();
    await targetUser.save();

    // Reissue the token but swap the active role context
    const token = await signToken({
      userId: targetUser._id!.toString(),
      role: targetUser.role,
      whatsappNumber: targetUser.whatsappNumber,
      status: targetUser.status,
      availableRoles: availableRoles, // preserve the roles map
    });

    await setSessionCookie(token);

    // Determine target dashboard URL
    let dashboardUrl = "/student/dashboard";
    if (targetUser.role === "coach") {
      dashboardUrl = "/coach/dashboard";
    } else if (targetUser.role === "manager") {
      dashboardUrl = "/manager/dashboard";
    }

    return NextResponse.json({ success: true, redirectUrl: dashboardUrl });
  } catch (error) {
    console.error("Switch role error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
