"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Loader2,
  TrendingUp,
  Users,
  Wallet,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface CourseBreakdown {
  courseId: string;
  title: string;
  coachName: string;
  enrollmentCount: number;
  grossRevenue: number;
  platformRevenue: number;
}

interface MonthData {
  key: string;
  label: string;
  year: number;
  month: number;
  grossRevenue: number;
  platformRevenue: number;
  coachPayouts: number;
  developerPayouts: number;
  netProfit: number;
  enrollmentCount: number;
  courses: CourseBreakdown[];
}

interface LifetimeData {
  grossRevenue: number;
  platformRevenue: number;
  coachPayouts: number;
  developerPayouts: number;
  netProfit: number;
  totalEnrollments: number;
}

interface RevenueData {
  lifetime: LifetimeData;
  months: MonthData[];
}

export default function ManagerRevenueBreakdownPage() {
  const router = useRouter();
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/manager/payments/revenue");
        if (!res.ok) throw new Error("Failed to fetch revenue data");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load revenue data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, []);

  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const fmt = (n: number) =>
    `Rs. ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

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
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link
          href="/manager/payments"
          className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Payments
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)]">
          Financial Ledger
        </h1>
        <p className="text-sm text-gray-500">
          Comprehensive month-by-month financial overview of the platform.
        </p>
      </div>

      {/* Lifetime Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Gross Revenue
          </p>
          <p className="text-xl font-extrabold text-gray-900">
            {fmt(data.lifetime.grossRevenue)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">
            Platform Revenue
          </p>
          <p className="text-xl font-extrabold text-emerald-700">
            {fmt(data.lifetime.platformRevenue)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-white border border-red-100 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">
            Coach Payouts
          </p>
          <p className="text-xl font-extrabold text-red-700">
            {fmt(data.lifetime.coachPayouts)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
            Developer Payouts
          </p>
          <p className="text-xl font-extrabold text-blue-700">
            {fmt(data.lifetime.developerPayouts)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">
            Net Profit
          </p>
          <p className="text-xl font-extrabold text-amber-700">
            {fmt(data.lifetime.netProfit)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-violet-50 to-white border border-violet-100 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1">
            Total Enrollments
          </p>
          <p className="text-xl font-extrabold text-violet-700">
            {data.lifetime.totalEnrollments.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Monthly Breakdown</h2>

        {data.months.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-500 font-medium">
              No enrollment data available yet.
            </p>
          </div>
        ) : (
          data.months.map((month) => {
            const isExpanded = expandedMonths.has(month.key);
            return (
              <div
                key={month.key}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Month Header — clickable */}
                <button
                  onClick={() => toggleMonth(month.key)}
                  className="w-full p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {month.label}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {month.enrollmentCount} enrollments
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Quick stats */}
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Gross
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {fmt(month.grossRevenue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                          Platform
                        </p>
                        <p className="text-sm font-bold text-emerald-700">
                          {fmt(month.platformRevenue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                          Net Profit
                        </p>
                        <p className="text-sm font-bold text-amber-700">
                          {fmt(month.netProfit)}
                        </p>
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-6 border-t border-gray-100">
                    {/* Financial Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Banknote className="w-4 h-4 text-gray-400" />
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Gross Revenue
                          </p>
                        </div>
                        <p className="text-lg font-extrabold text-gray-900">
                          {fmt(month.grossRevenue)}
                        </p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                            Platform Cut
                          </p>
                        </div>
                        <p className="text-lg font-extrabold text-emerald-700">
                          {fmt(month.platformRevenue)}
                        </p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-red-400" />
                          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                            Coach Payouts
                          </p>
                        </div>
                        <p className="text-lg font-extrabold text-red-700">
                          {fmt(month.coachPayouts)}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Wallet className="w-4 h-4 text-blue-400" />
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                            Developer Cut
                          </p>
                        </div>
                        <p className="text-lg font-extrabold text-blue-700">
                          {fmt(month.developerPayouts)}
                        </p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-amber-500" />
                          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                            Net Profit
                          </p>
                        </div>
                        <p className="text-lg font-extrabold text-amber-700">
                          {fmt(month.netProfit)}
                        </p>
                      </div>
                    </div>

                    {/* Top Courses Table */}
                    {month.courses.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          Top Contributing Courses
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[550px]">
                            <thead>
                              <tr className="bg-gray-50/80">
                                <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  Course
                                </th>
                                <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  Coach
                                </th>
                                <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                                  Enrollments
                                </th>
                                <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                                  Gross
                                </th>
                                <th className="py-3 px-4 text-[10px] font-bold text-emerald-400 uppercase tracking-widest text-right">
                                  Platform Cut
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {month.courses.map((c) => (
                                <tr
                                  key={c.courseId}
                                  className="hover:bg-gray-50/50 transition-colors"
                                >
                                  <td className="py-3 px-4">
                                    <Link
                                      href={`${baseUrl}courses/${c.courseId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                                    >
                                      {c.title}
                                      <ExternalLink className="w-3 h-3" />
                                    </Link>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600">
                                    {c.coachName}
                                  </td>
                                  <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                                    {c.enrollmentCount}
                                  </td>
                                  <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                                    {fmt(c.grossRevenue)}
                                  </td>
                                  <td className="py-3 px-4 text-sm font-bold text-emerald-700 text-right">
                                    {fmt(c.platformRevenue)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
