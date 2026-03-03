"use client";

import { useEffect, useState } from "react";
import {
  Users,
  ChevronRight,
  Sparkles,
  BookOpen,
  Loader2,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface FeaturedCourse {
  _id: string;
  title: string;
  thumbnailUrl?: string;
  price: number;
  discountedPrice?: number;
  level: string;
  enrollmentCount: number;
  tags: string[];
  coach?: { name?: string; profilePhotoThumbnail?: string };
  category?: { name?: string };
  durationHours?: number;
  durationMinutes?: number;
}

const levelStyles: Record<
  string,
  { label: string; color: string; bg: string; emoji: string }
> = {
  beginner: {
    label: "Beginner",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    emoji: "🌱",
  },
  intermediate: {
    label: "Intermediate",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    emoji: "⚔️",
  },
  advanced: {
    label: "Advanced",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    emoji: "👑",
  },
};

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function formatDuration(hours?: number, minutes?: number): string | null {
  const h = hours || 0;
  const m = minutes || 0;
  if (h === 0 && m === 0) return null;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function FeaturedCourses() {
  const [courses, setCourses] = useState<FeaturedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses?sort=popular");
        if (res.ok) {
          const data = await res.json();
          const pool: FeaturedCourse[] = data.courses || [];
          const picked = shuffleArray(pool).slice(0, 4);
          setCourses(picked);
        }
      } catch (error) {
        console.error("Failed to fetch featured courses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  return (
    <section className="relative bg-gray-50 py-20 lg:py-28 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -left-20 w-[400px] h-[400px] bg-primary-red/[0.03] rounded-full blur-[80px]"></div>
        <div className="absolute bottom-20 -right-20 w-[400px] h-[400px] bg-purple/[0.03] rounded-full blur-[80px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-red/5 border border-primary-red/10 text-primary-red text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Curated for Excellence
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Featured{" "}
            <span className="text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">
              Courses
            </span>
          </h2>
          <p className="font-sans text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Hand-picked courses designed by titled players to accelerate your
            chess journey — from your very first game to tournament-level
            mastery.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-[1.5rem] bg-white shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-9 h-9 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No courses available yet
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Our coaches are preparing amazing courses for you. Check back soon
              or sign up to get notified when new courses launch!
            </p>
          </div>
        )}

        {/* Course Cards Grid */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
            {courses.map((course) => {
              const level = levelStyles[course.level] || levelStyles.beginner;
              const hasDiscount =
                course.discountedPrice && course.discountedPrice < course.price;
              const coachName = course.coach?.name || "Caissa Coach";
              const coachInitials = coachName
                .split(" ")
                .map((n) => n[0])
                .join("");
              const coachAvatar = course.coach?.profilePhotoThumbnail;
              const duration = formatDuration(
                course.durationHours,
                course.durationMinutes,
              );

              return (
                <Link
                  key={course._id}
                  href={`/courses/${course._id}`}
                  className="group relative bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-gray-300" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>

                    {/* Level Badge — bottom left on thumbnail */}
                    <div
                      className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-extrabold border uppercase tracking-wider ${level.color} ${level.bg}`}
                    >
                      {level.emoji} {level.label}
                    </div>

                    {/* Duration Badge — bottom right */}
                    {duration && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        <Clock className="w-3 h-3" />
                        {duration}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Coach Row */}
                    <div className="flex items-center gap-2.5 mb-3">
                      {coachAvatar ? (
                        <img
                          src={coachAvatar}
                          alt={coachName}
                          className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center text-[10px] font-extrabold text-red-600 border-2 border-white shadow-sm">
                          {coachInitials}
                        </div>
                      )}
                      <span className="text-xs text-gray-500 font-semibold truncate">
                        {coachName}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-extrabold text-[15px] text-gray-900 leading-snug group-hover:text-red-600 transition-colors duration-300 line-clamp-2 mb-2">
                      {course.title}
                    </h3>

                    {/* Category & Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {course.category && (
                        <span className="text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md uppercase tracking-wider truncate max-w-[100px]">
                          {course.category.name}
                        </span>
                      )}
                      {course.tags?.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md truncate max-w-[80px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Footer: Price + Students */}
                    <div className="flex items-end justify-between pt-4 border-t border-gray-100 mt-2">
                      <div>
                        {hasDiscount ? (
                          <div className="flex flex-col">
                            <span className="text-gray-400 line-through text-[10px] font-semibold mb-0.5">
                              Rs. {course.price.toLocaleString()}
                            </span>
                            <span className="text-lg font-extrabold text-red-600 leading-none">
                              Rs. {course.discountedPrice!.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-extrabold text-gray-900 leading-none">
                            Rs. {course.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                        <Users className="w-3 h-3 text-gray-400" />
                        {course.enrollmentCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Hover Accent Line */}
                  <div className="h-1 bg-gradient-to-r from-red-500 via-red-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>
              );
            })}
          </div>
        )}

        {/* View All CTA */}
        {!loading && courses.length > 0 && (
          <div className="text-center mt-14">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Browse All Courses
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
