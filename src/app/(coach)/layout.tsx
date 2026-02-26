import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import CoachProfile from "@/models/CoachProfile";
import Link from "next/link";
import { LogOut } from "lucide-react";
import React from "react";
import CoachNavLinks from "./CoachNavLinks";
import MobileCoachNav from "./MobileCoachNav";

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user || user.role !== "coach") {
    redirect("/login");
  }

  await connectDB();

  // Verify coach profile is approved — redirect to /coach-pending (outside this layout)
  // Using /coach-pending instead of /coach/pending to avoid an infinite redirect loop
  const profile = await CoachProfile.findOne({ userId: user.userId }).lean();
  if (!profile || profile.verificationStatus !== "approved") {
    redirect("/coach-pending");
  }

  const dbUser = await User.findById(user.userId)
    .select("name profilePhoto profilePhotoThumbnail")
    .lean();
  const userName = dbUser?.name || "Coach";

  return (
    <>
      <MobileCoachNav userName={userName} />

      <div className="flex min-h-screen bg-slate-50 relative selection:bg-red-100 selection:text-red-900">
        {/* Decorative background ambient element */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0 hidden md:block">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-red-100/30 blur-[120px]" />
        </div>

        {/* Floating Sidebar */}
        <div className="hidden md:flex flex-col w-72 p-6 z-10 h-screen sticky top-0">
          <aside className="flex-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden border border-white/40 ring-1 ring-black/5">
            <div className="h-20 flex items-center px-8">
              <Link
                href="/coach/dashboard"
                className="flex items-center gap-2 group"
              >
                <span className="font-[family-name:var(--font-outfit)] font-bold text-2xl text-gray-900 tracking-tight">
                  Caissa{" "}
                  <span className="text-red-600 transition-colors group-hover:text-red-500">
                    Coach
                  </span>
                </span>
              </Link>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              <CoachNavLinks />
            </nav>

            <div className="p-4 mt-auto">
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-red-600 font-bold text-lg border border-gray-100 overflow-hidden">
                    {dbUser?.profilePhotoThumbnail || dbUser?.profilePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          dbUser.profilePhotoThumbnail || dbUser.profilePhoto
                        }
                        alt={userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      userName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {userName}
                    </p>
                    <p className="text-xs font-medium text-gray-500 truncate">
                      Coach
                    </p>
                  </div>
                </div>
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          </aside>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 z-10 relative">
          <div className="flex-1 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
