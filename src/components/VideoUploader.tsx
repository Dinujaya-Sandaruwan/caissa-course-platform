"use client";

import { useState, useRef } from "react";
import * as tus from "tus-js-client";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Film,
} from "lucide-react";

interface VideoUploaderProps {
  /** Title for the video on Bunny (e.g. lesson title) */
  title: string;
  /** Called with the Bunny videoId when upload completes */
  onUploadComplete: (videoId: string) => void;
  /** Optional: existing Bunny video ID (shows "replace" state) */
  existingVideoId?: string | null;
  /** Optional: current video status */
  videoStatus?: "pending" | "processing" | "ready";
}

export default function VideoUploader({
  title,
  onUploadComplete,
  existingVideoId,
  videoStatus,
}: VideoUploaderProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<tus.Upload | null>(null);

  async function startUpload(file: File) {
    if (!file.type.startsWith("video/")) {
      setErrorMsg("Please select a valid video file.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setProgress(0);
    setErrorMsg("");

    try {
      // Get upload credentials from our server
      const res = await fetch("/api/bunny/create-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        throw new Error("Failed to get upload credentials");
      }

      const { videoId, libraryId, expiresAt, signature } = await res.json();

      // Upload via tus (resumable)
      const upload = new tus.Upload(file, {
        endpoint: "https://video.bunnycdn.com/tusupload",
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          AuthorizationSignature: signature,
          AuthorizationExpire: String(expiresAt),
          VideoId: videoId,
          LibraryId: libraryId,
        },
        metadata: {
          filetype: file.type,
          title,
        },
        onProgress(bytesUploaded, bytesTotal) {
          setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
        },
        onSuccess() {
          setStatus("done");
          onUploadComplete(videoId);
        },
        onError(error) {
          console.error("Upload failed:", error);
          setErrorMsg(error.message || "Upload failed. Please try again.");
          setStatus("error");
        },
      });

      uploadRef.current = upload;
      upload.start();
    } catch (err) {
      console.error("Upload setup failed:", err);
      setErrorMsg("Failed to start upload. Please try again.");
      setStatus("error");
    }
  }

  function handleFileSelect() {
    const file = fileRef.current?.files?.[0];
    if (file) startUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) startUpload(file);
  }

  function handleCancel() {
    if (uploadRef.current) {
      uploadRef.current.abort();
      uploadRef.current = null;
    }
    setStatus("idle");
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  }

  // Show existing video status
  if (existingVideoId && status === "idle") {
    return (
      <div className="space-y-2">
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border ${
            videoStatus === "ready"
              ? "bg-emerald-50/80 border-emerald-200"
              : videoStatus === "processing"
                ? "bg-amber-50/80 border-amber-200"
                : "bg-gray-50 border-gray-200"
          }`}
        >
          {videoStatus === "ready" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : videoStatus === "processing" ? (
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin shrink-0" />
          ) : (
            <Film className="w-5 h-5 text-gray-400 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-bold ${
                videoStatus === "ready"
                  ? "text-emerald-700"
                  : videoStatus === "processing"
                    ? "text-amber-700"
                    : "text-gray-600"
              }`}
            >
              {videoStatus === "ready"
                ? "Video Ready"
                : videoStatus === "processing"
                  ? "Encoding in progress..."
                  : "Video Uploaded"}
            </p>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
              ID: {existingVideoId}
            </p>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-all shrink-0"
          >
            <Upload className="w-3 h-3" />
            Replace
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Upload Area */}
      {status === "idle" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
            dragOver
              ? "border-red-400 bg-red-50/50 scale-[1.01]"
              : "border-gray-200 bg-gray-50/50 hover:border-red-300 hover:bg-red-50/30"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              dragOver ? "bg-red-100" : "bg-gray-100"
            }`}
          >
            <Upload
              className={`w-6 h-6 ${dragOver ? "text-red-500" : "text-gray-400"}`}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700">
              Drop video file here or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports MP4, MOV, MKV, AVI — Resumable upload
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {/* Uploading State */}
      {status === "uploading" && (
        <div className="p-5 rounded-2xl border border-red-100 bg-red-50/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
              <span className="text-sm font-bold text-gray-700">
                Uploading...
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-red-600 tabular-nums">
                {progress}%
              </span>
              <button
                onClick={handleCancel}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                title="Cancel upload"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-300 relative"
              style={{ width: `${progress}%` }}
            >
              {progress > 0 && (
                <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-r from-transparent to-white/30 rounded-full" />
              )}
            </div>
          </div>
          <p className="text-[10px] text-gray-400">
            Upload is resumable — you can close the browser and continue later
          </p>
        </div>
      )}

      {/* Done State */}
      {status === "done" && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-700">
              Upload complete!
            </p>
            <p className="text-xs text-emerald-600/70 mt-0.5">
              Video is now being encoded by Bunny.net — this may take a few
              minutes.
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === "error" && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50/80 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-700">Upload failed</p>
            <p className="text-xs text-red-500/80 mt-0.5 truncate">
              {errorMsg}
            </p>
          </div>
          <button
            onClick={() => {
              setStatus("idle");
              setErrorMsg("");
              if (fileRef.current) fileRef.current.value = "";
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-white hover:bg-red-50 rounded-lg border border-red-200 transition-all shrink-0"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
