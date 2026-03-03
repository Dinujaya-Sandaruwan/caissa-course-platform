import Link from "next/link";
import NavbarClient from "@/components/landing/NavbarClient";
import Footer from "@/components/landing/Footer";
import {
  BadgePercent,
  ArrowRight,
  Users,
  GraduationCap,
  ShieldCheck,
  CreditCard,
  UploadCloud,
  HelpCircle,
  Sparkles,
} from "lucide-react";

const faqs = [
  {
    q: "Who decides the course price?",
    a: "Each coach sets their own price based on the depth, duration, and content of the course. We believe coaches know the value of their work best.",
  },
  {
    q: "Is there a subscription fee for students?",
    a: "No. There are no subscriptions or hidden fees. You only pay for the courses you choose to enroll in — one-time payment, lifetime access.",
  },
  {
    q: "How do I pay for a course?",
    a: "After selecting a course, you'll proceed to checkout where you'll find our bank account details. Simply make a bank transfer and upload a photo of your receipt. Once verified, you get instant access.",
  },
  {
    q: "What is the platform fee?",
    a: "We charge a small platform fee (up to 30%) on each course sale to cover hosting, marketing, student support, and platform development. The remaining revenue goes directly to the coach.",
  },
  {
    q: "Can I get a refund?",
    a: "Since all courses offer free preview lessons, we encourage you to watch those before purchasing. Please contact our support team if you face any issues after enrollment.",
  },
];

export default function PricingPage() {
  return (
    <>
      <NavbarClient session={null} />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gray-900">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary-red/[0.06] rounded-full blur-[120px]"></div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold mb-6">
              <BadgePercent className="w-4 h-4 text-primary-red" />
              Transparent Pricing
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
              Fair Pricing,{" "}
              <span className="text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">
                Set by Coaches
              </span>
            </h1>
            <p className="font-sans text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              We don&apos;t impose fixed prices. Every coach on our platform
              sets their own course price, so you always know exactly what
              you&apos;re paying for and who you&apos;re supporting.
            </p>
          </div>
        </section>

        {/* How It Works Cards */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                How Our Pricing Works
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                A simple, transparent model that benefits everyone — students
                and coaches alike.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-red to-red-400 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                  <GraduationCap className="w-7 h-7 text-primary-red" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">
                  Coaches Set the Price
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Each coach independently decides the price for their course.
                  This ensures pricing reflects the true value, depth, and
                  effort behind every lesson.
                </p>
              </div>

              {/* Card 2 */}
              <div className="relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-violet-400 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                  <BadgePercent className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">
                  Small Platform Fee
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We take a modest platform fee of{" "}
                  <span className="font-semibold text-gray-900">up to 30%</span>{" "}
                  on each course sale. This covers hosting, student support,
                  marketing, and continuous platform improvements. In many
                  cases, this fee is even lower.
                </p>
              </div>

              {/* Card 3 */}
              <div className="relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">
                  Coaches Earn More
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  The majority of every sale goes directly to the coach. We
                  believe in rewarding educators fairly for their knowledge and
                  dedication to the game.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-20 bg-gray-50 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-primary-red text-sm font-semibold mb-6">
                  <Sparkles className="w-4 h-4" />
                  What's Included
                </div>
                <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                  Every Course Comes With
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  When you purchase a course, you&apos;re not just buying
                  videos. Here&apos;s what&apos;s included with every
                  enrollment:
                </p>

                <ul className="space-y-5">
                  {[
                    {
                      icon: ShieldCheck,
                      title: "Lifetime Access",
                      desc: "Pay once, learn forever. No recurring fees or expiration dates.",
                    },
                    {
                      icon: CreditCard,
                      title: "One-Time Payment",
                      desc: "Simple bank transfer. No credit card required, no subscriptions.",
                    },
                    {
                      icon: UploadCloud,
                      title: "Quick Verification",
                      desc: "Upload your bank slip and get access as soon as our team verifies it.",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex gap-4">
                      <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                        <item.icon className="w-5 h-5 text-primary-red" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-0.5">
                          {item.title}
                        </h4>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Card */}
              <div className="bg-gray-900 rounded-[2rem] p-10 lg:p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-red/10 rounded-full blur-[100px]"></div>

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary-red/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <GraduationCap className="w-8 h-8 text-primary-red" />
                  </div>
                  <h3 className="font-heading text-2xl font-extrabold text-white mb-3">
                    Ready to Start Learning?
                  </h3>
                  <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                    Browse our full course catalog and find the perfect match
                    for your skill level and budget.
                  </p>
                  <Link
                    href="/courses"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-red text-white font-bold hover:bg-accent-red transition-all shadow-lg shadow-primary-red/20 hover:-translate-y-0.5"
                  >
                    Explore Courses
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold mb-6">
                <HelpCircle className="w-4 h-4" />
                Common Questions
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-gray-900">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-left font-bold text-gray-900 hover:text-primary-red transition-colors select-none">
                    {faq.q}
                    <span className="ml-4 text-gray-400 group-open:rotate-45 transition-transform duration-200 text-xl font-light shrink-0">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed -mt-1">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
