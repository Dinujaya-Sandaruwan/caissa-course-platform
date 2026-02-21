"use client";

import { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";

interface StudentRegistrationData {
  name: string;
  email?: string;
  dateOfBirth: string;
  gender: string;
  fideId?: string;
  skillLevel?: string;
  city?: string;
  preferredLanguage?: string;
  parentName?: string;
  parentDateOfBirth?: string;
}

interface StudentRegistrationFormProps {
  onSubmit: (data: StudentRegistrationData) => Promise<void>;
}

export default function StudentRegistrationForm({
  onSubmit,
}: StudentRegistrationFormProps) {
  const [form, setForm] = useState<StudentRegistrationData>({
    name: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    fideId: "",
    skillLevel: "beginner",
    city: "",
    preferredLanguage: "en",
    parentName: "",
    parentDateOfBirth: "",
  });
  const [isUnder13, setIsUnder13] = useState(false);
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
    if (!form.gender) {
      setError("Gender is required");
      return;
    }
    if (isUnder13 && !form.parentName?.trim()) {
      setError("Parent name is required for players under 13");
      return;
    }
    if (isUnder13 && !form.parentDateOfBirth) {
      setError("Parent date of birth is required for players under 13");
      return;
    }

    setLoading(true);
    try {
      const data: StudentRegistrationData = {
        name: form.name.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
      };
      if (form.email?.trim()) data.email = form.email.trim();
      if (form.fideId?.trim()) data.fideId = form.fideId.trim();
      if (form.skillLevel && form.skillLevel !== "beginner")
        data.skillLevel = form.skillLevel;
      if (form.city?.trim()) data.city = form.city.trim();
      if (form.preferredLanguage && form.preferredLanguage !== "en")
        data.preferredLanguage = form.preferredLanguage;
      if (isUnder13) {
        data.parentName = form.parentName?.trim();
        data.parentDateOfBirth = form.parentDateOfBirth;
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
    "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 mb-4">
          <UserPlus className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-outfit)]">
          Create Your Account
        </h1>
        <p className="text-gray-400 mt-2">
          Fill in your details to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Required Fields */}
        <div>
          <label className={labelClasses}>
            Name <span className="text-red-400">*</span>
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
            Date of Birth <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => updateField("dateOfBirth", e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>
            Gender <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-3">
            {[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField("gender", option.value)}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  form.gender === option.value
                    ? "bg-red-600/20 border-red-500 text-red-400"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Under 13 Toggle */}
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isUnder13}
              onChange={(e) => setIsUnder13(e.target.checked)}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-red-500 focus:ring-red-500 focus:ring-offset-0 accent-red-500"
            />
            <span className="text-gray-300 text-sm">
              I am under 13 years old
            </span>
          </label>
        </div>

        {/* Parent Fields (conditional) */}
        {isUnder13 && (
          <div className="space-y-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
            <p className="text-yellow-400 text-xs font-medium uppercase tracking-wider">
              Parent / Guardian Details
            </p>
            <div>
              <label className={labelClasses}>
                Parent Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.parentName}
                onChange={(e) => updateField("parentName", e.target.value)}
                placeholder="Parent's full name"
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>
                Parent Date of Birth <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.parentDateOfBirth}
                onChange={(e) =>
                  updateField("parentDateOfBirth", e.target.value)
                }
                className={inputClasses}
              />
            </div>
          </div>
        )}

        {/* Optional Fields Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-gray-900 text-gray-500 uppercase tracking-wider">
              Optional Information
            </span>
          </div>
        </div>

        <div>
          <label className={labelClasses}>FIDE ID</label>
          <input
            type="text"
            value={form.fideId}
            onChange={(e) => updateField("fideId", e.target.value)}
            placeholder="e.g. 123456789"
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses}>Skill Level</label>
            <select
              value={form.skillLevel}
              onChange={(e) => updateField("skillLevel", e.target.value)}
              className={inputClasses}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div>
            <label className={labelClasses}>Language</label>
            <select
              value={form.preferredLanguage}
              onChange={(e) => updateField("preferredLanguage", e.target.value)}
              className={inputClasses}
            >
              <option value="en">English</option>
              <option value="si">Sinhala</option>
              <option value="ta">Tamil</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClasses}>City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
            placeholder="e.g. Colombo"
            className={inputClasses}
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
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-600/20 hover:shadow-red-600/30 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </div>
  );
}
