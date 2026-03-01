"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Video,
  CheckCircle,
  XCircle,
  PauseCircle,
  Loader2,
  BookOpen,
  X,
  Trash2,
  RotateCcw,
} from "lucide-react";

interface PendingCourse {
  _id: string;
  title: string;
  price: number;
  level: string;
  createdAt: string;
  coach?: { name?: string; phone?: string };
}

interface TrashedCourse {
  _id: string;
  title: string;
  price: number;
  level: string;
  trashedAt: string;
  coach?: { name?: string; phone?: string };
}

const levelEmoji: Record<string, string> = {
  beginner: "🌱",
  intermediate: "⚔️",
  advanced: "👑",
};

export default function ManagerCoursesPage() {
  const [courses, setCourses] = useState<PendingCourse[]>([]);
  const [trashedCourses, setTrashedCourses] = useState<TrashedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"rejected" | "held">(
    "rejected",
  );
  const [modalCourseId, setModalCourseId] = useState("");
  const [modalNotes, setModalNotes] = useState("");
  const [modalCourseName, setModalCourseName] = useState("");

  // Trash action state
  const [trashModalOpen, setTrashModalOpen] = useState(false);
  const [trashAction, setTrashAction] = useState<"delete" | "reactivate">(
    "delete",
  );
  const [trashTargetId, setTrashTargetId] = useState("");
  const [trashTargetTitle, setTrashTargetTitle] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchTrashedCourses();
  }, []);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/manager/courses/pending");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Failed to fetch pending courses:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTrashedCourses() {
    try {
      const res = await fetch("/api/manager/courses/trashed");
      if (res.ok) {
        const data = await res.json();
        setTrashedCourses(data);
      }
    } catch (error) {
      console.error("Failed to fetch trashed courses:", error);
    }
  }

  async function handleReview(courseId: string, action: string, notes = "") {
    setActionLoading(courseId);
    try {
      const res = await fetch(`/api/manager/courses/${courseId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });

      if (res.ok) {
        // Remove from list on approve/reject, keep on hold
        if (action === "approved" || action === "rejected") {
          setCourses((prev) => prev.filter((c) => c._id !== courseId));
        }
        setModalOpen(false);
        setModalNotes("");
      }
    } catch (error) {
      console.error("Review action failed:", error);
    } finally {
      setActionLoading(null);
    }
  }

  function openModal(
    courseId: string,
    courseName: string,
    action: "rejected" | "held",
  ) {
    setModalCourseId(courseId);
    setModalCourseName(courseName);
    setModalAction(action);
    setModalNotes("");
    setModalOpen(true);
  }

  function openTrashModal(
    courseId: string,
    courseTitle: string,
    action: "delete" | "reactivate",
  ) {
    setTrashTargetId(courseId);
    setTrashTargetTitle(courseTitle);
    setTrashAction(action);
    setTrashModalOpen(true);
  }

  async function handleTrashAction() {
    setActionLoading(trashTargetId);
    try {
      if (trashAction === "delete") {
        const res = await fetch(`/api/manager/courses/${trashTargetId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setTrashedCourses((prev) =>
            prev.filter((c) => c._id !== trashTargetId),
          );
        }
      } else {
        const res = await fetch(`/api/manager/courses/${trashTargetId}`, {
          method: "PATCH",
        });
        if (res.ok) {
          setTrashedCourses((prev) =>
            prev.filter((c) => c._id !== trashTargetId),
          );
        }
      }
      setTrashModalOpen(false);
    } catch (error) {
      console.error("Trash action failed:", error);
    } finally {
      setActionLoading(null);
    }
  }

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
              <Video className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
            Course Reviews
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">
            Review submitted courses and approve, reject, or hold them.
          </p>
        </div>
        <span className="text-sm font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
          {courses.length} pending
        </span>
      </div>

      {/* Empty State */}
      {courses.length === 0 && (
        <div className="bg-white rounded-[2rem] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            No courses pending review
          </h3>
          <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto">
            All submitted courses have been reviewed. New submissions will
            appear here.
          </p>
        </div>
      )}

      {/* Courses Table */}
      {courses.length > 0 && (
        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-[1fr_150px_100px_100px_120px_200px] gap-4 px-8 py-4 bg-gray-50/80 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Course
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Coach
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Level
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Price
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Submitted
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
              Actions
            </span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100">
            {courses.map((course) => (
              <div
                key={course._id}
                className="grid grid-cols-1 md:grid-cols-[1fr_150px_100px_100px_120px_200px] gap-3 md:gap-4 px-8 py-5 items-center hover:bg-gray-50/50 transition-colors"
              >
                {/* Course Title */}
                <div>
                  <Link
                    href={`/manager/courses/${course._id}`}
                    className="text-sm font-bold text-gray-900 hover:text-red-600 transition-colors"
                  >
                    {course.title}
                  </Link>
                </div>

                {/* Coach */}
                <span className="text-sm text-gray-600 font-medium">
                  {course.coach?.name || "Unknown"}
                </span>

                {/* Level */}
                <span className="text-sm text-gray-600 font-medium capitalize">
                  {levelEmoji[course.level] || "📚"} {course.level}
                </span>

                {/* Price */}
                <span className="text-sm font-bold text-gray-700">
                  Rs. {course.price?.toLocaleString()}
                </span>

                {/* Submitted Date */}
                <span className="text-xs text-gray-500 font-medium">
                  {new Date(course.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2 md:justify-end">
                  <button
                    onClick={() => handleReview(course._id, "approved")}
                    disabled={actionLoading === course._id}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {actionLoading === course._id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3 h-3" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      openModal(course._id, course.title, "rejected")
                    }
                    disabled={actionLoading === course._id}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-3 h-3" />
                    Reject
                  </button>
                  <button
                    onClick={() => openModal(course._id, course.title, "held")}
                    disabled={actionLoading === course._id}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <PauseCircle className="w-3 h-3" />
                    Hold
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes Modal (Reject / Hold) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-[fade-in-up_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {modalAction === "rejected" ? "Reject Course" : "Hold Course"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              {modalAction === "rejected"
                ? `Provide feedback for the coach explaining why "${modalCourseName}" is being rejected.`
                : `Add notes about why "${modalCourseName}" is being held for further consideration.`}
            </p>

            <textarea
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              placeholder="Enter your notes here..."
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 text-sm font-medium transition-all focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 resize-none"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleReview(modalCourseId, modalAction, modalNotes)
                }
                disabled={!modalNotes.trim() || actionLoading === modalCourseId}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50 ${
                  modalAction === "rejected"
                    ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
                    : "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                }`}
              >
                {actionLoading === modalCourseId && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {modalAction === "rejected" ? "Reject Course" : "Hold Course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trashed Courses Section */}
      {trashedCourses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Trashed Courses</h2>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
              {trashedCourses.length}
            </span>
          </div>

          <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 overflow-hidden">
            <div className="hidden md:grid md:grid-cols-[1fr_150px_100px_120px_220px] gap-4 px-8 py-4 bg-gray-50/80 border-b border-gray-100">
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
                Trashed
              </span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                Actions
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {trashedCourses.map((course) => (
                <div
                  key={course._id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_150px_100px_120px_220px] gap-3 md:gap-4 px-8 py-5 items-center hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-sm font-bold text-gray-900">
                    {course.title}
                  </span>
                  <span className="text-sm text-gray-600 font-medium">
                    {course.coach?.name || "Unknown"}
                  </span>
                  <span className="text-sm font-bold text-gray-700">
                    Rs. {course.price?.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {course.trashedAt
                      ? new Date(course.trashedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                  <div className="flex items-center gap-2 md:justify-end">
                    <button
                      onClick={() =>
                        openTrashModal(course._id, course.title, "reactivate")
                      }
                      disabled={actionLoading === course._id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reactivate
                    </button>
                    <button
                      onClick={() =>
                        openTrashModal(course._id, course.title, "delete")
                      }
                      disabled={actionLoading === course._id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete Forever
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trash Action Modal */}
      {trashModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-[fade-in-up_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {trashAction === "delete"
                  ? "Permanently Delete?"
                  : "Reactivate Course?"}
              </h3>
              <button
                onClick={() => setTrashModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              {trashAction === "delete"
                ? `This will permanently delete "${trashTargetTitle}" and all its chapters, lessons, and materials. This action cannot be undone.`
                : `"${trashTargetTitle}" will be restored as a draft course and returned to the coach.`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setTrashModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTrashAction}
                disabled={actionLoading === trashTargetId}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50 ${
                  trashAction === "delete"
                    ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
                    : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                }`}
              >
                {actionLoading === trashTargetId && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {trashAction === "delete" ? "Delete Forever" : "Reactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
