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
  "/coach-pending": "coach",
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

  // Check if it's the enroll page (which allows any valid logged-in user)
  const isEnrollPage =
    pathname.startsWith("/courses/") && pathname.endsWith("/enroll");

  // Public routes — pass through
  // Public routes — pass through if it's neither role-protected nor the enroll page
  if (!matchedPrefix && !isEnrollPage) {
    return NextResponse.next();
  }

  const session = await getSession(request);

  // No valid session — redirect to login
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    if (isEnrollPage) {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If it's a role-protected route, check the role
  if (matchedPrefix) {
    const requiredRole = protectedRoutes[matchedPrefix];
    if (session.role !== requiredRole) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect root role paths to their respective dashboards
  if (
    pathname === "/coach" ||
    pathname === "/manager" ||
    pathname === "/student"
  ) {
    const dashboardUrl = new URL(`${pathname}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/manager/:path*",
    "/api/manager/:path*",
    "/coach/:path*",
    "/coach-pending",
    "/api/coach/:path*",
    "/student/:path*",
    "/api/student/:path*",
    "/courses/:id/enroll",
  ],
};
