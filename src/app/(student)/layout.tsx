import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Link from "next/link";
import React from "react";
import StudentNavLinks from "@/components/StudentNavLinks";
import StudentProfileMenu from "@/components/student/StudentProfileMenu";

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
  const dbUser = await User.findById(user.userId)
    .select("name nickname profilePhotoThumbnail")
    .lean();

  // Serialize the dbUser to pass to the Client Component
  const profileUser = {
    _id: dbUser?._id.toString() || "",
    name: dbUser?.name || "Student",
    nickname: dbUser?.nickname || undefined,
    profilePhotoThumbnail: dbUser?.profilePhotoThumbnail || undefined,
  };

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

            {/* Right: User Menu */}
            <div className="flex items-center gap-3">
              <StudentProfileMenu user={profileUser} />
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
