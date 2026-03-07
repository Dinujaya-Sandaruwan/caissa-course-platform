"use client";

import { useState, useRef, useCallback } from "react";
import { UserPlus, Loader2, Camera, UserCircle2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import ImageCropModal from "@/components/ui/ImageCropModal";

interface StudentRegistrationData {
  name: string;
  nickname?: string;
  email?: string;
  dateOfBirth: string;
  gender: string;
  fideId?: string;
  skillLevel?: string;
  city?: string;
  preferredLanguage?: string;
  parentName?: string;
  parentDateOfBirth?: string;
  profilePicture?: File | null;
  profilePictureThumbnail?: File | null;
}

interface StudentRegistrationFormProps {
  onSubmit: (data: StudentRegistrationData) => Promise<void>;
  initialData?: {
    name?: string;
    email?: string;
    profilePhoto?: string;
    profilePhotoThumbnail?: string;
  };
}

export default function StudentRegistrationForm({
  onSubmit,
  initialData,
}: StudentRegistrationFormProps) {
  const [form, setForm] = useState<StudentRegistrationData>({
    name: initialData?.name || "",
    nickname: "",
    email: initialData?.email || "",
    dateOfBirth: "",
    gender: "",
    fideId: "",
    skillLevel: "beginner",
    city: "",
    preferredLanguage: "en",
    parentName: "",
    parentDateOfBirth: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Profile picture state
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicThumbnail, setProfilePicThumbnail] = useState<File | null>(
    null,
  );
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    initialData?.profilePhotoThumbnail || initialData?.profilePhoto || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState("");
  const [compressing, setCompressing] = useState(false);

  // Crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageFile, setRawImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    setPhotoError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Only image files are allowed");
      return;
    }

    setRawImageFile(file);
    setCropModalOpen(true);
  };

  const handleCropComplete = useCallback(async (croppedBlob: Blob) => {
    setCropModalOpen(false);
    setRawImageFile(null);

    try {
      setCompressing(true);
      const croppedFile = new File([croppedBlob], "cropped-photo.webp", {
        type: "image/webp",
      });

      const compressedMain = await imageCompression(croppedFile, {
        maxSizeMB: 3,
        maxWidthOrHeight: 2048,
        useWebWorker: true,
        fileType: "image/webp",
      });
      setProfilePic(compressedMain as unknown as File);

      const thumbnail = await imageCompression(croppedFile, {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 256,
        useWebWorker: true,
        fileType: "image/webp",
      });

      setProfilePicThumbnail(thumbnail as unknown as File);
      setProfilePicPreview(URL.createObjectURL(thumbnail));
    } catch {
      setPhotoError("Failed to process the image. Please try another file.");
    } finally {
      setCompressing(false);
    }
  }, []);

  const handleCropCancel = useCallback(() => {
    setCropModalOpen(false);
    setRawImageFile(null);
  }, []);

  const calculateAge = (dateString: string) => {
    if (!dateString) return 999; // Default to assumed adult if no date
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isUnder13 = form.dateOfBirth
    ? calculateAge(form.dateOfBirth) < 13
    : false;

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // If there is no existing profile photo AND no newly uploaded one, block submission
    if (!profilePicPreview && (!profilePic || !profilePicThumbnail)) {
      setError("Profile picture is required");
      setPhotoError("Please upload a profile picture");
      return;
    }

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

      if (profilePic && profilePicThumbnail) {
        data.profilePicture = profilePic;
        data.profilePictureThumbnail = profilePicThumbnail;
      }
      if (form.nickname?.trim()) data.nickname = form.nickname.trim();
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
    "w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="w-full animate-[fade-in-up_0.4s_ease-out]">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-4">
          <UserPlus className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-outfit)]">
          Create Your Account
        </h1>
        <p className="text-gray-500 mt-2">
          Fill in your details to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="relative w-32 h-32 rounded-full mb-3 cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div
              className={`absolute inset-0 rounded-full border-2 border-dashed ${photoError ? "border-red-400 bg-red-50" : "border-gray-300 bg-slate-50"} overflow-hidden transition-all group-hover:border-red-400 group-hover:bg-red-50 flex items-center justify-center shadow-inner`}
            >
              {compressing ? (
                <div className="flex flex-col items-center gap-1">
                  <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
                  <span className="text-[10px] text-red-400 font-bold">
                    Compressing...
                  </span>
                </div>
              ) : profilePicPreview ? (
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
          <span className="text-sm font-bold text-gray-700">
            Profile Photo <span className="text-red-500">*</span>
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Recommend 1:1 ratio, max 5MB
          </span>
          {photoError && (
            <div className="flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-xs font-semibold text-red-600">
                {photoError}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-1">
            <label className={labelClasses}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Athawuda Mudiyanselage Dinujaya Sandaruwan Bandara"
              className={inputClasses}
              autoFocus
            />
          </div>

          <div className="sm:col-span-1">
            <label className={labelClasses}>Nickname</label>
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => updateField("nickname", e.target.value)}
              placeholder="e.g. Dinujaya"
              className={inputClasses}
            />
            <p className="text-xs text-gray-500 mt-1.5 font-medium">
              This is the name we&apos;ll call you around the learning platform.
            </p>
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
            <label className={labelClasses}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@example.com"
              className={inputClasses}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClasses}>
              Gender <span className="text-red-500">*</span>
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
                      ? "bg-red-50 border-red-500 text-red-600"
                      : "bg-white border-gray-300 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Parent Fields (conditional base on age) */}
          {isUnder13 && (
            <div className="sm:col-span-2 space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-700 text-xs font-medium uppercase tracking-wider">
                Parent / Guardian Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>
                    Parent Name <span className="text-red-500">*</span>
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
                    Parent Date of Birth <span className="text-red-500">*</span>
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
            </div>
          )}

          {/* Optional Fields Divider */}
          <div className="sm:col-span-2 relative py-2">
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
            <label className={labelClasses}>FIDE ID</label>
            <input
              type="text"
              value={form.fideId}
              onChange={(e) => updateField("fideId", e.target.value)}
              placeholder="e.g. 123456789"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>City / Location</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="e.g. Colombo"
              className={inputClasses}
            />
          </div>

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

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-red-200 disabled:text-red-400 disabled:shadow-none disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-600/20 hover:shadow-red-600/30 mt-2"
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

      {/* Image Crop Modal */}
      {cropModalOpen && rawImageFile && (
        <ImageCropModal
          imageFile={rawImageFile}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
