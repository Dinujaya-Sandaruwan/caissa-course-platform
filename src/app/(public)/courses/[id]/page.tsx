"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import NavbarClient from "@/components/landing/NavbarClient";
import Footer from "@/components/landing/Footer";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Clock,
  Play,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  Lock,
  MonitorSmartphone,
  Check,
} from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";

interface Lesson {
  _id: string;
  title: string;
  order: number;
  duration?: number;
}

interface Chapter {
  _id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseDetail {
  _id: string;
  title: string;
  description: string;
  price: number;
  discountedPrice?: number;
  level: string;
  tags: string[];
  durationHours?: number;
  durationMinutes?: number;
  thumbnailUrl?: string;
  bunnyPreviewVideoUrl?: string;
  enrollmentCount: number;
  createdAt: string;
  coach?: {
    name?: string;
    bio?: string;
    profilePhotoThumbnail?: string;
    profilePhoto?: string;
  };
  category?: { name?: string };
  chapters: Chapter[];
}

const levelEmoji: Record<string, string> = {
  beginner: "🌱",
  intermediate: "⚔️",
  advanced: "👑",
};

const levelColors: Record<
  string,
  { text: string; bg: string; border: string }
> = {
  beginner: {
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  intermediate: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  advanced: { text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
};

export default function PublicCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(),
  );
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
          // Expand first chapter by default
          if (data.chapters?.length > 0) {
            setExpandedChapters(new Set([data.chapters[0]._id]));
          }
        }
      } catch (error) {
        console.error("Failed to fetch course:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseId]);

  // Check if the user is already enrolled
  useEffect(() => {
    async function checkEnrollment() {
      try {
        const res = await fetch(
          `/api/student/enrollments/check?courseId=${courseId}`,
        );
        if (res.ok) {
          const data = await res.json();
          setIsEnrolled(data.enrolled);
        }
      } catch {
        // User may not be logged in — that's fine
      } finally {
        setCheckingEnrollment(false);
      }
    }
    checkEnrollment();
  }, [courseId]);

  function toggleChapter(chapterId: string) {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  }

  function handleEnroll() {
    setEnrolling(true);
    // Redirect to enrollment page (login check happens there)
    router.push(`/courses/${courseId}/enroll`);
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (!course) {
    return (
      <>
        <NavbarClient session={null} />
        <div className="text-center py-32 min-h-screen">
          <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
          <Link
            href="/courses"
            className="text-red-600 hover:underline mt-4 inline-block text-sm font-semibold"
          >
            ← Browse all courses
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const lc = levelColors[course.level] || levelColors.beginner;
  const totalLessons = course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.length,
    0,
  );

  return (
    <>
      <NavbarClient session={null} />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Back Link */}
        <div className="max-w-6xl mx-auto px-6 pt-28">
          <Link
            href="/courses"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            All Courses
          </Link>
        </div>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-6 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left: Course Info */}
            <div className="lg:col-span-3 space-y-6">
              {/* Level Badge */}
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border ${lc.text} ${lc.bg} ${lc.border}`}
                >
                  {levelEmoji[course.level]} {course.level}
                </span>

                {course.category && (
                  <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 text-gray-700 uppercase tracking-wider">
                    {course.category.name}
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight leading-tight">
                {course.title}
              </h1>

              <div className="flex items-center gap-3">
                {course.coach?.profilePhotoThumbnail ||
                course.coach?.profilePhoto ? (
                  <img
                    src={
                      course.coach.profilePhotoThumbnail ||
                      course.coach.profilePhoto
                    }
                    alt={course.coach.name || "Coach"}
                    className="w-10 h-10 rounded-full object-cover border border-red-100 shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600">
                    {course.coach?.name?.charAt(0) || "C"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {course.coach?.name || "Caissa Coach"}
                  </p>
                  {course.coach?.bio && (
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {course.coach.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">{totalLessons}</span> lessons
                </div>
                {(course.durationHours
                  ? course.durationHours > 0
                  : false ||
                    (course.durationMinutes
                      ? course.durationMinutes > 0
                      : false)) && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold">
                      {course.durationHours ? `${course.durationHours}h ` : ""}
                      {course.durationMinutes
                        ? `${course.durationMinutes}m`
                        : ""}
                    </span>{" "}
                    total
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">
                    {course.enrollmentCount || 0}
                  </span>{" "}
                  students
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  About this course
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {course.description}
                </p>
              </div>

              {/* Tags */}
              {course.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 rounded-full border border-red-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Preview + CTA */}
            <div className="lg:col-span-2 space-y-5">
              {/* Preview Video */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100">
                {course.bunnyPreviewVideoUrl ? (
                  <div className="aspect-video bg-gray-900 relative">
                    <iframe
                      src={course.bunnyPreviewVideoUrl}
                      loading="lazy"
                      className="w-full h-full border-0"
                      allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                      allowFullScreen
                      title="Course Preview"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-12 h-12 text-gray-300 mx-auto" />
                      <p className="text-xs text-gray-400 mt-2">
                        Preview not available
                      </p>
                    </div>
                  </div>
                )}

                {/* Price + Features + Enroll CTA */}
                <div className="p-6 md:p-8 flex flex-col h-full">
                  <div className="flex-1">
                    <div className="text-center mb-6">
                      <div className="flex flex-row items-center justify-center gap-3">
                        {course.discountedPrice ? (
                          <>
                            <span className="text-4xl font-extrabold text-red-600">
                              Rs. {course.discountedPrice?.toLocaleString()}
                            </span>
                            <span className="text-gray-400 line-through text-lg font-bold">
                              Rs. {course.price?.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-4xl font-extrabold text-gray-900">
                            Rs. {course.price?.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <h4 className="text-sm font-bold text-gray-900 mb-3">
                        What's included in this course:
                      </h4>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                          Full lifetime access to {totalLessons} lessons
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                          Access on mobile and desktop
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                          Direct coach support & feedback
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    {checkingEnrollment ? (
                      <div className="flex justify-center py-3">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      </div>
                    ) : isEnrolled ? (
                      <div className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl w-full">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-700">
                          Already Enrolled
                        </span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleEnroll}
                          disabled={enrolling}
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white text-base font-bold rounded-2xl hover:bg-red-700 shadow-xl shadow-red-600/20 hover:shadow-red-600/30 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                        >
                          {enrolling ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <BookOpen className="w-5 h-5" />
                          )}
                          Enroll Now
                        </button>
                        <p className="text-xs text-center text-gray-500 font-medium mt-4 flex items-center justify-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-gray-400" /> Secure
                          checkout & 24/7 support
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Course Curriculum
              </h2>
              <span className="text-sm text-gray-400 font-medium">
                {course.chapters.length} chapter
                {course.chapters.length !== 1 ? "s" : ""} · {totalLessons}{" "}
                lesson{totalLessons !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-3">
              {course.chapters.map((ch, chIdx) => {
                const isExpanded = expandedChapters.has(ch._id);
                return (
                  <div
                    key={ch._id}
                    className="border border-gray-100 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleChapter(ch._id)}
                      className="w-full flex items-center gap-3 px-5 py-4 bg-gray-50/80 hover:bg-gray-100/80 transition-colors text-left"
                    >
                      <span className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-xs font-bold text-red-600 border border-red-100 shrink-0">
                        {chIdx + 1}
                      </span>
                      <span className="text-sm font-bold text-gray-900 flex-1">
                        {ch.title}
                      </span>
                      <span className="text-xs text-gray-400 mr-2">
                        {ch.lessons.length} lesson
                        {ch.lessons.length !== 1 ? "s" : ""}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="divide-y divide-gray-50">
                        {ch.lessons.map((lesson, lIdx) => (
                          <div
                            key={lesson._id}
                            className="flex items-center gap-3 px-5 py-3"
                          >
                            <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                            <span className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                              {lIdx + 1}
                            </span>
                            <span className="text-sm text-gray-700 flex-1">
                              {lesson.title}
                            </span>
                            {lesson.duration && lesson.duration > 0 && (
                              <span className="text-xs text-gray-400">
                                {Math.round(lesson.duration / 60)} min
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
