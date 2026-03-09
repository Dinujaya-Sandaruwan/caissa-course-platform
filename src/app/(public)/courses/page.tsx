"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import NavbarClient from "@/components/landing/NavbarClient";
import Footer from "@/components/landing/Footer";
import SearchBar from "@/components/ui/SearchBar";
import CourseFilters from "@/components/ui/CourseFilters";
import { Users, BookOpen, Loader2 } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";

interface PublicCourse {
  _id: string;
  title: string;
  thumbnailUrl?: string;
  price: number;
  discountedPrice?: number;
  level: string;
  enrollmentCount: number;
  tags: string[];
  coach?: { name?: string };
  category?: { name?: string };
  ageMin?: number;
  ageMax?: number;
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

function CoursesContent() {
  const searchParams = useSearchParams();
  const search = searchParams?.get("search") || "";
  const levelParam = searchParams?.get("level") || "";
  const categoryParam = searchParams?.get("category") || "";
  const sortParam = searchParams?.get("sort") || "newest";
  const ageParam = searchParams?.get("age") || "";

  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchCourses = useCallback(
    async (reset = false) => {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (levelParam) params.set("level", levelParam);
        if (categoryParam) params.set("category", categoryParam);
        if (ageParam) params.set("age", ageParam);
        params.set("sort", sortParam);
        if (!reset && cursor) params.set("cursor", cursor);

        const res = await fetch(`/api/courses?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (reset) {
            setCourses(data.courses);
          } else {
            setCourses((prev) => [...prev, ...data.courses]);
          }
          setCursor(data.nextCursor);
          setHasMore(data.hasMore);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, levelParam, categoryParam, sortParam, ageParam, cursor],
  );

  // Refetch when URL params change
  useEffect(() => {
    setCursor(null);
    fetchCourses(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, levelParam, categoryParam, sortParam, ageParam]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Header */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
            Explore Courses
          </h1>
          <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto font-medium">
            Master chess with expert-led courses. From opening theory to endgame
            mastery — find the perfect course for your level.
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Search */}
            <SearchBar placeholder="Search courses..." paramName="search" />

            {/* Filters */}
            <CourseFilters />
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && <LoadingScreen />}

      {/* Course Grid */}
      {!loading && (
        <section className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            {courses.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  No courses found
                </h3>
                <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto">
                  {search
                    ? `No results for "${search}". Try a different search term.`
                    : "No published courses available yet. Check back soon!"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => {
                    const lc =
                      levelColors[course.level] || levelColors.beginner;
                    return (
                      <Link
                        key={course._id}
                        href={`/courses/${course._id}`}
                        className="group bg-white rounded-[24px] flex flex-col overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
                      >
                        {/* Thumbnail */}
                        <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden shrink-0">
                          {course.thumbnailUrl ? (
                            <img
                              src={course.thumbnailUrl}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                              <BookOpen className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-1">
                          {/* Top Row: Category & Level */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span
                              className={`px-2 py-1 text-[10px] font-extrabold rounded-md border uppercase tracking-wider ${lc.text} ${lc.bg} ${lc.border}`}
                            >
                              {levelEmoji[course.level]} {course.level}
                            </span>
                            {course.category && (
                              <span className="px-2 py-1 text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-100 rounded-md uppercase tracking-wider truncate max-w-[120px]">
                                {course.category.name}
                              </span>
                            )}
                            {course.ageMin != null && course.ageMax != null && (
                              <span className="px-2 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-md uppercase tracking-wider">
                                Ages {course.ageMin}–{course.ageMax}
                              </span>
                            )}
                          </div>

                          {/* Title & Coach */}
                          <h3 className="text-[17px] font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-tight mb-1.5">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-500 font-medium mb-3">
                            by {course.coach?.name || "Caissa Coach"}
                          </p>

                          {/* Tags */}
                          {course.tags?.length > 0 && (
                            <p className="text-xs text-gray-400 font-medium truncate mb-4">
                              {course.tags.slice(0, 4).join(" • ")}
                            </p>
                          )}

                          {/* Spacer to push footer down */}
                          <div className="flex-1"></div>

                          {/* Footer: Price & Students */}
                          <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-100">
                            <div>
                              {course.discountedPrice ? (
                                <div className="flex flex-col">
                                  <span className="text-gray-400 line-through text-xs font-semibold mb-0.5">
                                    Rs. {course.price?.toLocaleString()}
                                  </span>
                                  <span className="text-lg sm:text-xl font-extrabold text-red-600 leading-none">
                                    Rs.{" "}
                                    {course.discountedPrice.toLocaleString()}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col justify-end h-full">
                                  <span className="text-lg sm:text-xl font-extrabold text-gray-900 leading-none">
                                    Rs. {course.price?.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 shrink-0">
                              <Users className="w-3.5 h-3.5 text-gray-400" />
                              {course.enrollmentCount || 0}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => fetchCourses(false)}
                      disabled={loadingMore}
                      className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl transition-all disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : null}
                      Load More Courses
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default function PublicCoursesPage() {
  return (
    <>
      <NavbarClient session={null} />
      <Suspense fallback={<LoadingScreen />}>
        <CoursesContent />
      </Suspense>
      <Footer />
    </>
  );
}
