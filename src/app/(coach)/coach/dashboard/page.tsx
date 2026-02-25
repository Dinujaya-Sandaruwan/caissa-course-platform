"use client";

import { Users, BookOpen, Clock, FilePlus, PlusSquare } from "lucide-react";

export default function CoachDashboardPage() {
  const stats = [
    {
      label: "Total Students",
      value: "0",
      icon: Users,
      trend: "+0 this week",
      trendUp: true,
      color: "from-blue-500 to-blue-600",
      bgClass: "bg-blue-50",
      textClass: "text-blue-600",
    },
    {
      label: "Published Courses",
      value: "0",
      icon: BookOpen,
      trend: "All active",
      trendUp: true,
      color: "from-emerald-500 to-emerald-600",
      bgClass: "bg-emerald-50",
      textClass: "text-emerald-600",
    },
    {
      label: "Pending Review",
      value: "0",
      icon: Clock,
      trend: "Awaiting approval",
      trendUp: true,
      color: "from-amber-500 to-amber-600",
      bgClass: "bg-amber-50",
      textClass: "text-amber-600",
    },
    {
      label: "Draft Courses",
      value: "0",
      icon: FilePlus,
      trend: "In progress",
      trendUp: true,
      color: "from-purple-500 to-purple-600",
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

      {/* Placeholders for upcoming sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 min-h-[400px]">
          <h2 className="text-xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-outfit)]">
            Recent Enrolled Students
          </h2>
          <div className="flex items-center justify-center h-[200px] text-gray-400 font-medium">
            No recent activity
          </div>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 min-h-[400px]">
          <h2 className="text-xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-outfit)]">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold py-3.5 px-4 rounded-xl transition-colors border border-red-100 flex items-center justify-center gap-2">
              <PlusSquare className="w-5 h-5" />
              Create New Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
