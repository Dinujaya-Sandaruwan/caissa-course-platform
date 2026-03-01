"use client";

import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import Link from "next/link";
import ManagerNavLinks from "./ManagerNavLinks";
import LogoutButton from "@/components/auth/LogoutButton";

export default function MobileManagerNav({ userName }: { userName: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-outfit)] font-bold text-xl text-gray-900 tracking-tight">
            Caissa <span className="text-red-600">Manager</span>
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2.5 text-gray-700 hover:text-gray-900 bg-white shadow-sm rounded-xl focus:outline-none border border-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Slide-out Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-[60] w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <span className="font-[family-name:var(--font-outfit)] font-bold text-xl text-gray-900 tracking-tight">
            Menu
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav
          className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto"
          onClick={() => setIsOpen(false)}
        >
          <ManagerNavLinks />
        </nav>

        <div className="p-4 mt-auto border-t border-gray-100">
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
      </div>
    </>
  );
}
