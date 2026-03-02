"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import EditProfileModal from "./EditProfileModal";

export interface ProfileUser {
  _id: string;
  name: string;
  nickname?: string;
  profilePhotoThumbnail?: string;
}

export default function StudentProfileMenu({ user }: { user: ProfileUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = user.nickname || user.name || "Student";
  const userInitials = displayName.substring(0, 2).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 p-1.5 sm:p-1.5 rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-100"
        >
          {user.profilePhotoThumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profilePhotoThumbnail}
              alt={displayName}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-gray-200 shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-100 flex items-center justify-center text-xs sm:text-sm font-bold text-red-600 shadow-sm border border-red-50">
              {userInitials}
            </div>
          )}
          <div className="hidden sm:flex flex-col items-start mr-1">
            <span className="text-sm font-bold text-gray-900 leading-tight max-w-[100px] truncate">
              {displayName}
            </span>
            <span className="text-xs text-gray-500 font-medium">Student</span>
          </div>
          <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-[fade-in-up_0.15s_ease-out] origin-top-right">
            <div className="px-4 py-3 border-b border-gray-50 mb-2 sm:hidden">
              <p className="text-sm font-bold text-gray-900 truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                Student
              </p>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                setIsEditModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              Edit Profile
            </button>

            <div className="h-px bg-gray-50 my-2 mx-4" />

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? "Signing Out..." : "Sign Out"}
            </button>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  );
}
