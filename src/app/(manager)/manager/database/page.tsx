"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, DatabaseZap, ShieldAlert } from "lucide-react";

export default function DatabasePage() {
  const router = useRouter();
  const [isWiping, setIsWiping] = useState(false);
  const [wipeStatus, setWipeStatus] = useState<string | null>(null);

  const handleWipe = () => {
    setIsWiping(true);
    setWipeStatus("Initiating master wipe...");

    setTimeout(() => {
      setWipeStatus("Deleting all database collections...");
    }, 1500);

    setTimeout(() => {
      setWipeStatus("Emptying storage buckets...");
    }, 3000);

    setTimeout(() => {
      setWipeStatus("Erasing activity logs...");
    }, 4500);

    setTimeout(() => {
      setWipeStatus("Finalizing system reset...");
    }, 6000);

    // Simulate final "crash"
    setTimeout(() => {
      // Set the prank cookie (expires in 1 year)
      document.cookie = "prank_deleted=true; path=/; max-age=31536000";

      // Redirect to home, which will now be caught by middleware
      // and redirect/rewrite to the fatal error page
      window.location.href = "/";
    }, 7500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-red-600 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-red-500 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-red-700 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/30 border border-red-400/30 text-white text-sm font-semibold mb-6 backdrop-blur-sm">
            <AlertTriangle className="w-4 h-4" />
            System Administration
          </div>
          <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-outfit)] font-bold tracking-tight mb-4">
            Database Management
          </h1>
          <p className="text-red-100 text-lg max-w-2xl leading-relaxed">
            Advanced system controls and dangerous operations. Please proceed
            with extreme caution as actions here affect the entire platform.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <DatabaseZap className="w-64 h-64" />
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-[family-name:var(--font-outfit)] font-bold text-gray-900 mb-2 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            Danger Zone
          </h2>
          <p className="text-gray-500 mb-8 max-w-xl">
            The operations below will permanently alter or destroy system data.
            They cannot be undone. Ensure you have verified backups before
            proceeding.
          </p>

          <div className="border shadow-sm border-red-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-red-50/50 hover:bg-red-50 transition-colors">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Wipe Entire Database
              </h3>
              <p className="text-sm text-gray-600 max-w-md leading-relaxed">
                This will immediately and permanently delete all coach data,
                student profiles, payments, course content, and activity logs.
                The platform will be completely reset.
              </p>
              {wipeStatus && (
                <p className="text-sm font-bold text-red-600 mt-3 animate-pulse">
                  {wipeStatus}
                </p>
              )}
            </div>
            <button
              onClick={handleWipe}
              disabled={isWiping}
              className="whitespace-nowrap px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-red-600/20 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWiping ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Wiping...
                </>
              ) : (
                <>
                  <DatabaseZap className="w-5 h-5" />
                  Wipe Database
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
