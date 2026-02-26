"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Search,
  SlidersHorizontal,
  Users,
  BookOpen,
  Loader2,
  ChevronDown,
} from "lucide-react";

interface PublicCourse {
  _id: string;
  title: string;
  thumbnailUrl?: string;
  price: number;
  level: string;
  enrollmentCount: number;
  tags: string[];
  coach?: { name?: string };
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

export default function PublicCoursesPage() {
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("newest");
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
        if (level) params.set("level", level);
        params.set("sort", sort);
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
    [search, level, sort, cursor],
  );

  // Initial fetch + refetch on filter changes
  useEffect(() => {
    setCursor(null);
    fetchCourses(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, level, sort]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Header */}
        <section className="pt-32 pb-12 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
              Explore Courses
            </h1>
            <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto font-medium">
              Master chess with expert-led courses. From opening theory to
              endgame mastery — find the perfect course for your level.
            </p>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="px-6 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 text-sm font-medium transition-all focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                />
              </div>

              {/* Level Filter */}
              <div className="relative">
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 text-sm font-medium transition-all focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 cursor-pointer"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">🌱 Beginner</option>
                  <option value="intermediate">⚔️ Intermediate</option>
                  <option value="advanced">👑 Advanced</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 text-sm font-medium transition-all focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        )}

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
                            {/* Level Badge */}
                            <span
                              className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-lg border ${lc.text} ${lc.bg} ${lc.border}`}
                            >
                              {levelEmoji[course.level]} {course.level}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                              {course.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1.5 font-medium">
                              by {course.coach?.name || "Caissa Coach"}
                            </p>

                            {/* Tags */}
                            {course.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {course.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 text-[10px] font-semibold text-gray-500 bg-gray-100 rounded-md"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Price + Students */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                              <span className="text-lg font-extrabold text-gray-900">
                                Rs. {course.price?.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                <Users className="w-3.5 h-3.5" />
                                {course.enrollmentCount || 0} students
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
      <Footer />
    </>
  );
}
