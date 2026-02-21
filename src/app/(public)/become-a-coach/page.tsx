"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";
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
    const res = await fetch("/api/auth/complete-registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, role: "coach" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    if (data.role === "coach") {
      router.push("/coach/pending");
    }
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
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
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

          {/* Link to student login */}
          {step === "phone" && (
            <p className="text-center text-gray-400 text-sm mt-8">
              Looking to learn?{" "}
              <Link
                href="/login"
                className="text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                Sign in as a Student
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
