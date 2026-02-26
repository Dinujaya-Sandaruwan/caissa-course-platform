"use client";

import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Clock,
  FilePlus,
  PlusSquare,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface RecentEnrollment {
  _id: string;
  studentName: string;
  courseTitle: string;
  enrolledAt: string;
}

interface DashboardData {
  totalStudents: number;
  totalPublished: number;
  totalPending: number;
  totalDraft: number;
  recentEnrollments: RecentEnrollment[];
}

export default function CoachDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/coach/dashboard");
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
      label: "Total Students",
      value: loading ? "..." : (data?.totalStudents ?? 0).toString(),
      icon: Users,
      trend: "All time enrollments",
      bgClass: "bg-blue-50",
      textClass: "text-blue-600",
    },
    {
      label: "Published Courses",
      value: loading ? "..." : (data?.totalPublished ?? 0).toString(),
      icon: BookOpen,
      trend: "Live on platform",
      bgClass: "bg-emerald-50",
      textClass: "text-emerald-600",
    },
    {
      label: "Pending Review",
      value: loading ? "..." : (data?.totalPending ?? 0).toString(),
      icon: Clock,
      trend: "Awaiting approval",
      bgClass: "bg-amber-50",
      textClass: "text-amber-600",
    },
    {
      label: "Draft Courses",
      value: loading ? "..." : (data?.totalDraft ?? 0).toString(),
      icon: FilePlus,
      trend: "In progress",
      bgClass: "bg-purple-50",
      textClass: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-12 animate-[fade-in-up_0.4s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">
            Welcome back to your teaching hub.
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(220,38,38,0.08)] transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl ${stat.bgClass} flex items-center justify-center border border-white shadow-inner group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-7 h-7 ${stat.textClass}`} />
                </div>
              </div>
              <div>
                <h3 className="text-5xl font-extrabold text-gray-900 tracking-tight font-[family-name:var(--font-outfit)]">
                  {stat.value}
                </h3>
                <p className="text-gray-500 font-bold mt-2 text-sm tracking-wide uppercase">
                  {stat.label}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50 text-xs font-semibold text-gray-600 border border-gray-100">
                  {stat.trend}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* Recent Enrollments */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 min-h-[400px]">
          <h2 className="text-xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-outfit)]">
            Recent Enrolled Students
          </h2>

          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : !data?.recentEnrollments?.length ? (
            <div className="flex items-center justify-center h-[200px] text-gray-400 font-medium">
              No enrollments yet
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-gray-100">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_1fr_100px] gap-3 pb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Student
                </span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Course
                </span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                  Date
                </span>
              </div>
              {/* Rows */}
              {data.recentEnrollments.map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="grid grid-cols-[1fr_1fr_100px] gap-3 py-3.5 items-center"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                      {enrollment.studentName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {enrollment.studentName}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 truncate">
                    {enrollment.courseTitle}
                  </span>
                  <span className="text-xs text-gray-400 text-right">
                    {enrollment.enrolledAt
                      ? new Date(enrollment.enrolledAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 min-h-[400px]">
          <h2 className="text-xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-outfit)]">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              href="/coach/courses/new"
              className="w-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold py-3.5 px-4 rounded-xl transition-colors border border-red-100 flex items-center justify-center gap-2"
            >
              <PlusSquare className="w-5 h-5" />
              Create New Course
            </Link>
            <Link
              href="/coach/courses"
              className="w-full bg-gray-50 text-gray-700 hover:bg-gray-100 font-bold py-3.5 px-4 rounded-xl transition-colors border border-gray-200 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              My Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
