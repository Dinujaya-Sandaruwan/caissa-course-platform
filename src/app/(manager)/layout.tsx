import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Link from "next/link";
import { LogOut } from "lucide-react";
import React from "react";
import ManagerNavLinks from "./ManagerNavLinks";
import MobileManagerNav from "./MobileManagerNav";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user || user.role !== "manager") {
    redirect("/login");
  }

  await connectDB();
  const dbUser = await User.findById(user.userId).select("name").lean();
  const userName = dbUser?.name || "Manager";

  return (
    <>
      {/* Mobile Navigation (Visible only on small screens) */}
      <MobileManagerNav userName={userName} />

      <div className="flex min-h-screen bg-slate-50 relative selection:bg-red-100 selection:text-red-900">
        {/* Decorative background ambient element */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0 hidden md:block">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-red-100/30 blur-[120px]" />
        </div>

        {/* Floating Sidebar */}
        <div className="hidden md:flex flex-col w-72 p-6 z-10 h-screen sticky top-0">
          <aside className="flex-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden border border-white/40 ring-1 ring-black/5">
            <div className="h-20 flex items-center px-8">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="font-[family-name:var(--font-outfit)] font-bold text-2xl text-gray-900 tracking-tight">
                  Caissa{" "}
                  <span className="text-red-600 transition-colors group-hover:text-red-500">
                    Manager
                  </span>
                </span>
              </Link>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              <ManagerNavLinks />
            </nav>

            <div className="p-4 mt-auto">
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-red-600 font-bold text-lg border border-gray-100">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {userName}
                    </p>
                    <p className="text-xs font-medium text-gray-500 truncate">
                      Administrator
                    </p>
                  </div>
                </div>
                <LogoutButton className="w-full justify-center mt-1" />
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
