import NavbarClient from "@/components/landing/NavbarClient";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import {
  Smartphone,
  Search,
  CreditCard,
  Play,
  ChevronRight,
  ShieldCheck,
  Video,
  Banknote,
  Users,
  Target,
} from "lucide-react";

const studentSteps = [
  {
    number: "01",
    title: "Create Your Account",
    description:
      "Sign up with your WhatsApp number in seconds. No lengthy forms, no email verification — just your number and you're in. We keep your data secure.",
    icon: Smartphone,
    color: "text-primary-red",
    iconBg: "bg-primary-red/10",
    numberBg: "bg-primary-red",
  },
  {
    number: "02",
    title: "Browse & Preview",
    description:
      "Explore courses from titled players and watch free preview videos. Read through the syllabus and find the perfect course for your skill level.",
    icon: Search,
    color: "text-purple-500",
    iconBg: "bg-purple-500/10",
    numberBg: "bg-purple-500",
  },
  {
    number: "03",
    title: "Enroll & Pay",
    description:
      "Transfer the course fee via bank transfer and upload your payment receipt. Simple, secure, and completely transparent with no hidden charges.",
    icon: CreditCard,
    color: "text-blue-500",
    iconBg: "bg-blue-500/10",
    numberBg: "bg-blue-500",
  },
  {
    number: "04",
    title: "Start Learning",
    description:
      "Get instant access once your payment is confirmed by our team. Learn at your own pace with structured video lessons, forever.",
    icon: Play,
    color: "text-green-500",
    iconBg: "bg-green-500/10",
    numberBg: "bg-green-500",
  },
];

const coachSteps = [
  {
    number: "01",
    title: "Apply & Verify",
    description:
      "Submit your application using your WhatsApp number. Our management panel will review your credentials to ensure high standards.",
    icon: ShieldCheck,
    color: "text-primary-red",
    iconBg: "bg-primary-red/10",
    numberBg: "bg-primary-red",
  },
  {
    number: "02",
    title: "Create Content",
    description:
      "Film and structure your high-quality chess lessons. You decide the curriculum, the pace, and the overall teaching style.",
    icon: Video,
    color: "text-purple-500",
    iconBg: "bg-purple-500/10",
    numberBg: "bg-purple-500",
  },
  {
    number: "03",
    title: "Set Pricing",
    description:
      "You have the freedom to set your own course prices and offer custom discounts. We handle the hosting and the payments.",
    icon: Banknote,
    color: "text-blue-500",
    iconBg: "bg-blue-500/10",
    numberBg: "bg-blue-500",
  },
  {
    number: "04",
    title: "Grow Your Audience",
    description:
      "Use your dedicated coach dashboard to track earnings and interact with students while we manage all the marketing for you.",
    icon: Users,
    color: "text-green-500",
    iconBg: "bg-green-500/10",
    numberBg: "bg-green-500",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <NavbarClient session={null} />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-gray-900">
          {/* Background texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
          {/* Glows */}
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-primary-red/[0.06] rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-purple-500/[0.04] rounded-full blur-[120px]"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold mb-6">
              <Target className="w-4 h-4 text-primary-red" />
              Empowering the Chess Community
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
              How Caissa{" "}
              <span className="text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">
                Works
              </span>
            </h1>
            <p className="font-sans text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-4">
              Whether you are a passionate student looking to master the game or
              a titled player ready to share your knowledge, we've built a
              platform that removes friction and focuses on learning.
            </p>
          </div>
        </section>

        {/* For Students Section */}
        <section className="relative py-24 bg-gray-50 border-y border-gray-100">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                For Students
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Getting started is effortless. Here is how you can begin
                learning from the best coaches in Sri Lanka.
              </p>
            </div>

            <div className="relative">
              <div className="hidden lg:block absolute top-[24px] left-[12.5%] right-[12.5%] h-[2px] z-0">
                <div className="w-full h-full bg-gradient-to-r from-primary-red/40 via-purple-500/40 via-blue-500/40 to-green-500/40 rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 pb-6">
                {studentSteps.map((step, index) => (
                  <div
                    key={step.number}
                    className="relative flex flex-col group"
                  >
                    <div className="flex justify-center mb-5 shrink-0">
                      <div
                        className={`relative z-10 w-[48px] h-[48px] rounded-full ${step.numberBg} flex items-center justify-center shadow-lg ring-4 ring-gray-50 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <span className="font-heading font-extrabold text-white text-sm">
                          {step.number}
                        </span>
                      </div>
                    </div>

                    {index < studentSteps.length - 1 && (
                      <div className="lg:hidden absolute left-1/2 -translate-x-1/2 top-[56px] h-8 w-px bg-gradient-to-b from-gray-300 to-transparent md:hidden"></div>
                    )}

                    <div className="relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-500 text-center flex-1 flex flex-col">
                      <div
                        className={`w-14 h-14 rounded-xl ${step.iconBg} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shrink-0`}
                      >
                        <step.icon className={`w-6 h-6 ${step.color}`} />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="font-sans text-sm text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-12 relative z-10">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary-red text-white font-bold hover:bg-accent-red transition-all shadow-lg shadow-primary-red/20 hover:-translate-y-0.5"
              >
                Browse Courses
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* For Coaches Section */}
        <section className="relative py-24 bg-white border-b border-gray-100">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                For Coaches
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Focus entirely on creating great content while we handle the
                distribution, marketing, and payments.
              </p>
            </div>

            <div className="relative">
              <div className="hidden lg:block absolute top-[24px] left-[12.5%] right-[12.5%] h-[2px] z-0">
                <div className="w-full h-full bg-gradient-to-r from-primary-red/40 via-purple-500/40 via-blue-500/40 to-green-500/40 rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 pb-6">
                {coachSteps.map((step, index) => (
                  <div
                    key={step.number}
                    className="relative flex flex-col group"
                  >
                    <div className="flex justify-center mb-5 shrink-0">
                      <div
                        className={`relative z-10 w-[48px] h-[48px] rounded-full ${step.numberBg} flex items-center justify-center shadow-lg ring-4 ring-white group-hover:scale-110 transition-transform duration-300`}
                      >
                        <span className="font-heading font-extrabold text-white text-sm">
                          {step.number}
                        </span>
                      </div>
                    </div>

                    {index < coachSteps.length - 1 && (
                      <div className="lg:hidden absolute left-1/2 -translate-x-1/2 top-[56px] h-8 w-px bg-gradient-to-b from-gray-300 to-transparent md:hidden"></div>
                    )}

                    <div className="relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-500 text-center flex-1 flex flex-col">
                      <div
                        className={`w-14 h-14 rounded-xl ${step.iconBg} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shrink-0`}
                      >
                        <step.icon className={`w-6 h-6 ${step.color}`} />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="font-sans text-sm text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-12 relative z-10">
              <Link
                href="/become-a-coach"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-lg hover:-translate-y-0.5"
              >
                Apply to Teach
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
