"use client";

import { useState, useEffect } from "react";
import {
  ReceiptText,
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  X,
  ExternalLink,
} from "lucide-react";

interface PendingEnrollment {
  _id: string;
  referenceNumber?: string;
  amountPaid?: number;
  receiptImageUrl?: string;
  createdAt: string;
  studentId?: { name?: string; phone?: string };
  courseId?: { title?: string; price?: number };
}

export default function ManagerEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<PendingEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Receipt viewer
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  // Reject modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEnrollmentId, setModalEnrollmentId] = useState("");
  const [modalNotes, setModalNotes] = useState("");

  useEffect(() => {
    fetchEnrollments();
  }, []);

  async function fetchEnrollments() {
    try {
      const res = await fetch("/api/manager/enrollments/pending");
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data);
      }
    } catch (error) {
      console.error("Failed to fetch enrollments:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(
    enrollmentId: string,
    action: string,
    notes = "",
  ) {
    setActionLoading(enrollmentId);
    try {
      const res = await fetch(
        `/api/manager/enrollments/${enrollmentId}/review`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, notes }),
        },
      );
      if (res.ok) {
        setEnrollments((prev) => prev.filter((e) => e._id !== enrollmentId));
        setModalOpen(false);
        setModalNotes("");
      }
    } catch (error) {
      console.error("Review failed:", error);
    } finally {
      setActionLoading(null);
    }
  }

  function openRejectModal(enrollmentId: string) {
    setModalEnrollmentId(enrollmentId);
    setModalNotes("");
    setModalOpen(true);
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <ReceiptText className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
            Enrollment Reviews
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">
            Review payment receipts and approve student enrollments.
          </p>
        </div>
        <span className="text-sm font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
          {enrollments.length} pending
        </span>
      </div>

      {/* Empty State */}
      {enrollments.length === 0 && (
        <div className="bg-white rounded-[2rem] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            No enrollments pending review
          </h3>
          <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto">
            All payment receipts have been reviewed. New submissions will appear
            here.
          </p>
        </div>
      )}

      {/* Enrollments Table */}
      {enrollments.length > 0 && (
        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 overflow-hidden">
          {/* Header */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_120px_1fr_100px_120px_80px_80px_150px] gap-3 px-6 py-4 bg-gray-50/80 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Student
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              WhatsApp
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Course
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Amount
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Reference
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Date
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Receipt
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
              Actions
            </span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment._id}
                className="grid grid-cols-1 lg:grid-cols-[1fr_120px_1fr_100px_120px_80px_80px_150px] gap-3 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors"
              >
                {/* Student */}
                <span className="text-sm font-bold text-gray-900">
                  {enrollment.studentId?.name || "Unknown"}
                </span>

                {/* WhatsApp */}
                <span className="text-xs text-gray-500 font-mono">
                  {enrollment.studentId?.phone || "N/A"}
                </span>

                {/* Course */}
                <span className="text-sm text-gray-700 font-medium truncate">
                  {enrollment.courseId?.title || "Unknown"}
                </span>

                {/* Amount */}
                <span className="text-sm font-bold text-gray-700">
                  Rs. {enrollment.amountPaid?.toLocaleString()}
                </span>

                {/* Reference */}
                <span className="text-xs text-gray-600 font-mono">
                  {enrollment.referenceNumber || "—"}
                </span>

                {/* Date */}
                <span className="text-xs text-gray-500">
                  {new Date(enrollment.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>

                {/* Receipt */}
                <div>
                  {enrollment.receiptImageUrl ? (
                    <button
                      onClick={() =>
                        setViewingReceipt(enrollment.receiptImageUrl!)
                      }
                      className="w-12 h-12 rounded-xl border border-gray-200 overflow-hidden hover:ring-2 hover:ring-red-500/30 transition-all cursor-pointer group relative"
                    >
                      <img
                        src={enrollment.receiptImageUrl}
                        alt="Receipt"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ExternalLink className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">None</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 lg:justify-end">
                  <button
                    onClick={() => handleReview(enrollment._id, "approved")}
                    disabled={actionLoading === enrollment._id}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {actionLoading === enrollment._id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3 h-3" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(enrollment._id)}
                    disabled={actionLoading === enrollment._id}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-3 h-3" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Receipt Full-Size Viewer */}
      {viewingReceipt && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 cursor-pointer"
          onClick={() => setViewingReceipt(null)}
        >
          <div
            className="relative max-w-3xl max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingReceipt(null)}
              className="absolute -top-3 -right-3 p-2 bg-white rounded-full shadow-lg text-gray-600 hover:text-red-500 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={viewingReceipt}
              alt="Receipt full view"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-[fade-in-up_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Reject Enrollment
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Provide a reason for rejection. The student will be notified via
              WhatsApp.
            </p>
            <textarea
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              placeholder="e.g. Receipt is unclear, amount doesn't match..."
              rows={3}
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
                  handleReview(modalEnrollmentId, "rejected", modalNotes)
                }
                disabled={
                  !modalNotes.trim() || actionLoading === modalEnrollmentId
                }
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
              >
                {actionLoading === modalEnrollmentId && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Reject Enrollment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
