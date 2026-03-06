/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, Users, Trophy, ShieldCheck, ArrowLeft } from "lucide-react";
import PhoneEntry from "@/components/auth/PhoneEntry";
import OTPEntry from "@/components/auth/OTPEntry";
import StudentRegistrationForm from "@/components/auth/StudentRegistrationForm";

type Step = "phone" | "otp" | "register";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl");
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.session?.isNewUser) {
          setStep("register");
        }
      })
      .catch(console.error);
  }, []);

  const handleSendOTP = async (phone: string) => {
    setPhoneNumber(phone);
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsappNumber: phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setStep("otp");
  };

  const handleVerifyOTP = async (otp: string) => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsappNumber: phoneNumber, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    if (data.isNewUser) {
      setStep("register");
    } else {
      if (callbackUrl && data.role !== "manager") {
        router.push(callbackUrl);
      } else if (
        data.role === "coach" &&
        data.verificationStatus === "paused"
      ) {
        router.push("/coach-paused");
      } else if (
        data.role === "coach" &&
        data.verificationStatus === "pending"
      ) {
        router.push("/coach-pending");
      } else if (data.role === "manager") {
        router.push("/manager/dashboard");
      } else if (data.role === "coach") {
        router.push("/coach/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    }
  };

  const handleResendOTP = async () => {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsappNumber: phoneNumber }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
  };

  const handleRegister = async (
    formData: Record<string, any>,
    regRole: "student" | "coach",
  ) => {
    let body;
    let headers: Record<string, string> = {};

    if (formData.profilePicture) {
      const fb = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "profilePicture" || key === "profilePictureThumbnail") {
          fb.append(key, formData[key]);
        } else if (Array.isArray(formData[key])) {
          fb.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== undefined) {
          fb.append(key, formData[key]);
        }
      });
      fb.append("role", regRole);
      body = fb;
    } else {
      body = JSON.stringify({ ...formData, role: regRole });
      headers = { "Content-Type": "application/json" };
    }

    const res = await fetch("/api/auth/complete-registration", {
      method: "POST",
      headers,
      body,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    if (callbackUrl) {
      router.push(callbackUrl);
    } else if (data.role === "coach") {
      router.push("/coach-pending");
    } else {
      router.push("/student");
    }
  };

  const features = [
    { icon: BookOpen, value: "50+", label: "Expert Courses" },
    { icon: Users, value: "20+", label: "Titled Coaches" },
    { icon: Trophy, value: "2K+", label: "Active Students" },
    { icon: ShieldCheck, value: "100%", label: "Secure" },
  ];

  return (
    <div className="min-h-screen relative bg-white">
      {/* Background — matching hero section style */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* CSS Grid pattern (same as hero) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
        {/* Subtle red glow top-right */}
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-red-500/8 blur-[120px]" />
        {/* Subtle red glow bottom-left */}
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-red-400/6 blur-[100px]" />
        {/* Very soft center warmth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-red-50/50 blur-[150px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 group-hover:scale-105 transition-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Caissa Chess Courses Logo"
                className="object-contain w-full h-full"
              />
            </div>
            <span className="font-[family-name:var(--font-outfit)] font-bold text-lg text-gray-900">
              Caissa <span className="text-red-600">Chess Courses</span>
            </span>
          </Link>

          <Link
            href="/become-a-coach"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
          >
            Are you a coach?
            <span className="text-red-500 font-semibold">Apply here →</span>
          </Link>
        </header>

        {/* Main */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          {/* Step Indicators */}
          <div className="flex items-center gap-2 mb-6 animate-[fade-in-up_0.3s_ease-out]">
            {[
              { key: "phone", label: "Phone" },
              { key: "otp", label: "Verify" },
              { key: "register", label: "Profile" },
            ].map((s, i) => {
              const steps = ["phone", "otp", "register"];
              const currentIndex = steps.indexOf(step);
              const isActive = step === s.key;
              const isComplete = currentIndex > i;

              return (
                <div key={s.key} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isActive
                          ? "bg-red-600 text-white shadow-xl shadow-red-500/25 scale-110"
                          : isComplete
                            ? "bg-red-100 text-red-600"
                            : "bg-white text-gray-400 border border-gray-200 shadow-sm"
                      }`}
                    >
                      {isComplete ? "✓" : i + 1}
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-semibold tracking-wide ${
                        isActive
                          ? "text-red-600"
                          : isComplete
                            ? "text-red-500"
                            : "text-gray-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      className={`w-12 sm:w-16 h-[3px] rounded-full mb-6 transition-colors duration-500 ${
                        isComplete ? "bg-red-400" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form Card */}
          <div
            className={`w-full ${
              step === "register" ? "max-w-3xl" : "max-w-md"
            } bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10 animate-[fade-in-up_0.5s_ease-out] transition-all duration-500`}
          >
            {step === "phone" && <PhoneEntry onSubmit={handleSendOTP} />}
            {step === "otp" && (
              <OTPEntry
                phoneNumber={phoneNumber}
                onSubmit={handleVerifyOTP}
                onResend={handleResendOTP}
              />
            )}
            {step === "register" && (
              <StudentRegistrationForm
                onSubmit={(data) => handleRegister(data, "student")}
              />
            )}
          </div>

          {/* Feature Stats */}
          {step === "phone" && (
            <div className="grid grid-cols-4 gap-3 mt-8 w-full max-w-md animate-[fade-in-up_0.7s_ease-out]">
              {features.map((f) => (
                <div
                  key={f.label}
                  className="flex flex-col items-center gap-1.5 py-4 px-2 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-red-100 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                    <f.icon className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="text-lg font-bold text-gray-900 font-[family-name:var(--font-outfit)]">
                    {f.value}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium text-center leading-tight">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Coach Link (mobile) */}
          {step === "phone" && (
            <p className="sm:hidden text-center text-gray-400 text-sm mt-6">
              Want to teach?{" "}
              <Link
                href="/become-a-coach"
                className="text-red-500 hover:text-red-600 font-semibold"
              >
                Apply as a Coach →
              </Link>
            </p>
          )}
        </main>

        {/* Footer */}
        <footer className="px-6 py-5 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>
          <span className="text-gray-200">·</span>
          <p className="text-gray-300 text-xs">© 2026 Caissa Chess Academy</p>
        </footer>
      </div>
    </div>
  );
}
