"use client";

import { useState, useRef, useCallback } from "react";
import {
  Loader2,
  Camera,
  UserCircle2,
  Crown,
  FileUp,
  FileText,
  X,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import ImageCropModal from "@/components/ui/ImageCropModal";

interface CoachRegistrationData {
  name: string;
  email: string;
  dateOfBirth: string;
  fideId: string;
  fideRating: number;
  profilePicture?: File | null;
  profilePictureThumbnail?: File | null;
  cv?: File | null;
  address: string;
  bio: string;
  specializations: string[];
  coachAchievements: string[];
  playerAchievements: string[];
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
  const [profilePicThumbnail, setProfilePicThumbnail] = useState<File | null>(
    null,
  );
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [dobError, setDobError] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState("");
  const [draggingCv, setDraggingCv] = useState(false);

  // Crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageFile, setRawImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset the input so the same file can be re-selected after an error
    e.target.value = "";
    setPhotoError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Only image files are allowed (JPG, PNG, WEBP, etc.)");
      return;
    }

    // Open the crop modal instead of compressing directly
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

      // 1. Compress the MAIN image (max 3MB)
      const compressedMain = await imageCompression(croppedFile, {
        maxSizeMB: 3,
        maxWidthOrHeight: 2048,
        useWebWorker: true,
        fileType: "image/webp",
      });
      setProfilePic(compressedMain as unknown as File);

      // 2. Generate the tiny thumbnail
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

  const handleCvFile = (file: File | undefined) => {
    setCvError("");
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    if (file.type !== "application/pdf" && !isImage) {
      setCvError("Only PDF or image files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setCvError("File size must be under 10MB.");
      return;
    }
    setCvFile(file);
  };

  const calculateAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    updateField("dateOfBirth", selectedDate);

    if (selectedDate) {
      const age = calculateAge(selectedDate);
      if (age < 18) {
        setDobError("You must be at least 18 years old to apply.");
      } else {
        setDobError("");
      }
    } else {
      setDobError("");
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
    if (calculateAge(form.dateOfBirth) < 18) {
      setError("You must be at least 18 years old to apply as a coach.");
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
    if (!form.email.trim()) {
      setError("Email address is required");
      return;
    }
    if (!form.address.trim()) {
      setError("City / Location is required");
      return;
    }
    if (!form.bio.trim()) {
      setError("Short Bio is required");
      return;
    }
    if (!form.specializations.trim()) {
      setError("Specializations are required");
      return;
    }
    if (!form.coachAchievements.trim()) {
      setError("Top achievements as a coach are required");
      return;
    }
    if (!form.playerAchievements.trim()) {
      setError("Top achievements as a player are required");
      return;
    }

    setLoading(true);
    try {
      const data: CoachRegistrationData = {
        name: form.name.trim(),
        email: form.email.trim(),
        dateOfBirth: form.dateOfBirth,
        fideId: form.fideId.trim(),
        fideRating: Number(form.fideRating),
        profilePicture: profilePic,
        profilePictureThumbnail: profilePicThumbnail,
        address: form.address.trim(),
        bio: form.bio.trim(),
        specializations: form.specializations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        coachAchievements: form.coachAchievements
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        playerAchievements: form.playerAchievements
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        cv: cvFile,
      };
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
          <span className="text-sm font-bold text-gray-700">Profile Photo</span>
          <span className="text-xs text-gray-500 mt-1">
            Recommend 1:1 ratio, max 5MB
          </span>
          {/* Inline photo error — shown right below the avatar */}
          {photoError && (
            <div className="flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-xs font-semibold text-red-600">
                {photoError}
              </span>
            </div>
          )}
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
              onChange={handleDobChange}
              max={new Date().toISOString().split("T")[0]} // Prevent selecting future dates visually
              className={`${inputClasses} ${dobError ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""}`}
            />
            {dobError && (
              <p className="text-red-600 text-xs font-semibold mt-1.5 animate-[fade-in-up_0.2s_ease-out]">
                {dobError}
              </p>
            )}
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

        {/* Additional Fields Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-wider">
              Additional Information
            </span>
          </div>
        </div>

        {/* CV Upload */}
        <div className="mb-2">
          <label className={labelClasses}>Upload CV / Resume</label>
          <p className="text-xs text-gray-500 mb-3 -mt-1">
            Profiles with a CV have a{" "}
            <span className="font-bold text-red-600">
              higher chance of approval
            </span>
            . Upload a PDF or image.
          </p>
          <div
            className={`relative flex items-center gap-4 p-4 bg-slate-50 border border-dashed rounded-xl transition-all cursor-pointer group ${draggingCv ? "border-red-400 bg-red-50/40 scale-[1.01]" : "border-gray-200 hover:border-red-300 hover:bg-red-50/30"}`}
            onClick={() => cvInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDraggingCv(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDraggingCv(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDraggingCv(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDraggingCv(false);
              handleCvFile(e.dataTransfer.files?.[0]);
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:border-red-200 transition-colors">
              {cvFile ? (
                <FileText className="w-6 h-6 text-red-500" />
              ) : (
                <FileUp className="w-6 h-6 text-gray-400 group-hover:text-red-400 transition-colors" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {cvFile ? (
                <>
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {cvFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors">
                    {draggingCv
                      ? "Drop your file here"
                      : "Drag & drop or click to upload"}
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF or Image, max 10MB
                  </p>
                </>
              )}
            </div>
            {cvFile && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCvFile(null);
                  setCvError("");
                }}
                className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <input
            type="file"
            ref={cvInputRef}
            accept=".pdf,image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              handleCvFile(file);
            }}
          />
          {cvError && (
            <p className="text-red-600 text-xs font-semibold mt-1.5 animate-[fade-in-up_0.2s_ease-out]">
              {cvError}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClasses}>
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@example.com"
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>
              City / Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Your address"
              className={inputClasses}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClasses}>
              Short Bio <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              placeholder="Tell students about your coaching style and philosophy..."
              rows={3}
              className={`${inputClasses} resize-none`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClasses}>
              Specializations <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.specializations}
              onChange={(e) => updateField("specializations", e.target.value)}
              placeholder="e.g. Openings, Endgames, Tactics (comma separated)"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>
              Top Achievements as Coach <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.coachAchievements}
              onChange={(e) => updateField("coachAchievements", e.target.value)}
              placeholder="One achievement per line..."
              rows={4}
              className={`${inputClasses} resize-none`}
            />
          </div>

          <div>
            <label className={labelClasses}>
              Top Achievements as Player <span className="text-red-500">*</span>
            </label>
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
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 disabled:bg-red-200 disabled:text-red-400 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer text-white text-lg font-extrabold rounded-2xl transition-all duration-300 shadow-[0_8px_20px_rgba(220,38,38,0.25)] hover:shadow-[0_12px_25px_rgba(220,38,38,0.35)] hover:-translate-y-1"
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
