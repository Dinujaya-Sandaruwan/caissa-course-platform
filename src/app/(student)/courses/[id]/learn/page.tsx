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
  ChevronRight,
  Crown,
  Sparkles,
  Clock,
  ChevronDown,
  Trophy,
} from "lucide-react";

interface Lesson {
  _id: string;
  title: string;
  bunnyVideoId?: string;
  signedIframeUrl?: string;
  duration: number;
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
  const courseId = params?.id as string;

  const [data, setData] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [marking, setMarking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(),
  );

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
        if (!currentLessonId) {
          const allLessons = content.chapters.flatMap((ch) => ch.lessons);
          const firstIncomplete = allLessons.find(
            (l) => !content.completedLessonIds.includes(l._id),
          );
          setCurrentLessonId(
            firstIncomplete?._id || allLessons[0]?._id || null,
          );
        }
        setExpandedChapters(new Set(content.chapters.map((ch) => ch._id)));
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

  const allLessons = data?.chapters.flatMap((ch) => ch.lessons) || [];
  const currentLesson = allLessons.find((l) => l._id === currentLessonId);
  const currentIndex = allLessons.findIndex((l) => l._id === currentLessonId);
  const nextLesson = currentIndex >= 0 ? allLessons[currentIndex + 1] : null;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const isCompleted = currentLessonId
    ? completedIds.has(currentLessonId)
    : false;

