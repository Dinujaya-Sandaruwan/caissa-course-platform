"use client";

import { useState, useRef } from "react";
import { Loader2, Camera, UserCircle2, Crown } from "lucide-react";

interface CoachRegistrationData {
  name: string;
  email?: string;
  dateOfBirth: string;
  fideId: string;
  fideRating: number;
  profilePicture?: File | null;
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
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
      setError("");
    }
  };

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
        profilePicture: profilePic,
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
    "w-full px-5 py-3.5 bg-slate-50 border border-gray-100 rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all";
  const labelClasses = "block text-sm font-bold text-gray-700 mb-2";

  return (
    <div className="w-full max-w-2xl mx-auto animate-[fade-in-up_0.4s_ease-out]">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-red-600 shadow-xl shadow-red-600/20 mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
          <Crown className="w-10 h-10 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
          Complete Your Profile
        </h1>
        <p className="text-gray-500 mt-3 text-lg">
          Tell us about your chess journey and credentials
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="relative w-32 h-32 rounded-full mb-3 cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-300 bg-slate-50 overflow-hidden transition-all group-hover:border-red-400 group-hover:bg-red-50 flex items-center justify-center shadow-inner">
              {profilePicPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profilePicPreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle2 className="w-16 h-16 text-gray-400 group-hover:text-red-400 transition-colors" />
              )}
            </div>

            <div
              className={`absolute bottom-0 right-0 p-2 rounded-full border-2 border-white shadow-md transition-colors ${profilePicPreview ? "bg-white text-gray-700 hover:text-red-600" : "bg-red-600 text-white hover:bg-red-700"}`}
            >
              <Camera className="w-5 h-5" />
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          <span className="text-sm font-bold text-gray-700">Profile Photo</span>
          <span className="text-xs text-gray-500 mt-1">
            Recommend 1:1 ratio, max 5MB
          </span>
        </div>

        {/* Core Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className={labelClasses}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Magnus Carlsen"
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
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-wider">
              Optional Information
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClasses}>Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@example.com"
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>City / Location</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Your address"
              className={inputClasses}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClasses}>Short Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              placeholder="Tell students about your coaching style and philosophy..."
              rows={3}
              className={`${inputClasses} resize-none`}
            />
          </div>

          <div className="sm:col-span-2">
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
              rows={4}
              className={`${inputClasses} resize-none`}
            />
          </div>

          <div>
            <label className={labelClasses}>Top Achievements as Player</label>
            <textarea
              value={form.playerAchievements}
              onChange={(e) =>
                updateField("playerAchievements", e.target.value)
              }
              placeholder="One achievement per line..."
              rows={4}
              className={`${inputClasses} resize-none`}
            />
          </div>
        </div>

        {error && (
          <div className="px-5 py-4 bg-red-50 border border-red-100 rounded-xl mt-6">
            <p className="text-red-600 text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 disabled:bg-red-200 disabled:text-red-400 disabled:shadow-none disabled:cursor-not-allowed text-white text-lg font-extrabold rounded-2xl transition-all duration-300 shadow-[0_8px_20px_rgba(220,38,38,0.25)] hover:shadow-[0_12px_25px_rgba(220,38,38,0.35)] hover:-translate-y-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Submitting Application...
              </>
            ) : (
              "Submit Application"
            )}
          </button>
        </div>

        <p className="text-gray-400 text-sm font-medium text-center mt-4">
          Your application will be securely processed and reviewed by our
          verification team.
        </p>
      </form>
    </div>
  );
}
