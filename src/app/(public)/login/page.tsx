"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhoneEntry from "@/components/auth/PhoneEntry";
import OTPEntry from "@/components/auth/OTPEntry";
import StudentRegistrationForm from "@/components/auth/StudentRegistrationForm";

type Step = "phone" | "otp" | "register";

export default function LoginPage() {
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
      if (data.role === "coach" && data.verificationStatus === "pending") {
        router.push("/become-a-coach");
      } else if (data.role === "manager") {
        router.push("/manager");
      } else if (data.role === "coach") {
        router.push("/coach");
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

  const handleRegister = async (formData: {
    name: string;
    email?: string;
    dateOfBirth: string;
    gender: string;
    [key: string]: unknown;
  }) => {
    const res = await fetch("/api/auth/complete-registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, role: "student" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    router.push("/student");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding & Decoration */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Animated grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating chess pieces — decorative */}
        <div className="absolute top-[15%] left-[10%] text-[120px] leading-none text-white/[0.04] animate-[float_8s_ease-in-out_infinite] select-none">
          ♛
        </div>
        <div className="absolute top-[55%] right-[15%] text-[100px] leading-none text-white/[0.04] animate-[float_6s_ease-in-out_infinite_1s] select-none">
          ♞
        </div>
        <div className="absolute bottom-[10%] left-[20%] text-[80px] leading-none text-white/[0.04] animate-[float_10s_ease-in-out_infinite_2s] select-none">
          ♜
        </div>

        {/* Red accent glow */}
        <div className="absolute top-1/4 -right-20 w-64 h-64 bg-red-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-red-600/10 rounded-full blur-[100px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 group-hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="Caissa Chess Courses Logo"
                className="object-contain w-full h-full"
              />
            </div>
            <span className="font-[family-name:var(--font-outfit)] font-bold text-xl text-white">
              Caissa <span className="text-red-500">Chess Courses</span>
            </span>
          </Link>

          {/* Main Message */}
          <div className="animate-[fade-in-up_0.8s_ease-out]">
            <h2 className="text-5xl font-bold text-white font-[family-name:var(--font-outfit)] leading-tight mb-6">
              Master the
              <br />
              <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
                Royal Game
              </span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
              Learn from titled players and Grandmasters. Structured courses
              designed to take you from beginner to champion.
            </p>

            {/* Stats */}
            <div className="mt-10 flex gap-8">
              {[
                { value: "50+", label: "Expert Courses" },
                { value: "20+", label: "Titled Coaches" },
                { value: "2K+", label: "Students" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white font-[family-name:var(--font-outfit)]">
                    {stat.value}
                  </div>
                  <div className="text-gray-500 text-sm mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Testimonial */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-[fade-in-up_1s_ease-out]">
            <p className="text-gray-300 text-sm italic leading-relaxed">
              &ldquo;Caissa&apos;s structured approach helped me gain 300 rating
              points in just 4 months. The quality of coaching is
              world-class.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xs font-bold">
                K
              </div>
              <div>
                <p className="text-white text-sm font-medium">
                  Kavitha Jayasuriya
                </p>
                <p className="text-gray-500 text-xs">Student, Colombo</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-3.5 h-3.5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden p-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10">
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
        </div>

        {/* Form Area */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2 mb-8 animate-[fade-in-up_0.4s_ease-out]">
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
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          isActive
                            ? "bg-red-600 text-white shadow-lg shadow-red-600/30 scale-110"
                            : isComplete
                              ? "bg-red-100 text-red-600 border-2 border-red-300"
                              : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {isComplete ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-medium ${
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
                        className={`w-14 h-[2px] rounded-full mb-4 transition-all duration-500 ${
                          isComplete ? "bg-red-400" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 animate-[fade-in-up_0.6s_ease-out]">
              {step === "phone" && <PhoneEntry onSubmit={handleSendOTP} />}
              {step === "otp" && (
                <OTPEntry
                  phoneNumber={phoneNumber}
                  onSubmit={handleVerifyOTP}
                  onResend={handleResendOTP}
                />
              )}
              {step === "register" && (
                <StudentRegistrationForm onSubmit={handleRegister} />
              )}
            </div>

            {/* Link to coach signup */}
            {step === "phone" && (
              <p className="text-center text-gray-400 text-sm mt-6 animate-[fade-in-up_0.8s_ease-out]">
                Want to teach?{" "}
                <Link
                  href="/become-a-coach"
                  className="text-red-500 hover:text-red-600 font-semibold transition-colors"
                >
                  Apply as a Coach →
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="px-6 py-4 text-center">
          <p className="text-gray-300 text-xs">
            © 2026 Caissa Chess Academy. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
      `}</style>
    </div>
  );
}
