"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, RefreshCw, User, Briefcase, Shield } from "lucide-react";

interface RoleSwitcherProps {
  currentRole: "student" | "coach" | "manager";
  availableRoles: Record<string, string>;
}

export default function RoleSwitcher({
  currentRole,
  availableRoles,
}: RoleSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const roleConfigs = {
    student: {
      label: "Student Dashboard",
      icon: User,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    coach: {
      label: "Coach Dashboard",
      icon: Briefcase,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    manager: {
      label: "Manager Dashboard",
      icon: Shield,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  };

  const handleSwitch = async (targetRole: string) => {
    try {
      setSwitching(true);
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl; // Force a hard navigation to reload layout states cleanly
      }
    } catch (error) {
      console.error("Failed to switch role:", error);
      setSwitching(false);
    }
  };

  const availableKeys = Object.keys(availableRoles || {}).filter(
    (key) => key !== currentRole,
  ) as Array<"student" | "coach" | "manager">;

  if (availableKeys.length === 0) return null;

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
      >
        <RefreshCw
          className={`w-4 h-4 text-gray-500 ${switching ? "animate-spin" : ""}`}
        />
        <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
          Switch Role
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && !switching && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-50 animate-[fade-in-up_0.2s_ease-out]">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Switch Dashboard
            </div>
            {availableKeys.map((role) => {
              const config = roleConfigs[role];
              const Icon = config.icon;
              return (
                <button
                  key={role}
                  onClick={() => {
                    setIsOpen(false);
                    handleSwitch(role);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg}`}
                  >
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
