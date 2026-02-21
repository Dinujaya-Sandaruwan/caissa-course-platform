import {
  Smartphone,
  Search,
  CreditCard,
  Play,
  ChevronRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description:
      "Sign up with your WhatsApp number in seconds. No lengthy forms, no email verification — just your number and you're in.",
    icon: Smartphone,
    color: "text-primary-red",
    iconBg: "bg-primary-red/10",
    numberBg: "bg-primary-red",
  },
  {
    number: "02",
    title: "Browse & Preview",
    description:
      "Explore courses from titled players and watch free preview videos. Find the perfect course for your skill level.",
    icon: Search,
    color: "text-purple",
    iconBg: "bg-purple/10",
    numberBg: "bg-purple",
  },
  {
    number: "03",
    title: "Enroll & Pay",
    description:
      "Transfer the course fee via bank transfer and upload your payment receipt. Simple, secure, and transparent.",
    icon: CreditCard,
    color: "text-info-blue",
    iconBg: "bg-info-blue/10",
    numberBg: "bg-info-blue",
  },
  {
    number: "04",
    title: "Start Learning",
    description:
      "Get instant access once your payment is confirmed. Learn at your own pace with structured video lessons.",
    icon: Play,
    color: "text-success-green",
    iconBg: "bg-success-green/10",
    numberBg: "bg-success-green",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative bg-gray-900 py-20 lg:py-28 overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
      {/* Glows */}
      <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-primary-red/[0.04] rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-purple/[0.04] rounded-full blur-[120px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold mb-6">
            <Play className="w-4 h-4 text-primary-red" />
            Simple 4-Step Process
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
            How It{" "}
            <span className="text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">
              Works
            </span>
          </h2>
          <p className="font-sans text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Getting started is effortless. Four simple steps and you&apos;re on
            your way to mastering chess with the best coaches in Sri Lanka.
          </p>
        </div>

        {/* Steps — Timeline Layout */}
        <div className="relative">
          {/* Horizontal connector line — goes through center of circles */}
          <div className="hidden lg:block absolute top-[24px] left-[12.5%] right-[12.5%] h-[2px] z-0">
            <div className="w-full h-full bg-gradient-to-r from-primary-red/40 via-purple/40 via-info-blue/40 to-success-green/40 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative group">
                {/* Number circle — sits on top of the connector line */}
                <div className="flex justify-center mb-5">
                  <div
                    className={`relative z-10 w-[48px] h-[48px] rounded-full ${step.numberBg} flex items-center justify-center shadow-lg ring-4 ring-gray-900 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span className="font-heading font-extrabold text-white text-sm">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Vertical connector — mobile/tablet only */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden absolute left-1/2 -translate-x-1/2 top-[56px] h-8 w-px bg-gradient-to-b from-white/20 to-transparent md:hidden"></div>
                )}

                {/* Card */}
                <div className="relative p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-500 text-center">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl ${step.iconBg} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-bold text-base text-white mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="font-sans text-xs text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 lg:mt-20">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5"
          >
            Get Started Now
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
