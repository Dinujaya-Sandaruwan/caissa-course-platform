"use client";

import { useState, useEffect } from "react";
import {
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Medal,
  Trophy,
  Star,
  Phone,
  Calendar,
  Mail,
  FileText,
  MapPin,
  User,
  Crown,
  PauseCircle,
  PlayCircle,
} from "lucide-react";

interface PendingCoach {
  _id: string;
  userId: {
    _id: string;
    name: string;
    whatsappNumber: string;
    email?: string;
    profilePhotoThumbnail?: string;
  };
  dateOfBirth: string | Date;
  fideId?: string;
  fideRating?: number;
  cvUrl?: string;
  bio?: string;
  address?: string;
  specializations?: string[];
  coachAchievements?: string[];
  playerAchievements?: string[];
  createdAt: string;
}

interface ApprovedCoach {
  _id: string;
  userId: {
    _id: string;
    name: string;
    whatsappNumber: string;
    email?: string;
    profilePhotoThumbnail?: string;
  };
  fideRating?: number;
  verificationStatus: "approved" | "paused";
  verifiedAt?: string;
}

type Tab = "pending" | "approved";

export default function CoachesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pending");

  // Pending state
  const [coaches, setCoaches] = useState<PendingCoach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Rejection modal state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  // Approval modal state
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Image preview modal state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Approved coaches state
  const [approvedCoaches, setApprovedCoaches] = useState<ApprovedCoach[]>([]);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [approvedError, setApprovedError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Pause confirmation modal state
  const [pauseConfirmId, setPauseConfirmId] = useState<string | null>(null);
  const [pauseConfirmAction, setPauseConfirmAction] = useState<
    "pause" | "unpause"
  >("pause");

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

  const fetchApprovedCoaches = async () => {
    setApprovedLoading(true);
    try {
      const res = await fetch("/api/manager/coaches/approved");
      if (!res.ok) throw new Error("Failed to fetch approved coaches");
      const data = await res.json();
      setApprovedCoaches(data);
    } catch (err: unknown) {
      setApprovedError(
        err instanceof Error ? err.message : "An error occurred",
      );
    } finally {
      setApprovedLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCoaches();
  }, []);

  useEffect(() => {
    if (activeTab === "approved" && approvedCoaches.length === 0) {
      fetchApprovedCoaches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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
      setApprovingId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to verify coach");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleTogglePause = async (id: string, action: "pause" | "unpause") => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/manager/coaches/${id}/pause`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update local state
      setApprovedCoaches((curr) =>
        curr.map((c) =>
          c._id === id
            ? {
                ...c,
                verificationStatus: action === "pause" ? "paused" : "approved",
              }
            : c,
        ),
      );
      setPauseConfirmId(null);
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Failed to update coach status",
      );
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-8 relative z-10">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-[2.5rem] p-8 md:p-12 mb-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/10 text-white/90 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 backdrop-blur-md">
                Caissa Course Platform
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-white font-[family-name:var(--font-outfit)] tracking-tight mb-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 border border-white/10">
                <Crown className="w-7 h-7 text-white" />
              </div>
              {activeTab === "pending"
                ? "Pending Applications"
                : "Approved Coaches"}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
              {activeTab === "pending"
                ? "Review credentials and approve new coaches for the platform."
                : "Manage approved coaches. Pause or unpause access as needed."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
              {activeTab === "pending"
                ? `${coaches.length} pending`
                : `${approvedCoaches.length} coaches`}
            </div>
            <button
              onClick={
                activeTab === "pending"
                  ? fetchPendingCoaches
                  : fetchApprovedCoaches
              }
              className="group flex items-center gap-2.5 px-6 py-3 bg-white text-gray-900 border border-transparent text-sm font-bold rounded-full transition-all duration-300 shadow-lg cursor-pointer hover:scale-105 active:scale-95 hover:bg-gray-100"
            >
              <RefreshCw className="w-5 h-5 transition-transform group-hover:rotate-180" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
            activeTab === "pending"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Pending Applications
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
            activeTab === "approved"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Approved Coaches
        </button>
      </div>

      {error && activeTab === "pending" && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {approvedError && activeTab === "approved" && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {approvedError}
        </div>
      )}

      {/* ==================== PENDING TAB ==================== */}
      {activeTab === "pending" && (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-red-100 rounded-full mb-6" />
              <p className="text-gray-500 font-medium">
                Loading applications...
              </p>
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
            <div className="space-y-10">
              {coaches.map((coach, index) => (
                <div
                  key={coach._id}
                  className="group relative bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_rgba(220,38,38,0.08)]"
                >
                  {/* Top accent bar */}
                  <div className="h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-400" />

                  {/* Header area */}
                  <div className="px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                      {/* Applicant number badge */}
                      <div className="hidden sm:flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Profile picture */}
                      <div
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-red-500/20 overflow-hidden cursor-pointer ring-2 ring-white transition-all hover:scale-105"
                        onClick={async () => {
                          if (!coach.userId.profilePhotoThumbnail) return;
                          setPreviewImage("loading");
                          setPreviewLoading(true);
                          try {
                            const res = await fetch(
                              `/api/manager/coaches/${coach._id}/photo`,
                            );
                            if (!res.ok)
                              throw new Error("Failed to fetch photo");
                            const data = await res.json();
                            setPreviewImage(
                              data.url || coach.userId.profilePhotoThumbnail,
                            );
                          } catch (err) {
                            console.error(err);
                            setPreviewImage(coach.userId.profilePhotoThumbnail);
                          } finally {
                            setPreviewLoading(false);
                          }
                        }}
                      >
                        {coach.userId.profilePhotoThumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={coach.userId.profilePhotoThumbnail}
                            alt={coach.userId.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          coach.userId.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight font-[family-name:var(--font-outfit)]">
                          {coach.userId.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm font-medium text-gray-400">
                            Applied{" "}
                            {new Date(coach.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                          {coach.fideRating && (
                            <span className="text-xs font-extrabold bg-gradient-to-r from-red-500 to-rose-600 text-white px-2.5 py-0.5 rounded-lg shadow-sm">
                              {coach.fideRating} ELO
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                      <button
                        disabled={verifyingId === coach._id}
                        onClick={() => setRejectingId(coach._id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        disabled={verifyingId === coach._id}
                        onClick={() => setApprovingId(coach._id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-xl transition-all disabled:opacity-50 shadow-[0_8px_20px_rgba(5,150,105,0.25)] hover:shadow-[0_12px_25px_rgba(5,150,105,0.35)] hover:-translate-y-0.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                    </div>
                  </div>

                  {/* Content body */}
                  <div className="px-8 pb-8">
                    {/* Quick info chips */}
                    <div className="flex flex-wrap gap-2.5 mb-8 pb-6 border-b border-gray-100">
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />+
                        {coach.userId.whatsappNumber}
                      </div>
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {coach.dateOfBirth
                          ? new Date(coach.dateOfBirth).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : "N/A"}
                      </div>
                      {coach.userId.email && (
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {coach.userId.email}
                        </div>
                      )}
                      {coach.address && (
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {coach.address}
                        </div>
                      )}
                      {coach.fideId && (
                        <a
                          href={`https://ratings.fide.com/profile/${coach.fideId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3.5 py-2 rounded-xl border border-red-100 hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5" />
                          FIDE #{coach.fideId}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {coach.cvUrl && (
                        <a
                          href={coach.cvUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-gray-500" />
                          View CV
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </a>
                      )}
                    </div>

                    {/* Bio */}
                    {coach.bio && (
                      <div className="mb-8">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                          <span className="font-bold text-gray-900">
                            &ldquo;
                          </span>
                          {coach.bio}
                          <span className="font-bold text-gray-900">
                            &rdquo;
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Specializations + Achievements */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      {/* Left: Specializations */}
                      {((coach.specializations?.length ?? 0) > 0 ||
                        coach.specializations?.[0] !== "") && (
                        <div className="bg-gradient-to-br from-rose-50 to-red-50/50 p-6 rounded-2xl border border-red-100/60 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-40 h-40 bg-red-200/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400 mb-4">
                            <Star className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                            Specializations
                          </h4>
                          <div className="flex flex-wrap gap-2 relative z-10">
                            {coach.specializations?.map(
                              (spec: string, i: number) =>
                                spec.trim() && (
                                  <span
                                    key={i}
                                    className="px-3.5 py-1.5 bg-white border border-red-100 text-red-700 text-xs font-bold rounded-lg shadow-sm hover:-translate-y-0.5 transition-transform"
                                  >
                                    {spec}
                                  </span>
                                ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Right: Achievements Stack */}
                      <div className="space-y-5">
                        {/* Coach Achievements */}
                        {(coach.coachAchievements?.length ?? 0) > 0 && (
                          <div>
                            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                              <Medal className="w-3.5 h-3.5 text-red-400" />
                              Coaching Achievements
                            </h4>
                            <div className="space-y-2">
                              {coach.coachAchievements?.map(
                                (item: string, i: number) =>
                                  item.trim() && (
                                    <div
                                      key={i}
                                      className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100"
                                    >
                                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                      <span className="font-medium leading-relaxed">
                                        {item}
                                      </span>
                                    </div>
                                  ),
                              )}
                            </div>
                          </div>
                        )}

                        {/* Player Achievements */}
                        {(coach.playerAchievements?.length ?? 0) > 0 && (
                          <div>
                            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                              <Trophy className="w-3.5 h-3.5 text-red-400" />
                              Player Achievements
                            </h4>
                            <div className="space-y-2">
                              {coach.playerAchievements?.map(
                                (item: string, i: number) =>
                                  item.trim() && (
                                    <div
                                      key={i}
                                      className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100"
                                    >
                                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                      <span className="font-medium leading-relaxed">
                                        {item}
                                      </span>
                                    </div>
                                  ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ==================== APPROVED TAB ==================== */}
      {activeTab === "approved" && (
        <>
          {approvedLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-red-100 rounded-full mb-6" />
              <p className="text-gray-500 font-medium">Loading coaches...</p>
            </div>
          ) : approvedCoaches.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 transition-all">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Crown className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2 font-[family-name:var(--font-outfit)] tracking-tight">
                No Approved Coaches
              </h3>
              <p className="text-gray-500 text-lg">
                There are no approved coaches on the platform yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {approvedCoaches.map((coach) => (
                <div
                  key={coach._id}
                  className={`group relative bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] ${
                    coach.verificationStatus === "paused" ? "opacity-75" : ""
                  }`}
                >
                  <div className="px-6 py-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Profile picture */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden ring-2 ring-white shrink-0">
                        {coach.userId.profilePhotoThumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={coach.userId.profilePhotoThumbnail}
                            alt={coach.userId.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          coach.userId.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base font-bold text-gray-900 truncate font-[family-name:var(--font-outfit)]">
                            {coach.userId.name}
                          </h3>
                          {coach.fideRating && (
                            <span className="text-[11px] font-extrabold bg-gradient-to-r from-red-500 to-rose-600 text-white px-2 py-0.5 rounded-md shadow-sm shrink-0">
                              {coach.fideRating} ELO
                            </span>
                          )}
                          {coach.verificationStatus === "paused" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
                              <PauseCircle className="w-3 h-3" />
                              Paused
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs font-medium text-gray-400">
                            +{coach.userId.whatsappNumber}
                          </span>
                          {coach.userId.email && (
                            <span className="text-xs text-gray-400 hidden sm:inline">
                              {coach.userId.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pause/Unpause Button */}
                    <button
                      disabled={togglingId === coach._id}
                      onClick={() => {
                        setPauseConfirmId(coach._id);
                        setPauseConfirmAction(
                          coach.verificationStatus === "paused"
                            ? "unpause"
                            : "pause",
                        );
                      }}
                      className={`shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer ${
                        coach.verificationStatus === "paused"
                          ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                          : "text-amber-600 bg-amber-50 hover:bg-amber-100"
                      }`}
                    >
                      {coach.verificationStatus === "paused" ? (
                        <>
                          <PlayCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Unpause</span>
                        </>
                      ) : (
                        <>
                          <PauseCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Pause</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ==================== MODALS ==================== */}

      {/* Approve Modal */}
      {approvingId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-8 py-6 flex justify-between items-center">
              <h3 className="text-2xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
                Approve Coach
              </h3>
              <button
                onClick={() => setApprovingId(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                disabled={!!verifyingId}
              >
                ✕
              </button>
            </div>

            <div className="px-8 pb-4">
              <p className="text-gray-600 font-medium">
                Are you sure you want to approve this application? The coach
                will be notified and granted access to the platform.
              </p>
            </div>

            <div className="px-8 py-6 flex gap-3">
              <button
                onClick={() => setApprovingId(null)}
                className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
                disabled={!!verifyingId}
              >
                Cancel
              </button>
              <button
                disabled={!!verifyingId}
                onClick={() => handleVerify(approvingId, "approved")}
                className="flex-1 px-4 py-3 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-50 shadow-[0_4px_14px_rgba(5,150,105,0.25)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                {verifyingId === approvingId
                  ? "Processing..."
                  : "Confirm Approval"}
              </button>
            </div>
          </div>
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
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
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
                className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!rejectNotes.trim() || verifyingId === rejectingId}
                onClick={() =>
                  handleVerify(rejectingId, "rejected", rejectNotes)
                }
                className="flex-1 px-4 py-3 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-500 disabled:opacity-50 shadow-[0_4px_14px_rgba(220,38,38,0.25)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                {verifyingId === rejectingId
                  ? "Processing..."
                  : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause/Unpause Confirmation Modal */}
      {pauseConfirmId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-8 py-6 flex justify-between items-center">
              <h3 className="text-2xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
                {pauseConfirmAction === "pause"
                  ? "Pause Coach"
                  : "Unpause Coach"}
              </h3>
              <button
                onClick={() => setPauseConfirmId(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                disabled={!!togglingId}
              >
                ✕
              </button>
            </div>

            <div className="px-8 pb-4">
              <p className="text-gray-600 font-medium">
                {pauseConfirmAction === "pause"
                  ? "Are you sure you want to pause this coach? They will not be able to access their dashboard or manage courses while paused."
                  : "Are you sure you want to unpause this coach? They will regain full access to their dashboard and courses."}
              </p>
            </div>

            <div className="px-8 py-6 flex gap-3">
              <button
                onClick={() => setPauseConfirmId(null)}
                className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
                disabled={!!togglingId}
              >
                Cancel
              </button>
              <button
                disabled={!!togglingId}
                onClick={() =>
                  handleTogglePause(pauseConfirmId, pauseConfirmAction)
                }
                className={`flex-1 px-4 py-3 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-all transform hover:-translate-y-0.5 cursor-pointer ${
                  pauseConfirmAction === "pause"
                    ? "bg-amber-500 hover:bg-amber-400 shadow-[0_4px_14px_rgba(245,158,11,0.25)]"
                    : "bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_14px_rgba(5,150,105,0.25)]"
                }`}
              >
                {togglingId === pauseConfirmId
                  ? "Processing..."
                  : pauseConfirmAction === "pause"
                    ? "Confirm Pause"
                    : "Confirm Unpause"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]"
          onClick={() => {
            if (!previewLoading) setPreviewImage(null);
          }}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            {previewLoading ? (
              <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full shadow-2xl" />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImage}
                  alt="Profile Preview"
                  className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute -top-4 -right-4 w-10 h-10 flex items-center justify-center bg-white text-gray-900 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10 cursor-pointer"
                  aria-label="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Full-screen Loading Overlay for processing verify requests */}
      {verifyingId && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-[70] flex flex-col items-center justify-center animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center border border-gray-100">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-emerald-100 rounded-full mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Processing...</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Please wait while we update the application.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
