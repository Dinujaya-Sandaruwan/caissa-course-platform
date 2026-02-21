import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

interface SessionPayload {
  userId: string;
  role: "student" | "coach" | "manager";
  whatsappNumber: string;
}

const protectedRoutes: Record<string, string> = {
  "/manager": "manager",
  "/api/manager": "manager",
  "/coach": "coach",
  "/api/coach": "coach",
  "/student": "student",
  "/api/student": "student",
};

async function getSession(
  request: NextRequest,
): Promise<SessionPayload | null> {
  const token = request.cookies.get("session")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Find matching protected route prefix
  const matchedPrefix = Object.keys(protectedRoutes).find((prefix) =>
    pathname.startsWith(prefix),
  );

  // Public routes — pass through
  if (!matchedPrefix) {
    return NextResponse.next();
  }

  const requiredRole = protectedRoutes[matchedPrefix];
  const session = await getSession(request);

  // No valid session — redirect to login
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Wrong role — redirect to login
  if (session.role !== requiredRole) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/manager/:path*",
    "/api/manager/:path*",
    "/coach/:path*",
    "/api/coach/:path*",
    "/student/:path*",
    "/api/student/:path*",
  ],
};
