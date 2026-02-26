import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Link from "next/link";
import { LogOut } from "lucide-react";
import React from "react";
import StudentNavLinks from "@/components/StudentNavLinks";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user || user.role !== "student") {
    redirect("/login");
  }

  await connectDB();
  const dbUser = await User.findById(user.userId).select("name").lean();
  const userName = dbUser?.name || "Student";

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-red-100 selection:text-red-900">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/student/dashboard"
              className="flex items-center gap-2 group shrink-0"
            >
              <span className="font-[family-name:var(--font-outfit)] font-bold text-xl text-gray-900 tracking-tight">
                Caissa{" "}
                <span className="text-red-600 transition-colors group-hover:text-red-500">
                  Learn
                </span>
              </span>
            </Link>

            {/* Nav Links (Desktop) */}
            <div className="hidden sm:flex items-center gap-1">
              <StudentNavLinks />
            </div>

            {/* Right: User + Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {userName}
                </span>
              </div>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="flex sm:hidden items-center gap-1 pb-2 overflow-x-auto">
            <StudentNavLinks />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
