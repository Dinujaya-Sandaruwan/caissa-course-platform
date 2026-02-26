"use client";

import Link from "next/link";
import Lottie from "lottie-react";
import { Home, BookOpen, ArrowLeft } from "lucide-react";
import error404Animation from "@/assets/lottieFiles/Error404.json";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-lightest-red/30 flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(220,38,38,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(220,38,38,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Floating chess pieces — decorative */}
      <div
        className="absolute top-20 left-10 text-6xl opacity-5 animate-bounce"
        style={{ animationDuration: "3s" }}
      >
        ♔
      </div>
      <div
        className="absolute top-40 right-16 text-5xl opacity-5 animate-bounce"
        style={{ animationDuration: "4s", animationDelay: "1s" }}
      >
        ♞
      </div>
      <div
        className="absolute bottom-32 left-20 text-7xl opacity-5 animate-bounce"
        style={{ animationDuration: "5s", animationDelay: "0.5s" }}
      >
        ♜
      </div>
      <div
        className="absolute bottom-20 right-24 text-4xl opacity-5 animate-bounce"
        style={{ animationDuration: "3.5s", animationDelay: "2s" }}
      >
        ♝
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        {/* Lottie Animation */}
        <div className="w-72 h-72 sm:w-96 sm:h-96 mx-auto -mb-4">
          <Lottie
            animationData={error404Animation}
            loop
            className="w-full h-full"
          />
        </div>

        {/* Chess-themed message */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
            Looks like this page
            <br />
            has been{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-red to-accent-red">
              checkmated
            </span>
          </h1>

          <p className="text-gray-500 text-lg font-medium max-w-md mx-auto leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist, was moved, or
            may have been captured by an opponent&apos;s piece.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            href="/"
            className="group flex items-center gap-2.5 bg-primary-red hover:bg-accent-red text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-xl shadow-primary-red/20 hover:shadow-primary-red/40 hover:-translate-y-1"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>

          <Link
            href="/courses"
            className="group flex items-center gap-2.5 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 font-semibold px-8 py-4 rounded-full transition-all duration-300"
          >
            <BookOpen className="w-5 h-5 text-gray-500 group-hover:text-primary-red transition-colors" />
            Browse Courses
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

        {/* Fun footer */}
        <p className="mt-16 text-xs text-gray-300 font-medium">
          Error 404 — Even Grandmasters lose pieces sometimes ♟️
        </p>
      </div>
    </main>
  );
}
