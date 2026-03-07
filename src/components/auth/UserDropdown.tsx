"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown, User, ShieldCheck, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

interface RoleOption {
  role: "student" | "coach" | "manager";
  label: string;
  icon: React.ReactNode;
}

const ROLES: RoleOption[] = [
  { role: "student", label: "Student", icon: <User className="w-4 h-4" /> },
  { role: "coach", label: "Coach", icon: <Crown className="w-4 h-4" /> },
  {
    role: "manager",
    label: "Manager",
    icon: <ShieldCheck className="w-4 h-4" />,
  },
];

interface UserDropdownProps {
  user: {
    name: string;
    profilePhotoThumbnail?: string;
    role: string;
    availableRoles?: string[]; // Array of role strings available to this user
  };
  variant?: "topbar" | "sidebar";
}

export default function UserDropdown({
  user,
  variant = "topbar",
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
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

  const handleSwitchRole = async (targetRole: string) => {
    if (targetRole === user.role) return;
    try {
      setIsSwitching(true);
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole }),
      });
      const data = await res.json();
      if (res.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setIsSwitching(false);
      }
    } catch (error) {
      console.error("Switch role failed:", error);
      setIsSwitching(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Only show roles they actually have access to, and filter out current
  const availableSwitchOptions = ROLES.filter(
    (r) => user.availableRoles?.includes(r.role) && r.role !== user.role,
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          variant === "sidebar"
            ? "flex items-center gap-3 p-2 w-full rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 text-left"
            : "flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
        }
      >
        {user.profilePhotoThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profilePhotoThumbnail}
            alt={user.name}
            className={`rounded-full object-cover shadow-sm shrink-0 border border-gray-200 ${variant === "sidebar" ? "w-10 h-10" : "w-8 h-8"}`}
          />
        ) : (
          <div
            className={`rounded-full shrink-0 flex items-center justify-center text-red-600 font-bold border ${variant === "sidebar" ? "w-10 h-10 text-lg bg-white border-gray-100 shadow-sm" : "w-8 h-8 text-sm bg-red-100 border-red-50"}`}
          >
            {getInitials(user.name)}
          </div>
        )}

        {variant === "sidebar" && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs font-medium text-gray-500 truncate capitalize">
              {user.role}
            </p>
          </div>
        )}

        <ChevronDown
          className={`shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          } ${variant === "sidebar" ? "w-5 h-5 text-gray-400" : "w-4 h-4 text-gray-500"}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-[fade-in-up_0.2s_ease-out] ${variant === "sidebar" ? "bottom-full mb-2 left-0" : "right-0"}`}
        >
          <div className="p-3 border-b border-gray-100 bg-slate-50">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs font-medium text-gray-500 capitalize">
              {user.role} Account
            </p>
          </div>

          {availableSwitchOptions.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <p className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Switch Identity
              </p>
              {availableSwitchOptions.map((roleOpt) => (
                <button
                  key={roleOpt.role}
                  disabled={isSwitching}
                  onClick={() => handleSwitchRole(roleOpt.role)}
                  className="w-full flex items-center justify-between px-2 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors group disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 font-medium">
                    {roleOpt.icon}
                    {roleOpt.label}
                  </div>
                  {isSwitching && (
                    <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="p-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2 px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? "Signing Out..." : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
