"use client";

import NavbarClient from "@/components/landing/NavbarClient";
import Footer from "@/components/landing/Footer";
import {
  ShieldCheck,
  Calendar,
  Lock,
  UserCheck,
  Eye,
  Database,
  Server,
  Scale,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <>
      <NavbarClient session={null} />
      <main className="min-h-screen bg-gray-50 flex flex-col">
        {/* Dark Theme Hero Section */}
        <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-900 border-b border-white/5">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
          <div className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-primary-red/[0.08] rounded-full blur-[140px]"></div>
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/[0.05] rounded-full blur-[120px]"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold mb-6">
              <ShieldCheck className="w-4 h-4 text-primary-red" />
              Your Privacy Matters
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Privacy{" "}
              <span className="text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">
                Policy
              </span>
            </h1>
            <p className="font-sans text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Understand how Caissa Academy collects, uses, and protects your
              information. We value transparency and your security.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="flex-1 pb-16 lg:pb-24 relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 lg:-mt-16">
          <div className="bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
            {/* Header / Date */}
            <div className="p-8 sm:px-12 sm:py-10 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-heading text-gray-900">
                  Information & Governance
                </h2>
                <p className="text-gray-500 mt-1">
                  Full details on our data handling practices.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                <Calendar className="w-4 h-4 text-primary-red" />
                Last Updated: March 4, 2026
              </div>
            </div>

            <div className="p-8 sm:p-12 space-y-12">
              {/* Point 1 */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-16 shrink-0 flex items-start justify-center">
                  <div className="w-12 h-12 bg-red-50 text-primary-red rounded-xl flex items-center justify-center">
                    <UserCheck className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                    1. Introduction
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Welcome to Caissa Academy. We respect your privacy and are
                    committed to protecting your personal data. This privacy
                    policy will inform you as to how we look after your personal
                    data when you visit our website (regardless of where you
                    visit it from) and tell you about your privacy rights and
                    how the law protects you.
                  </p>
                </div>
              </div>

              {/* Point 2 */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-16 shrink-0 flex items-start justify-center">
                  <div className="w-12 h-12 bg-gray-50 text-gray-700 border border-gray-100 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                    2. The Data We Collect About You
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We may collect, use, store and transfer different kinds of
                    personal data about you which we have grouped together as
                    follows:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-red mt-2 shrink-0"></span>
                      <span>
                        <strong className="text-gray-900">
                          Identity Data:
                        </strong>{" "}
                        includes first name, last name, username or similar
                        identifier.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-red mt-2 shrink-0"></span>
                      <span>
                        <strong className="text-gray-900">Contact Data:</strong>{" "}
                        includes WhatsApp number, telephone numbers, and email
                        address.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-red mt-2 shrink-0"></span>
                      <span>
                        <strong className="text-gray-900">
                          Financial Data:
                        </strong>{" "}
                        includes bank account and payment receipt details for
                        course enrollment.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-red mt-2 shrink-0"></span>
                      <span>
                        <strong className="text-gray-900">
                          Technical Data:
                        </strong>{" "}
                        includes internet protocol (IP) address, login data,
                        browser type and version, time zone setting and
                        location.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-red mt-2 shrink-0"></span>
                      <span>
                        <strong className="text-gray-900">Usage Data:</strong>{" "}
                        includes information about how you use our website,
                        products, and services.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Point 3 */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-16 shrink-0 flex items-start justify-center">
                  <div className="w-12 h-12 bg-red-50 text-primary-red rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                    3. How We Use Your Personal Data
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We will only use your personal data when the law allows us
                    to. Most commonly, we will use your personal data in the
                    following circumstances:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="text-primary-red shrink-0">•</span>
                      <span>
                        Where we need to perform the contract we are about to
                        enter into or have entered into with you (e.g. providing
                        course access).
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="text-primary-red shrink-0">•</span>
                      <span>
                        Where it is necessary for our legitimate interests (or
                        those of a third party) and your interests and
                        fundamental rights do not override those interests.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="text-primary-red shrink-0">•</span>
                      <span>
                        Where we need to comply with a legal obligation.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Point 4 */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-16 shrink-0 flex items-start justify-center">
                  <div className="w-12 h-12 bg-gray-50 text-gray-700 border border-gray-100 rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                    4. Data Security
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    We have put in place appropriate security measures to
                    prevent your personal data from being accidentally lost,
                    used, or accessed in an unauthorized way, altered, or
                    disclosed, including password hashing, OTP verifications via
                    WhatsApp, and restricted database entry points.
                  </p>
                </div>
              </div>

              {/* Point 5 */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-16 shrink-0 flex items-start justify-center">
                  <div className="w-12 h-12 bg-red-50 text-primary-red rounded-xl flex items-center justify-center">
                    <Server className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                    5. Data Retention
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    We will only retain your personal data for as long as
                    reasonably necessary to fulfill the purposes we collected it
                    for, including for the purposes of satisfying any legal,
                    regulatory, tax, accounting, or reporting requirements.
                  </p>
                </div>
              </div>

              {/* Point 6 */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-16 shrink-0 flex items-start justify-center">
                  <div className="w-12 h-12 bg-gray-50 text-gray-700 border border-gray-100 rounded-xl flex items-center justify-center">
                    <Scale className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                    6. Your Legal Rights
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Under certain circumstances, you have rights under data
                    protection laws in relation to your personal data, including
                    the right to request access, correction, erasure, or
                    restriction of your personal data.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 sm:px-12 sm:py-8 bg-gray-50/80 border-t border-gray-100 text-center sm:text-left">
              <p className="text-gray-600 text-[15px]">
                If you have any questions about this privacy policy or our
                privacy practices, please contact us via our{" "}
                <a
                  href="/contact"
                  className="text-primary-red font-bold hover:underline transition-colors"
                >
                  Contact Us
                </a>{" "}
                page.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
