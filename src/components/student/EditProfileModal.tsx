"use client";

import { useState, useRef, useCallback } from "react";
import { X, Camera, Loader2, UserCircle2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import ImageCropModal from "@/components/ui/ImageCropModal";
import { useRouter } from "next/navigation";
import { ProfileUser } from "./StudentProfileMenu";

interface EditProfileModalProps {
  user: ProfileUser;
  onClose: () => void;
}

export default function EditProfileModal({
  user,
  onClose,
}: EditProfileModalProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [nickname, setNickname] = useState(user.nickname || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicThumbnail, setProfilePicThumbnail] = useState<File | null>(
    null,
  );
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    user.profilePhotoThumbnail || null,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("nickname", nickname.trim());

      if (profilePic && profilePicThumbnail) {
        formData.append("profilePicture", profilePic);
        formData.append("profilePictureThumbnail", profilePicThumbnail);
      }

      const res = await fetch("/api/student/profile", {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      router.refresh();
      onClose();
    } catch (err: Error | unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-[fade-in-up_0.3s_ease-out]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-outfit)]">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 -mr-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto"
        >
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center pt-2">
            <div
              className="relative w-28 h-28 rounded-full cursor-pointer group mb-2"
              onClick={() => !loading && fileInputRef.current?.click()}
            >
              <div
                className={`absolute inset-0 rounded-full border-[3px] border-dashed ${photoError ? "border-red-400 bg-red-50" : "border-gray-200 bg-slate-50"} overflow-hidden transition-all group-hover:border-red-400 group-hover:bg-red-50 flex items-center justify-center shadow-inner`}
              >
                {compressing ? (
                  <div className="flex flex-col items-center gap-1">
                    <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                  </div>
                ) : profilePicPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profilePicPreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover group-hover:opacity-60 transition-opacity"
                  />
                ) : (
                  <UserCircle2 className="w-12 h-12 text-gray-300 group-hover:text-red-400 transition-colors" />
                )}
              </div>

              <div
                className={`absolute bottom-0 right-0 p-2.5 rounded-full border-[3px] border-white shadow-md transition-all ${profilePicPreview ? "bg-white text-gray-600 hover:text-red-600 hover:scale-105" : "bg-red-600 text-white hover:bg-red-700 hover:scale-105"}`}
              >
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              disabled={loading}
            />
            {photoError ? (
              <p className="text-xs font-semibold text-red-600 mt-2 text-center bg-red-50 px-3 py-1 rounded-lg">
                {photoError}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Click to upload new photo
              </p>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all disabled:opacity-50"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all disabled:opacity-50"
                placeholder="What should we call you?"
              />
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5 font-medium">
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                Displayed across your dashboard
              </p>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm font-medium text-red-600 animate-[fade-in_0.2s_ease-out]">
              {error}
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 text-sm font-bold rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(220,38,38,0.2)] hover:shadow-[0_6px_16px_rgba(220,38,38,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
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
