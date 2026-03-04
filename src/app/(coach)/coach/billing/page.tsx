"use client";

import { useState, useEffect } from "react";
import {
  Banknote,
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Building2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface CourseBreakdown {
  courseId: string;
  title: string;
  enrolledStudents: number;
  revenueGenerated: number;
}

interface BillingSummary {
  lifetimeRevenue: number;
  pendingPayout: number;
  totalEnrolledStudents: number;
}

interface BillingData {
  summary: BillingSummary;
  courseBreakdowns: CourseBreakdown[];
}

export default function CoachBillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState({
    accountOwnerName: "",
    bankName: "",
    bankLocation: "",
    accountNumber: "",
  });
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/coach/billing");
      if (!res.ok) throw new Error("Failed to fetch billing data");

      const json = await res.json();
      setData(json);
      if (json.bankDetails) {
        setBankDetails(json.bankDetails);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your billing analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
    // Fetch pending payout requests
    const fetchPayoutRequests = async () => {
      try {
        const res = await fetch("/api/coach/payout-requests");
        if (res.ok) {
          const json = await res.json();
          setPendingRequests(json.requests || []);
        }
      } catch (error) {
        console.error("Error fetching payout requests:", error);
      }
    };
    fetchPayoutRequests();
  }, []);

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBank(true);
    try {
      const res = await fetch("/api/coach/billing/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bankDetails),
      });

      if (!res.ok) throw new Error("Failed to save bank details");
      toast.success("Bank details saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save bank details");
    } finally {
      setIsSavingBank(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[calc(100vh-2rem)]">
        <Loader2 className="w-8 h-8 text-primary-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Payout Request Notification Banner */}
      {pendingRequests.filter((r) => r.status === "pending_coach").length >
        0 && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 animate-pulse">
                <Banknote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Payout Ready for Review!
                </h3>
                <p className="text-emerald-100 text-sm mt-0.5">
                  Rs.{" "}
                  {pendingRequests
                    .filter((r) => r.status === "pending_coach")
                    .reduce((sum: number, r: any) => sum + r.totalAmount, 0)
                    .toLocaleString()}{" "}
                  is pending your approval.
                </p>
              </div>
            </div>
            {pendingRequests
              .filter((r) => r.status === "pending_coach")
              .map((req) => (
                <Link
                  key={req._id}
                  href={`/coach/billing/payout-review/${req._id}`}
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-white text-emerald-700 font-bold text-sm rounded-xl hover:bg-emerald-50 transition-colors shadow-sm shrink-0"
                >
                  Review & Confirm
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)]">
          Billing & Analytics
        </h1>
        <p className="text-gray-500 mt-2">
          Track your student enrollments and calculate your lifetime earnings.
        </p>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-indigo-600 mb-1">
                Lifetime Pure Revenue
              </p>
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                Rs.{" "}
                {data?.summary.lifetimeRevenue.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </h3>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center -mt-1 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs text-indigo-500 mt-4 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Net earnings (Fees deducted)
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-emerald-600 mb-1">
                Pending Payout
              </p>
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                Rs.{" "}
                {data?.summary.pendingPayout.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center -mt-1 group-hover:scale-110 transition-transform">
              <Banknote className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-4 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Transferring to your bank soon
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">
                All-Time Enrollments
              </p>
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                {data?.summary.totalEnrolledStudents.toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center -mt-1 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-blue-500 mt-4 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Total students taught
          </p>
        </div>
      </div>

      {/* Course Revenue Grid Box */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Revenue by Course</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Students Enrolled
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Lifetime Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.courseBreakdowns.map((row) => (
                <tr
                  key={row.courseId}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-900">{row.title}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      {row.enrolledStudents} students
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p
                      className={
                        row.revenueGenerated > 0
                          ? "font-bold text-gray-900"
                          : "font-bold text-gray-400"
                      }
                    >
                      Rs.{" "}
                      {row.revenueGenerated.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </td>
                </tr>
              ))}

              {data?.courseBreakdowns.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 px-6 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <BookOpen className="w-12 h-12 text-gray-200 mb-4" />
                      <p className="text-lg font-semibold text-gray-900">
                        No Courses Built Yet
                      </p>
                      <p className="text-sm mt-1 max-w-sm mx-auto">
                        Once you publish a course and a student enrolls, your
                        lifetime revenue matrix will automatically populate
                        here.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank Account Details Form */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
            <Building2 className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Payout Details</h2>
            <p className="text-sm text-gray-500">
              Provide your bank account information to receive your earnings.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBankDetails} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Account Owner Name
              </label>
              <input
                type="text"
                placeholder="Name on bank account"
                value={bankDetails.accountOwnerName}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    accountOwnerName: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Account Number
              </label>
              <input
                type="text"
                placeholder="e.g. 100010001000"
                value={bankDetails.accountNumber}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    accountNumber: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Bank Name
              </label>
              <input
                type="text"
                placeholder="e.g. Commercial Bank"
                value={bankDetails.bankName}
                onChange={(e) =>
                  setBankDetails({ ...bankDetails, bankName: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Bank Branch / Location
              </label>
              <input
                type="text"
                placeholder="e.g. Colombo Main Branch"
                value={bankDetails.bankLocation}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    bankLocation: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSavingBank}
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-500 text-white text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95 min-w-[140px]"
            >
              {isSavingBank ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Details
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
