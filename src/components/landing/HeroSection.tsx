import Link from "next/link";
import { ArrowRight, PlayCircle, Trophy, Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-24 lg:pb-32 min-h-[90vh] flex items-center">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Subtle CSS Grid pattern matching a chess theme but modern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 animate-[pan-grid_40s_linear_infinite]"></div>
        {/* Abstract Glows */}
        <div className="absolute top-0 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-primary-red/10 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-10 left-10 -z-10 h-[300px] w-[300px] rounded-full bg-purple/10 blur-[100px] animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Text Content Area */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-primary-red text-sm font-semibold tracking-wide mb-6 animate-[fade-in-up_0.8s_ease-out]">
              <Trophy className="w-4 h-4" />
              Sri Lanka&apos;s First Premium Chess Platform
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight animate-[fade-in-up_1s_ease-out]">
              Master Chess from the <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">
                World&apos;s Best
              </span>
            </h1>

            <p className="font-sans text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed animate-[fade-in-up_1.2s_ease-out]">
              Elevate your game with structured, high-quality video courses.
              Whether you&apos;re a beginner learning the rules or an advanced
              player mastering opening theory, our Grandmasters have a course
              for you.
            </p>

            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 animate-[fade-in-up_1.4s_ease-out]">
              <Link
                href="/courses"
                className="group flex items-center justify-center gap-2 bg-primary-red hover:bg-accent-red text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-xl shadow-primary-red/20 hover:shadow-primary-red/40 hover:-translate-y-1"
              >
                Browse Courses
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/teach"
                className="group flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 font-semibold px-8 py-4 rounded-full transition-all duration-300"
              >
                <PlayCircle className="w-5 h-5 text-gray-500 group-hover:text-primary-red transition-colors" />
                Become a Coach
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex items-center gap-6 animate-[fade-in-up_1.6s_ease-out] text-gray-500 text-sm font-medium">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-primary-red flex items-center justify-center text-white border-2 border-white text-xs">
                  +1K
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-warning-yellow mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                Trusted by 1000+ Students
              </div>
            </div>
          </div>

          {/* Visual/Image Area */}
          <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end animate-[fade-in-up_1.2s_ease-out]">
            {/* Main Visual Container */}
            <div className="relative w-full max-w-[500px] aspect-square rounded-[2rem] bg-gradient-to-tr from-gray-50 to-white/60 border border-gray-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex items-center justify-center group transform transition-transform duration-500 hover:-translate-y-2 backdrop-blur-sm">
              <div className="absolute inset-0 bg-[image:var(--gradient-soft)] opacity-20 group-hover:opacity-40 transition-opacity duration-500 mix-blend-multiply"></div>

              {/* Premium Generated 3D Image */}
              <img
                src="/hero-chess.png"
                alt="Premium 3D Chess Illustration"
                className="relative z-10 object-contain w-[120%] h-[120%] mix-blend-darken filter contrast-[1.05] brightness-95 transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute -left-8 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 animate-[float_6s_ease-in-out_infinite]">
              <div className="w-10 h-10 rounded-full bg-info-blue/10 flex items-center justify-center text-info-blue font-bold">
                1
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Top Rated</p>
                <p className="text-xs text-gray-500">Coaches in LK</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
