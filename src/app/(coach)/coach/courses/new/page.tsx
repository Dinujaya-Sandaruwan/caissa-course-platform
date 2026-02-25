"use client";

import { useState } from "react";
import {
  ArrowRight,
  X,
  Sparkles,
  BookOpen,
  DollarSign,
  BarChart3,
  Tag,
  FileText,
} from "lucide-react";

type CourseLevel = "beginner" | "intermediate" | "advanced";

interface CourseMetadata {
  title: string;
  description: string;
  price: string;
  level: CourseLevel;
  tags: string[];
}

export default function CreateCoursePage() {
  const [step, setStep] = useState(1);
  const [metadata, setMetadata] = useState<CourseMetadata>({
    title: "",
    description: "",
    price: "",
    level: "beginner",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Tag Management ────────────────────────────────────
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !metadata.tags.includes(tag) && metadata.tags.length < 10) {
        setMetadata((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // ─── Form Validation ──────────────────────────────────
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!metadata.title.trim()) {
      newErrors.title = "Course title is required";
    } else if (metadata.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (!metadata.description.trim()) {
      newErrors.description = "Description is required";
    } else if (metadata.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (!metadata.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(metadata.price)) || Number(metadata.price) < 0) {
      newErrors.price = "Price must be a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  // ─── Level Config ─────────────────────────────────────
  const levels: {
    value: CourseLevel;
    label: string;
    description: string;
    icon: string;
  }[] = [
    {
      value: "beginner",
      label: "Beginner",
      description: "For new players learning the fundamentals",
      icon: "🌱",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "For club-level players looking to improve",
      icon: "⚔️",
    },
    {
      value: "advanced",
      label: "Advanced",
      description: "For strong players pursuing mastery",
      icon: "👑",
    },
  ];

  // ─── Render ───────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-white rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-outfit)]">
            Step 2 — Chapters &amp; Lessons
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            This step will be built in Step 63. Click Back to return.
          </p>
          <button
            onClick={() => setStep(1)}
            className="mt-6 px-6 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            ← Back to Course Details
          </button>
        </div>
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
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-red-500 tracking-widest uppercase bg-red-50 px-3 py-1 rounded-full">
              New Course
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
            Create a Course
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">
            Fill in the details below to start building your new course.
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3">
        {[
          { num: 1, label: "Course Details" },
          { num: 2, label: "Chapters & Lessons" },
          { num: 3, label: "Review & Submit" },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step === s.num
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/25 scale-110"
                    : step > s.num
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span
                className={`text-sm font-semibold hidden sm:inline ${
                  step === s.num
                    ? "text-gray-900"
                    : step > s.num
                      ? "text-red-500"
                      : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`w-8 sm:w-16 h-[3px] rounded-full transition-colors ${
                  step > s.num ? "bg-red-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="space-y-8">
          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
              <BookOpen className="w-4 h-4 text-red-500" />
              Course Title
            </label>
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => {
                setMetadata({ ...metadata, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: "" });
              }}
              placeholder="e.g., Mastering the Sicilian Defense"
              className={`w-full px-5 py-4 rounded-2xl border-2 text-gray-900 placeholder-gray-400 text-base font-medium transition-all duration-200 focus:outline-none ${
                errors.title
                  ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-gray-200 bg-gray-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:bg-white"
              }`}
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-500" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
              <FileText className="w-4 h-4 text-red-500" />
              Description
            </label>
            <textarea
              value={metadata.description}
              onChange={(e) => {
                setMetadata({ ...metadata, description: e.target.value });
                if (errors.description)
                  setErrors({ ...errors, description: "" });
              }}
              placeholder="Describe what students will learn, the structure of the course, and any prerequisites..."
              rows={5}
              className={`w-full px-5 py-4 rounded-2xl border-2 text-gray-900 placeholder-gray-400 text-base font-medium transition-all duration-200 focus:outline-none resize-none ${
                errors.description
                  ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-gray-200 bg-gray-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:bg-white"
              }`}
            />
            <div className="flex justify-between mt-2">
              {errors.description ? (
                <p className="text-sm text-red-500 font-medium flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  {errors.description}
                </p>
              ) : (
                <span />
              )}
              <span className="text-xs text-gray-400 font-medium">
                {metadata.description.length} characters
              </span>
            </div>
          </div>

          {/* Price + Level Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                <DollarSign className="w-4 h-4 text-red-500" />
                Price (LKR)
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base">
                  Rs.
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={metadata.price}
                  onChange={(e) => {
                    setMetadata({ ...metadata, price: e.target.value });
                    if (errors.price) setErrors({ ...errors, price: "" });
                  }}
                  placeholder="2500"
                  className={`w-full pl-14 pr-5 py-4 rounded-2xl border-2 text-gray-900 placeholder-gray-400 text-base font-medium transition-all duration-200 focus:outline-none ${
                    errors.price
                      ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      : "border-gray-200 bg-gray-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:bg-white"
                  }`}
                />
              </div>
              {errors.price && (
                <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  {errors.price}
                </p>
              )}
            </div>

            {/* Level */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                <BarChart3 className="w-4 h-4 text-red-500" />
                Difficulty Level
              </label>
              <div className="space-y-2">
                {levels.map((lvl) => (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() =>
                      setMetadata({ ...metadata, level: lvl.value })
                    }
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
                      metadata.level === lvl.value
                        ? "border-red-500 bg-red-50/70 shadow-sm"
                        : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-lg">{lvl.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold ${
                          metadata.level === lvl.value
                            ? "text-red-600"
                            : "text-gray-700"
                        }`}
                      >
                        {lvl.label}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {lvl.description}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        metadata.level === lvl.value
                          ? "border-red-500 bg-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      {metadata.level === lvl.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
              <Tag className="w-4 h-4 text-red-500" />
              Tags
              <span className="text-xs text-gray-400 font-normal ml-1">
                (press Enter to add, max 10)
              </span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 text-red-600 text-sm font-semibold border border-red-100 group hover:bg-red-100 transition-colors"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="e.g., opening, defense, strategy..."
              className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 text-base font-medium transition-all duration-200 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:bg-white"
            />
          </div>
        </div>

        {/* Action */}
        <div className="mt-10 flex justify-end">
          <button
            onClick={handleNextStep}
            className="group flex items-center gap-2.5 px-8 py-4 bg-red-600 text-white text-base font-bold rounded-2xl hover:bg-red-700 shadow-xl shadow-red-600/20 hover:shadow-red-600/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            Next: Add Chapters
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
