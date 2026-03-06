"use client";

import { useState, useEffect } from "react";
import {
  FolderOpen,
  Plus,
  Trash2,
  RefreshCw,
  BookOpen,
  AlertTriangle,
  Check,
  X,
  Loader2,
} from "lucide-react";

interface CategoryItem {
  _id: string;
  name: string;
  courseCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/manager/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/manager/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCategories((prev) =>
        [...prev, { ...data, courseCount: 0 }].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      setNewName("");
    } catch (err: unknown) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create category",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/manager/categories?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setDeletingId(null);
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
                <FolderOpen className="w-7 h-7 text-white" />
              </div>
              Categories
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
              Manage course categories. Coaches select these when creating
              courses.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
              {categories.length} categories
            </div>
            <button
              onClick={fetchCategories}
              className="group flex items-center gap-2.5 px-6 py-3 bg-white text-gray-900 border border-transparent text-sm font-bold rounded-full transition-all duration-300 shadow-lg cursor-pointer hover:scale-105 active:scale-95 hover:bg-gray-100"
            >
              <RefreshCw className="w-5 h-5 transition-transform group-hover:rotate-180" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Add Category Form */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5"
      >
        <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-red-500" />
          Add New Category
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setCreateError("");
            }}
            placeholder="e.g. Endgame, Opening Theory, Tactics..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 shadow-[0_8px_20px_rgba(220,38,38,0.25)] hover:shadow-[0_12px_25px_rgba(220,38,38,0.35)] hover:-translate-y-0.5 cursor-pointer disabled:cursor-not-allowed"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </button>
        </div>
        {createError && (
          <p className="text-red-500 text-sm font-medium mt-3 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {createError}
          </p>
        )}
      </form>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-red-100 rounded-full mb-6" />
          <p className="text-gray-500 font-medium">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FolderOpen className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mb-2 font-[family-name:var(--font-outfit)] tracking-tight">
            No Categories Yet
          </h3>
          <p className="text-gray-500 text-lg">
            Create your first category using the form above.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 overflow-hidden">
          <div className="grid gap-0 divide-y divide-gray-100">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {cat.courseCount} course{cat.courseCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {deleteConfirmId === cat._id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 mr-1">
                      Delete?
                    </span>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      disabled={!!deletingId}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {deletingId === cat._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      disabled={!!deletingId}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(cat._id)}
                    disabled={cat.courseCount > 0}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      cat.courseCount > 0
                        ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                        : "text-red-500 bg-red-50 hover:bg-red-100"
                    }`}
                    title={
                      cat.courseCount > 0
                        ? "Cannot delete — category is used by courses"
                        : "Delete category"
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
