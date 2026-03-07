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
            ? "flex items-center gap-2.5 p-1.5 w-full rounded-full bg-white/60 hover:bg-white border border-gray-200/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all text-left group"
            : "flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
        }
      >
        {user.profilePhotoThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profilePhotoThumbnail}
            alt={user.name}
            className={`rounded-full object-cover shadow-[0_2px_8px_rgba(0,0,0,0.06)] shrink-0 border border-white ${variant === "sidebar" ? "w-9 h-9" : "w-8 h-8"}`}
          />
        ) : (
          <div
            className={`rounded-full shrink-0 flex items-center justify-center text-red-600 font-bold border ${variant === "sidebar" ? "w-9 h-9 text-base bg-white border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : "w-8 h-8 text-sm bg-red-100 border-red-50"}`}
          >
            {getInitials(user.name)}
          </div>
        )}

        {variant === "sidebar" && (
          <div className="flex-1 min-w-0 pr-1">
            <p className="text-sm font-bold text-gray-900 truncate tracking-tight">
              {user.name}
            </p>
            <p className="text-[11px] font-medium text-gray-500 truncate capitalize">
              {user.role}
            </p>
          </div>
        )}

        <ChevronDown
          className={`shrink-0 transition-transform duration-200 ease-out ${
            isOpen ? "rotate-180" : ""
          } ${variant === "sidebar" ? "w-4 h-4 text-gray-400 group-hover:text-gray-600 mr-1" : "w-4 h-4 text-gray-500"}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute mt-2 w-52 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100/80 overflow-hidden z-50 animate-[fade-in-up_0.2s_ease-out] ${variant === "sidebar" ? "bottom-full mb-3 left-0" : "right-0"}`}
        >
          <div className="p-3.5 border-b border-gray-100 bg-slate-50/50">
            <p className="text-sm font-bold text-gray-900 truncate tracking-tight">
              {user.name}
            </p>
            <p className="text-[11px] font-medium text-gray-400 capitalize mt-0.5">
              {user.role} Account
            </p>
          </div>

          {availableSwitchOptions.length > 0 && (
            <div className="p-2 border-b border-gray-100/80">
              <p className="px-2 pt-1 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Switch Identity
              </p>
              <div className="space-y-0.5">
                {availableSwitchOptions.map((roleOpt) => (
                  <button
                    key={roleOpt.role}
                    disabled={isSwitching}
                    onClick={() => handleSwitchRole(roleOpt.role)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 rounded-xl transition-colors group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2.5 font-medium">
                      {roleOpt.icon}
                      {roleOpt.label}
                    </div>
                    {isSwitching && (
                      <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors disabled:opacity-50"
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
