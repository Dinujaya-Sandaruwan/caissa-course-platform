import { verifyToken } from "./jwt";
import { getSessionCookie } from "./cookies";
import { JWTPayload } from "jose";

export interface SessionUser {
  userId: string;
  role: "student" | "coach" | "manager";
  whatsappNumber: string;
  status?: "active" | "suspended" | string;
  isNewUser?: boolean;
  availableRoles?: Record<string, string>;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const token = await getSessionCookie();

    if (!token) {
      return null;
    }

    const payload: JWTPayload = await verifyToken(token);

    if (!payload.userId && !payload.isNewUser) {
      return null;
    }

    return {
      userId: payload.userId as string,
      role: payload.role as SessionUser["role"],
      whatsappNumber: payload.whatsappNumber as string,
      status: payload.status as string | undefined,
      isNewUser: payload.isNewUser as boolean | undefined,
      availableRoles: payload.availableRoles as
        | Record<string, string>
        | undefined,
    };
  } catch {
    return null;
  }
}
