"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Video,
  CheckCircle,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Play,
  Loader2,
  Save,
  Globe,
  X,
  AlertTriangle,
  Rocket,
  EyeOff,
  Download,
  DollarSign,
  Percent,
  Trash2,
  Mail,
  Phone,
  User as UserIcon,
  Award,
  MapPin,
  FileText,
  Calendar,
  ExternalLink,
  Maximize2,
  Star,
  Trophy,
  Users,
} from "lucide-react";

interface Lesson {
  _id: string;
  title: string;
  bunnyVideoId?: string;
  signedIframeUrl?: string;
  videoStatus: string;
  order: number;
}

interface Chapter {
  _id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseDetail {
  _id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  status: string;
  tags: string[];
  bunnyPreviewVideoUrl?: string;
  allowDiscounts?: boolean;
  maxDiscountPercent?: number;
  discountedPrice?: number;
  reviewNotes?: string;
  createdAt: string;
  ageMin?: number;
  ageMax?: number;
  coach?: {
    _id?: string;
    name?: string;
    whatsappNumber?: string;
    email?: string;
    profilePhoto?: string;
    profilePhotoThumbnail?: string;
  };
  chapters: Chapter[];
}

interface CoachFullProfile {
  user: {
    _id: string;
    name: string;
    email?: string;
    whatsappNumber: string;
    profilePhoto?: string;
    profilePhotoThumbnail?: string;
  };
  profile: {
    fideId?: string;
    fideRating?: number;
    bio?: string;
    specializations?: string[];
    coachAchievements?: string[];
    playerAchievements?: string[];
    dateOfBirth?: string;
    address?: string;
    cvUrl?: string;
    verificationStatus?: string;
  } | null;
}

const levelEmoji: Record<string, string> = {
  beginner: "🌱",
  intermediate: "⚔️",
  advanced: "👑",
};

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  draft: {
    label: "Draft",
    color: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-gray-200",
  },
  pending_review: {
    label: "Pending Review",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  approved: {
    label: "Approved",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  published: {
    label: "Published",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  unpublished: {
    label: "Unpublished",
    color: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-gray-200",
  },
};

export default function ManagerCourseDetailPage() {
  const params = useParams() as { id: string } | null;
  const router = useRouter();
  const courseId = params?.id;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  // Discount state
  const [discountPriceInput, setDiscountPriceInput] = useState("");
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState("");

  // Video Playing State
  const [playingLessonId, setPlayingLessonId] = useState<string | null>(null);

  // Review Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"rejected" | "held">(
    "rejected",
  );
  const [modalNotes, setModalNotes] = useState("");

  // Coach Info Modal
  const [coachModalOpen, setCoachModalOpen] = useState(false);
  const [coachData, setCoachData] = useState<CoachFullProfile | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [photoFullscreen, setPhotoFullscreen] = useState(false);

  const fetchCoachProfile = async () => {
    if (!course?.coach?._id) return;
    setCoachLoading(true);
    setCoachModalOpen(true);
    try {
      const res = await fetch(`/api/manager/coaches/${course.coach._id}`);
      if (res.ok) {
        const data = await res.json();
        setCoachData(data);
      }
    } catch (error) {
      console.error("Failed to fetch coach profile:", error);
    } finally {
      setCoachLoading(false);
    }
  };

  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/manager/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
      }
    } catch (error) {
      console.error("Failed to fetch course:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // Handle set discount
  const handleSetDiscount = async () => {
    if (!course) return;
    setSavingDiscount(true);
    setDiscountError("");
    try {
      const res = await fetch(`/api/manager/courses/${courseId}/discount`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountedPrice: Number(discountPriceInput) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to set discount");
      }
      setCourse({ ...course, discountedPrice: Number(discountPriceInput) });
      setActionMessage("Discount price set successfully!");
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err: any) {
      setDiscountError(err.message);
    } finally {
      setSavingDiscount(false);
    }
  };

  // Handle remove discount
  const handleRemoveDiscount = async () => {
    if (!course) return;
    setSavingDiscount(true);
    setDiscountError("");
    try {
      const res = await fetch(`/api/manager/courses/${courseId}/discount`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove discount");
      }
      const updatedCourse = { ...course };
      delete updatedCourse.discountedPrice;
      setCourse(updatedCourse);
      setDiscountPriceInput("");
      setActionMessage("Discount removed successfully!");
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err: any) {
      setDiscountError(err.message);
    } finally {
      setSavingDiscount(false);
    }
  };

  // Review actions
  async function handleReview(action: string, notes = "") {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/manager/courses/${courseId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });
      if (res.ok) {
        setModalOpen(false);
        setModalNotes("");
        await fetchCourse();
        setActionMessage(`Course ${action} successfully!`);
        setTimeout(() => setActionMessage(""), 3000);
      }
    } catch (error) {
      console.error("Review action failed:", error);
    } finally {
      setActionLoading(false);
    }
  }

