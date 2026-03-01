"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

interface LogoutButtonProps {
  className?: string;
  variant?: "icon" | "text" | "full";
  iconOnly?: boolean;
}

export default function LogoutButton({
  className = "",
  variant = "full",
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        // Force a full page reload to clear all Next.js client-side router caches
        // and ensure the middleware kicks in correctly on the next request.
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  const baseStyles = "flex items-center gap-2 transition-all duration-300";

  if (variant === "text") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`${baseStyles} text-sm font-medium text-gray-600 hover:text-red-600 ${
          isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
      >
        <span>Sign Out</span>
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`${baseStyles} p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl ${
          isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
        title="Sign Out"
      >
        <LogOut className="w-5 h-5" />
      </button>
    );
  }

  // default "full" standard button
  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`${baseStyles} px-6 py-2.5 text-sm font-bold text-gray-600 bg-white hover:bg-gray-50 border border-gray-100 rounded-full shadow-sm hover:shadow-md ring-1 ring-black/5 hover:-translate-y-0.5 ${
        isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <LogOut className="w-4 h-4" />
      {isLoggingOut ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
