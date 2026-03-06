"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Loader2,
  Phone,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface BreakdownItem {
  courseId: string;
  courseTitle: string;
  enrollmentCount: number;
  grossRevenue: number;
  platformFeePercent: number;
  platformCut: number;
  coachCut: number;
}

interface PayoutRequestData {
  _id: string;
  status: "pending_coach" | "coach_approved" | "coach_rejected" | "paid";
  totalAmount: number;
  breakdown: BreakdownItem[];
  coachNote?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CoachPayoutReviewPage() {
  const params = useParams() as { requestId: string } | null;
  const router = useRouter();
  const requestId = params?.requestId;

  const [data, setData] = useState<PayoutRequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const supportPhone =
    process.env.NEXT_PUBLIC_SUPPORT_PHONE_NUMBER || "+94712345678";

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/coach/payout-requests/${requestId}`);
        if (!res.ok) {
          toast.error("Payout request not found");
          router.push("/coach/billing");
          return;
        }
        const json = await res.json();
        setData(json.payoutRequest);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load payout request.");
      } finally {
        setLoading(false);
      }
    };

    if (requestId) fetchRequest();
  }, [requestId, router]);

  const handleRespond = async (action: "approve" | "reject") => {
    try {
      setIsProcessing(true);
      const res = await fetch(
        `/api/coach/payout-requests/${requestId}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            note: action === "reject" ? rejectNote : undefined,
          }),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to respond");

      if (action === "approve") {
        toast.success(
          "Payout approved! The manager will process your payment.",
        );
      } else {
        toast.success("Payout rejected. The manager has been notified.");
        setShowRejectModal(false);
      }
      router.push("/coach/billing");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to respond to payout request");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[calc(100vh-2rem)]">
        <Loader2 className="w-8 h-8 text-primary-red animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const totalGross = data.breakdown.reduce((s, b) => s + b.grossRevenue, 0);
  const totalPlatformCut = data.breakdown.reduce(
    (s, b) => s + b.platformCut,
    0,
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link
          href="/coach/billing"
          className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Billing
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)]">
          Payout Review
        </h1>
        <p className="text-sm text-gray-500">
          Review the payout details below and confirm or reject.
        </p>
      </div>

      {/* Status Badge */}
      {data.status === "pending_coach" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm font-semibold text-amber-800">
            This payout request is awaiting your review. Please verify the
            amounts below.
          </p>
        </div>
      )}
      {data.status === "coach_approved" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-sm font-semibold text-emerald-800">
            You have approved this payout. The manager will process your bank
            transfer.
          </p>
        </div>
      )}
      {data.status === "coach_rejected" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              You rejected this payout request.
            </p>
            {data.coachNote && (
              <p className="text-xs text-red-600 mt-1">
                Reason: {data.coachNote}
              </p>
            )}
          </div>
        </div>
      )}
      {data.status === "paid" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-sm font-semibold text-emerald-800">
            This payout has been completed. The amount has been transferred to
            your bank.
          </p>
        </div>
      )}

      {/* Payout Summary Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          Your Payout Amount
        </p>
        <h2 className="text-4xl font-extrabold text-emerald-600">
          Rs. {data.totalAmount.toLocaleString()}
        </h2>
        <p className="text-xs text-gray-400 mt-2">
          Submitted on{" "}
          {new Date(data.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Course Breakdown Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Course-by-Course Breakdown
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Details of how the payout was calculated
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Enrollments
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Gross Revenue
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Platform Fee
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-emerald-600 uppercase tracking-wider text-right bg-emerald-50/30">
                  Your Earnings
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.breakdown.map((item) => (
                <tr
                  key={item.courseId}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <p className="font-semibold text-gray-900 text-sm">
                      {item.courseTitle}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      {item.enrollmentCount}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className="font-semibold text-gray-900">
                      Rs. {item.grossRevenue.toLocaleString()}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className="font-semibold text-gray-700">
                      Rs. {item.platformCut.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                      {item.platformFeePercent}% Fee
                    </p>
                  </td>
                  <td className="py-4 px-6 text-right bg-emerald-50/30">
                    <p className="font-bold text-emerald-600">
                      Rs. {item.coachCut.toLocaleString()}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-100 bg-gray-50/50">
              <tr>
                <td className="py-4 px-6 font-extrabold text-gray-900 text-sm">
                  TOTALS
                </td>
                <td className="py-4 px-6 text-right font-bold text-gray-900">
                  {data.breakdown.reduce((s, b) => s + b.enrollmentCount, 0)}
                </td>
                <td className="py-4 px-6 text-right font-bold text-gray-900">
                  Rs. {totalGross.toLocaleString()}
                </td>
                <td className="py-4 px-6 text-right font-bold text-gray-700">
                  Rs. {totalPlatformCut.toLocaleString()}
                </td>
                <td className="py-4 px-6 text-right bg-emerald-50/30">
                  <p className="font-extrabold text-emerald-700 text-lg">
                    Rs. {data.totalAmount.toLocaleString()}
                  </p>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Action Buttons (only for pending requests) */}
      {data.status === "pending_coach" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 text-center">
              By clicking <strong>Approve</strong>, you confirm that the amounts
              above are correct and you authorize the bank transfer.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isProcessing}
              className="flex-1 py-3 text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 border border-red-200 rounded-xl transition-colors flex justify-center items-center"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Payout
            </button>
            <button
              onClick={() => handleRespond("approve")}
              disabled={isProcessing}
              className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 rounded-xl transition-colors flex justify-center items-center shadow-sm"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Payout
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl ring-1 ring-gray-900/10 p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Reject Payout?
                </h3>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">
                    Before rejecting, please call us to discuss
                  </p>
                  <a
                    href={`tel:${supportPhone}`}
                    className="text-lg font-extrabold text-amber-900 hover:underline mt-1 block"
                  >
                    {supportPhone}
                  </a>
                  <p className="text-xs text-amber-600 mt-1">
                    We can resolve pricing concerns over a quick call.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="block text-sm font-semibold text-gray-700">
                Reason for rejection (optional)
              </label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Tell us why you're rejecting this payout..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRespond("reject")}
                disabled={isProcessing}
                className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-xl transition-colors flex justify-center items-center shadow-sm"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Reject"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
