"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Loader2,
  BookOpen,
  X,
  Search,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface CourseWithFee {
  _id: string;
  title: string;
  price: number;
  status: string;
  platformFee: number;
  coach?: { name?: string };
}

export default function PlatformFeesPage() {
  const [courses, setCourses] = useState<CourseWithFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCourse, setModalCourse] = useState<CourseWithFee | null>(null);
  const [newFee, setNewFee] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    setLoading(true);
    try {
      const res = await fetch("/api/manager/platform-fees");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  }

  const openEditModal = (course: CourseWithFee) => {
    setModalCourse(course);
    setNewFee((course.platformFee ?? 30).toString());
    setErrorMsg("");
    setModalOpen(true);
  };

  const closeEditModal = () => {
    setModalOpen(false);
    setModalCourse(null);
  };

  const handleSaveFee = async () => {
    if (!modalCourse) return;

    const feeValue = Number(newFee);
    if (isNaN(feeValue) || feeValue < 5 || feeValue > 100) {
      setErrorMsg("Please enter a valid percentage between 5 and 100.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/manager/platform-fees/${modalCourse._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformFee: feeValue }),
      });

      if (res.ok) {
        // Update local state
        setCourses((prev) =>
          prev.map((c) =>
            c._id === modalCourse._id ? { ...c, platformFee: feeValue } : c,
          ),
        );
        closeEditModal();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to update fee.");
      }
    } catch (error) {
      console.error("Error updating fee:", error);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 relative z-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
            Platform Fees
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">
            Manage the percentage of earnings the platform takes from each
            course.
          </p>
        </div>
      </div>

      {/* Top Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-gray-900/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search courses by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500 transition-shadow sm:text-sm font-medium"
          />
        </div>
        <div className="text-sm font-medium text-gray-500 bg-gray-50 px-4 py-2 rounded-xl">
          Showing {filteredCourses.length}{" "}
          {filteredCourses.length === 1 ? "course" : "courses"}
        </div>
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-[2rem] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No courses found</h3>
          <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto">
            {searchQuery
              ? `No courses matching "${searchQuery}"`
              : "There are currently no active courses on the platform."}
          </p>
        </div>
      )}

      {/* Courses Table */}
      {filteredCourses.length > 0 && (
        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-[1fr_150px_100px_150px_120px] gap-4 px-8 py-4 bg-gray-50/80 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Course
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Coach
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Price
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Platform Fee
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
              Action
            </span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="grid grid-cols-1 md:grid-cols-[1fr_150px_100px_150px_120px] gap-3 md:gap-4 px-8 py-5 items-center hover:bg-gray-50/50 transition-colors"
              >
                {/* Course Title */}
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {course.title}
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                      course.status === "published"
                        ? "bg-green-100 text-green-800"
                        : course.status === "approved"
                          ? "bg-blue-100 text-blue-800"
                          : course.status === "pending_review"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {course.status.replace("_", " ")}
                  </span>
                </div>

                {/* Coach */}
                <span className="text-sm text-gray-600 font-medium truncate">
                  {course.coach?.name || "Unknown"}
                </span>

                {/* Price */}
                <span className="text-sm font-bold text-gray-700">
                  Rs. {course.price?.toLocaleString()}
                </span>

                {/* Platform Fee */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-700 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                    {course.platformFee ?? 30}%
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => openEditModal(course)}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
                  >
                    Edit Fee
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Fee Modal */}
      {modalOpen && modalCourse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-[fade-in-up_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Edit Platform Fee
              </h3>
              <button
                onClick={closeEditModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                Target Course
              </p>
              <p className="text-sm font-bold text-gray-900">
                {modalCourse.title}
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="feeInput"
                className="block text-sm font-bold text-gray-700"
              >
                Fee Percentage (%)
              </label>
              <div className="relative">
                <input
                  id="feeInput"
                  type="number"
                  min="0"
                  max="100"
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 text-lg font-bold transition-all focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  placeholder="e.g. 15"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-bold text-lg">%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-2">
                This is the percentage of the course price that the platform
                will retain upon enrollment.
              </p>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={closeEditModal}
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFee}
                disabled={isSaving || newFee === ""}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 rounded-xl transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
