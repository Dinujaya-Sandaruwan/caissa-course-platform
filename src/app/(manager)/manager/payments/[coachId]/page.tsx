"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Copy,
  Loader2,
  Phone,
  User,
  ExternalLink,
  MessageCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface PayoutBreakdownItem {
  _id: string;
  enrollmentId: string;
  studentName: string;
  courseTitle: string;
  courseId: string;
  enrolledAt: string;
  amountPaid: number;
  platformFeePercent: number;
  platformCut: number;
  coachCut: number;
}

interface CoachData {
  id: string;
  name: string;
  whatsappNumber: string;
  profilePicture?: string;
  profilePictureThumbnail?: string;
  bankDetails?: {
    accountOwnerName: string;
    bankName: string;
    bankLocation: string;
    accountNumber: string;
  };
}

interface BreakdownData {
  coach: CoachData;
  summary: {
    totalPendingAmount: number;
    totalEnrollments: number;
  };
  breakdown: PayoutBreakdownItem[];
}

export default function ManagerCoachPayoutBreakdownPage() {
  const params = useParams();
  const router = useRouter();
  const coachId = params.coachId as string;

  const [data, setData] = useState<BreakdownData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  const fetchBreakdown = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/manager/payments/${coachId}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Coach not found");
          router.push("/manager/payments");
          return;
        }
        throw new Error("Failed to fetch payout breakdown");
      }
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while loading the payout breakdown.");
    } finally {
      setLoading(false);
    }
  }, [coachId, router]);

  useEffect(() => {
    if (coachId) fetchBreakdown();
  }, [coachId, fetchBreakdown]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleNotifyBank = async () => {
    try {
      setIsNotifying(true);
      const res = await fetch(`/api/manager/payments/${coachId}/notify-bank`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pendingAmount: data?.summary.totalPendingAmount,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send notification");
      }

      toast.success("WhatsApp notification sent to the coach");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send WhatsApp notification");
    } finally {
      setIsNotifying(false);
    }
  };

  const executeCoachPayout = async () => {
    try {
      setIsProcessingPayout(true);
      const res = await fetch("/api/manager/payments/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachId }),
      });

      if (!res.ok) {
        throw new Error("Payout transaction failed");
      }

      toast.success(`Successfully processed payout for ${data?.coach.name}`);
      setIsPayoutModalOpen(false);
      await fetchBreakdown();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to process payout for ${data?.coach.name}`);
    } finally {
      setIsProcessingPayout(false);
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

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header and Back navigation */}
      <div className="flex flex-col gap-2">
        <Link
          href="/manager/payments"
          className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Payments
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)]">
          Payout Breakdown
        </h1>
        <p className="text-sm text-gray-500">
          Detailed breakdown of all unpaid enrollments for this coach.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Coach Profile & Bank Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Coach Identity Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-red-50 bg-red-100 flex items-center justify-center text-red-600 text-3xl font-bold mb-4">
              {data.coach.profilePictureThumbnail ? (
                <img
                  src={data.coach.profilePictureThumbnail}
                  alt={data.coach.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                data.coach.name.charAt(0).toUpperCase()
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {data.coach.name}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 text-sm">
              <Phone className="w-4 h-4" />
              <span>{data.coach.whatsappNumber}</span>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 w-full flex flex-col gap-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
                Total Owed Amount
              </p>
              <h3 className="text-3xl font-extrabold text-red-600 mb-2">
                Rs. {data.summary.totalPendingAmount.toLocaleString()}
              </h3>
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                disabled={data.summary.totalPendingAmount === 0}
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 text-white text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95 mt-2"
              >
                Mark as Paid
              </button>
            </div>
          </div>

          {/* Bank Details Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              Bank Details
            </h3>

            {data.coach.bankDetails ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Account Owner
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {data.coach.bankDetails.accountOwnerName}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        data.coach.bankDetails?.accountOwnerName || "",
                        "Account Owner",
                      )
                    }
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Bank Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {data.coach.bankDetails.bankName}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        data.coach.bankDetails?.bankName || "",
                        "Bank Name",
                      )
                    }
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Branch
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {data.coach.bankDetails.bankLocation}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        data.coach.bankDetails?.bankLocation || "",
                        "Branch",
                      )
                    }
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Account Number
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {data.coach.bankDetails.accountNumber}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        data.coach.bankDetails?.accountNumber || "",
                        "Account Number",
                      )
                    }
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() =>
                      handleCopy(
                        `Payment Details for ${data.coach.name}:\nAccount Owner: ${data.coach.bankDetails?.accountOwnerName}\nBank Name: ${data.coach.bankDetails?.bankName}\nBranch: ${data.coach.bankDetails?.bankLocation}\nAccount Number: ${data.coach.bankDetails?.accountNumber}\nAmount: Rs. ${data.summary.totalPendingAmount}`,
                        "All Bank Details",
                      )
                    }
                    className="w-full inline-flex justify-center flex-1 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-2" /> Copy All Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center bg-gray-50 rounded-2xl border border-gray-100 mt-4">
                <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-900 font-bold mb-1">
                  No Bank Details Provided
                </p>
                <p className="text-xs text-gray-500 mb-6">
                  This coach has not updated their bank account on their billing
                  profile.
                </p>
                <button
                  onClick={handleNotifyBank}
                  disabled={isNotifying}
                  className="w-full inline-flex justify-center items-center py-2.5 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors border border-green-200"
                >
                  {isNotifying ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4 mr-2" />
                  )}
                  {isNotifying ? "Sending..." : "Notify via WhatsApp"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Calculations Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                Pending Enrollments Breakdown
              </h2>
              <span className="bg-red-50 text-red-700 font-bold px-3 py-1 rounded-lg text-sm">
                {data.summary.totalEnrollments} Enrollments
              </span>
            </div>

            <div className="overflow-x-auto">
              {data.breakdown.length > 0 ? (
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Enrollment Details
                      </th>
                      <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                        Paid By Student
                      </th>
                      <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                        Platform Fee
                      </th>
                      <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right text-red-600 bg-red-50/30">
                        Owed to Coach
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.breakdown.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <p className="font-semibold text-gray-900 text-sm">
                            {item.studentName}
                          </p>
                          <Link
                            href={`${baseUrl}courses/${item.courseId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 mt-0.5 inline-flex"
                          >
                            {item.courseTitle}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-mono">
                            {item.enrollmentId}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <p className="font-semibold text-gray-900">
                            Rs. {item.amountPaid.toLocaleString()}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <p className="font-bold text-gray-700">
                            Rs. {item.platformCut.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                            {item.platformFeePercent}% Fee
                          </p>
                        </td>
                        <td className="py-4 px-6 text-right bg-red-50/30">
                          <p className="font-bold text-red-600">
                            Rs. {item.coachCut.toLocaleString()}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-100 bg-gray-50/50">
                    <tr>
                      <td
                        colSpan={3}
                        className="py-4 px-6 text-right font-extrabold text-gray-900 text-sm uppercase tracking-wider"
                      >
                        Total Amount Owed:
                      </td>
                      <td className="py-4 px-6 text-right">
                        <p className="font-extrabold text-red-700 text-lg">
                          Rs. {data.summary.totalPendingAmount.toLocaleString()}
                        </p>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-gray-500 font-medium">
                    No pending enrollments found for this coach.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Coach Payout Modal */}
      {isPayoutModalOpen && data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl ring-1 ring-gray-900/10 p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-100 shrink-0">
                  {data.coach.profilePictureThumbnail ||
                  data.coach.profilePicture ? (
                    <img
                      src={
                        data.coach.profilePictureThumbnail ||
                        data.coach.profilePicture
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl">
                      {data.coach.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Payout: {data.coach.name}
                  </h3>
                  <p className="text-sm font-medium text-gray-500">
                    {data.summary.totalEnrollments} Pending Enrollments
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {data.coach.bankDetails ? (
              <div className="space-y-4 mb-8 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Account Owner
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {data.coach.bankDetails.accountOwnerName}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        data.coach.bankDetails?.accountOwnerName || "",
                        "Account Owner",
                      )
                    }
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Copy Name"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Bank Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {data.coach.bankDetails.bankName}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        data.coach.bankDetails?.bankName || "",
                        "Bank Name",
                      )
                    }
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Copy Bank Name"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Branch
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {data.coach.bankDetails.bankLocation}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        data.coach.bankDetails?.bankLocation || "",
                        "Branch",
                      )
                    }
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Copy Branch"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Account Number
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {data.coach.bankDetails.accountNumber}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        data.coach.bankDetails?.accountNumber || "",
                        "Account Number",
                      )
                    }
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Copy Account Number"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() =>
                      handleCopy(
                        `Payment Details for ${data.coach.name}:\nAccount Owner: ${data.coach.bankDetails?.accountOwnerName}\nBank Name: ${data.coach.bankDetails?.bankName}\nBranch: ${data.coach.bankDetails?.bankLocation}\nAccount Number: ${data.coach.bankDetails?.accountNumber}\nAmount: Rs. ${data.summary.totalPendingAmount}`,
                        "All Coach Bank Details",
                      )
                    }
                    className="inline-flex justify-center items-center py-2 px-4 text-xs font-bold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors w-full"
                  >
                    <Copy className="w-3.5 h-3.5 mr-2" /> Copy All Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-6 text-center bg-gray-50 rounded-2xl border border-gray-100">
                <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-900 font-bold mb-1">
                  No Bank Details Provided
                </p>
                <p className="text-sm text-gray-500">
                  This coach has not updated their bank account on the billing
                  portal. Please use the WhatsApp button to contact them.
                </p>
              </div>
            )}

            <div className="bg-red-50 p-4 rounded-2xl mb-6">
              <p className="text-sm text-red-700 text-center font-medium">
                Please transfer{" "}
                <strong className="font-extrabold text-red-900">
                  Rs. {data.summary.totalPendingAmount.toLocaleString()}
                </strong>{" "}
                before confirming.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="flex-1 py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeCoachPayout}
                disabled={isProcessingPayout}
                className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-xl transition-colors flex justify-center items-center shadow-sm"
              >
                {isProcessingPayout ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Paid"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
