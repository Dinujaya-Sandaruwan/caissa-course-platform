"use client";

import NavbarClient from "@/components/landing/NavbarClient";
import Footer from "@/components/landing/Footer";
import {
  Award,
  ShieldCheck,
  GraduationCap,
  Users,
  Play,
  UploadCloud,
  CreditCard,
  ChevronRight,
  Search,
} from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <NavbarClient session={null} />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gray-900">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary-red/[0.08] rounded-full blur-[120px]"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold mb-6">
              <Award className="w-4 h-4 text-primary-red" />
              Sri Lanka's Premier Platform
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
              Empowering the Next Generation of{" "}
              <span className="text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">
                Chess Masters
              </span>
            </h1>
            <p className="font-sans text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              We are Sri Lanka's first and best chess learning platform,
              dedicated to connecting eager students with titled players and
              grandmasters through high-quality, structured video courses.
            </p>
          </div>
        </section>

        {/* The First & Best Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                  Setting the Standard in Chess Education
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Caissa Chess Academy was founded with a singular vision: to
                  elevate chess education in Sri Lanka. Before us, finding
                  structured, high-quality, local content from verified masters
                  was incredibly difficult. We changed that by building a
                  dedicated hub for excellence.
                </p>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6 text-primary-red" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        Expert-Led Courses
                      </h3>
                      <p className="text-gray-600">
                        Learn directly from National Champions, FIDE Masters,
                        and Grandmasters.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-primary-red" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        Quality Guaranteed
                      </h3>
                      <p className="text-gray-600">
                        Every course is strictly reviewed by our management team
                        to ensure the highest educational standards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-[2rem] overflow-hidden shadow-2xl relative">
                  <img
                    src="https://images.unsplash.com/photo-1529699211952-734e80c4d42b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                    alt="Chess pieces on a board"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                </div>
                {/* Floating stat card */}
                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center gap-4 animate-[bounce_3s_ease-in-out_infinite]">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-extrabold text-2xl text-gray-900">
                      300+
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      Active Students
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Purchasing */}
        <section className="py-20 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                Simple & Secure Purchasing
              </h2>
              <p className="text-gray-600 text-lg">
                We've intentionally kept our enrollment process straightforward
                to ensure maximum accessibility across the country.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">
                  1. Find Your Course
                </h3>
                <p className="text-gray-600">
                  Browse our extensive library. Watch free previews to ensure
                  the teaching style matches your learning needs.
                </p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow relative">
                {/* Arrow connector */}
                <div className="hidden md:block absolute top-14 -right-4 w-8 border-t-2 border-dashed border-gray-300 z-10"></div>

                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <CreditCard className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">
                  2. Bank Transfer
                </h3>
                <p className="text-gray-600">
                  Proceed to checkout and transfer the course fee directly to
                  our provided bank account details. Safe and reliable.
                </p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">
                  3. Upload & Access
                </h3>
                <p className="text-gray-600">
                  Upload a photo of your bank slip. Our management team quickly
                  verifies the payment and grants you instant lifetime access.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* For Coaches */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-900 rounded-[2.5rem] overflow-hidden relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

              <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10">
                <div className="p-10 lg:p-16 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-semibold mb-6 w-max">
                    For Coaches
                  </div>
                  <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white mb-6">
                    Share Your Mastery with the World
                  </h2>
                  <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                    Are you a titled player or an experienced coach? Join our
                    platform to monetize your knowledge. Film your courses,
                    submit them for review, and start earning while helping
                    students grow.
                  </p>

                  <ul className="space-y-4 mb-10">
                    <li className="flex items-start gap-3 text-gray-300">
                      <div className="mt-1 bg-primary-red/20 rounded-full p-1">
                        <ChevronRight className="w-4 h-4 text-primary-red" />
                      </div>
                      <span>Set your own price and course structure</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-300">
                      <div className="mt-1 bg-primary-red/20 rounded-full p-1">
                        <ChevronRight className="w-4 h-4 text-primary-red" />
                      </div>
                      <span>
                        We handle all the marketing and student management
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-300">
                      <div className="mt-1 bg-primary-red/20 rounded-full p-1">
                        <ChevronRight className="w-4 h-4 text-primary-red" />
                      </div>
                      <span>Get paid effortlessly for every enrollment</span>
                    </li>
                  </ul>

                  <a
                    href="/become-a-coach"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-red text-white font-bold hover:bg-accent-red transition-all w-max shadow-lg shadow-primary-red/20"
                  >
                    Apply to Teach
                  </a>
                </div>

                <div className="hidden lg:block relative opacity-90 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700">
                  <img
                    src="https://images.unsplash.com/photo-1580541832626-2a7131ee809f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Chess coach teaching"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
