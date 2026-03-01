"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  BookOpen,
  DollarSign,
  BarChart3,
  Tag,
  FileText,
  Plus,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Video,
  CheckCircle2,
  Loader2,
  Trash2,
  Upload,
  Send,
  AlertTriangle,
  Link as LinkIcon,
  FilePlus,
  Image as ImageIcon,
  File as FileIcon,
  Sprout,
  Swords,
  Crown,
  LucideIcon,
} from "lucide-react";

type CourseLevel = "beginner" | "intermediate" | "advanced";

interface CourseMetadata {
  title: string;
  description: string;
  price: string;
  level: CourseLevel;
  tags: string[];
  thumbnailFile: File | null;
  tempThumbnailPath: string | null;
  thumbnailUploadStatus: "idle" | "uploading" | "success" | "error";
  thumbnailUploadProgress: number;
}

export interface LessonMaterial {
  id: string;
  file: File | null;
  fileName: string;
  fileSize: number;
  title: string;
  status: "pending" | "selected" | "uploading" | "uploaded" | "error";
  progress: number;
  tempPath: string;
  error: string;
}

interface LessonDraft {
  id: string;
  title: string;
  description: string;
  links: string[];
  materials: LessonMaterial[];
  videoFile: File | null;
  videoFileName: string;
  videoFileSize: number;
  videoStatus: "pending" | "selected" | "uploading" | "uploaded" | "error";
  uploadProgress: number;
  tempVideoPath: string;
  uploadError: string;
}

interface ChapterDraft {
  id: string;
  title: string;
  lessons: LessonDraft[];
  isExpanded: boolean;
}

let idCounter = 0;
function generateId() {
  return `draft_${Date.now()}_${idCounter++}`;
}

