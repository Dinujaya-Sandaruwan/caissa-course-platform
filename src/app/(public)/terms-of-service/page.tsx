"use client";

import NavbarClient from "@/components/landing/NavbarClient";
import Footer from "@/components/landing/Footer";
import {
  CheckCircle2,
  Calendar,
  FileText,
  UserPlus,
  GraduationCap,
  CreditCard,
  AlertTriangle,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";

export default function TermsOfServicePage() {
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
              <FileText className="w-4 h-4 text-primary-red" />
              Agreements & Guidelines
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Terms of{" "}
              <span className="text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">
                Service
              </span>
            </h1>
            <p className="font-sans text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Rules and guidelines for using the Caissa Course Platform. Please
              read these terms carefully before joining.
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
                  Platform Terms
                </h2>
                <p className="text-gray-500 mt-1">
                  Please ensure you are familiar with our rules.
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
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                    1. Acceptance of Terms
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    By accessing and using the Caissa Course Platform, you
                    accept and agree to be bound by the terms and provision of
                    this agreement. In addition, when using this platform's
                    particular services, you shall be subject to any posted
                    guidelines or rules applicable to such services.
                  </p>
                </div>
              </div>

              {/* Point 2 */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-16 shrink-0 flex items-start justify-center">
                  <div className="w-12 h-12 bg-gray-50 text-gray-700 border border-gray-100 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                    2. User Registration
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    To use certain features of the Service (e.g., enrolling in
                    courses, teaching as a coach), you must register for an
                    account. You agree to provide accurate, current, and
                    complete information during the registration process (via
                    WhatsApp) and to update such information to keep it
                    accurate, current, and complete.
                  </p>
                </div>
              </div>

              {/* Point 3 */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-16 shrink-0 flex items-start justify-center">
                  <div className="w-12 h-12 bg-red-50 text-primary-red rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                    3. Content Ownership and Licenses
                  </h3>

                  <div className="space-y-4 mt-4">
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-1">
                        For Students:
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        When you enroll in a course, you get a license from us
                        to view it via the Caissa services and no other use. You
                        may not transfer or resell courses in any way.
                      </p>
                    </div>

                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-1">
                        For Coaches:
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        When you publish a course on Caissa, you retain all
                        ownership rights to your content. However, you grant us
                        a license to host, present, distribute, and market your
                        content on our platform to users.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Point 4 */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-16 shrink-0 flex items-start justify-center">
                  <div className="w-12 h-12 bg-gray-50 text-gray-700 border border-gray-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                    4. Payments, Credits, and Refunds
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    When you make a payment for a course via Bank Transfer, you
                    agree to submit legitimate, valid payment proofs. Because
                    our platform grants immediate access to digital video assets
                    upon manager verification, we generally do not offer refunds
                    outside of major technical errors or duplicate-charge
                    errors.
                  </p>
                </div>
              </div>

              {/* Point 5 */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-16 shrink-0 flex items-start justify-center">
                  <div className="w-12 h-12 bg-red-50 text-primary-red rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                    5. Acceptable Use Policy
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    You agree not to use the platform to collect or harvest any
                    personally identifiable information, including account
                    names, from the Service nor to use the communication systems
                    provided by the Service for any commercial solicitation
                    purposes. Distributing copyright content, cheating
                    mechanisms, or malicious software will result in an
                    immediate permanent ban.
                  </p>
                </div>
              </div>

              {/* Point 6 */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-16 shrink-0 flex items-start justify-center">
                  <div className="w-12 h-12 bg-gray-50 text-gray-700 border border-gray-100 rounded-xl flex items-center justify-center">
                    <RefreshCcw className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                    6. Platform Modifications
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    We reserve the right at any time and from time to time to
                    modify or discontinue, temporarily or permanently, the
                    Service (or any part thereof) with or without notice.
                  </p>
                </div>
              </div>

              {/* Point 7 */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-16 shrink-0 flex items-start justify-center">
                  <div className="w-12 h-12 bg-red-50 text-primary-red rounded-xl flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                    7. Disclaimer of Warranties
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    The Service is provided on an "as is" and "as available"
                    basis. Caissa Academy makes no representations or warranties
                    of any kind, express or implied, as to the operation of
                    their services, or the information, content, or materials
                    included therein.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 sm:px-12 sm:py-8 bg-gray-50/80 border-t border-gray-100 text-center sm:text-left">
              <p className="text-gray-600 text-[15px]">
                If you have any questions about these Terms, please contact us
                via our{" "}
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
