"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  Users,
  ChevronDown,
  Sparkles,
  Loader2,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

interface Course {
  _id: string;
  title: string;
  status: string;
  price: number;
  level: string;
  enrollmentCount: number;
  createdAt: string;
  reviewNotes?: string;
}

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: LucideIcon;
  }
> = {
  draft: {
    label: "Draft",
    color: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-gray-200",
    icon: FileEdit,
  },
  pending_review: {
    label: "Pending Review",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Clock,
  },
  published: {
    label: "Published",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: XCircle,
  },
};

const levelEmoji: Record<string, string> = {
  beginner: "🌱",
  intermediate: "⚔️",
  advanced: "👑",
};

export default function CoachCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/coach/courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fade-in-up_0.4s_ease-out]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-red-500 tracking-widest uppercase bg-red-50 px-3 py-1 rounded-full">
              Courses
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
            My Courses
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">
            Manage and track all your courses in one place.
          </p>
        </div>
        <Link
          href="/coach/courses/new"
          className="group flex items-center gap-2.5 px-6 py-3.5 bg-red-600 text-white text-sm font-bold rounded-2xl hover:bg-red-700 shadow-xl shadow-red-600/20 hover:shadow-red-600/30 transition-all duration-200 hover:-translate-y-0.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </Link>
      </div>

      {/* Empty State */}
      {courses.length === 0 && (
        <div className="bg-white rounded-3xl p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 text-center">
          <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mt-2">
            No courses yet
          </h3>
          <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto">
            Start building your first course! Create engaging chess content and
            share it with students.
          </p>
          <Link
            href="/coach/courses/new"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Your First Course
          </Link>
        </div>
      )}

      {/* Course Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {courses.map((course) => {
          const status = statusConfig[course.status] || statusConfig.draft;
          const StatusIcon: LucideIcon = status.icon;

          return (
            <div
              key={course._id}
              className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] transition-all duration-200 group"
            >
              {/* Top Row: Title + Status */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-red-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                    <span>
                      {levelEmoji[course.level] || "📚"} {course.level}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span>
                      {new Date(course.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border ${status.color} ${status.bg} ${status.border} shrink-0`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status.label}
                </span>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-700">
                    {course.enrollmentCount || 0}
                  </span>
                  <span>students</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span className="font-bold text-gray-700">
                    Rs. {course.price?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Rejected Feedback */}
              {course.status === "rejected" && course.reviewNotes && (
                <div className="mb-4">
                  <button
                    onClick={() =>
                      setExpandedFeedback(
                        expandedFeedback === course._id ? null : course._id,
                      )
                    }
                    className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    View Feedback
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedFeedback === course._id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFeedback === course._id && (
                    <div className="mt-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 leading-relaxed">
                      {course.reviewNotes}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                {course.status === "draft" && (
                  <Link
                    href={`/coach/courses/${course._id}/edit`}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    Edit Course
                  </Link>
                )}
                {course.status === "rejected" && (
                  <Link
                    href={`/coach/courses/${course._id}/edit`}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    Revise & Resubmit
                  </Link>
                )}
                {course.status === "pending_review" && (
                  <span className="text-xs text-amber-600 font-medium px-3 py-2 bg-amber-50 rounded-xl border border-amber-100">
                    Awaiting manager review...
                  </span>
                )}
                {course.status === "published" && (
                  <span className="text-xs text-emerald-600 font-medium px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                    Live and accepting students
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
