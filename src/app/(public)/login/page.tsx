"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-900 hover:text-red-600 transition-colors"
        >
          <Crown className="w-6 h-6 text-red-500" />
          <span className="font-bold text-lg font-[family-name:var(--font-outfit)]">
            Caissa Chess
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {["phone", "otp", "register"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step === s
                      ? "bg-red-600 text-white"
                      : ["phone", "otp", "register"].indexOf(step) > i
                        ? "bg-red-100 text-red-600 border border-red-300"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={`w-12 h-0.5 ${
                      ["phone", "otp", "register"].indexOf(step) > i
                        ? "bg-red-300"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
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
            <p className="text-center text-gray-400 text-sm mt-8">
              Want to teach?{" "}
              <Link
                href="/become-a-coach"
                className="text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                Apply as a Coach
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
