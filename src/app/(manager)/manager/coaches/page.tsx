"use client";

import { useState, useEffect } from "react";
import { Check, X, ExternalLink, RefreshCw } from "lucide-react";

interface PendingCoach {
  _id: string;
  userId: {
    _id: string;
    name: string;
    whatsappNumber: string;
  };
  nationalId: string;
  dob: string;
  fideId?: string;
  fideRating?: number;
  about: string;
  createdAt: string;
}

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<PendingCoach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Rejection modal state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const fetchPendingCoaches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/manager/coaches/pending");
      if (!res.ok) throw new Error("Failed to fetch pending applications");
      const data = await res.json();
      setCoaches(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCoaches();
  }, []);

  const handleVerify = async (
    id: string,
    action: "approved" | "rejected",
    notes?: string,
  ) => {
    setVerifyingId(id);
    try {
      const res = await fetch(`/api/manager/coaches/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Remove from list
      setCoaches((curr) => curr.filter((c) => c._id !== id));
      setRejectingId(null);
      setRejectNotes("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to verify coach");
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
            Pending Coach Applications
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Review and approve new coach registrations.
          </p>
        </div>
        <button
          onClick={fetchPendingCoaches}
          className="group flex items-center gap-2.5 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-full transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 ring-1 ring-black/5 hover:-translate-y-0.5"
        >
          <RefreshCw className="w-5 h-5 transition-transform group-hover:rotate-180" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-red-100 rounded-full mb-6" />
          <p className="text-gray-500 font-medium">Loading applications...</p>
        </div>
      ) : coaches.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 transition-all">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Check className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mb-2 font-[family-name:var(--font-outfit)] tracking-tight">
            All caught up!
          </h3>
          <p className="text-gray-500 text-lg">
            There are no pending coach applications to review right now.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {coaches.map((coach) => (
            <div
              key={coach._id}
              className="group bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(220,38,38,0.08)]"
            >
              {/* Header area */}
              <div className="border-b border-gray-100 px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-4">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold text-2xl shadow-sm group-hover:bg-red-600 group-hover:text-white transition-colors">
                    {coach.userId.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                      {coach.userId.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 mt-0.5">
                      Applied {new Date(coach.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                  <button
                    disabled={verifyingId === coach._id}
                    onClick={() => setRejectingId(coach._id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                    Reject
                  </button>
                  <button
                    disabled={verifyingId === coach._id}
                    onClick={() => handleVerify(coach._id, "approved")}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all disabled:opacity-50 shadow-[0_8px_20px_rgba(5,150,105,0.25)] hover:shadow-[0_12px_25px_rgba(5,150,105,0.35)] hover:-translate-y-0.5"
                  >
                    <Check className="w-5 h-5" />
                    Approve
                  </button>
                </div>
              </div>

              {/* Details grid */}
              <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Personal Details
                    </h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <dt className="text-sm text-gray-500">WhatsApp</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          +{coach.userId.whatsappNumber}
                        </dd>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <dt className="text-sm text-gray-500">National ID</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {coach.nationalId}
                        </dd>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <dt className="text-sm text-gray-500">Date of Birth</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {new Date(coach.dob).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">
                      Chess Credentials
                    </h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <dt className="text-sm text-gray-500">FIDE ID</dt>
                        <dd className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {coach.fideId ? (
                            <>
                              {coach.fideId}
                              <a
                                href={`https://ratings.fide.com/profile/${coach.fideId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500 hover:text-blue-600"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </>
                          ) : (
                            <span className="text-gray-400">None provided</span>
                          )}
                        </dd>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <dt className="text-sm text-gray-500">FIDE Rating</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {coach.fideRating || (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    About / Experience
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed border border-gray-100 min-h-[150px] whitespace-pre-wrap">
                    {coach.about}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-8 py-6 flex justify-between items-center">
              <h3 className="text-2xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
                Reject Application
              </h3>
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectNotes("");
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="px-8 pb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Reason for Rejection (Required)
              </label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Please explain why the application is being rejected. This will be visible to the coach."
                className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium transition-all resize-none"
              />
              <p className="text-xs font-semibold text-gray-500 mt-3">
                A notification will be sent to their WhatsApp.
              </p>
            </div>

            <div className="px-8 py-6 flex gap-3">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectNotes("");
                }}
                className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!rejectNotes.trim() || verifyingId === rejectingId}
                onClick={() =>
                  handleVerify(rejectingId, "rejected", rejectNotes)
                }
                className="flex-1 px-4 py-3 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-500 disabled:opacity-50 shadow-[0_4px_14px_rgba(220,38,38,0.25)] transition-all transform hover:-translate-y-0.5"
              >
                {verifyingId === rejectingId
                  ? "Processing..."
                  : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
