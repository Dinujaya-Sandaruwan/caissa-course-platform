"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Loader2,
  Play,
  Search,
  AlertCircle,
} from "lucide-react";

interface CourseInfo {
  _id: string;
  title?: string;
  thumbnailUrl?: string;
  price?: number;
  level?: string;
}

interface EnrollmentItem {
  _id: string;
  courseId: CourseInfo;
  paymentStatus: string;
  totalLessons?: number;
  completedLessons?: number;
  reviewNotes?: string;
  createdAt: string;
}

interface DashboardData {
  studentName: string;
  studentAvatar?: string;
  pending: EnrollmentItem[];
  approved: EnrollmentItem[];
  rejected: EnrollmentItem[];
}

const levelEmoji: Record<string, string> = {
  beginner: "🌱",
  intermediate: "⚔️",
  advanced: "👑",
};

export default function StudentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/student/dashboard");
        if (res.ok) {
          setData(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const hasAnyCourses =
    data.approved.length > 0 ||
    data.pending.length > 0 ||
    data.rejected.length > 0;

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <div className="flex items-center gap-5 bg-white p-6 sm:p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mb-8">
        {data.studentAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.studentAvatar}
            alt={data.studentName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-red-50 shadow-md"
          />
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 flex items-center justify-center text-2xl sm:text-3xl font-bold text-red-600 border-4 border-red-50 shadow-md">
            {data.studentName.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
            Welcome back, {data.studentName} 👋
          </h1>
          <p className="text-gray-500 mt-2 text-base sm:text-lg font-medium">
            {data.approved.length > 0
              ? "Continue where you left off."
              : "Start your chess journey today."}
          </p>
        </div>
      </div>

      {/* My Courses — Approved Enrollments */}
      {data.approved.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-500" />
            My Courses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.approved.map((enrollment) => {
              const course = enrollment.courseId;
              const total = enrollment.totalLessons || 0;
              const completed = enrollment.completedLessons || 0;
              const percent =
                total > 0 ? Math.round((completed / total) * 100) : 0;
              const isComplete = percent === 100;

              return (
                <div
                  key={enrollment._id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_16px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    {course.level && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-lg bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200">
                        {levelEmoji[course.level]} {course.level}
                      </span>
                    )}
                    {isComplete && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500 text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Complete
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                      {course.title}
                    </h3>

                    {/* Progress */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-gray-700">
                          {percent}% complete
                        </span>
                        <span className="text-gray-400">
                          {completed}/{total} lessons
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isComplete
                              ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                              : "bg-gradient-to-r from-red-500 to-red-600"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Continue Button */}
                    <Link
                      href={`/courses/${course._id}/learn`}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/15 transition-all"
                    >
                      <Play className="w-4 h-4" />
                      {isComplete ? "Review Course" : "Continue Learning"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Pending Enrollments */}
      {data.pending.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Pending Enrollments
          </h2>
          <div className="space-y-3">
            {data.pending.map((enrollment) => (
              <div
                key={enrollment._id}
                className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900">
                    {enrollment.courseId?.title || "Course"}
                  </h4>
                  <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Receipt under review — you will receive a WhatsApp
                    confirmation within 24 hours
                  </p>
                </div>
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full shrink-0">
                  Pending Review
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rejected Enrollments */}
      {data.rejected.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Action Required
          </h2>
          <div className="space-y-3">
            {data.rejected.map((enrollment) => (
              <div
                key={enrollment._id}
                className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-red-100 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900">
                    {enrollment.courseId?.title || "Course"}
                  </h4>
                  <p className="text-xs text-red-600 font-medium mt-1">
                    Payment could not be verified.{" "}
                    {enrollment.reviewNotes && (
                      <span className="text-gray-500">
                        Note: {enrollment.reviewNotes}
                      </span>
                    )}
                  </p>
                </div>
                <Link
                  href={`/courses/${enrollment.courseId?._id}/enroll`}
                  className="inline-flex items-center px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors shrink-0"
                >
                  Resubmit Receipt
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!hasAnyCourses && (
        <div className="bg-white rounded-3xl p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 text-center">
          <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No courses yet</h3>
          <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto">
            Browse our catalog and enroll in a course to start learning chess.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 mt-6 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
}
