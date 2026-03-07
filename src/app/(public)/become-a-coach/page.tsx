"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavbarClient from "@/components/landing/NavbarClient";
import Footer from "@/components/landing/Footer";
import PhoneEntry from "@/components/auth/PhoneEntry";
import OTPEntry from "@/components/auth/OTPEntry";
import CoachRegistrationForm from "@/components/auth/CoachRegistrationForm";
import {
  ShieldCheck,
  Video,
  LineChart,
  Megaphone,
  Smartphone,
  ChevronRight,
  BadgePercent,
  PlayCircle,
} from "lucide-react";

type Step = "phone" | "otp" | "register" | "pending";

export default function BecomeACoachPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [initialData, setInitialData] = useState<any>(undefined);

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
    scrollToForm();
  };

  const handleVerifyOTP = async (otp: string) => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        whatsappNumber: phoneNumber,
        otp,
        loginType: "coach",
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    if (data.isNewUser) {
      if (data.existingProfile) setInitialData(data.existingProfile);
      setStep("register");
      scrollToForm();
    } else {
      if (data.role === "manager") {
        router.push("/manager/dashboard");
      } else if (data.role === "coach") {
        if (data.verificationStatus === "paused") {
          router.push("/coach-paused");
        } else if (data.verificationStatus === "pending") {
          router.push("/coach-pending");
        } else {
          router.push("/coach/dashboard");
        }
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRegister = async (formData: any) => {
    let body;
    let headers: Record<string, string> = {};

    if (formData.profilePicture || formData.cv) {
      const fb = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "profilePicture" || key === "profilePictureThumbnail") {
          if (formData[key]) {
            const filename =
              key === "profilePictureThumbnail"
                ? "thumbnail.webp"
                : formData[key].name || "photo.jpg";
            fb.append(key, formData[key], filename);
          }
        } else if (key === "cv") {
          if (formData[key]) {
            fb.append(key, formData[key], formData[key].name || "cv");
          }
        } else if (Array.isArray(formData[key])) {
          fb.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== undefined) {
          fb.append(key, formData[key]);
        }
      });
      fb.append("role", "coach");
      body = fb;
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
      router.push("/coach-pending");
    }
  };

  const scrollToForm = () => {
    const element = document.getElementById("apply-form");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <NavbarClient session={null} />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gray-900">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary-red/[0.08] rounded-full blur-[120px]"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold mb-6">
              <Megaphone className="w-4 h-4 text-primary-red" />
              Join Our Elite Roster
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white">
              Share Your Mastery{" "}
              <span className="text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">
                With The World
              </span>
            </h1>
            <p className="font-sans text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
              Become a coach at Caissa Chess Academy. Create structured video
              courses, set your own prices, and reach thousands of passionate
              students across Sri Lanka.
            </p>
            <button
              onClick={scrollToForm}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-red text-white font-bold hover:bg-accent-red transition-all shadow-lg shadow-primary-red/20 hover:-translate-y-0.5"
            >
              Apply to Teach
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                How It Works
              </h2>
              <p className="text-gray-600 text-lg">
                The journey to becoming a certified Caissa Coach is simple,
                straightforward, and secure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow relative">
                <div className="hidden md:block absolute top-14 -right-4 w-8 border-t-2 border-dashed border-gray-300 z-10"></div>
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                  <Smartphone className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">
                  1. Verify Number
                </h3>
                <p className="text-gray-600 text-sm">
                  Start by securely validating your WhatsApp number to begin
                  your application and create your profile.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow relative">
                <div className="hidden md:block absolute top-14 -right-4 w-8 border-t-2 border-dashed border-gray-300 z-10"></div>
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">
                  2. Panel Verification
                </h3>
                <p className="text-gray-600 text-sm">
                  The Caissa Academy will review your qualifications to ensure
                  top-tier quality for our students.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow relative">
                <div className="hidden md:block absolute top-14 -right-4 w-8 border-t-2 border-dashed border-gray-300 z-10"></div>
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <Video className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">
                  3. Add Courses
                </h3>
                <p className="text-gray-600 text-sm">
                  Once verified, easily upload your video courses. You decide
                  your own course prices and discount amounts.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <LineChart className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">
                  4. Coach Dashboard
                </h3>
                <p className="text-gray-600 text-sm">
                  Manage your students, track your earnings, and update your
                  content seamlessly via your personalized dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl relative">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                    alt="Team collaborating"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 animate-[bounce_4s_ease-in-out_infinite]">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <BadgePercent className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-medium">
                      Custom
                    </div>
                    <div className="font-extrabold text-xl text-gray-900">
                      Discounts
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                  Focus on Teaching, <br />
                  <span className="text-primary-red">We Handle the Rest</span>
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Creating high-quality educational content takes time. That's
                  why we take the technical and marketing burdens off your
                  shoulders.
                </p>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <PlayCircle className="w-6 h-6 text-primary-red" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        Hosting & Platform
                      </h3>
                      <p className="text-gray-600">
                        We provide top-tier video hosting, secure streaming, and
                        a smooth learning experience for all your students.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <Megaphone className="w-6 h-6 text-primary-red" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        Marketing & Growth
                      </h3>
                      <p className="text-gray-600">
                        We actively market the platform to bring eager students
                        directly to your courses. All of this is covered by a
                        standard platform fee. You keep the rest.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Application Form Section */}
        <section
          id="apply-form"
          className="py-24 bg-gray-50 relative border-t border-gray-200"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                Begin Your Application
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Ready to inspire? Follow the steps below to join the Caissa
                Chess Academy coaching team.
              </p>
            </div>

            <div className="flex justify-center">
              <div
                className={`w-full ${step === "register" ? "max-w-4xl" : "max-w-md"} transition-all duration-500`}
              >
                {/* Step Indicators */}
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

                {/* Form Card */}
                <div className="bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.06)] border border-gray-100 p-8 sm:p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/2" />

                  <div className="relative z-10">
                    {step === "phone" && (
                      <PhoneEntry
                        onSubmit={handleSendOTP}
                        title="Coach Application"
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
                      <CoachRegistrationForm
                        onSubmit={handleRegister}
                        initialData={initialData}
                      />
                    )}
                  </div>
                </div>

                {/* Looking to learn link */}
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
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
