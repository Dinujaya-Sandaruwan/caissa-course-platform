"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Shield,
  Filter,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";

interface AuditLogEntry {
  _id: string;
  managerId: string;
  managerName: string;
  action: string;
  category: string;
  targetId?: string;
  targetName?: string;
  details?: string;
  createdAt: string;
}

interface ManagerOption {
  id: string;
  name: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "All Activities",
  categories: "Categories",
  coaches: "Coaches",
  courses: "Courses",
  enrollments: "Enrollments",
  students: "Students",
  managers: "Managers",
  messages: "Messages",
  payments: "Payments",
  "platform-fees": "Platform Fees",
};

const CATEGORY_COLORS: Record<string, string> = {
  categories: "bg-purple-100 text-purple-700",
  coaches: "bg-blue-100 text-blue-700",
  courses: "bg-emerald-100 text-emerald-700",
  enrollments: "bg-amber-100 text-amber-700",
  students: "bg-pink-100 text-pink-700",
  managers: "bg-red-100 text-red-700",
  messages: "bg-cyan-100 text-cyan-700",
  payments: "bg-green-100 text-green-700",
  "platform-fees": "bg-orange-100 text-orange-700",
};

export default function ManagerActivityLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState("all");
  const [managerId, setManagerId] = useState("all");
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "30",
        category,
        managerId,
      });
      const res = await fetch(`/api/manager/audit-log?${params}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      const json = await res.json();
      setLogs(json.logs);
      setTotal(json.total);
      setTotalPages(json.totalPages);
      if (json.managers) setManagers(json.managers);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load activity log.");
    } finally {
      setLoading(false);
    }
  }, [page, category, managerId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [category, managerId]);

  const filteredLogs = searchTerm
    ? logs.filter(
        (log) =>
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.managerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.targetName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : logs;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatFullTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary-red" />
          Activity Log
        </h1>
        <p className="text-gray-500 mt-2">
          Complete audit trail of all manager actions on the platform.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search actions, managers, targets…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Manager Filter */}
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
          >
            <option value="all">All Managers</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <span className="bg-gray-100 px-2.5 py-1 rounded-lg">
          {total.toLocaleString()} total actions
        </span>
        {category !== "all" && (
          <span
            className={`px-2.5 py-1 rounded-lg ${CATEGORY_COLORS[category] || "bg-gray-100 text-gray-700"}`}
          >
            {CATEGORY_LABELS[category]}
          </span>
        )}
      </div>

      {/* Log Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-red animate-spin" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">
          <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-900 font-bold text-lg">No activity yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Manager actions will appear here as they happen.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filteredLogs.map((log) => (
              <div
                key={log._id}
                className="px-6 py-4 hover:bg-gray-50/50 transition-colors flex items-start gap-4"
              >
                {/* Manager initials avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                  {log.managerName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-bold">{log.managerName}</span>{" "}
                        <span className="text-gray-600">{log.action}</span>
                      </p>
                      {log.details && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {log.details}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${CATEGORY_COLORS[log.category] || "bg-gray-100 text-gray-600"}`}
                      >
                        {log.category}
                      </span>
                      <span
                        className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1"
                        title={formatFullTime(log.createdAt)}
                      >
                        <Clock className="w-3 h-3" />
                        {formatTime(log.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
