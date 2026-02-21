"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";
import Link from "next/link";
import PhoneEntry from "@/components/auth/PhoneEntry";
import OTPEntry from "@/components/auth/OTPEntry";
import CoachRegistrationForm from "@/components/auth/CoachRegistrationForm";
import CoachPendingApproval from "@/components/auth/CoachPendingApproval";

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
      // Existing user
      if (data.role === "coach") {
        if (data.verificationStatus === "approved") {
          router.push("/coach");
        } else {
          setStep("pending");
        }
      } else if (data.role === "manager") {
        router.push("/manager");
      } else {
        // Student trying to access coach page — redirect to student dashboard
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

  const handleRegister = async (formData: Record<string, unknown>) => {
    const res = await fetch("/api/auth/complete-registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, role: "coach" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // After coach registration, always show pending
    if (data.role === "coach") {
      setStep("pending");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white hover:text-red-400 transition-colors"
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
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step === s
                        ? "bg-red-600 text-white"
                        : ["phone", "otp", "register"].indexOf(step) > i
                          ? "bg-red-600/20 text-red-400 border border-red-500/30"
                          : "bg-gray-800 text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < 2 && (
                    <div
                      className={`w-12 h-0.5 ${
                        ["phone", "otp", "register"].indexOf(step) > i
                          ? "bg-red-600/40"
                          : "bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

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
          {step === "pending" && <CoachPendingApproval />}

          {/* Link to student login */}
          {step === "phone" && (
            <p className="text-center text-gray-500 text-sm mt-8">
              Looking to learn?{" "}
              <Link
                href="/login"
                className="text-red-400 hover:text-red-300 font-medium transition-colors"
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