export default function CreateCoursePage() {
  const [step, setStep] = useState(1);
  const [metadata, setMetadata] = useState<CourseMetadata>({
    title: "",
    description: "",
    price: "",
    level: "beginner",
    tags: [],
    thumbnailFile: null,
    tempThumbnailPath: null,
    thumbnailUploadStatus: "idle",
    thumbnailUploadProgress: 0,
  });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [chapters, setChapters] = useState<ChapterDraft[]>([]);
  const [step2Error, setStep2Error] = useState("");
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitError, setSubmitError] = useState("");

  type DeleteItemContext =
    | { type: "chapter"; chapterId: string; title: string }
    | { type: "lesson"; chapterId: string; lessonId: string; title: string }
    | { type: "link"; chapterId: string; lessonId: string; index: number }
    | {
        type: "material";
        chapterId: string;
        lessonId: string;
        materialId: string;
        title: string;
      }
    | null;

  const [itemToDelete, setItemToDelete] = useState<DeleteItemContext>(null);

  const confirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "chapter") {
      setChapters((prev) =>
        prev.filter((ch) => ch.id !== itemToDelete.chapterId),
      );
    } else if (itemToDelete.type === "lesson") {
      setChapters((prev) =>
        prev.map((ch) =>
          ch.id === itemToDelete.chapterId
            ? {
                ...ch,
                lessons: ch.lessons.filter(
                  (l) => l.id !== itemToDelete.lessonId,
                ),
              }
            : ch,
        ),
      );
    } else if (itemToDelete.type === "link") {
      setChapters((prev) =>
        prev.map((ch) =>
          ch.id === itemToDelete.chapterId
            ? {
                ...ch,
                lessons: ch.lessons.map((l) =>
                  l.id === itemToDelete.lessonId
                    ? {
                        ...l,
                        links: l.links.filter(
                          (_, i) => i !== itemToDelete.index,
                        ),
                      }
                    : l,
                ),
              }
            : ch,
        ),
      );
    } else if (itemToDelete.type === "material") {
      setChapters((prev) =>
        prev.map((ch) =>
          ch.id === itemToDelete.chapterId
            ? {
                ...ch,
                lessons: ch.lessons.map((l) =>
                  l.id === itemToDelete.lessonId
                    ? {
                        ...l,
                        materials: l.materials.filter(
                          (m) => m.id !== itemToDelete.materialId,
                        ),
                      }
                    : l,
                ),
              }
            : ch,
        ),
      );
    }

    setItemToDelete(null);
  };

  // ─── Tag Management ────────────────────────────────────
  const [tagSuggestions, setTagSuggestions] = useState<
    { name: string; usageCount: number }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTagSuggestions = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setTagSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/tags?q=${encodeURIComponent(query.trim())}`,
        );
        if (res.ok) {
          const data = await res.json();
          // Filter out tags already added
          const filtered = data.filter(
            (t: { name: string }) => !metadata.tags.includes(t.name),
          );
          setTagSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
          setSelectedSuggestionIndex(-1);
        }
      } catch {
        // Silently fail — autocomplete is a nice-to-have
      }
    },
    [metadata.tags],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!tagInput.trim()) {
      setTagSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchTagSuggestions(tagInput);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [tagInput, fetchTagSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        tagInputRef.current &&
        !tagInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (
      trimmed &&
      !metadata.tags.includes(trimmed) &&
      metadata.tags.length < 10
    ) {
      setMetadata((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput("");
      setShowSuggestions(false);
      setTagSuggestions([]);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < tagSuggestions.length - 1 ? prev + 1 : prev,
      );
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
      return;
    }
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (
        selectedSuggestionIndex >= 0 &&
        tagSuggestions[selectedSuggestionIndex]
      ) {
        addTag(tagSuggestions[selectedSuggestionIndex].name);
      } else {
        addTag(tagInput);
      }
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // ─── Form Validation ──────────────────────────────────
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!metadata.title.trim()) {
      newErrors.title = "Course title is required";
    } else if (metadata.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (!metadata.description.trim()) {
      newErrors.description = "Description is required";
    } else if (metadata.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (!metadata.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(metadata.price)) || Number(metadata.price) < 0) {
      newErrors.price = "Price must be a valid positive number";
    }

    if (metadata.tags.length === 0) {
      newErrors.tags = "Please add at least one tag";
    }

    if (!metadata.tempThumbnailPath) {
      newErrors.thumbnailFile = "A course thumbnail is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  // ─── Thumbnail Management ──────────────────────────────
  const handleThumbnailSelect = (file: File) => {
    // Basic validation
    if (file.size > 4 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        thumbnailFile: "Thumbnail exceeds 4MB. Please choose a smaller image.",
      }));
      setMetadata((prev) => ({
        ...prev,
        thumbnailUploadStatus: "error",
        thumbnailUploadProgress: 0,
      }));
      return;
    }

    setMetadata((prev) => ({
      ...prev,
      thumbnailFile: file,
      thumbnailUploadStatus: "uploading",
      thumbnailUploadProgress: 0,
      tempThumbnailPath: null,
    }));

    if (errors.thumbnailFile)
      setErrors((prev) => ({ ...prev, thumbnailFile: "" }));

    // Auto-upload using XMLHttpRequest to get progress
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("video", file); // We use the exact same endpoint

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        setMetadata((prev) => ({
          ...prev,
          thumbnailUploadProgress: percentComplete,
        }));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          setMetadata((prev) => ({
            ...prev,
            tempThumbnailPath: res.tempPath,
            thumbnailUploadStatus: "success",
            thumbnailUploadProgress: 100,
          }));
        } catch (error) {
          setMetadata((prev) => ({ ...prev, thumbnailUploadStatus: "error" }));
        }
      } else {
        setMetadata((prev) => ({ ...prev, thumbnailUploadStatus: "error" }));
        try {
          const errBody = JSON.parse(xhr.responseText);
          setErrors((prev) => ({
            ...prev,
            thumbnailFile: `Upload failed: ${errBody.error || "Unknown error"}`,
          }));
        } catch (e) {
          setErrors((prev) => ({
            ...prev,
            thumbnailFile: "Thumbnail upload failed.",
          }));
        }
      }
    };

    xhr.onerror = () => {
      setMetadata((prev) => ({ ...prev, thumbnailUploadStatus: "error" }));
      alert("Network error during thumbnail upload.");
    };

    xhr.open("POST", "/api/coach/uploads/temp");
    xhr.send(formData);
  };

  // ─── Chapter / Lesson Management ─────────────────────
  const addChapter = () => {
    setChapters((prev) => [
      ...prev,
      {
        id: generateId(),
        title: "",
        lessons: [],
        isExpanded: true,
      },
    ]);
    setStep2Error("");
  };

  const updateChapterTitle = (chapterId: string, title: string) => {
    setChapters((prev) =>
      prev.map((ch) => (ch.id === chapterId ? { ...ch, title } : ch)),
    );
  };

  const removeChapter = (chapterId: string) => {
    const ch = chapters.find((c) => c.id === chapterId);
    setItemToDelete({
      type: "chapter",
      chapterId,
      title: ch?.title || "Untitled Chapter",
    });
  };

  const toggleChapter = (chapterId: string) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId ? { ...ch, isExpanded: !ch.isExpanded } : ch,
      ),
    );
  };

  const addLesson = (chapterId: string) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: [
                ...ch.lessons,
                {
                  id: generateId(),
                  title: "",
                  description: "",
                  links: [],
                  materials: [],
                  videoFile: null,
                  videoFileName: "",
                  videoFileSize: 0,
                  videoStatus: "pending",
                  uploadProgress: 0,
                  tempVideoPath: "",
                  uploadError: "",
                },
              ],
              isExpanded: true,
            }
          : ch,
      ),
    );
    setStep2Error("");
  };

  const updateLessonTitle = (
    chapterId: string,
    lessonId: string,
    title: string,
  ) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((l) =>
                l.id === lessonId ? { ...l, title } : l,
              ),
            }
          : ch,
      ),
    );
  };

  const removeLesson = (chapterId: string, lessonId: string) => {
    const ch = chapters.find((c) => c.id === chapterId);
    const l = ch?.lessons.find((ls) => ls.id === lessonId);
    setItemToDelete({
      type: "lesson",
      chapterId,
      lessonId,
      title: l?.title || "Untitled Lesson",
    });
  };

  // ─── Upload Queue ──────────────────────────────────────
  type QueueItem = {
    chapterId: string;
    lessonId: string;
    file: File;
    type: "video" | "material";
    materialId?: string;
  };

  const uploadQueueRef = useRef<QueueItem[]>([]);
  const isUploadingRef = useRef(false);

  const updateLessonUploadState = (
    lessonId: string,
    updates: Partial<LessonDraft>,
  ) => {
    setChapters((prev) =>
      prev.map((ch) => ({
        ...ch,
        lessons: ch.lessons.map((l) =>
          l.id === lessonId ? { ...l, ...updates } : l,
        ),
      })),
    );
  };

  const updateMaterialUploadState = (
    lessonId: string,
    materialId: string,
    updates: Partial<LessonMaterial>,
  ) => {
    setChapters((prev) =>
      prev.map((ch) => ({
        ...ch,
        lessons: ch.lessons.map((l) => {
          if (l.id !== lessonId) return l;
          return {
            ...l,
            materials: l.materials.map((m) =>
              m.id === materialId ? { ...m, ...updates } : m,
            ),
          };
        }),
      })),
    );
  };

  const processUploadQueue = async () => {
    if (isUploadingRef.current || uploadQueueRef.current.length === 0) return;
    isUploadingRef.current = true;

    while (uploadQueueRef.current.length > 0) {
      const item = uploadQueueRef.current[0];

      if (item.type === "video") {
        updateLessonUploadState(item.lessonId, {
          videoStatus: "uploading",
          uploadProgress: 0,
          uploadError: "",
        });
      } else if (item.type === "material" && item.materialId) {
        updateMaterialUploadState(item.lessonId, item.materialId, {
          status: "uploading",
          progress: 0,
          error: "",
        });
      }

      try {
        const result = await new Promise<{ tempPath: string }>(
          (resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append("video", item.file); // temp API just expects 'video' field currently

            xhr.upload.addEventListener("progress", (e) => {
              if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                if (item.type === "video") {
                  updateLessonUploadState(item.lessonId, {
                    uploadProgress: percent,
                  });
                } else if (item.type === "material" && item.materialId) {
                  updateMaterialUploadState(item.lessonId, item.materialId, {
                    progress: percent,
                  });
                }
              }
            });

            xhr.addEventListener("load", () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
              } else {
                try {
                  const err = JSON.parse(xhr.responseText);
                  reject(new Error(err.error || "Upload failed"));
                } catch {
                  reject(new Error("Upload failed"));
                }
              }
            });

            xhr.addEventListener("error", () => {
              reject(new Error("Network error during upload"));
            });

            xhr.addEventListener("abort", () => {
              reject(new Error("Upload cancelled"));
            });

            xhr.open("POST", "/api/coach/uploads/temp");
            xhr.send(formData);
          },
        );

        if (item.type === "video") {
          updateLessonUploadState(item.lessonId, {
            videoStatus: "uploaded",
            uploadProgress: 100,
            tempVideoPath: result.tempPath,
          });
        } else if (item.type === "material" && item.materialId) {
          updateMaterialUploadState(item.lessonId, item.materialId, {
            status: "uploaded",
            progress: 100,
            tempPath: result.tempPath,
          });
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Upload failed";
        if (item.type === "video") {
          updateLessonUploadState(item.lessonId, {
            videoStatus: "error",
            uploadProgress: 0,
            uploadError: errorMsg,
          });
        } else if (item.type === "material" && item.materialId) {
          updateMaterialUploadState(item.lessonId, item.materialId, {
            status: "error",
            progress: 0,
            error: errorMsg,
          });
        }
      }

      uploadQueueRef.current.shift();
    }

    isUploadingRef.current = false;
  };

  const handleVideoSelect = (
    chapterId: string,
    lessonId: string,
    file: File,
  ) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((l) =>
                l.id === lessonId
                  ? {
                      ...l,
                      videoFile: file,
                      videoFileName: file.name,
                      videoFileSize: file.size,
                      videoStatus: "selected" as const,
                    }
                  : l,
              ),
            }
          : ch,
      ),
    );

    // Add to upload queue and start processing
    uploadQueueRef.current.push({ chapterId, lessonId, file, type: "video" });
    processUploadQueue();
  };

  const handleMaterialSelect = (
    chapterId: string,
    lessonId: string,
    file: File,
  ) => {
    const materialId = generateId();
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((l) =>
                l.id === lessonId
                  ? {
                      ...l,
                      materials: [
                        ...l.materials,
                        {
                          id: materialId,
                          file: file,
                          fileName: file.name,
                          fileSize: file.size,
                          title: file.name,
                          status: "selected",
                          progress: 0,
                          tempPath: "",
                          error: "",
                        },
                      ],
                    }
                  : l,
              ),
            }
          : ch,
      ),
    );

    // Add to upload queue and start processing
    uploadQueueRef.current.push({
      chapterId,
      lessonId,
      file,
      type: "material",
      materialId,
    });
    processUploadQueue();
  };

  const retryUpload = (chapterId: string, lessonId: string) => {
    const chapter = chapters.find((ch) => ch.id === chapterId);
    const lesson = chapter?.lessons.find((l) => l.id === lessonId);
    if (lesson?.videoFile) {
      uploadQueueRef.current.push({
        chapterId,
        lessonId,
        file: lesson.videoFile,
        type: "video",
      });
      processUploadQueue();
    }
  };

  const retryMaterialUpload = (
    chapterId: string,
    lessonId: string,
    materialId: string,
  ) => {
    const chapter = chapters.find((ch) => ch.id === chapterId);
    const lesson = chapter?.lessons.find((l) => l.id === lessonId);
    const material = lesson?.materials.find((m) => m.id === materialId);
    if (material?.file) {
      uploadQueueRef.current.push({
        chapterId,
        lessonId,
        file: material.file,
        type: "material",
        materialId,
      });
      processUploadQueue();
    }
  };

  const updateLessonDescription = (
    chapterId: string,
    lessonId: string,
    description: string,
  ) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((l) =>
                l.id === lessonId ? { ...l, description } : l,
              ),
            }
          : ch,
      ),
    );
  };

  const addLessonLink = (chapterId: string, lessonId: string) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((l) =>
                l.id === lessonId ? { ...l, links: [...l.links, ""] } : l,
              ),
            }
          : ch,
      ),
    );
  };

  const updateLessonLink = (
    chapterId: string,
    lessonId: string,
    index: number,
    value: string,
  ) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((l) =>
                l.id === lessonId
                  ? {
                      ...l,
                      links: l.links.map((link, i) =>
                        i === index ? value : link,
                      ),
                    }
                  : l,
              ),
            }
          : ch,
      ),
    );
  };

  const removeLessonLink = (
    chapterId: string,
    lessonId: string,
    index: number,
  ) => {
    setItemToDelete({ type: "link", chapterId, lessonId, index });
  };

  const removeLessonMaterial = (
    chapterId: string,
    lessonId: string,
    materialId: string,
  ) => {
    const ch = chapters.find((c) => c.id === chapterId);
    const l = ch?.lessons.find((ls) => ls.id === lessonId);
    const mat = l?.materials.find((m) => m.id === materialId);
    setItemToDelete({
      type: "material",
      chapterId,
      lessonId,
      materialId,
      title: mat?.title || mat?.fileName || "Untitled Material",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const validateStep2 = (): boolean => {
    if (chapters.length === 0) {
      setStep2Error("Add at least one chapter to your course");
      return false;
    }
    for (const ch of chapters) {
      if (!ch.title.trim()) {
        setStep2Error("All chapters must have a title");
        return false;
      }
      if (ch.lessons.length === 0) {
        setStep2Error(
          `Chapter "${ch.title || "Untitled"}" needs at least one lesson`,
        );
        return false;
      }
      for (const l of ch.lessons) {
        if (!l.title.trim()) {
          setStep2Error("All lessons must have a title");
          return false;
        }
      }
    }
    setStep2Error("");
    return true;
  };

  const handleGoToStep3 = () => {
    if (validateStep2()) {
      setStep(3);
    }
  };

  // ─── Submit Chain ─────────────────────────────────────
  const handleSubmitCourse = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // 1. Create the course draft
      setSubmitStatus("Creating course...");
      const courseRes = await fetch("/api/coach/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: metadata.title.trim(),
          description: metadata.description.trim(),
          price: Number(metadata.price),
          level: metadata.level,
          tags: metadata.tags,
          tempThumbnailPath: metadata.tempThumbnailPath,
        }),
      });

      if (!courseRes.ok) {
        const err = await courseRes.json();
        throw new Error(err.error || "Failed to create course");
      }

      const course = await courseRes.json();
      const courseId = course._id;

      // 2. Create chapters and lessons sequentially
      for (let chIdx = 0; chIdx < chapters.length; chIdx++) {
        const ch = chapters[chIdx];
        setSubmitStatus(
          `Creating chapter ${chIdx + 1}/${chapters.length}: ${ch.title}...`,
        );

        const chapterRes = await fetch(
          `/api/coach/courses/${courseId}/chapters`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: ch.title.trim() }),
          },
        );

        if (!chapterRes.ok) {
          const err = await chapterRes.json();
          throw new Error(err.error || `Failed to create chapter: ${ch.title}`);
        }

        const chapterData = await chapterRes.json();
        const chapterId = chapterData._id;

        // 3. Create lessons for this chapter
        for (let lIdx = 0; lIdx < ch.lessons.length; lIdx++) {
          const lesson = ch.lessons[lIdx];
          setSubmitStatus(
            `Creating lesson ${lIdx + 1}/${ch.lessons.length} in "${ch.title}"...`,
          );

          const lessonRes = await fetch(
            `/api/coach/courses/${courseId}/chapters/${chapterId}/lessons`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: lesson.title.trim(),
                description: lesson.description.trim(),
                links: lesson.links.filter((link) => link.trim() !== ""),
                tempVideoPath: lesson.tempVideoPath || undefined,
                tempMaterials: lesson.materials
                  .filter((m) => m.tempPath)
                  .map((m) => ({
                    title: m.title.trim() || m.fileName,
                    tempPath: m.tempPath,
                  })),
              }),
            },
          );

          if (!lessonRes.ok) {
            const err = await lessonRes.json();
            throw new Error(
              err.error || `Failed to create lesson: ${lesson.title}`,
            );
          }

          const lessonData = await lessonRes.json();

          // 4. No longer uploading videos here — they were already uploaded
          //    to temp storage during Step 2. The lesson API handles moving them.
        }
      }

      // 5. Submit for review
      setSubmitStatus("Submitting course for review...");
      const submitRes = await fetch(`/api/coach/courses/${courseId}/submit`, {
        method: "POST",
      });

      if (!submitRes.ok) {
        const err = await submitRes.json();
        throw new Error(err.error || "Failed to submit course for review");
      }

      setSubmitStatus("Course submitted successfully! Redirecting...");
      setTimeout(() => {
        router.push("/coach/courses");
      }, 1500);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
      setIsSubmitting(false);
    }
  };

  // ─── Level Config ─────────────────────────────────────
  const levels: {
    value: CourseLevel;
    label: string;
    description: string;
    icon: LucideIcon;
  }[] = [
    {
      value: "beginner",
      label: "Beginner",
      description: "For new players learning the fundamentals",
      icon: Sprout,
    },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "For club-level players looking to improve",
      icon: Swords,
    },
    {
      value: "advanced",
      label: "Advanced",
      description: "For strong players pursuing mastery",
      icon: Crown,
    },
  ];

  // ─── Render ───────────────────────────────────────────

  // Step 3: Review & Submit
  if (step === 3) {
    const totalLessonsStep3 = chapters.reduce(
      (acc, ch) => acc + ch.lessons.length,
      0,
    );
    const lessonsWithVideo = chapters.reduce(
      (acc, ch) => acc + ch.lessons.filter((l) => l.videoFile).length,
      0,
    );
    const lessonsWithoutVideo = totalLessonsStep3 - lessonsWithVideo;

    return (
      <div className="space-y-8 animate-[fade-in-up_0.4s_ease-out]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold text-red-500 tracking-widest uppercase bg-red-50 px-3 py-1 rounded-full">
                New Course
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
              Review &amp; Submit
            </h1>
            <p className="text-gray-500 mt-2 text-lg font-medium max-w-2xl">
              Double-check your course details below. You can always come back
              and edit these before finally publishing.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-3">
          {[
            { num: 1, label: "Course Details" },
            { num: 2, label: "Chapters & Lessons" },
            { num: 3, label: "Review & Submit" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step === s.num
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/25 scale-110"
                      : step > s.num
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step > s.num ? "✓" : s.num}
                </div>
                <span
                  className={`text-sm font-semibold hidden sm:inline ${
                    step === s.num
                      ? "text-gray-900"
                      : step > s.num
                        ? "text-red-500"
                        : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`w-8 sm:w-16 h-[3px] rounded-full transition-colors ${
                    step > s.num ? "bg-red-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Course Metadata Summary Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-500" />
            Course Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Title
              </p>
              <p className="text-base font-semibold text-gray-900">
                {metadata.title}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Level
              </p>
              <p className="text-base font-semibold text-gray-900 capitalize">
                <span className="capitalize flex items-center gap-1">
                  {(() => {
                    const LIcon =
                      levels.find((l) => l.value === metadata.level)?.icon ||
                      Sprout;
                    return <LIcon className="w-4 h-4" />;
                  })()}
                  {metadata.level}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Price
              </p>
              <p className="text-base font-semibold text-gray-900">
                Rs. {metadata.price}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {metadata.tags.length > 0 ? (
                  metadata.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 text-xs font-semibold text-red-600 bg-red-50 rounded-full border border-red-100"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">No tags</span>
                )}
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Description
              </p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {metadata.description}
              </p>
            </div>
          </div>
        </div>

        {/* Curriculum Summary Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Video className="w-5 h-5 text-red-500" />
            Curriculum
            <span className="ml-auto text-sm font-medium text-gray-400">
              {chapters.length} chapter{chapters.length !== 1 ? "s" : ""} ·{" "}
              {totalLessonsStep3} lesson{totalLessonsStep3 !== 1 ? "s" : ""}
            </span>
          </h2>
          <div className="space-y-4">
            {chapters.map((ch, chIdx) => (
              <div
                key={ch.id}
                className="border border-gray-100 rounded-2xl overflow-hidden"
              >
                <div className="flex items-center gap-3 px-5 py-3 bg-gray-50/80">
                  <span className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-xs font-bold text-red-600 border border-red-100">
                    {chIdx + 1}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {ch.title}
                  </span>
                  <span className="ml-auto text-xs text-gray-400">
                    {ch.lessons.length} lesson
                    {ch.lessons.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {ch.lessons.map((lesson, lIdx) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 px-5 py-2.5"
                    >
                      <span className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        {lIdx + 1}
                      </span>
                      <span className="text-sm text-gray-700 flex-1">
                        {lesson.title}
                      </span>
                      {lesson.videoFile ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Video
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          No video
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning: Missing Videos */}
        {lessonsWithoutVideo > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-700">
                {lessonsWithoutVideo} lesson
                {lessonsWithoutVideo !== 1 ? "s are" : " is"} missing a video
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                You can still submit, but lessons without videos will need
                uploads later.
              </p>
            </div>
          </div>
        )}

        {/* Submit Error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            {submitError}
          </div>
        )}

        {/* Submitting Progress */}
        {isSubmitting && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
            <p className="text-sm font-medium text-blue-700">{submitStatus}</p>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={isSubmitting}
            className="group flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Chapters
          </button>
          <button
            type="button"
            onClick={handleSubmitCourse}
            disabled={isSubmitting}
            className="group flex items-center gap-2.5 px-8 py-4 bg-red-600 text-white text-base font-bold rounded-2xl hover:bg-red-700 shadow-xl shadow-red-600/20 hover:shadow-red-600/30 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit for Review
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Chapter & Lesson Manager
  if (step === 2) {
    const totalLessons = chapters.reduce(
      (acc, ch) => acc + ch.lessons.length,
      0,
    );
    const videosSelected = chapters.reduce(
      (acc, ch) =>
        acc + ch.lessons.filter((l) => l.videoStatus !== "pending").length,
      0,
    );

    return (
      <div className="space-y-8 animate-[fade-in-up_0.4s_ease-out]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold text-red-500 tracking-widest uppercase bg-red-50 px-3 py-1 rounded-full">
                New Course
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
              Chapters &amp; Lessons
            </h1>
            <p className="text-gray-500 mt-2 text-lg font-medium">
              Build your course curriculum by adding chapters and lessons.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-3">
          {[
            { num: 1, label: "Course Details" },
            { num: 2, label: "Chapters & Lessons" },
            { num: 3, label: "Review & Submit" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step === s.num
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/25 scale-110"
                      : step > s.num
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step > s.num ? "✓" : s.num}
                </div>
                <span
                  className={`text-sm font-semibold hidden sm:inline ${
                    step === s.num
                      ? "text-gray-900"
                      : step > s.num
                        ? "text-red-500"
                        : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`w-8 sm:w-16 h-[3px] rounded-full transition-colors ${
                    step > s.num ? "bg-red-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-red-400" />
            {chapters.length} chapter{chapters.length !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Video className="w-4 h-4 text-red-400" />
            {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-red-400" />
            {videosSelected} video{videosSelected !== 1 ? "s" : ""} selected
          </span>
        </div>

        {/* Chapters List */}
        <div className="space-y-4">
          {chapters.map((chapter, chIdx) => (
            <div
              key={chapter.id}
              className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
            >
              {/* Chapter Header */}
              <div
                className="flex items-center gap-3 p-5 cursor-pointer"
                onClick={() => toggleChapter(chapter.id)}
              >
                <div className="text-gray-300 hover:text-gray-500 transition-colors">
                  <GripVertical className="w-5 h-5" />
                </div>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChapter(chapter.id);
                  }}
                >
                  {chapter.isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
                <span className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-sm font-bold text-red-600 border border-red-100">
                  {chIdx + 1}
                </span>
                <input
                  type="text"
                  value={chapter.title}
                  onChange={(e) =>
                    updateChapterTitle(chapter.id, e.target.value)
                  }
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Chapter title..."
                  className="flex-1 text-base font-bold text-gray-900 placeholder-gray-400 bg-transparent border-none focus:outline-none focus:ring-0"
                />
                <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                  {chapter.lessons.length} lesson
                  {chapter.lessons.length !== 1 ? "s" : ""}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChapter(chapter.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Expanded Lessons */}
              {chapter.isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                  <div className="p-4 space-y-2">
                    {chapter.lessons.map((lesson, lIdx) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm group"
                      >
                        <div className="flex flex-col gap-3 w-full p-1.5 pt-0">
                          {/* Top Row: Title & Basic Actions */}
                          <div className="flex items-center gap-3 w-full">
                            <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                              {lIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) =>
                                updateLessonTitle(
                                  chapter.id,
                                  lesson.id,
                                  e.target.value,
                                )
                              }
                              placeholder="Lesson title..."
                              className="flex-1 text-sm font-medium text-gray-800 placeholder-gray-400 bg-transparent border-none focus:outline-none focus:ring-0"
                            />

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  fileInputRefs.current[lesson.id]?.click()
                                }
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                  lesson.videoStatus === "pending"
                                    ? "text-gray-500 bg-gray-100 hover:bg-red-50 hover:text-red-600"
                                    : "text-red-600 bg-red-50 hover:bg-red-100"
                                }`}
                              >
                                <Video className="w-3.5 h-3.5" />
                                {lesson.videoStatus === "pending"
                                  ? "Add Video"
                                  : "Change Video"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  addLessonLink(chapter.id, lesson.id)
                                }
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Add Reading Link"
                              >
                                <LinkIcon className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.createElement("input");
                                  input.type = "file";
                                  input.accept =
                                    "application/pdf,image/jpeg,image/png";
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement)
                                      .files?.[0];
                                    if (file)
                                      handleMaterialSelect(
                                        chapter.id,
                                        lesson.id,
                                        file,
                                      );
                                  };
                                  input.click();
                                }}
                                className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                title="Add File (PDF/Image)"
                              >
                                <FilePlus className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  removeLesson(chapter.id, lesson.id)
                                }
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Video Status Row (If active) */}
                          {lesson.videoStatus !== "pending" && (
                            <div className="flex items-center gap-3 pl-9">
                              <div className="flex items-center gap-2 shrink-0">
                                {lesson.videoStatus === "selected" && (
                                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg animate-pulse">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Waiting...
                                  </span>
                                )}
                                {lesson.videoStatus === "uploading" && (
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-300 ease-out"
                                        style={{
                                          width: `${lesson.uploadProgress}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs font-bold text-red-600 min-w-[3rem] text-right">
                                      {lesson.uploadProgress}%
                                    </span>
                                  </div>
                                )}
                                {lesson.videoStatus === "uploaded" && (
                                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-lg">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Video Uploaded
                                  </span>
                                )}
                                {lesson.videoStatus === "error" && (
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="text-xs font-semibold text-red-500 max-w-[150px] truncate"
                                      title={
                                        lesson.uploadError || "Upload failed"
                                      }
                                    >
                                      {lesson.uploadError || "Failed"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        retryUpload(chapter.id, lesson.id)
                                      }
                                      className="text-xs font-bold text-red-600 underline hover:text-red-700 cursor-pointer"
                                    >
                                      Retry
                                    </button>
                                  </div>
                                )}
                                {lesson.videoFileName && (
                                  <span
                                    className="text-[10px] text-gray-400 font-medium max-w-[150px] sm:max-w-xs truncate"
                                    title={lesson.videoFileName}
                                  >
                                    {lesson.videoFileName} (
                                    {formatFileSize(lesson.videoFileSize)})
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Expansion Area: Description */}
                          <div className="pl-9 pr-2 space-y-3 mt-1">
                            <textarea
                              value={lesson.description}
                              onChange={(e) =>
                                updateLessonDescription(
                                  chapter.id,
                                  lesson.id,
                                  e.target.value,
                                )
                              }
                              placeholder="Write a text description or notes for this lesson (optional)..."
                              rows={2}
                              className="w-full text-sm text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-100 focus:border-red-300 focus:ring-4 focus:ring-red-50 rounded-xl px-4 py-2 resize-y transition-all"
                            />

                            {/* Links List */}
                            {lesson.links.length > 0 && (
                              <div className="space-y-2">
                                {lesson.links.map((link, linkIdx) => (
                                  <div
                                    key={linkIdx}
                                    className="flex items-center gap-2"
                                  >
                                    <LinkIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                    <input
                                      type="url"
                                      value={link}
                                      onChange={(e) =>
                                        updateLessonLink(
                                          chapter.id,
                                          lesson.id,
                                          linkIdx,
                                          e.target.value,
                                        )
                                      }
                                      placeholder="https://example.com/reading-material"
                                      className="flex-1 text-xs text-blue-600 placeholder-gray-400 bg-transparent border-b border-gray-200 focus:border-blue-400 focus:outline-none px-1 py-1"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeLessonLink(
                                          chapter.id,
                                          lesson.id,
                                          linkIdx,
                                        )
                                      }
                                      className="text-gray-400 hover:text-red-500 p-1"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Materials List */}
                            {lesson.materials.length > 0 && (
                              <div className="space-y-2">
                                {lesson.materials.map((mat) => (
                                  <div
                                    key={mat.id}
                                    className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100"
                                  >
                                    <FileIcon className="w-4 h-4 text-purple-400 shrink-0" />
                                    <div className="flex-1 flex items-center justify-between min-w-0">
                                      <span className="text-xs font-medium text-gray-700 truncate pr-4">
                                        {mat.fileName} (
                                        {formatFileSize(mat.fileSize)})
                                      </span>

                                      <div className="flex items-center gap-2 shrink-0">
                                        {mat.status === "selected" && (
                                          <span className="text-[10px] font-bold text-gray-400">
                                            Waiting...
                                          </span>
                                        )}
                                        {mat.status === "uploading" && (
                                          <span className="text-[10px] font-bold text-purple-600">
                                            {mat.progress}%
                                          </span>
                                        )}
                                        {mat.status === "uploaded" && (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        )}
                                        {mat.status === "error" && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-red-500 truncate max-w-[80px]">
                                              {mat.error}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                retryMaterialUpload(
                                                  chapter.id,
                                                  lesson.id,
                                                  mat.id,
                                                )
                                              }
                                              className="text-[10px] text-red-600 underline"
                                            >
                                              Retry
                                            </button>
                                          </div>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeLessonMaterial(
                                              chapter.id,
                                              lesson.id,
                                              mat.id,
                                            )
                                          }
                                          className="text-gray-400 hover:text-red-500 ml-2"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Hidden file input for video */}
                        <input
                          ref={(el) => {
                            if (el) fileInputRefs.current[lesson.id] = el;
                          }}
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleVideoSelect(chapter.id, lesson.id, file);
                            }
                          }}
                        />
                      </div>
                    ))}

                    {/* Add Lesson Button */}
                    <button
                      type="button"
                      onClick={() => addLesson(chapter.id)}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-red-300 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      Add Lesson
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Chapter Button */}
          <button
            type="button"
            onClick={addChapter}
            className="flex items-center gap-3 w-full px-6 py-5 text-base font-bold text-gray-500 hover:text-red-600 bg-white hover:bg-red-50/50 rounded-3xl border-2 border-dashed border-gray-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-2xl bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            Add Chapter
          </button>
        </div>

        {/* Error Message */}
        {step2Error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            {step2Error}
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="group flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Course Details
          </button>
          <button
            type="button"
            onClick={handleGoToStep3}
            className="group flex items-center gap-2.5 px-8 py-4 bg-red-600 text-white text-base font-bold rounded-2xl hover:bg-red-700 shadow-xl shadow-red-600/20 hover:shadow-red-600/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            Review &amp; Submit
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-[fade-in-up_0.3s_ease-out]">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Delete{" "}
                  {itemToDelete.type === "chapter"
                    ? "Chapter"
                    : itemToDelete.type === "lesson"
                      ? "Lesson"
                      : itemToDelete.type === "link"
                        ? "Link"
                        : "Material"}
                  ?
                </h3>
                <p className="text-gray-500 text-sm mb-8">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-700">
                    {itemToDelete.type === "link"
                      ? "this URL"
                      : itemToDelete.title}
                  </span>
                  ? This action cannot be undone.
                </p>

                <div className="flex w-full gap-3">
                  <button
                    type="button"
                    onClick={() => setItemToDelete(null)}
                    className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-[0_4px_12px_rgba(220,38,38,0.3)] hover:shadow-[0_6px_16px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fade-in-up_0.4s_ease-out]">
      {/* Page Header */}
      <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-300 rounded-r-full" />
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight leading-tight">
            Create a Course
          </h1>
          <p className="text-gray-400 text-sm font-medium mt-0.5">
            Fill in the details to start building your new course
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3">
        {[
          { num: 1, label: "Course Details" },
          { num: 2, label: "Chapters & Lessons" },
          { num: 3, label: "Review & Submit" },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step === s.num
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/25 scale-110"
                    : step > s.num
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span
                className={`text-sm font-semibold hidden sm:inline ${
                  step === s.num
                    ? "text-gray-900"
                    : step > s.num
                      ? "text-red-500"
                      : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`w-8 sm:w-16 h-[3px] rounded-full transition-colors ${
                  step > s.num ? "bg-red-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                <BookOpen className="w-4 h-4 text-red-500" />
                Course Title
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => {
                  setMetadata({ ...metadata, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: "" });
                }}
                placeholder="e.g., Mastering the Sicilian Defense"
                className={`w-full px-5 py-4 rounded-2xl border-2 text-gray-900 placeholder-gray-400 text-base font-medium transition-all duration-200 focus:outline-none ${
                  errors.title
                    ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                    : "border-gray-200 bg-gray-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:bg-white"
                }`}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                <FileText className="w-4 h-4 text-red-500" />
                Description
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) => {
                  setMetadata({ ...metadata, description: e.target.value });
                  if (errors.description)
                    setErrors({ ...errors, description: "" });
                }}
                placeholder="Describe what students will learn, the structure of the course, and any prerequisites..."
                rows={7}
                className={`w-full px-5 py-4 rounded-2xl border-2 text-gray-900 placeholder-gray-400 text-base font-medium transition-all duration-200 focus:outline-none resize-none ${
                  errors.description
                    ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                    : "border-gray-200 bg-gray-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:bg-white"
                }`}
              />
              <div className="flex justify-between mt-2">
                {errors.description ? (
                  <p className="text-sm text-red-500 font-medium flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                    {errors.description}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-gray-400 font-medium">
                  {metadata.description.length} characters
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <label className="text-base font-bold text-gray-900 flex items-center gap-2">
                    Course Tags
                    <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-red-100 text-red-700">
                      Required
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    Adding accurate tags helps us suggest your course to new
                    students! Think about what topics, openings, or skills your
                    course covers. Add at least one tag.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4 ml-14">
                {metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 text-red-600 text-sm font-semibold border border-red-100 group hover:bg-red-100 transition-colors"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  onFocus={() => {
                    if (tagSuggestions.length > 0) setShowSuggestions(true);
                  }}
                  placeholder="e.g., opening, defense, strategy..."
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 text-base font-medium transition-all duration-200 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:bg-white"
                />
                {/* Autocomplete Dropdown */}
                {showSuggestions && tagSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-20 top-full mt-2 w-full bg-white rounded-2xl border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden"
                  >
                    {tagSuggestions.map((suggestion, idx) => (
                      <button
                        key={suggestion.name}
                        type="button"
                        onClick={() => addTag(suggestion.name)}
                        className={`w-full flex items-center justify-between px-5 py-3 text-left text-sm font-medium transition-colors cursor-pointer ${
                          idx === selectedSuggestionIndex
                            ? "bg-red-50 text-red-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-gray-400" />
                          {suggestion.name}
                        </span>
                        <span className="text-xs text-gray-400 font-semibold">
                          {suggestion.usageCount} course
                          {suggestion.usageCount !== 1 ? "s" : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {tagInput.trim() &&
                tagSuggestions.length === 0 &&
                tagInput.trim().length >= 2 && (
                  <p className="text-xs text-gray-400 mt-2 font-medium">
                    Press Enter to add &ldquo;{tagInput.trim()}&rdquo; as a new
                    tag
                  </p>
                )}
              <div className="mt-3">
                {errors.tags ? (
                  <p className="text-sm font-semibold text-red-500 animate-[fade-in-up_0.2s_ease-out]">
                    {errors.tags}
                  </p>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Thumbnail Upload Dropzone */}
            <div>
              <label className="flex items-center gap-2 text-base font-bold text-gray-700 mb-2">
                <ImageIcon className="w-5 h-5 text-red-500" />
                Course Thumbnail
              </label>
              <p className="text-sm text-gray-500 mb-4 font-medium">
                Ideal size:{" "}
                <strong className="text-gray-700">1280x720px (16:9)</strong>.
                Max: 4MB.
              </p>

              <div
                className={`relative group rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] cursor-pointer overflow-hidden ${
                  errors.thumbnailFile
                    ? "border-red-400 bg-red-50/30 hover:bg-red-50/60"
                    : metadata.thumbnailUploadStatus === "success"
                      ? "border-emerald-400 bg-emerald-50/10 hover:border-emerald-500"
                      : "border-gray-200 bg-gray-50/30 hover:bg-gray-50 hover:border-red-300"
                }`}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/jpeg,image/png,image/webp";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleThumbnailSelect(file);
                  };
                  input.click();
                }}
              >
                {metadata.thumbnailUploadStatus === "success" &&
                metadata.thumbnailFile ? (
                  <div className="absolute inset-0 w-full h-full bg-black/5">
                    {/* We use an object URL purely for local preview instantly without needing to load the remote URL */}
                    <img
                      src={URL.createObjectURL(metadata.thumbnailFile)}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-40"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                      <CheckCircle2 className="w-8 h-8 text-white mb-2" />
                      <span className="text-white font-bold text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                        Replace
                      </span>
                    </div>
                  </div>
                ) : metadata.thumbnailUploadStatus === "uploading" ? (
                  <div className="flex flex-col items-center gap-4 w-full px-6">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-300 ease-out"
                        style={{
                          width: `${metadata.thumbnailUploadProgress}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      {metadata.thumbnailUploadProgress}%
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:-translate-y-1 transition-all">
                      <Upload className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      Click to upload
                    </span>
                  </>
                )}
              </div>

              {errors.thumbnailFile && (
                <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1.5 animate-[fade-in-up_0.2s_ease-out]">
                  <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                  {errors.thumbnailFile}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                <DollarSign className="w-4 h-4 text-red-500" />
                Price (LKR)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base">
                  Rs.
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={metadata.price}
                  onChange={(e) => {
                    setMetadata({ ...metadata, price: e.target.value });
                    if (errors.price) setErrors({ ...errors, price: "" });
                  }}
                  placeholder="2500"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 text-gray-900 placeholder-gray-400 text-base font-medium transition-all duration-200 focus:outline-none ${
                    errors.price
                      ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      : "border-gray-200 bg-gray-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:bg-white"
                  }`}
                />
              </div>
              {errors.price && (
                <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  {errors.price}
                </p>
              )}
            </div>

            {/* Level */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                <BarChart3 className="w-4 h-4 text-red-500" />
                Difficulty Level
              </label>
              <div className="space-y-2">
                {levels.map((lvl) => (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() =>
                      setMetadata({ ...metadata, level: lvl.value })
                    }
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
                      metadata.level === lvl.value
                        ? "border-red-500 bg-red-50/70 shadow-sm"
                        : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-6 flex justify-center">
                      <lvl.icon className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold ${
                          metadata.level === lvl.value
                            ? "text-red-600"
                            : "text-gray-700"
                        }`}
                      >
                        {lvl.label}
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                        metadata.level === lvl.value
                          ? "border-red-500 bg-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      {metadata.level === lvl.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={handleNextStep}
            className="group flex items-center gap-2.5 px-8 py-4 bg-red-600 text-white text-base font-bold rounded-2xl hover:bg-red-700 shadow-xl shadow-red-600/20 hover:shadow-red-600/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            Next: Add Chapters
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
