import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

interface SessionPayload {
  userId: string;
  role: "student" | "coach" | "manager";
  whatsappNumber: string;
  status?: "active" | "suspended" | string;
  availableRoles?: Record<string, string>;
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

  // Prank Database Check
  if (request.cookies.get("prank_deleted")?.value === "true") {
    if (pathname !== "/fatal-error") {
      return NextResponse.rewrite(new URL("/fatal-error", request.url));
    }
  }

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

  // Session exists — if they try to visit login/apply, apply smart redirects
  if (isAuthPage) {
    if ((session as any).isNewUser) {
      return NextResponse.next();
    }

    // For /become-a-coach: allow through if user doesn't already have a coach role
    if (pathname === "/become-a-coach") {
      if (session.availableRoles?.coach) {
        // Already a coach — send to coach dashboard
        return NextResponse.redirect(new URL("/coach/dashboard", request.url));
      }
      // Not a coach yet — let them through to register
      return NextResponse.next();
    }

    // For /login: redirect logged-in users to their dashboard
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
      // They are logged in, but trying to access another role's area directly.
      // Redirect them back to their current active role's dashboard.
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
    "/((?!_next/static|_next/image|favicon.ico|images|favicon|_next/data).*)",
  ],
};
