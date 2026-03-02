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
  PauseCircle,
  Trash2,
  Search,
} from "lucide-react";

interface PendingEnrollment {
  _id: string;
  referenceNumber?: string;
  amountPaid?: number;
  receiptImageUrl?: string;
  createdAt: string;
  studentId?: { name?: string; phone?: string };
  courseId?: { title?: string; price?: number };
  paymentStatus?: "pending_review" | "approved" | "rejected" | "on_hold";
  reviewNotes?: string;
}

export default function ManagerEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<PendingEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [searchTerm, setSearchTerm] = useState("");

  // Receipt viewer
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEnrollmentId, setModalEnrollmentId] = useState("");
  const [modalType, setModalType] = useState<"rejected" | "on_hold" | "revoke">(
    "rejected",
  );
  const [modalNotes, setModalNotes] = useState("");

  useEffect(() => {
    fetchEnrollments(activeTab);
  }, [activeTab]);

  async function fetchEnrollments(tab: "pending" | "all") {
    setLoading(true);
    try {
      const url =
        tab === "pending"
          ? "/api/manager/enrollments/pending"
          : "/api/manager/enrollments?filter=all";

      const res = await fetch(url);
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
      if (action === "revoke") {
        const res = await fetch(
          `/api/manager/enrollments/${enrollmentId}/revoke`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notes }),
          },
        );
        if (res.ok) {
          setEnrollments((prev) => prev.filter((e) => e._id !== enrollmentId));
          setModalOpen(false);
          setModalNotes("");
        }
      } else {
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
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setActionLoading(null);
    }
  }

  function openModal(
    enrollmentId: string,
    type: "rejected" | "on_hold" | "revoke",
  ) {
    setModalEnrollmentId(enrollmentId);
    setModalType(type);
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

  const filteredEnrollments = enrollments.filter((e) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const studentName = e.studentId?.name?.toLowerCase() || "";
    const courseTitle = e.courseId?.title?.toLowerCase() || "";
    const phone = e.studentId?.phone?.toLowerCase() || "";
    const ref = e.referenceNumber?.toLowerCase() || "";

    return (
      studentName.includes(term) ||
      courseTitle.includes(term) ||
      phone.includes(term) ||
      ref.includes(term)
    );
  });

  return (
    <div className="space-y-6 relative z-10">
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
          {filteredEnrollments.length} records
        </span>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-gray-100/80 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "pending"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "all"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            }`}
          >
            All Enrollments
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, course, phone, or reference..."
            className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-2xl shadow-sm ring-1 ring-gray-900/5 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
          />
        </div>
      </div>

      {/* Empty State */}
      {!loading && filteredEnrollments.length === 0 && (
        <div className="bg-white rounded-[2rem] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {enrollments.length > 0
              ? "No matches found"
              : activeTab === "pending"
                ? "No enrollments pending review"
                : "No enrollments found"}
          </h3>
          <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto">
            {enrollments.length > 0
              ? "Try tweaking your search term to find what you're looking for."
              : activeTab === "pending"
                ? "All payment receipts have been reviewed. New submissions will appear here."
                : "There are currently no recorded enrollments in the database."}
          </p>
        </div>
      )}

      {/* Enrollments Grid */}
      {!loading && filteredEnrollments.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredEnrollments.map((enrollment) => (
            <div
              key={enrollment._id}
              className="bg-white rounded-[2rem] p-6 shadow-sm ring-1 ring-gray-900/5 hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 flex flex-col gap-6"
            >
              {/* Top Section */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {enrollment.studentId?.name || "Unknown"}
                  </h3>
                  <span className="text-sm font-medium text-gray-500 font-mono">
                    {enrollment.studentId?.phone || "N/A"}
                  </span>
                </div>
                {/* Status Badge */}
                {enrollment.paymentStatus === "on_hold" && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200/50">
                    ON HOLD
                  </span>
                )}
                {enrollment.paymentStatus === "pending_review" && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200/50">
                    PENDING
                  </span>
                )}
                {enrollment.paymentStatus === "approved" && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200/50">
                    APPROVED
                  </span>
                )}
                {enrollment.paymentStatus === "rejected" && (
                  <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200/50">
                    REJECTED
                  </span>
                )}
              </div>

              {/* Course Details Grid */}
              <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-gray-50/80 border border-gray-100/50">
                <div className="col-span-3 pb-3 border-b border-gray-200/50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Course
                  </p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {enrollment.courseId?.title || "Unknown"}
                  </p>
                </div>
                <div className="col-span-1 pt-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Amount
                  </p>
                  <p className="text-sm font-bold text-emerald-600">
                    Rs. {enrollment.amountPaid?.toLocaleString()}
                  </p>
                </div>
                <div className="col-span-1 pt-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Date
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(enrollment.createdAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" },
                    )}
                  </p>
                </div>
                <div className="col-span-1 pt-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Reference
                  </p>
                  <p className="text-sm font-mono text-gray-600 truncate">
                    {enrollment.referenceNumber || "—"}
                  </p>
                </div>
              </div>

              {/* Bottom Actions Area */}
              <div className="flex items-center justify-between mt-auto pt-2">
                {/* Receipt */}
                <div className="flex items-center gap-4">
                  {enrollment.receiptImageUrl ? (
                    <button
                      onClick={() =>
                        setViewingReceipt(enrollment.receiptImageUrl!)
                      }
                      className="w-14 h-14 rounded-2xl border-[3px] border-white ring-1 ring-gray-200 overflow-hidden hover:ring-rose-300 transition-all cursor-pointer group relative shadow-md"
                    >
                      <img
                        src={enrollment.receiptImageUrl}
                        alt="Receipt"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100" />
                      </div>
                    </button>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        None
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Payment Receipt
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      View Document
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                  {enrollment.paymentStatus === "approved" ||
                  enrollment.paymentStatus === "rejected" ? (
                    <button
                      onClick={() => openModal(enrollment._id, "revoke")}
                      disabled={actionLoading === enrollment._id}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Revoke
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleReview(enrollment._id, "approved")}
                        disabled={actionLoading === enrollment._id}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 rounded-xl transition-all disabled:opacity-50"
                      >
                        {actionLoading === enrollment._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => openModal(enrollment._id, "on_hold")}
                        disabled={actionLoading === enrollment._id}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors disabled:opacity-50"
                        title="Place on Hold"
                      >
                        <PauseCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal(enrollment._id, "rejected")}
                        disabled={actionLoading === enrollment._id}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50"
                        title="Reject Enrollment"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
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

      {/* Action Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-[fade-in-up_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {modalType === "on_hold" && "Hold Enrollment"}
                {modalType === "rejected" && "Reject Enrollment"}
                {modalType === "revoke" && "Revoke Access"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Provide a reason for this decision. The student will be notified
              via WhatsApp.
            </p>
            <textarea
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              placeholder={
                modalType === "on_hold"
                  ? "e.g. Please provide a clearer screenshot..."
                  : modalType === "revoke"
                    ? "e.g. Violation of terms..."
                    : "e.g. Receipt is unclear, amount doesn't match..."
              }
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
                  handleReview(modalEnrollmentId, modalType, modalNotes)
                }
                disabled={
                  (!modalNotes.trim() && modalType !== "revoke") ||
                  actionLoading === modalEnrollmentId
                }
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all disabled:opacity-50 ${
                  modalType === "on_hold"
                    ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                    : "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                }`}
              >
                {actionLoading === modalEnrollmentId && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {modalType === "on_hold" && "Place on Hold"}
                {modalType === "rejected" && "Reject Enrollment"}
                {modalType === "revoke" && "Confirm Revoke"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
