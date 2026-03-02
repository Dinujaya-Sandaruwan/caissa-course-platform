"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import NavbarClient from "@/components/landing/NavbarClient";
import Footer from "@/components/landing/Footer";
import {
  ArrowLeft,
  CreditCard,
  Upload,
  ImageIcon,
  Send,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";

interface CourseBasic {
  _id: string;
  title: string;
  price: number;
  discountedPrice?: number;
  level: string;
}

export default function EnrollPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [course, setCourse] = useState<CourseBasic | null>(null);
  const [loading, setLoading] = useState(true);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
        }
      } catch (err) {
        console.error("Failed to fetch course:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseId]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, WebP, or PDF file");
      return;
    }

    setReceiptFile(file);
    setError("");

    // Generate preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  }

  function removeReceipt() {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit() {
    setError("");

    if (!referenceNumber.trim()) {
      setError("Please enter the bank transfer reference number");
      return;
    }
    if (!receiptFile) {
      setError("Please upload your payment receipt");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("referenceNumber", referenceNumber.trim());
      formData.append("receipt", receiptFile);

      const res = await fetch("/api/student/enrollments", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit enrollment");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/student/dashboard");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <NavbarClient session={null} />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <NavbarClient session={null} />
        <div className="text-center py-32 min-h-screen">
          <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
          <Link
            href="/courses"
            className="text-red-600 hover:underline mt-4 inline-block text-sm font-semibold"
          >
            ← Browse courses
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavbarClient session={null} />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-2xl mx-auto px-6 pt-28 pb-20">
          {/* Back Link */}
          <Link
            href={`/courses/${courseId}`}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Course
          </Link>

          {/* Page Title */}
          <h1 className="text-3xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight">
            Enroll in Course
          </h1>
          <p className="text-gray-500 mt-2 text-base font-medium">
            Complete your payment and upload the receipt to enroll.
          </p>

          {/* Success State */}
          {success && (
            <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center animate-[fade-in-up_0.3s_ease-out]">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-emerald-800">
                Enrollment Submitted!
              </h3>
              <p className="text-sm text-emerald-600 mt-2">
                Your payment receipt is being reviewed. You&apos;ll receive a
                WhatsApp notification once approved.
              </p>
              <p className="text-xs text-emerald-500 mt-3">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {!success && (
            <div className="space-y-6 mt-8">
              {/* Course Summary Card */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Course
                    </p>
                    <h3 className="text-lg font-bold text-gray-900">
                      {course.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Amount
                    </p>
                    <p className="text-2xl font-extrabold text-red-600 flex flex-col items-end">
                      {course.discountedPrice ? (
                        <>
                          <span className="text-gray-400 line-through text-sm font-semibold mb-1">
                            Rs. {course.price?.toLocaleString()}
                          </span>
                          <span>
                            Rs. {course.discountedPrice.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span>Rs. {course.price?.toLocaleString()}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bank Details Card */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-red-500" />
                  Bank Account Details
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  Transfer the exact amount to the following bank account, then
                  upload your receipt below.
                </p>
                <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Account Name
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ||
                        "Caissa Chess Academy"}
                    </span>
                  </div>
                  <div className="border-t border-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Account Number
                    </span>
                    <span className="text-sm font-bold text-gray-900 font-mono">
                      {process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ||
                        "XXXX-XXXX-XXXX"}
                    </span>
                  </div>
                  <div className="border-t border-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Bank Name
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {process.env.NEXT_PUBLIC_BANK_NAME || "Bank of Ceylon"}
                    </span>
                  </div>
                  <div className="border-t border-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Branch
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {process.env.NEXT_PUBLIC_BANK_BRANCH || "Main Branch"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reference Number */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
                <label className="block text-base font-bold text-gray-900 mb-2">
                  Bank Transfer Reference Number
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Enter the reference/receipt number from your bank transfer
                </p>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. TXN-123456789"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 text-base font-medium transition-all focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                />
              </div>

              {/* Receipt Upload */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
                <label className="block text-base font-bold text-gray-900 mb-2">
                  Payment Receipt
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload a screenshot or photo of your bank transfer receipt
                  (JPG, PNG, or PDF)
                </p>

                {!receiptFile ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-10 flex flex-col items-center gap-3 hover:border-red-400 hover:bg-red-50/30 transition-colors cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-500">
                      Click to upload receipt
                    </span>
                    <span className="text-xs text-gray-400">
                      JPG, PNG, WebP, or PDF up to 10MB
                    </span>
                  </button>
                ) : (
                  <div className="border-2 border-gray-200 rounded-2xl p-4 space-y-3">
                    {/* Preview */}
                    {receiptPreview && (
                      <div className="relative rounded-xl overflow-hidden bg-gray-100 max-h-64 flex items-center justify-center">
                        <img
                          src={receiptPreview}
                          alt="Receipt preview"
                          className="max-h-64 object-contain"
                        />
                      </div>
                    )}
                    {!receiptPreview &&
                      receiptFile.type === "application/pdf" && (
                        <div className="flex items-center justify-center gap-2 py-6 bg-gray-50 rounded-xl">
                          <ImageIcon className="w-6 h-6 text-red-400" />
                          <span className="text-sm font-medium text-gray-600">
                            PDF Receipt
                          </span>
                        </div>
                      )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {receiptFile.name}
                        </span>
                        <span className="text-xs text-gray-400 shrink-0">
                          ({(receiptFile.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        onClick={removeReceipt}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2.5 px-8 py-4 bg-red-600 text-white text-base font-bold rounded-2xl hover:bg-red-700 shadow-xl shadow-red-600/20 hover:shadow-red-600/30 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Enrollment
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