  // Publish / Unpublish
  async function handlePublish() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/manager/courses/${courseId}/publish`, {
        method: "PATCH",
      });
      if (res.ok) {
        await fetchCourse();
        setActionMessage("Course published!");
        setTimeout(() => setActionMessage(""), 3000);
      } else {
        const err = await res.json();
        setActionMessage(err.error || "Failed to publish");
        setTimeout(() => setActionMessage(""), 5000);
      }
    } catch (error) {
      console.error("Publish failed:", error);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUnpublish() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/manager/courses/${courseId}/unpublish`, {
        method: "PATCH",
      });
      if (res.ok) {
        await fetchCourse();
        setActionMessage("Course unpublished");
        setTimeout(() => setActionMessage(""), 3000);
      }
    } catch (error) {
      console.error("Unpublish failed:", error);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Course not found.</p>
        <Link
          href="/manager/courses"
          className="text-red-600 hover:underline mt-2 inline-block text-sm font-semibold"
        >
          ← Back to Courses
        </Link>
      </div>
    );
  }

  const status = statusConfig[course.status] || statusConfig.draft;
  const totalLessons = course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.length,
    0,
  );
  const readyLessons = course.chapters.reduce(
    (acc, ch) =>
      acc + ch.lessons.filter((l) => l.videoStatus === "ready").length,
    0,
  );
  const allReady = totalLessons > 0 && readyLessons === totalLessons;
  const canPublish =
    (course.status === "approved" || course.status === "unpublished") &&
    allReady &&
    !!course.bunnyPreviewVideoUrl;

  return (
    <div className="space-y-8 animate-[fade-in-up_0.4s_ease-out]">
      {/* Back + Header */}
      <div>
        <Link
          href="/manager/courses"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Course Reviews
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
              {course.title}
            </h1>
            <p className="text-gray-500 mt-1 text-sm flex items-center gap-3 flex-wrap">
              <span>
                {levelEmoji[course.level] || "📚"} {course.level}
              </span>
              <span className="text-gray-300">·</span>
              <span>Rs. {course.price?.toLocaleString()}</span>
              <span className="text-gray-300">·</span>
              <button
                onClick={fetchCoachProfile}
                className="text-red-600 hover:text-red-700 font-semibold hover:underline underline-offset-2 transition-colors cursor-pointer"
                title="Click to view coach profile"
              >
                By {course.coach?.name || "Unknown"}
              </button>
            </p>
          </div>
          <span
            className={`inline-flex items-center px-4 py-2 text-xs font-bold rounded-full border ${status.color} ${status.bg} ${status.border} shrink-0`}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Success/Error Feedback */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 text-sm font-medium text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {actionMessage}
        </div>
      )}

      {/* Course Metadata Card */}
      <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-red-500" />
          Course Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Description
            </p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {course.description}
            </p>
          </div>
          <div className="space-y-4">
            {course.ageMin != null && course.ageMax != null && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Age Group
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-blue-700 bg-blue-50 rounded-xl border border-blue-200">
                  <Users className="w-4 h-4" />
                  Ages {course.ageMin}–{course.ageMax}
                </span>
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {course.tags?.length > 0 ? (
                  course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 text-xs font-semibold text-red-600 bg-red-50 rounded-full border border-red-100"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">No tags</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Coach Contact
              </p>
              <div className="text-sm text-gray-700 flex flex-col gap-1">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {course.coach?.email || "N/A"}
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {course.coach?.whatsappNumber || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discount Management Card */}
      {course.allowDiscounts && (
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-red-500" />
            Discount Management
          </h2>

          <div className="space-y-4">
            {/* Discount Info */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                <Percent className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold text-emerald-700">
                  Max {course.maxDiscountPercent}% off
                </span>
              </div>
              <div className="text-gray-500">
                Regular price:{" "}
                <span className="font-bold text-gray-800">
                  Rs. {course.price?.toLocaleString()}
                </span>
              </div>
              <div className="text-gray-500">
                Min allowed:{" "}
                <span className="font-bold text-gray-800">
                  Rs.{" "}
                  {Math.ceil(
                    course.price * (1 - (course.maxDiscountPercent || 0) / 100),
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Current discount display */}
            {course.discountedPrice && (
              <div className="flex items-center gap-3 p-4 bg-amber-50/80 rounded-xl border border-amber-100">
                <DollarSign className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-900">
                    Active discount: Rs.{" "}
                    {course.discountedPrice.toLocaleString()}
                    <span className="text-amber-600 font-medium ml-2">
                      (
                      {Math.round(
                        (1 - course.discountedPrice / course.price) * 100,
                      )}
                      % off)
                    </span>
                  </p>
                </div>
                <button
                  onClick={handleRemoveDiscount}
                  disabled={savingDiscount}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-all disabled:opacity-50"
                >
                  {savingDiscount ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  Remove
                </button>
              </div>
            )}

            {/* Set discount */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                  Rs.
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={discountPriceInput}
                  onChange={(e) => {
                    setDiscountPriceInput(e.target.value);
                    setDiscountError("");
                  }}
                  placeholder="Enter discounted price"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 text-sm font-medium transition-all focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                />
              </div>
              <button
                onClick={handleSetDiscount}
                disabled={savingDiscount || !discountPriceInput.trim()}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
              >
                {savingDiscount ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {course.discountedPrice ? "Update" : "Set Discount"}
              </button>
            </div>

            {discountError && (
              <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {discountError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Preview Video */}
      {course.bunnyPreviewVideoUrl && (
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-red-500" />
            Preview Video
          </h2>
          <div className="aspect-video bg-gray-900 relative rounded-xl overflow-hidden">
            <iframe
              src={course.bunnyPreviewVideoUrl}
              loading="lazy"
              className="w-full h-full border-0"
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
              allowFullScreen
              title="Course Preview"
            />
          </div>
        </div>
      )}

      {/* Chapters & Lessons with Video URL Management */}
      <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5">
        <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Video className="w-4 h-4 text-red-500" />
          Curriculum &amp; Video URLs
          <span className="ml-auto text-sm font-medium text-gray-400">
            {readyLessons}/{totalLessons} videos ready
          </span>
        </h2>
        {!allReady && totalLessons > 0 && (
          <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mb-4">
            <AlertTriangle className="w-3 h-3" />
            Ensure all lessons finish processing before publishing
          </p>
        )}

        <div className="space-y-5 mt-4">
          {course.chapters.map((ch, chIdx) => (
            <div
              key={ch._id}
              className="border border-gray-100 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-5 py-3 bg-gray-50/80">
                <span className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-xs font-bold text-red-600 border border-red-100">
                  {chIdx + 1}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {ch.title}
                </span>
                <span className="ml-auto text-xs text-gray-400">
                  {ch.lessons.length} lesson{ch.lessons.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="divide-y divide-gray-50">
                {ch.lessons.map((lesson, lIdx) => (
                  <div key={lesson._id} className="px-5 py-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        {lIdx + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-800 flex-1">
                        {lesson.title}
                      </span>
                      {lesson.videoStatus === "ready" ? (
                        <button
                          onClick={() =>
                            setPlayingLessonId(
                              playingLessonId === lesson._id
                                ? null
                                : lesson._id,
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-all"
                        >
                          <Play className="w-3.5 h-3.5" />
                          {playingLessonId === lesson._id
                            ? "Close Video"
                            : "Watch Video"}
                        </button>
                      ) : lesson.videoStatus === "processing" ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                          Processing
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-400">
                          No video
                        </span>
                      )}
                    </div>
                    {/* Expandable Video Player inline */}
                    {playingLessonId === lesson._id &&
                      lesson.signedIframeUrl && (
                        <div className="mt-3 aspect-video bg-gray-900 rounded-xl overflow-hidden relative shadow-inner ring-1 ring-gray-900/10">
                          <iframe
                            src={lesson.signedIframeUrl}
                            loading="lazy"
                            className="w-full h-full border-0 absolute inset-0"
                            allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                            allowFullScreen
                            title={lesson.title}
                          />
                        </div>
                      )}
                    {playingLessonId === lesson._id &&
                      lesson.videoStatus === "ready" &&
                      !lesson.signedIframeUrl && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                          <p className="text-sm text-gray-500 font-medium">
                            Video URL not found. It may be missing from
                            Bunny.net.
                          </p>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5">
        <h2 className="text-base font-bold text-gray-900 mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {/* Review Actions (only for pending_review) */}
          {course.status === "pending_review" && (
            <>
              <button
                onClick={() => handleReview("approved")}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={() => {
                  setModalAction("rejected");
                  setModalOpen(true);
                }}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button
                onClick={() => {
                  setModalAction("held");
                  setModalOpen(true);
                }}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                <PauseCircle className="w-4 h-4" /> Hold
              </button>
            </>
          )}

          {/* Publish (only for approved) */}
          {course.status === "approved" && (
            <button
              onClick={handlePublish}
              disabled={actionLoading || !canPublish}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xl shadow-red-600/20 transition-all disabled:opacity-50"
            >
              <Rocket className="w-4 h-4" /> Publish Course
            </button>
          )}
          {course.status === "approved" && !canPublish && (
            <span className="text-xs text-amber-600 font-medium self-center">
              {!allReady ? "Set all video URLs first" : "Set preview URL first"}
            </span>
          )}

          {/* Republish (only for unpublished) */}
          {course.status === "unpublished" && (
            <button
              onClick={handlePublish}
              disabled={actionLoading || !canPublish}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xl shadow-red-600/20 transition-all disabled:opacity-50"
            >
              <Rocket className="w-4 h-4" /> Republish Course
            </button>
          )}
          {course.status === "unpublished" && !canPublish && (
            <span className="text-xs text-amber-600 font-medium self-center">
              {!allReady ? "Set all video URLs first" : "Set preview URL first"}
            </span>
          )}

          {/* Unpublish (only for published) */}
          {course.status === "published" && (
            <button
              onClick={handleUnpublish}
              disabled={actionLoading}
              className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50"
            >
              <EyeOff className="w-4 h-4" /> Unpublish
            </button>
          )}

          {/* Back */}
          <button
            onClick={() => router.push("/manager/courses")}
            className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors ml-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
        </div>
      </div>

      {/* Review Notes Modal */}
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
            <textarea
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              placeholder="Enter your notes for the coach..."
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
                onClick={() => handleReview(modalAction, modalNotes)}
                disabled={!modalNotes.trim() || actionLoading}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50 ${
                  modalAction === "rejected"
                    ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
                    : "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                }`}
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {modalAction === "rejected" ? "Reject" : "Hold"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coach Info Modal */}
      {coachModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setCoachModalOpen(false);
            setCoachData(null);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-[fade-in-up_0.2s_ease-out] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {coachLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              </div>
            ) : coachData ? (
              <>
                {/* Header with profile photo */}
                <div className="relative bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 rounded-t-3xl p-8 pb-6">
                  <button
                    onClick={() => {
                      setCoachModalOpen(false);
                      setCoachData(null);
                    }}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-5">
                    {/* Profile Photo */}
                    <div className="relative group">
                      {coachData.user.profilePhoto ||
                      coachData.user.profilePhotoThumbnail ? (
                        <div
                          className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg cursor-pointer relative"
                          onClick={() => setPhotoFullscreen(true)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              coachData.user.profilePhotoThumbnail ||
                              coachData.user.profilePhoto ||
                              ""
                            }
                            alt={coachData.user.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 ring-4 ring-white shadow-lg flex items-center justify-center">
                          <UserIcon className="w-8 h-8 text-red-400" />
                        </div>
                      )}
                    </div>

                    {/* Name & Status */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-outfit)] truncate">
                        {coachData.user.name}
                      </h3>
                      {coachData.profile?.verificationStatus && (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold rounded-full mt-1.5 ${
                            coachData.profile.verificationStatus === "approved"
                              ? "text-emerald-700 bg-emerald-100 border border-emerald-200"
                              : coachData.profile.verificationStatus ===
                                  "paused"
                                ? "text-amber-700 bg-amber-100 border border-amber-200"
                                : "text-gray-600 bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {coachData.profile.verificationStatus
                            .charAt(0)
                            .toUpperCase() +
                            coachData.profile.verificationStatus.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Body */}
                <div className="p-8 pt-6 space-y-5">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Contact
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <span className="flex items-center gap-2.5 text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                        {coachData.user.email || "N/A"}
                      </span>
                      <span className="flex items-center gap-2.5 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                        {coachData.user.whatsappNumber}
                      </span>
                      {coachData.profile?.address && (
                        <span className="flex items-center gap-2.5 text-gray-700">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                          {coachData.profile.address}
                        </span>
                      )}
                      {coachData.profile?.dateOfBirth && (
                        <span className="flex items-center gap-2.5 text-gray-700">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          {new Date(
                            coachData.profile.dateOfBirth,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* FIDE Info */}
                  {coachData.profile &&
                    (coachData.profile.fideId ||
                      coachData.profile.fideRating) && (
                      <div className="flex gap-3">
                        {coachData.profile.fideId && (
                          <div className="flex-1 p-3 bg-blue-50/80 rounded-xl border border-blue-100">
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                              FIDE ID
                            </p>
                            <p className="text-sm font-bold text-blue-900 mt-0.5">
                              {coachData.profile.fideId}
                            </p>
                          </div>
                        )}
                        {coachData.profile.fideRating != null && (
                          <div className="flex-1 p-3 bg-amber-50/80 rounded-xl border border-amber-100">
                            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                              FIDE Rating
                            </p>
                            <p className="text-sm font-bold text-amber-900 mt-0.5">
                              {coachData.profile.fideRating}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Bio */}
                  {coachData.profile?.bio && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Bio
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {coachData.profile.bio}
                      </p>
                    </div>
                  )}

                  {/* Specializations */}
                  {coachData.profile?.specializations &&
                    coachData.profile.specializations.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                          Specializations
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {coachData.profile.specializations.map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 rounded-full border border-red-100"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Coach Achievements */}
                  {coachData.profile?.coachAchievements &&
                    coachData.profile.coachAchievements.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <Trophy className="w-3 h-3" /> Coach Achievements
                        </p>
                        <ul className="space-y-1">
                          {coachData.profile.coachAchievements.map((a, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-700 flex items-start gap-2"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Player Achievements */}
                  {coachData.profile?.playerAchievements &&
                    coachData.profile.playerAchievements.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <Award className="w-3 h-3" /> Player Achievements
                        </p>
                        <ul className="space-y-1">
                          {coachData.profile.playerAchievements.map((a, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-700 flex items-start gap-2"
                            >
                              <Star className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* CV Link */}
                  {coachData.profile?.cvUrl && (
                    <a
                      href={coachData.profile.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-100 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      View CV
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <UserIcon className="w-10 h-10 mb-2" />
                <p className="text-sm font-medium">Could not load coach info</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Photo Fullscreen Overlay */}
      {photoFullscreen && coachData?.user.profilePhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPhotoFullscreen(false)}
        >
          <button
            onClick={() => setPhotoFullscreen(false)}
            className="absolute top-6 right-6 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-2xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="relative max-w-3xl max-h-[85vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coachData.user.profilePhoto}
              alt={coachData.user.name}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
            {coachData.user.name} — Click anywhere to close
          </p>
        </div>
      )}
    </div>
  );
}
