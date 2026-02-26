"use client";

import Link from "next/link";
import { ShieldX, Home, LogIn, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-lightest-red/30 flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(220,38,38,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(220,38,38,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-6 text-center">
        {/* Icon */}
        <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-red-100 to-lightest-red flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-500/10">
          <ShieldX className="w-14 h-14 text-primary-red" />
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
            Access{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-red to-accent-red">
              Denied
            </span>
          </h1>

          <p className="text-gray-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">
            You don&apos;t have permission to access this page. Please log in
            with an authorized account or return to the homepage.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            href="/login"
            className="group flex items-center gap-2.5 bg-primary-red hover:bg-accent-red text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-xl shadow-primary-red/20 hover:shadow-primary-red/40 hover:-translate-y-1"
          >
            <LogIn className="w-5 h-5" />
            Log In
          </Link>

          <Link
            href="/"
            className="group flex items-center gap-2.5 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 font-semibold px-8 py-4 rounded-full transition-all duration-300"
          >
            <Home className="w-5 h-5 text-gray-500 group-hover:text-primary-red transition-colors" />
            Go to Homepage
          </Link>
        </div>

        {/* Go back link */}
        <button
          onClick={() => history.back()}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back to previous page
        </button>
      </div>
    </main>
  );
}
