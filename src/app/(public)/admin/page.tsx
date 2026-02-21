"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import OTPEntry from "@/components/auth/OTPEntry";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"login" | "otp">("login");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.requireOtp) {
        setWhatsappNumber(data.whatsappNumber);
        setStep("otp");
      } else {
        // Fallback for direct login if OTP was disabled
        router.push(data.redirect || "/manager/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsappNumber, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    router.push("/manager/dashboard");
    router.refresh();
  };

  const handleResendOTP = async () => {
    // We resend the OTP by hitting the admin-login endpoint again with the credentials
    const res = await fetch("/api/auth/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to resend code");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none border-b border-gray-200">
        {/* CSS Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
        {/* Subtle red glow top-right */}
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-red-500/8 blur-[120px]" />
        {/* Subtle red glow bottom-left */}
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-red-400/6 blur-[100px]" />
        {/* Very soft center warmth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-red-50/50 blur-[150px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center flex-col items-center relative">
          {step === "otp" && (
            <button
              onClick={() => setStep("login")}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
              aria-label="Back to login"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="inline-block group">
            <div className="w-16 h-16 group-hover:scale-105 transition-transform duration-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Caissa Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold font-[family-name:var(--font-outfit)] tracking-tight text-gray-900">
            Manager Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === "login"
              ? "Sign in to access the administration dashboard"
              : "Verify your identity to continue"}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-red-900/5 sm:rounded-2xl sm:px-10 border border-gray-100">
          {step === "login" ? (
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 animate-[fade-in_0.3s_ease-out]">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl shadow-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-shadow bg-white"
                    placeholder="Enter your admin username"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl shadow-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-shadow bg-white"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !username || !password}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    "Access Dashboard"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="animate-[fade-in_0.3s_ease-out]">
              <OTPEntry
                phoneNumber={whatsappNumber}
                onSubmit={handleVerifyOTP}
                onResend={handleResendOTP}
              />
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              This area is restricted to authorized administrative personnel
              only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