  const totalLessons = allLessons.length;
  const completedCount = completedIds.size;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const currentChapter = data?.chapters.find((ch) =>
    ch.lessons.some((l) => l._id === currentLessonId),
  );

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
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }

  function toggleChapter(chId: string) {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chId)) next.delete(chId);
      else next.add(chId);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-[3px] border-gray-100"></div>
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-red-500 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-red-50 flex items-center justify-center">
              <Crown className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <p className="text-sm text-gray-500 font-semibold animate-pulse">
            Loading your course…
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
        <div className="text-center bg-white rounded-[2rem] p-12 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-100">
          <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-9 h-9 text-gray-400" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">
            Course not available
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            This course may have been removed or you may not have access.
          </p>
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/20 flex">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  SIDEBAR                                                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[340px] bg-white/90 backdrop-blur-2xl border-r border-gray-100/80 z-40 flex flex-col transition-all duration-500 ease-out ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <Link
              href="/student/dashboard"
              className="group flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-600 transition-all duration-200"
            >
              <div className="w-7 h-7 rounded-xl bg-gray-50 group-hover:bg-red-50 flex items-center justify-center transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              Dashboard
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Course Card */}
          <div className="bg-gradient-to-br from-red-50/80 to-white p-5 rounded-[1.5rem] border border-red-100/60 shadow-[0_4px_20px_rgba(239,68,68,0.06)]">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold text-gray-900 line-clamp-2 leading-snug">
                  {data.course.title}
                </h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  by {data.course.coach?.name || "Coach"}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                  {progressPercent === 100 ? (
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  )}
                  {progressPercent}% complete
                </span>
                <span className="text-gray-400 font-semibold tabular-nums">
                  {completedCount}/{totalLessons}
                </span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-red-500 to-red-400 rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  {progressPercent > 0 && (
                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-white/30 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {data.chapters.map((ch, chIdx) => {
            const chLessons = ch.lessons;
            const chCompleted = chLessons.filter((l) =>
              completedIds.has(l._id),
            ).length;
            const isExpanded = expandedChapters.has(ch._id);
            const hasActiveLessonHere = ch.lessons.some(
              (l) => l._id === currentLessonId,
            );
            const allChapterDone = chCompleted === chLessons.length;

            return (
              <div key={ch._id} className="mb-2">
                {/* Chapter Header */}
                <button
                  onClick={() => toggleChapter(ch._id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all duration-200 ${
                    hasActiveLessonHere
                      ? "bg-red-50/60 shadow-sm"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-extrabold transition-colors ${
                      allChapterDone
                        ? "bg-emerald-50 text-emerald-600"
                        : hasActiveLessonHere
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {allChapterDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      chIdx + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-800 leading-snug line-clamp-1">
                      {ch.title}
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                      {chCompleted}/{chLessons.length} lessons
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-300 shrink-0 transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Lessons */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    isExpanded
                      ? "max-h-[2000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pt-1 pb-2 pl-3">
                    {ch.lessons.map((lesson, lessonIdx) => {
                      const isActive = lesson._id === currentLessonId;
                      const isDone = completedIds.has(lesson._id);
                      return (
                        <button
                          key={lesson._id}
                          onClick={() => goToLesson(lesson._id)}
                          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 mb-0.5 ${
                            isActive
                              ? "bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-red-100"
                              : "hover:bg-gray-50/80 border border-transparent"
                          }`}
                        >
                          {/* Status Icon */}
                          <div className="shrink-0">
                            {isDone ? (
                              <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              </div>
                            ) : isActive ? (
                              <div className="w-6 h-6 rounded-lg bg-red-500 flex items-center justify-center shadow-md shadow-red-500/30">
                                <Play className="w-3 h-3 text-white fill-white" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-lg bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
                                <Circle className="w-3 h-3 text-gray-300 group-hover:text-gray-400 transition-colors" />
                              </div>
                            )}
                          </div>

                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-[13px] font-medium line-clamp-1 transition-colors ${
                                isActive
                                  ? "text-gray-900 font-bold"
                                  : isDone
                                    ? "text-gray-400"
                                    : "text-gray-600 group-hover:text-gray-800"
                              }`}
                            >
                              {lesson.title}
                            </span>
                          </div>

                          {/* Duration */}
                          {lesson.duration && lesson.duration > 0 && (
                            <span
                              className={`text-[10px] shrink-0 font-semibold tabular-nums px-2 py-0.5 rounded-md ${
                                isActive
                                  ? "bg-red-50 text-red-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {Math.round(lesson.duration / 60)}m
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  MAIN CONTENT                                                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-white/70 backdrop-blur-2xl border-b border-gray-100/60 px-4 sm:px-8 py-3.5 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-all duration-200"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="min-w-0 flex-1 flex items-center gap-2 text-sm">
            {currentChapter && (
              <>
                <span className="text-gray-400 font-medium truncate hidden sm:inline text-xs">
                  {currentChapter.title}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0 hidden sm:block" />
              </>
            )}
            <span className="text-gray-800 font-bold truncate text-sm">
              {currentLesson?.title || "Select a lesson"}
            </span>
          </div>

          {/* Progress Pill */}
          <div className="hidden sm:flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 shrink-0">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-gray-700 tabular-nums">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-[960px] mx-auto px-4 sm:px-8 py-8 space-y-8">
          {currentLesson ? (
            <>
              {/* Video Player */}
              <div className="relative bg-black rounded-[1.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] aspect-video ring-1 ring-black/5">
                {currentLesson.signedIframeUrl ? (
                  <iframe
                    key={currentLesson._id}
                    src={currentLesson.signedIframeUrl}
                    loading="lazy"
                    className="w-full h-full border-0"
                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                    allowFullScreen
                    title={currentLesson.title}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-[1.25rem] bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-400 font-semibold">
                        Video not available
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson Info Card */}
              <div className="bg-white rounded-[1.75rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-100/80 overflow-hidden">
                <div className="p-7 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-extrabold text-gray-900 leading-tight tracking-tight">
                        {currentLesson.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {currentLesson.duration &&
                          currentLesson.duration > 0 && (
                            <span className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold bg-gray-50 px-3 py-1.5 rounded-xl">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {Math.round(currentLesson.duration / 60)} min
                            </span>
                          )}
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold bg-gray-50 px-3 py-1.5 rounded-xl">
                          <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                          Lesson {currentIndex + 1} of {totalLessons}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0">
                      {isCompleted ? (
                        <span className="flex items-center gap-2.5 px-6 py-3 bg-emerald-50 text-emerald-600 text-sm font-extrabold rounded-2xl border border-emerald-100 shadow-sm">
                          <CheckCircle2 className="w-5 h-5" />
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={handleMarkComplete}
                          disabled={marking}
                          className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-extrabold rounded-2xl hover:from-red-700 hover:to-red-600 shadow-xl shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          {marking ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5" />
                          )}
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center gap-3 mt-7 pt-7 border-t border-gray-100">
                    {prevLesson ? (
                      <button
                        onClick={() => goToLesson(prevLesson._id)}
                        className="group flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-2xl transition-all duration-200"
                      >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Previous
                      </button>
                    ) : (
                      <div />
                    )}
                    <div className="flex-1" />
                    {nextLesson && (
                      <button
                        onClick={() => goToLesson(nextLesson._id)}
                        className="group flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-2xl transition-all duration-200"
                      >
                        Next Lesson
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Lesson Description */}
                {currentLesson.description && (
                  <div className="px-7 sm:px-8 pb-7 sm:pb-8">
                    <div className="bg-gradient-to-br from-gray-50/80 to-gray-50 rounded-[1.25rem] p-6 border border-gray-100/80">
                      <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                          <BookOpen className="w-3.5 h-3.5 text-red-500" />
                        </div>
                        About This Lesson
                      </h3>
                      <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                        {currentLesson.description
                          .split("\n")
                          .map((para, i) => (
                            <p key={i}>{para}</p>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Resources */}
                {((currentLesson.links ?? []).length > 0 ||
                  (currentLesson.materials ?? []).length > 0) && (
                  <div className="px-7 sm:px-8 pb-7 sm:pb-8">
                    <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      Resources & Materials
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentLesson.links?.map((link, i) => (
                        <a
                          key={`link-${i}`}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50/70 hover:bg-red-50/60 border border-gray-100 hover:border-red-100 transition-all duration-300 hover:shadow-sm"
                        >
                          <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                            <LinkIcon className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 group-hover:text-red-700 transition-colors line-clamp-1">
                              External Resource
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {link}
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-red-400 shrink-0 transition-colors" />
                        </a>
                      ))}

                      {currentLesson.materials?.map((material, i) => (
                        <a
                          key={`material-${material._id || i}`}
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50/70 hover:bg-emerald-50/60 border border-gray-100 hover:border-emerald-100 transition-all duration-300 hover:shadow-sm"
                        >
                          <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                            <FileText className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                              {material.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Download Material
                            </p>
                          </div>
                          <Download className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 shrink-0 transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-28">
              <div className="w-20 h-20 rounded-[1.5rem] bg-white shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-5">
                <BookOpen className="w-9 h-9 text-gray-300" />
              </div>
              <p className="text-gray-500 font-semibold text-lg">
                Select a lesson to begin
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Pick a lesson from the sidebar to start learning
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
