"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

export default function CourseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const level = searchParams.get("level") || "";
  const sort = searchParams.get("sort") || "newest";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      {/* Level Filter */}
      <div className="relative">
        <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <select
          value={level}
          onChange={(e) => updateParam("level", e.target.value)}
          className="appearance-none pl-10 pr-10 py-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 text-sm font-medium transition-all focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 cursor-pointer"
        >
          <option value="">All Levels</option>
          <option value="beginner">🌱 Beginner</option>
          <option value="intermediate">⚔️ Intermediate</option>
          <option value="advanced">👑 Advanced</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Sort Dropdown */}
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="appearance-none pl-4 pr-10 py-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 text-sm font-medium transition-all focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </>
  );
}
