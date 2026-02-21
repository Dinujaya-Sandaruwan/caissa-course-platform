"use client";

import { useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";

interface CoachRegistrationData {
  name: string;
  email?: string;
  dateOfBirth: string;
  fideId: string;
  fideRating: number;
  address?: string;
  bio?: string;
  specializations?: string[];
  coachAchievements?: string[];
  playerAchievements?: string[];
}

interface CoachRegistrationFormProps {
  onSubmit: (data: CoachRegistrationData) => Promise<void>;
}

export default function CoachRegistrationForm({
  onSubmit,
}: CoachRegistrationFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    fideId: "",
    fideRating: "",
    address: "",
    bio: "",
    specializations: "",
    coachAchievements: "",
    playerAchievements: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.dateOfBirth) {
      setError("Date of birth is required");
      return;
    }
    if (!form.fideId.trim()) {
      setError("FIDE ID is required");
      return;
    }
    if (!form.fideRating || isNaN(Number(form.fideRating))) {
      setError("A valid FIDE Rating is required");
      return;
    }

    setLoading(true);
    try {
      const data: CoachRegistrationData = {
        name: form.name.trim(),
        dateOfBirth: form.dateOfBirth,
        fideId: form.fideId.trim(),
        fideRating: Number(form.fideRating),
      };
      if (form.email?.trim()) data.email = form.email.trim();
      if (form.address?.trim()) data.address = form.address.trim();
      if (form.bio?.trim()) data.bio = form.bio.trim();
      if (form.specializations?.trim()) {
        data.specializations = form.specializations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (form.coachAchievements?.trim()) {
        data.coachAchievements = form.coachAchievements
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (form.playerAchievements?.trim()) {
        data.playerAchievements = form.playerAchievements
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      await onSubmit(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-4">
          <GraduationCap className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-outfit)]">
          Coach Application
        </h1>
        <p className="text-gray-500 mt-2">
          Tell us about yourself to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClasses}>
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Your full name"
            className={inputClasses}
            autoFocus
          />
        </div>

        <div>
          <label className={labelClasses}>
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => updateField("dateOfBirth", e.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses}>
              FIDE ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.fideId}
              onChange={(e) => updateField("fideId", e.target.value)}
              placeholder="e.g. 123456789"
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>
              FIDE Rating <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.fideRating}
              onChange={(e) => updateField("fideRating", e.target.value)}
              placeholder="e.g. 2200"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Optional Fields Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-gray-400 uppercase tracking-wider">
              Optional Information
            </span>
          </div>
        </div>

        <div>
          <label className={labelClasses}>Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Your address"
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => updateField("bio", e.target.value)}
            placeholder="Tell students about yourself..."
            rows={3}
            className={`${inputClasses} resize-none`}
          />
        </div>

        <div>
          <label className={labelClasses}>Specializations</label>
          <input
            type="text"
            value={form.specializations}
            onChange={(e) => updateField("specializations", e.target.value)}
            placeholder="e.g. Openings, Endgames, Tactics (comma separated)"
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Top Achievements as Coach</label>
          <textarea
            value={form.coachAchievements}
            onChange={(e) => updateField("coachAchievements", e.target.value)}
            placeholder="One achievement per line..."
            rows={2}
            className={`${inputClasses} resize-none`}
          />
        </div>

        <div>
          <label className={labelClasses}>Top Achievements as Player</label>
          <textarea
            value={form.playerAchievements}
            onChange={(e) => updateField("playerAchievements", e.target.value)}
            placeholder="One achievement per line..."
            rows={2}
            className={`${inputClasses} resize-none`}
          />
        </div>

        <div>
          <label className={labelClasses}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="you@example.com"
            className={inputClasses}
          />
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-600/20 hover:shadow-red-600/30 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting Application...
            </>
          ) : (
            "Submit Application"
          )}
        </button>

        <p className="text-gray-400 text-xs text-center mt-2">
          Your application will be reviewed by our team. You&apos;ll be notified
          once approved.
        </p>
      </form>
    </div>
  );
}
