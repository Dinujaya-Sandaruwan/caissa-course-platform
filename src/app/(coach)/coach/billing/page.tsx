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
} from "lucide-react";
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

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/coach/billing");
      if (!res.ok) throw new Error("Failed to fetch billing data");

      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your billing analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

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
    </div>
  );
}
