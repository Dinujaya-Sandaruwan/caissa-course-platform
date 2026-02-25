"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import CoachNavLinks from "./CoachNavLinks";

export default function MobileCoachNav({ userName }: { userName: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Fixed top header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 flex flex-row items-center justify-between px-4">
        <Link
          href="/coach/dashboard"
          className="flex items-center gap-2 group"
          onClick={() => setIsOpen(false)}
        >
          <span className="font-[family-name:var(--font-outfit)] font-bold text-xl text-gray-900 tracking-tight">
            Caissa{" "}
            <span className="text-red-600 transition-colors group-hover:text-red-500">
              Coach
            </span>
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -mr-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:bg-gray-50 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Spacer to prevent content from hiding behind the fixed header */}
      <div className="h-16" />

      {/* Full-screen sliding menu */}
      <div
        className={`fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col pt-16">
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            <div onClick={() => setIsOpen(false)}>
              <CoachNavLinks />
            </div>
          </nav>

          <div className="p-4 border-t border-gray-50 bg-gray-50/50 pb-8">
            <div className="flex items-center gap-3 mb-4 p-2">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-red-600 font-bold text-lg border border-gray-100">
                {userName.charAt(0).toUpperCase()}
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
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
