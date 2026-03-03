"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Play,
  Menu,
  X,
  Loader2,
  BookOpen,
  Link as LinkIcon,
  ExternalLink,
  FileText,
  Download,
} from "lucide-react";

interface Lesson {
  _id: string;
  title: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  description?: string;
  links?: string[];
  materials?: { title: string; url: string; _id?: string }[];
}

interface Chapter {
  _id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseContent {
  course: {
    _id: string;
    title: string;
    description: string;
    level: string;
    coach?: { name?: string };
  };
  chapters: Chapter[];
  completedLessonIds: string[];
}

export default function StudentCourseViewerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [data, setData] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [marking, setMarking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch(`/api/student/courses/${courseId}/content`);
      if (res.status === 403) {
        router.push(`/courses/${courseId}`);
        return;
      }
      if (res.ok) {
        const content: CourseContent = await res.json();
        setData(content);
        setCompletedIds(new Set(content.completedLessonIds));
        // Auto-select first incomplete lesson, or first lesson
        if (!currentLessonId) {
          const allLessons = content.chapters.flatMap((ch) => ch.lessons);
          const firstIncomplete = allLessons.find(
            (l) => !content.completedLessonIds.includes(l._id),
          );
          setCurrentLessonId(
            firstIncomplete?._id || allLessons[0]?._id || null,
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch course content:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId, currentLessonId, router]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Find current lesson
  const allLessons = data?.chapters.flatMap((ch) => ch.lessons) || [];
  const currentLesson = allLessons.find((l) => l._id === currentLessonId);
  const currentIndex = allLessons.findIndex((l) => l._id === currentLessonId);
  const nextLesson = currentIndex >= 0 ? allLessons[currentIndex + 1] : null;
  const isCompleted = currentLessonId
    ? completedIds.has(currentLessonId)
    : false;

  // Progress
  const totalLessons = allLessons.length;
  const completedCount = completedIds.size;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  async function handleMarkComplete() {
    if (!currentLessonId || isCompleted) return;
    setMarking(true);
    try {
      const res = await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: currentLessonId, courseId }),
      });
      if (res.ok) {
        setCompletedIds((prev) => new Set([...prev, currentLessonId]));
      }
    } catch (error) {
      console.error("Failed to mark complete:", error);
    } finally {
      setMarking(false);
    }
  }

  function goToLesson(lessonId: string) {
    setCurrentLessonId(lessonId);
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">
            Course not available
          </h2>
          <Link
            href="/student/dashboard"
            className="text-red-600 hover:underline mt-4 inline-block text-sm font-semibold"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-80 bg-white border-r border-gray-100 z-40 flex flex-col transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/student/dashboard"
              className="group flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Dashboard
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
            {data.course.title}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            by {data.course.coach?.name || "Coach"}
          </p>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-gray-900">
                {progressPercent}% complete
              </span>
              <span className="text-gray-400">
                {completedCount}/{totalLessons}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto py-2">
          {data.chapters.map((ch, chIdx) => (
            <div key={ch._id} className="mb-1">
              <div className="px-5 py-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Chapter {chIdx + 1}
                </span>
                <p className="text-xs font-bold text-gray-700 mt-0.5 leading-snug">
                  {ch.title}
                </p>
              </div>
              {ch.lessons.map((lesson) => {
                const isActive = lesson._id === currentLessonId;
                const isDone = completedIds.has(lesson._id);
                return (
                  <button
                    key={lesson._id}
                    onClick={() => goToLesson(lesson._id)}
                    className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-left transition-colors ${
                      isActive
                        ? "bg-red-50 border-r-2 border-red-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : isActive ? (
                      <Play className="w-4 h-4 text-red-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                    )}
                    <span
                      className={`text-xs font-medium flex-1 line-clamp-1 ${
                        isActive
                          ? "text-red-700 font-bold"
                          : isDone
                            ? "text-gray-500"
                            : "text-gray-700"
                      }`}
                    >
                      {lesson.title}
                    </span>
                    {lesson.duration && lesson.duration > 0 && (
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {Math.round(lesson.duration / 60)}m
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 truncate">
              {currentLesson?.title || "Select a lesson"}
            </p>
          </div>
          <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full shrink-0">
            {progressPercent}%
          </span>
        </div>

        {/* Video Player Area */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {currentLesson ? (
            <>
              {/* Video Player */}
              <div className="bg-black rounded-2xl overflow-hidden shadow-xl aspect-video">
                {currentLesson.videoUrl ? (
                  <iframe
                    key={currentLesson._id}
                    src={currentLesson.videoUrl}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                    title={currentLesson.title}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Play className="w-12 h-12 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Video not available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson Info + Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {currentLesson.title}
                    </h2>
                    {currentLesson.duration && currentLesson.duration > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Duration: {Math.round(currentLesson.duration / 60)}{" "}
                        minutes
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <span className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={handleMarkComplete}
                        disabled={marking}
                        className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
                      >
                        {marking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Mark as Complete
                      </button>
                    )}

                    {nextLesson && (
                      <button
                        onClick={() => goToLesson(nextLesson._id)}
                        className="px-5 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                      >
                        Next Lesson →
                      </button>
                    )}
                  </div>
                </div>

                {/* Lesson Description */}
                {currentLesson.description && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-red-500" />
                      Lesson Description
                    </h3>
                    <div className="prose prose-sm prose-red max-w-none text-gray-600 leading-relaxed">
                      {currentLesson.description.split("\n").map((para, i) => (
                        <p key={i} className="mb-4 last:mb-0">
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Resources Grid */}
                {((currentLesson.links ?? []).length > 0 ||
                  (currentLesson.materials ?? []).length > 0) && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-500" />
                      Additional Resources
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* External Links */}
                      {currentLesson.links?.map((link, i) => (
                        <a
                          key={`link-${i}`}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-red-50 border border-gray-100 hover:border-red-100 transition-all duration-300"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <LinkIcon className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-red-700 transition-colors">
                              External Resource Link
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {link}
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-red-400 shrink-0 mt-1 transition-colors" />
                        </a>
                      ))}

                      {/* Downloadable Materials */}
                      {currentLesson.materials?.map((material, i) => (
                        <a
                          key={`material-${material._id || i}`}
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="group flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-100 transition-all duration-300"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <FileText className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                              {material.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              File Download
                            </p>
                          </div>
                          <Download className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 shrink-0 mt-1 transition-colors relative top-0.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                Select a lesson from the sidebar to begin
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
