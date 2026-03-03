import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PauseCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import { connectDB } from "@/lib/db";
import CoachProfile from "@/models/CoachProfile";

export default async function CoachPausedPage() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "coach") {
    redirect(`/${session.role}/dashboard`);
  }

  await connectDB();
  const coach = await CoachProfile.findOne({ userId: session.userId });

  if (coach && coach.verificationStatus === "approved") {
    redirect("/coach/dashboard");
  }

  if (!coach || coach.verificationStatus !== "paused") {
    redirect("/coach-pending");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-100/40 rounded-full blur-3xl mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-50/40 rounded-full blur-3xl mix-blend-multiply pointer-events-none" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02] z-0">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[120vw] h-[120vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-900"
        >
          <path d="M19 22H5V20H19V22ZM17 18H7V15L9 12H15L17 15V18ZM15 10H9L12 4L15 10Z" />
        </svg>
      </div>

      {/* Header */}
      <header className="absolute top-0 w-full py-8 px-8 flex justify-between items-center z-10">
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
        <LogoutButton />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.06)] ring-1 ring-gray-900/5 overflow-hidden animate-[fade-in-up_0.6s_ease-out]">
          <div className="p-12 md:p-16 text-center">
            {/* Animated Icon */}
            <div className="relative w-28 h-28 mx-auto mb-10">
              <div className="absolute inset-0 bg-red-100 rounded-[2rem] rotate-6 opacity-50 animate-pulse" />
              <div className="absolute inset-0 bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(239,68,68,0.15)] flex items-center justify-center border border-red-50">
                <PauseCircle
                  className="w-12 h-12 text-red-500"
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight mb-6">
              Account Paused
            </h1>

            <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed mb-10 max-w-lg mx-auto">
              Your coaching account has been temporarily paused by an
              administrator. During this time, you will not be able to access
              your dashboard or manage courses.
            </p>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
              <div className="bg-slate-50/80 rounded-3xl p-6 border border-gray-100 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <PauseCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-900 tracking-wide uppercase">
                    Status
                  </span>
                </div>
                <p className="text-gray-600 font-medium">Temporarily Paused</p>
              </div>

              <div className="bg-slate-50/80 rounded-3xl p-6 border border-gray-100 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-gray-900 tracking-wide uppercase">
                    Contact Info
                  </span>
                </div>
                <p className="text-gray-600 font-medium break-all">
                  +{session.whatsappNumber}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="inline-flex items-center justify-center w-full px-8 py-4 bg-red-50 text-red-700 rounded-2xl font-bold text-sm">
              If you believe this is a mistake, please contact the
              administration via WhatsApp.
            </div>

            <div className="mt-10">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors group"
              >
                Return to Homepage
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
