import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

interface SessionPayload {
  userId: string;
  role: "student" | "coach" | "manager";
  whatsappNumber: string;
  status?: "active" | "suspended" | string;
}

const protectedRoutes: Record<string, string> = {
  "/manager": "manager",
  "/api/manager": "manager",
  "/coach": "coach",
  "/coach-pending": "coach",
  "/coach-paused": "coach",
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

  const isEnrollPage =
    pathname.startsWith("/courses/") && pathname.endsWith("/enroll");

  // Check if it's an auth page (login or apply)
  const isAuthPage = pathname === "/login" || pathname === "/become-a-coach";

  // Public routes — pass through if it's not restricted
  if (!matchedPrefix && !isEnrollPage && !isAuthPage) {
    return NextResponse.next();
  }

  const session = await getSession(request);

  // No valid session
  if (!session) {
    // If they are just trying to visit login/apply, let them through
    if (isAuthPage) {
      return NextResponse.next();
    }

    // Otherwise, redirect unauthorized access to login
    const loginUrl = new URL("/login", request.url);
    if (isEnrollPage) {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Session exists — if they try to visit login/apply, redirect to dashboard
  if (isAuthPage) {
    if ((session as any).isNewUser) {
      return NextResponse.next();
    }
    const dashboardUrl = new URL(
      session.role === "coach"
        ? "/coach/dashboard"
        : session.role === "manager"
          ? "/manager/dashboard"
          : "/student/dashboard",
      request.url,
    );
    return NextResponse.redirect(dashboardUrl);
  }

  // If it's a role-protected route, check the role
  if (matchedPrefix) {
    const requiredRole = protectedRoutes[matchedPrefix];
    if (session.role !== requiredRole) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Suspension logic for students
    if (session.role === "student" && session.status === "suspended") {
      const isAllowedSuspendedRoute =
        pathname === "/student/profile" ||
        pathname === "/student/suspended" ||
        pathname.startsWith("/api/student/profile") ||
        pathname.startsWith("/api/user");

      if (
        !isAllowedSuspendedRoute &&
        (pathname.startsWith("/student") || pathname.startsWith("/api/student"))
      ) {
        return NextResponse.redirect(
          new URL("/student/suspended", request.url),
        );
      }
    }
  }

  // Redirect root role paths to their respective dashboards
  if (
    pathname === "/coach" ||
    pathname === "/manager" ||
    pathname === "/student"
  ) {
    if (pathname === "/student" && session.status === "suspended") {
      return NextResponse.redirect(new URL("/student/suspended", request.url));
    }
    const dashboardUrl = new URL(`${pathname}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Course enrollment/learning logic for suspended students
  if (session.role === "student" && session.status === "suspended") {
    if (
      pathname.startsWith("/courses/") &&
      (pathname.endsWith("/enroll") || pathname.endsWith("/learn"))
    ) {
      return NextResponse.redirect(new URL("/student/suspended", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/manager/:path*",
    "/api/manager/:path*",
    "/coach/:path*",
    "/coach-pending",
    "/coach-paused",
    "/api/coach/:path*",
    "/student/:path*",
    "/api/student/:path*",
    "/courses/:id/enroll",
    "/login",
    "/become-a-coach",
  ],
};
