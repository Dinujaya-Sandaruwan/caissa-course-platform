"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  paramName?: string;
  debounceMs?: number;
}

export default function SearchBar({
  placeholder = "Search courses...",
  paramName = "search",
  debounceMs = 400,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [value, setValue] = useState(searchParams.get(paramName) || "");

  // Sync from URL → state on mount / param changes
  useEffect(() => {
    setValue(searchParams.get(paramName) || "");
  }, [searchParams, paramName]);

  // Debounced URL update
  const updateUrl = useCallback(
    (newValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue.trim()) {
        params.set(paramName, newValue.trim());
      } else {
        params.delete(paramName);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, pathname, paramName],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParam = searchParams.get(paramName) || "";
      if (value.trim() !== currentParam) {
        updateUrl(value);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [value, debounceMs, updateUrl, searchParams, paramName]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateUrl(value);
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 text-sm font-medium transition-all focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
      />
    </form>
  );
}
