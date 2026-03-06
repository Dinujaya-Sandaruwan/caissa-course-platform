"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Shield } from "lucide-react";

interface Manager {
  _id: string;
  name: string;
  whatsappNumber: string;
  status: "active" | "suspended";
  createdAt: string;
}

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const res = await fetch("/api/manager/managers");
      if (!res.ok) throw new Error("Failed to fetch managers");
      const data = await res.json();
      setManagers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/manager/managers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          whatsappNumber: newPhone,
          username: newUsername,
          password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsAddModalOpen(false);
      setNewName("");
      setNewPhone("");
      setNewUsername("");
      setNewPassword("");
      fetchManagers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add manager");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    currentStatus: "active" | "suspended",
  ) => {
    try {
      const action = currentStatus === "active" ? "suspend" : "activate";
      const res = await fetch(`/api/manager/managers/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchManagers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const filteredManagers = managers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.whatsappNumber.includes(searchQuery),
  );

  return (
    <div className="space-y-8 relative z-10">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-[2.5rem] p-8 md:p-12 mb-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/10 text-white/90 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 backdrop-blur-md">
                Caissa Course Platform
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-white font-[family-name:var(--font-outfit)] tracking-tight mb-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/10">
                <Shield className="w-7 h-7 text-white" />
              </div>
              Platform Managers
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
              Manage admin access and permissions.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="group flex items-center gap-2.5 px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-full transition-all duration-300 shadow-[0_8px_20px_rgba(220,38,38,0.25)] hover:shadow-[0_12px_25px_rgba(220,38,38,0.35)] hover:-translate-y-0.5 cursor-pointer ring-1 ring-red-500/50"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Add Manager
          </button>
        </div>
      </div>

      {/* Filters/Search */}
      <div className="bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-900/5 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  Manager
                </th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  WhatsApp
                </th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  Status
                </th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  Joined
                </th>
                <th className="px-8 py-5 right text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 w-full flex-col items-center"
                  >
                    <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Loading managers...
                  </td>
                </tr>
              ) : filteredManagers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No managers found.
                  </td>
                </tr>
              ) : (
                filteredManagers.map((manager) => (
                  <tr
                    key={manager._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold text-sm shadow-sm group-hover:bg-red-600 group-hover:text-white transition-colors">
                          {manager.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          {manager.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-500">
                      +{manager.whatsappNumber}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          manager.status === "active"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200/50"
                            : "bg-red-50 text-red-600 border border-red-200/50"
                        }`}
                      >
                        {manager.status.charAt(0).toUpperCase() +
                          manager.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-500">
                      {new Date(manager.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          handleStatusChange(manager._id, manager.status)
                        }
                        className={`text-sm px-4 py-2 rounded-lg font-bold transition-all ${
                          manager.status === "active"
                            ? "text-red-500 hover:bg-red-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {manager.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Manager Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-8 py-6 flex justify-between items-center">
              <h3 className="text-2xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
                Add New Manager
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddManager} className="px-8 pb-8 space-y-5">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-2xl border border-red-100/50">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium text-gray-900 transition-all"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    +94
                  </span>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium text-gray-900 transition-all"
                    placeholder="771234567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium text-gray-900 transition-all"
                  placeholder="e.g. manager123"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium text-gray-900 transition-all"
                  placeholder="Secure password"
                />
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !newName ||
                    !newPhone ||
                    !newUsername ||
                    !newPassword
                  }
                  className="flex-1 px-4 py-3 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-500 disabled:opacity-50 shadow-[0_4px_14px_rgba(220,38,38,0.25)] transition-all transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? "Adding..." : "Add Manager"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
