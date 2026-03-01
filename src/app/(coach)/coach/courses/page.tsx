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
  Sprout,
  Swords,
  Crown,
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
  thumbnailUrl?: string;
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
  approved: {
    label: "Approved",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
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

const levelIcon: Record<string, LucideIcon> = {
  beginner: Sprout,
  intermediate: Swords,
  advanced: Crown,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => {
          const status = statusConfig[course.status] || statusConfig.draft;
          const StatusIcon: LucideIcon = status.icon;

          return (
            <div
              key={course._id}
              className="bg-white rounded-3xl flex flex-col overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 group"
            >
              {/* Thumbnail Banner */}
              <div className="relative w-full aspect-[16/9] bg-gray-50 border-b border-gray-100 overflow-hidden shrink-0">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl.replace(
                      /^\/?(\.\/)?public\//,
                      "/",
                    )}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <BookOpen className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-sm font-medium">No Image</span>
                  </div>
                )}

                {/* Status Badge overlay */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border shadow-sm backdrop-blur-md bg-white/95 ${status.color} ${status.border}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Card Content body */}
              <div className="p-5 sm:p-6 flex flex-col flex-1">
                {/* Title & Metadata */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-1.5 leading-tight">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <span className="capitalize flex items-center gap-1.5">
                      {(() => {
                        const Icon = levelIcon[course.level] || BookOpen;
                        return <Icon className="w-4 h-4 text-gray-400" />;
                      })()}
                      {course.level}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span>
                      {new Date(course.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-100">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-800">
                      {course.enrollmentCount || 0}
                    </span>{" "}
                    students
                  </div>
                  <div className="font-extrabold text-gray-900">
                    Rs. {course.price?.toLocaleString()}
                  </div>
                </div>

                {/* Feedback Dropdown (Rejected) */}
                {course.status === "rejected" && course.reviewNotes && (
                  <div className="mb-5 bg-red-50/70 rounded-2xl border border-red-100 overflow-hidden">
                    <button
                      onClick={() =>
                        setExpandedFeedback(
                          expandedFeedback === course._id ? null : course._id,
                        )
                      }
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Manager Feedback
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedFeedback === course._id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedFeedback === course._id && (
                      <div className="px-4 pb-4 pt-1 text-sm text-red-800 leading-relaxed border-t border-red-100/50">
                        {course.reviewNotes}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Actions */}
                <div className="mt-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Primary Edit Button for Editable states */}
                  {["draft", "pending_review", "rejected"].includes(
                    course.status,
                  ) && (
                    <Link
                      href={`/coach/courses/${course._id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-0.5 transition-all"
                    >
                      <FileEdit className="w-4 h-4" />
                      {course.status === "rejected"
                        ? "Revise & Resubmit"
                        : "Edit Course"}
                    </Link>
                  )}

                  {/* Supplemental Status Badge for Pending */}
                  {course.status === "pending_review" && (
                    <div className="flex-none sm:flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      Awaiting Review
                    </div>
                  )}

                  {course.status === "published" && (
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      Live and Accepting Students
                    </div>
                  )}

                  {/* Action for Approved Courses */}
                  {course.status === "approved" && (
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-blue-700 bg-blue-50 rounded-xl border border-blue-200">
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      Approved! Awaiting Manager Publication...
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
