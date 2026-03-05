import {
  BarChart3,
  MessageCircle,
  Trophy,
  TrendingUp,
  Users,
  ExternalLink,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track rating progress, puzzle accuracy, and study patterns",
  },
  {
    icon: MessageCircle,
    title: "Coach Communication",
    description: "Direct messaging with your assigned coaches",
  },
  {
    icon: Trophy,
    title: "Leaderboards & Ranks",
    description: "Compete with fellow students and climb the rankings",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Visual dashboards showing your chess improvement journey",
  },
];

const highlights = [
  "Real-time game analysis & review",
  "Structured study plans by Coaches",
  "Daily tournaments & challenges",
  "Win prizes & rewards",
];

export default function LMSBanner() {
  return (
    <section className="relative bg-white py-20 lg:py-28 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-primary-red/[0.02] rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-info-blue/[0.02] rounded-full blur-[120px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-red/5 border border-primary-red/10 text-primary-red text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Sri Lanka&apos;s #1 Chess LMS
          </div>
        </div>

        {/* Main Content — Split Layout */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Side — Text & Features */}
          <div className="w-full lg:w-1/2">
            <h2 className="font-heading text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-5 leading-[1.1]">
              Your Chess Journey,{" "}
              <span className="text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">
                All in One Place
              </span>
            </h2>

            <p className="font-sans text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
              Our powerful Learning Management System gives you everything you
              need to learn, practice, and grow — with tools designed
              specifically for chess students and coaches.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group flex items-start gap-3 p-4 rounded-2xl border border-gray-100 hover:border-primary-red/20 hover:bg-primary-red/[0.02] transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-red/5 flex items-center justify-center shrink-0 group-hover:bg-primary-red/10 transition-colors">
                    <feature.icon className="w-5 h-5 text-primary-red" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-gray-900 mb-0.5">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Checklist highlights */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <CheckCircle2 className="w-4 h-4 text-success-green shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link
                href="https://lms.caissachess.org/"
                target="_blank"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary-red hover:bg-accent-red text-white font-semibold transition-all duration-300 shadow-lg shadow-primary-red/20 hover:shadow-primary-red/40 hover:-translate-y-1"
              >
                Explore the LMS
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                <div className="flex -space-x-2">
                  <div className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                    <Image
                      src="/images/students/student-1.jpg"
                      alt="Student"
                      fill
                      className="object-cover grayscale-[50%] contrast-[90%]"
                    />
                  </div>
                  <div className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-300">
                    <Image
                      src="/images/students/student-2.jpg"
                      alt="Student"
                      fill
                      className="object-cover grayscale-[50%] contrast-[90%]"
                    />
                  </div>
                  <div className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-400">
                    <Image
                      src="/images/students/student-3.webp"
                      alt="Student"
                      fill
                      className="object-cover grayscale-[50%] contrast-[90%]"
                    />
                  </div>
                </div>
                <span>Trusted by 300+ students</span>
              </div>
            </div>
          </div>

          {/* Right Side — Dashboard Mockup */}
          <div className="w-full lg:w-1/2 relative">
            {/* Glow behind the image */}
            <div className="absolute inset-0 -m-4 bg-gradient-to-br from-primary-red/10 via-transparent to-info-blue/10 rounded-3xl blur-2xl"></div>

            {/* Dashboard image */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-gray-200/50">
              <Image
                src="/images/lms-dashboard.png"
                alt="Caissa Chess LMS Dashboard"
                width={800}
                height={600}
                className="w-full h-auto"
              />

              {/* Floating badge — top right */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-gray-100 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-success-green animate-pulse"></div>
                <span className="text-xs font-semibold text-gray-700">
                  Live Platform
                </span>
              </div>
            </div>

            {/* Floating stats card — bottom left */}
            <div className="absolute -bottom-4 -left-4 lg:-left-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success-green/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success-green" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Avg. Rating Growth</p>
                  <p className="font-heading font-extrabold text-gray-900">
                    +180 pts
                    <span className="text-success-green text-xs font-medium ml-1">
                      per year
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
