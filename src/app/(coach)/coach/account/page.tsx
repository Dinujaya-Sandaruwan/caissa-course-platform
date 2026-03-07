"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Camera,
  UserCircle2,
  Phone,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import ImageCropModal from "@/components/ui/ImageCropModal";
import PhoneInput from "@/components/ui/PhoneInput";
import toast from "react-hot-toast";

type ProfileData = {
  name: string;
  nickname: string;
  email: string;
  address: string;
  bio: string;
  specializations: string[];
  whatsappNumber: string;
  profilePhotoThumbnail?: string;
};

export default function CoachAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<ProfileData>({
    name: "",
    nickname: "",
    email: "",
    address: "",
    bio: "",
    specializations: [],
    whatsappNumber: "",
  });

  // Profile Picture State
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicThumbnail, setProfilePicThumbnail] = useState<File | null>(
    null,
  );
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageFile, setRawImageFile] = useState<File | null>(null);

  // Phone Change State
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [phoneStep, setPhoneStep] = useState<
    "initial" | "verify_current" | "enter_new" | "verify_new"
  >("initial");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/coach/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();

      setForm({
        name: data.user.name || "",
        nickname: data.user.nickname || "",
        email: data.user.email || "",
        address: data.coachProfile?.address || "",
        bio: data.coachProfile?.bio || "",
        specializations: data.coachProfile?.specializations || [],
        whatsappNumber: data.user.whatsappNumber || "",
      });
      if (data.user.profilePhotoThumbnail) {
        setProfilePicPreview(data.user.profilePhotoThumbnail);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  // --- Image Crop Logic ---
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
      setPhotoError("");
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

  const updateField = (field: keyof ProfileData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Name is required");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("email", form.email.trim());
      formData.append("address", form.address.trim());
      formData.append("bio", form.bio.trim());
      formData.append("specializations", JSON.stringify(form.specializations));

      if (profilePic && profilePicThumbnail) {
        formData.append("profilePicture", profilePic);
        formData.append("profilePictureThumbnail", profilePicThumbnail);
      }

      const res = await fetch("/api/coach/profile", {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
      toast.error(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  // --- Phone Change Logic ---
  const startPhoneChange = async () => {
    setPhoneLoading(true);
    try {
      const res = await fetch("/api/user/phone/send-current-otp", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setPhoneStep("verify_current");
      setPhoneOtp("");
      toast.success("OTP sent to your current number");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPhoneLoading(false);
    }
  };

  const verifyCurrentOtp = async () => {
    setPhoneLoading(true);
    try {
      const res = await fetch("/api/user/phone/verify-current-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: phoneOtp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      setPhoneStep("enter_new");
      setPhoneOtp("");
      toast.success("Verified! Enter your new number.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPhoneLoading(false);
    }
  };

  const sendNewOtp = async () => {
    if (!newPhoneNumber.trim()) return toast.error("Enter a new number");
    setPhoneLoading(true);
    try {
      const formattedNumber = newPhoneNumber.startsWith("+")
        ? newPhoneNumber.slice(1)
        : newPhoneNumber;

      const res = await fetch("/api/user/phone/send-new-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newWhatsappNumber: formattedNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setPhoneStep("verify_new");
      setPhoneOtp("");
      toast.success(`OTP sent to ${newPhoneNumber}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPhoneLoading(false);
    }
  };

  const verifyNewOtp = async () => {
    setPhoneLoading(true);
    try {
      const formattedNumber = newPhoneNumber.startsWith("+")
        ? newPhoneNumber.slice(1)
        : newPhoneNumber;

      const res = await fetch("/api/user/phone/verify-new-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newWhatsappNumber: formattedNumber,
          otp: phoneOtp,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      setForm((prev) => ({ ...prev, whatsappNumber: data.newWhatsappNumber }));
      setIsChangingPhone(false);
      setPhoneStep("initial");
      toast.success("Mobile number updated successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPhoneLoading(false);
    }
  };

  const inputClasses =
    "w-full px-5 py-3.5 bg-white border border-gray-200 shadow-sm rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all";
  const labelClasses = "block text-sm font-bold text-gray-700 mb-2";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-[fade-in-up_0.4s_ease-out]">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
          Account Settings
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Manage your profile details and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Col: Main Profile Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-outfit)]">
              General Information
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6 mb-8">
                <div
                  className="relative w-28 h-28 rounded-full cursor-pointer group shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-300 bg-slate-50 overflow-hidden transition-all group-hover:border-red-400 group-hover:bg-red-50 flex items-center justify-center shadow-inner">
                    {compressing ? (
                      <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
                    ) : profilePicPreview ? (
                      <img
                        src={profilePicPreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover group-hover:opacity-75"
                      />
                    ) : (
                      <UserCircle2 className="w-12 h-12 text-gray-400 group-hover:text-red-400 transition-colors" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 p-2 rounded-full border-2 border-white shadow-md bg-red-600 text-white group-hover:bg-red-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-center sm:text-left pt-2">
                  <h3 className="font-bold text-gray-900">Profile Photo</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Recommend 1:1 ratio, max 5MB. Click the avatar to upload a
                    new one.
                  </p>
                  {photoError && (
                    <p className="text-xs font-semibold text-red-600 mt-2 bg-red-50 inline-block px-2 py-1 rounded">
                      {photoError}
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className={labelClasses}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClasses}>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClasses}>City / Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClasses}>Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    rows={4}
                    className={`${inputClasses} resize-none`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClasses}>
                    Specializations (comma separated)
                  </label>
                  <input
                    type="text"
                    value={form.specializations.join(", ")}
                    onChange={(e) =>
                      updateField(
                        "specializations",
                        e.target.value.split(",").map((s) => s.trim()),
                      )
                    }
                    className={inputClasses}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold">
                  {error}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Security & Phone */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-outfit)] flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-500" /> Security
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Update your secure login and contact methods.
            </p>

            <div className="p-4 bg-slate-50 border border-gray-100 rounded-2xl mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Current Mobile Number
              </span>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 text-lg">
                  {form.whatsappNumber || "Not Set"}
                </span>
                {!isChangingPhone && (
                  <button
                    onClick={() => setIsChangingPhone(true)}
                    className="text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Change
                  </button>
                )}
              </div>
            </div>

            {/* Phone Change Flow */}
            {isChangingPhone && (
              <div className="mt-6 p-5 sm:p-6 border border-red-100 bg-gradient-to-br from-red-50/50 to-white rounded-2xl shadow-[0_4px_20px_rgb(220,38,38,0.05)] animate-[fade-in_0.3s_ease-out]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Change Number</h3>
                  <button
                    onClick={() => {
                      setIsChangingPhone(false);
                      setPhoneStep("initial");
                    }}
                    className="text-xs text-gray-500 hover:text-gray-900 font-medium"
                  >
                    Cancel
                  </button>
                </div>

                {phoneStep === "initial" && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      To protect your account, we first need to verify your
                      current mobile number.
                    </p>
                    <button
                      onClick={startPhoneChange}
                      disabled={phoneLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                      {phoneLoading && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Send OTP to {form.whatsappNumber}
                    </button>
                  </div>
                )}

                {phoneStep === "verify_current" && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Enter the 6-digit code sent to your current number.
                    </p>
                    <input
                      type="text"
                      placeholder="123456"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value)}
                      className="w-full text-center tracking-[0.5em] font-bold text-2xl text-gray-900 px-4 py-3 bg-white shadow-sm border border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      maxLength={6}
                    />
                    <button
                      onClick={verifyCurrentOtp}
                      disabled={phoneLoading || phoneOtp.length !== 6}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                      {phoneLoading && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Verify
                    </button>
                  </div>
                )}

                {phoneStep === "enter_new" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm font-semibold mb-2">
                      <CheckCircle2 className="w-4 h-4" /> Verified Current
                      Number
                    </div>
                    <p className="text-sm text-gray-600">
                      Enter your new mobile number with country code.
                    </p>
                    <PhoneInput
                      value={newPhoneNumber}
                      onChange={(val) => setNewPhoneNumber(val)}
                    />
                    <button
                      onClick={sendNewOtp}
                      disabled={
                        phoneLoading ||
                        newPhoneNumber.replace(/\D/g, "").length < 8
                      }
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                      {phoneLoading && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Send Verification Code
                    </button>
                  </div>
                )}

                {phoneStep === "verify_new" && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Enter the 6-digit code sent to{" "}
                      <strong>{newPhoneNumber}</strong>.
                    </p>
                    <input
                      type="text"
                      placeholder="123456"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value)}
                      className="w-full text-center tracking-[0.5em] font-bold text-2xl text-gray-900 px-4 py-3 bg-white shadow-sm border border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      maxLength={6}
                    />
                    <button
                      onClick={verifyNewOtp}
                      disabled={phoneLoading || phoneOtp.length !== 6}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                      {phoneLoading && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Confirm New Number
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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
