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
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-outfit)]">
            Pending Coach Applications
          </h1>
          <p className="text-gray-500 mt-1">
            Review and approve new coach registrations.
          </p>
        </div>
        <button
          onClick={fetchPendingCoaches}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mb-4" />
          <p className="text-gray-500">Loading applications...</p>
        </div>
      ) : coaches.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            All caught up!
          </h3>
          <p className="text-gray-500">
            There are no pending coach applications to review right now.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {coaches.map((coach) => (
            <div
              key={coach._id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
            >
              {/* Header area */}
              <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl">
                    {coach.userId.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {coach.userId.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Applied {new Date(coach.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={verifyingId === coach._id}
                    onClick={() => setRejectingId(coach._id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    disabled={verifyingId === coach._id}
                    onClick={() => handleVerify(coach._id, "approved")}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    Approve Request
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-[fade-in-up_0.2s_ease-out]">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Reject Application
              </h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection (Required)
              </label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Please explain why the application is being rejected. This will be visible to the coach."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                A notification will be sent to their WhatsApp.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectNotes("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={!rejectNotes.trim() || verifyingId === rejectingId}
                onClick={() =>
                  handleVerify(rejectingId, "rejected", rejectNotes)
                }
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {verifyingId === rejectingId
                  ? "Rejecting..."
                  : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
