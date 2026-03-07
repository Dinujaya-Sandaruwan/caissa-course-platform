"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import ManagerNavLinks from "./ManagerNavLinks";
import UserDropdown from "@/components/auth/UserDropdown";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MobileManagerNav({ user }: { user: any }) {
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

        <div className="p-4 mt-auto border-t border-gray-100 flex justify-center">
          <div className="bg-gray-50 rounded-2xl p-2 flex justify-center w-full">
            <UserDropdown user={user} variant="sidebar" />
          </div>
        </div>
      </div>
    </>
  );
}
