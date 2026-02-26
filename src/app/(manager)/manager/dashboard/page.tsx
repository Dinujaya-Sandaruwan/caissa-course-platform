"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  ReceiptText,
  Video,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface DashboardData {
  pendingCoaches: number;
  pendingCourses: number;
  pendingEnrollments: number;
  publishedCourses: number;
}

export default function ManagerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/manager/dashboard");
        if (res.ok) {
          setData(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const stats = [
    {
      title: "Pending Coach Approvals",
      value: loading ? "..." : (data?.pendingCoaches ?? 0).toString(),
      icon: Users,
      trend: "Requires review",
      iconBg: "from-rose-500 to-red-600",
      shadowColor: "shadow-red-500/20",
      href: "/manager/coaches",
    },
    {
      title: "Pending Course Reviews",
      value: loading ? "..." : (data?.pendingCourses ?? 0).toString(),
      icon: Video,
      trend: "Awaiting publication",
      iconBg: "from-orange-400 to-red-500",
      shadowColor: "shadow-red-500/20",
      href: "/manager/courses",
    },
    {
      title: "Pending Receipt Reviews",
      value: loading ? "..." : (data?.pendingEnrollments ?? 0).toString(),
      icon: ReceiptText,
      trend: "Recent payments",
      iconBg: "from-pink-500 to-rose-600",
      shadowColor: "shadow-rose-500/20",
      href: "/manager/enrollments",
    },
    {
      title: "Total Published Courses",
      value: loading ? "..." : (data?.publishedCourses ?? 0).toString(),
      icon: BookOpen,
      trend: "Active on platform",
      iconBg: "from-gray-800 to-gray-900",
      shadowColor: "shadow-gray-900/20",
      href: "/manager/courses",
    },
  ];

  return (
    <div className="space-y-10 relative z-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Monitor platform activity and pending approvals.
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </div>
      )}

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="group relative bg-white rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(220,38,38,0.08)] shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 block"
          >
            <div className="flex flex-col h-full justify-between">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.iconBg} shadow-lg ${stat.shadowColor} mb-6 transition-transform duration-300 group-hover:scale-110`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>

              <div>
                <h3 className="text-5xl font-black text-gray-900 tracking-tight mb-2">
                  {loading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                  ) : (
                    stat.value
                  )}
                </h3>
                <p className="text-base font-semibold text-gray-700 leading-snug">
                  {stat.title}
                </p>
                <p className="text-sm text-gray-400 mt-3 font-medium bg-gray-50 inline-block px-3 py-1 rounded-full">
                  {stat.trend}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Ambient background watermark */}
      <div className="fixed bottom-[-10%] right-[-5%] overflow-hidden pointer-events-none opacity-[0.03] z-[-1]">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[800px] h-[800px] text-gray-900"
        >
          <path d="M19 22H5V20H19V22ZM17 18H7V15L9 12H15L17 15V18ZM15 10H9L12 4L15 10Z" />
        </svg>
      </div>
    </div>
  );
}
