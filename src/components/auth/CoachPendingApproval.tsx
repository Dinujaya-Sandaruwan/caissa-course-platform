"use client";

import { Clock, LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CoachPendingApproval() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 mb-6">
        <Clock className="w-10 h-10 text-amber-500" />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-outfit)] mb-3">
        Application Under Review
      </h1>

      <p className="text-gray-500 mb-2 leading-relaxed">
        Thank you for applying to be a coach at Caissa Chess Academy! Your
        application is currently being reviewed by our team.
      </p>

      <p className="text-gray-400 text-sm mb-8">
        You&apos;ll receive a WhatsApp notification once your account has been
        approved. This usually takes 1–2 business days.
      </p>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
        <div className="flex items-center gap-3 justify-center">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-700 text-sm font-medium">
            Verification Status: Pending
          </span>
        </div>
      </div>

      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors text-sm font-medium"
      >
        {loggingOut ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
        Back to Home
      </button>
    </div>
  );
}
