"use client";

import { useState, useEffect } from "react";
import {
  Banknote,
  TrendingUp,
  Wallet,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Phone,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

interface CoachBreakdown {
  coachId: string;
  name: string;
  whatsappNumber: string;
  profilePicture?: string;
  profilePictureThumbnail?: string;
  pendingAmount: number;
  unpaidEnrollments: number;
}

interface PaymentSummary {
  totalOwedToCoaches: number;
  totalPlatformRevenue: number;
  developerCut: number;
}

interface PaymentsData {
  summary: PaymentSummary;
  coachBreakdowns: CoachBreakdown[];
}

export default function ManagerPaymentsPage() {
  const [data, setData] = useState<PaymentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isPayingDeveloper, setIsPayingDeveloper] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchPaymentsData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/manager/payments");
      if (!res.ok) throw new Error("Failed to fetch payment data");

      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load payment analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const handlePayout = async (coachId: string, coachName: string) => {
    if (
      !confirm(
        `Are you sure you want to mark ${coachName} as Paid? This will trigger a WhatsApp notification and reset their pending balance to zero.`,
      )
    ) {
      return;
    }

    try {
      setProcessingId(coachId);
      const res = await fetch("/api/manager/payments/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachId }),
      });

      if (!res.ok) {
        throw new Error("Payout transaction failed");
      }

      toast.success(`Successfully processed payout for ${coachName}`);
      await fetchPaymentsData(); // Refresh the data grid
    } catch (error) {
      console.error(error);
      toast.error(`Failed to process payout for ${coachName}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeveloperPayout = async () => {
    if (
      !confirm(
        "Are you sure you want to mark the developer cut as Paid? This will reset the pending developer balance to zero.",
      )
    ) {
      return;
    }

    try {
      setIsPayingDeveloper(true);
      const res = await fetch("/api/manager/payments/pay-developer", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Developer payout transaction failed");
      }

      toast.success("Successfully processed developer payout");
      await fetchPaymentsData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to process developer payout");
    } finally {
      setIsPayingDeveloper(false);
    }
  };

  const filteredCoaches =
    data?.coachBreakdowns.filter(
      (coach) =>
        coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.whatsappNumber.includes(searchTerm),
    ) || [];

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[calc(100vh-2rem)]">
        <Loader2 className="w-8 h-8 text-primary-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)]">
          Payment Analytics
        </h1>
        <p className="text-gray-500 mt-2">
          Monitor platform revenue and process coach payouts.
        </p>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-white border border-red-100 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">
                Total Owed to Coaches
              </p>
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                Rs.{" "}
                {data?.summary.totalOwedToCoaches.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </h3>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center -mt-1 group-hover:scale-110 transition-transform">
              <Banknote className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-red-500 mt-4 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Pending Bank Transfers
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-emerald-600 mb-1">
                Total Platform Revenue
              </p>
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                Rs.{" "}
                {data?.summary.totalPlatformRevenue.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center -mt-1 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-emerald-500 mt-4 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Lifetime Company Gross
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">
                Pending Developer Cut
              </p>
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                Rs.{" "}
                {data?.summary.developerCut.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center -mt-1 group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-blue-500 mt-4 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Accrued Unpaid Cut (5%)
          </p>
        </div>
      </div>

      {/* Developer Payout Execution Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Developer Payouts</h2>
          <p className="text-sm text-gray-500 mt-1">
            Execute payments to clear the pending developer cut balance.
          </p>
        </div>
        <button
          onClick={handleDeveloperPayout}
          disabled={
            !data?.summary.developerCut ||
            data.summary.developerCut === 0 ||
            isPayingDeveloper
          }
          className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-100 disabled:text-blue-400 text-white text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap"
        >
          {isPayingDeveloper ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Wallet className="w-4 h-4 mr-2" />
          )}
          {isPayingDeveloper ? "Processing..." : "Pay Developer"}
        </button>
      </div>

      {/* Filter and Table Box */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900">
            Coach Payouts Ledger
          </h2>

          <div className="relative w-full sm:w-auto">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Coach
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Pending Enrollments
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Owed Amount
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCoaches.map((row) => (
                <tr
                  key={row.coachId}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 overflow-hidden group/avatar relative">
                        {row.profilePictureThumbnail || row.profilePicture ? (
                          <button
                            onClick={() =>
                              setPreviewImage(
                                row.profilePicture ||
                                  row.profilePictureThumbnail ||
                                  null,
                              )
                            }
                            className="w-full h-full cursor-pointer focus:outline-none"
                            title="Preview Profile Picture"
                          >
                            <img
                              src={
                                row.profilePictureThumbnail ||
                                row.profilePicture
                              }
                              alt={row.name}
                              className="w-full h-full object-cover group-hover/avatar:opacity-80 transition-opacity"
                            />
                          </button>
                        ) : (
                          <User className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {row.name}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {row.whatsappNumber}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${
                        row.unpaidEnrollments > 0
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {row.unpaidEnrollments} students
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p
                      className={`font-bold ${
                        row.pendingAmount > 0
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      Rs.{" "}
                      {row.pendingAmount.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handlePayout(row.coachId, row.name)}
                      disabled={
                        row.pendingAmount === 0 || processingId === row.coachId
                      }
                      className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95"
                    >
                      {processingId === row.coachId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Mark as Paid"
                      )}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCoaches.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No matching coaches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-xl w-full flex items-center justify-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Prevent clicking the image from closing
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Profile Picture"
              className="w-full max-h-[85vh] object-cover rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
