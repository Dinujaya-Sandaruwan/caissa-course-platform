"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhoneEntry from "@/components/auth/PhoneEntry";
import OTPEntry from "@/components/auth/OTPEntry";
import CoachRegistrationForm from "@/components/auth/CoachRegistrationForm";

type Step = "phone" | "otp" | "register" | "pending";

export default function BecomeACoachPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");

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
      if (data.role === "coach") {
        if (data.verificationStatus === "approved") {
          router.push("/coach");
        } else {
          router.push("/coach/pending");
        }
      } else if (data.role === "manager") {
        router.push("/manager");
      } else {
        router.push("/student");
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRegister = async (formData: any) => {
    let body;
    let headers: Record<string, string> = {};

    if (formData.profilePicture) {
      const fb = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "profilePicture" || key === "profilePictureThumbnail") {
          if (formData[key]) fb.append(key, formData[key]);
        } else if (Array.isArray(formData[key])) {
          fb.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== undefined) {
          fb.append(key, formData[key]);
        }
      });
      fb.append("role", "coach");
      body = fb;
      // Let browser set Content-Type mapping with boundary
    } else {
      body = JSON.stringify({ ...formData, role: "coach" });
      headers = { "Content-Type": "application/json" };
    }

    const res = await fetch("/api/auth/complete-registration", {
      method: "POST",
      headers,
      body,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    if (data.role === "coach") {
      router.push("/coach/pending");
    }
  };

  return (
    <div className="min-h-screen relative bg-white">
      {/* Background — matching login and hero section style */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-red-500/8 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-red-400/6 blur-[100px]" />
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
              Caissa <span className="text-red-600">Coach</span>
            </span>
          </Link>
        </header>

        {/* Main Form Area */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div
            className={`w-full ${step === "register" ? "max-w-4xl" : "max-w-md"} transition-all duration-500`}
          >
            {/* Step Indicators (hidden on pending) */}
            {step !== "pending" && (
              <div className="flex items-center justify-center gap-2 mb-8">
                {["phone", "otp", "register"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          step === s
                            ? "bg-red-600 text-white shadow-xl shadow-red-500/25 scale-110"
                            : ["phone", "otp", "register"].indexOf(step) > i
                              ? "bg-red-100 text-red-600"
                              : "bg-white text-gray-400 border border-gray-200 shadow-sm"
                        }`}
                      >
                        {["phone", "otp", "register"].indexOf(step) > i
                          ? "✓"
                          : i + 1}
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-semibold tracking-wide ${
                          step === s
                            ? "text-red-600"
                            : ["phone", "otp", "register"].indexOf(step) > i
                              ? "text-red-500"
                              : "text-gray-400"
                        }`}
                      >
                        {s === "phone"
                          ? "Phone"
                          : s === "otp"
                            ? "Verify"
                            : "Profile"}
                      </span>
                    </div>
                    {i < 2 && (
                      <div
                        className={`w-12 sm:w-16 h-[3px] rounded-full mb-6 transition-colors duration-500 ${
                          ["phone", "otp", "register"].indexOf(step) > i
                            ? "bg-red-400"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Card Container */}
            <div className="bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.06)] border border-gray-100 p-8 sm:p-12 relative overflow-hidden">
              {/* Subtle card glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10">
                {step === "phone" && (
                  <PhoneEntry
                    onSubmit={handleSendOTP}
                    title="Become a Coach"
                    subtitle="Enter your WhatsApp number to apply"
                  />
                )}
                {step === "otp" && (
                  <OTPEntry
                    phoneNumber={phoneNumber}
                    onSubmit={handleVerifyOTP}
                    onResend={handleResendOTP}
                  />
                )}
                {step === "register" && (
                  <CoachRegistrationForm onSubmit={handleRegister} />
                )}
              </div>
            </div>

            {/* Link to student login */}
            {step === "phone" && (
              <p className="text-center text-gray-500 font-medium text-sm mt-8">
                Looking to learn?{" "}
                <Link
                  href="/login"
                  className="text-red-600 hover:text-red-700 font-bold transition-colors hover:underline"
                >
                  Sign in as a Student
                </Link>
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
