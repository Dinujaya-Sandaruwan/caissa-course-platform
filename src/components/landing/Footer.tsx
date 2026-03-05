import Link from "next/link";
import { Crown, Mail, Phone, MapPin, ChevronRight, Heart } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

const footerLinks = {
  platform: {
    title: "Platform",
    links: [
      { label: "Our Courses", href: "/courses" },
      { label: "Browse Courses", href: "/courses" },
      { label: "About Us", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "Student Portal", href: "#" },
    ],
  },
  forCoaches: {
    title: "For Coaches",
    links: [
      { label: "Become a Coach", href: "/become-a-coach" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Coach Dashboard", href: "/coach/dashboard" },
      { label: "Coach Resources", href: "/coach/dashboard" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
    ],
  },
};

export default function Footer() {
  return (
    <footer className="relative bg-gray-900 overflow-hidden">
      {/* Subtle grid texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-red/40 to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 lg:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-red flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-xl font-extrabold text-white">
                Caissa{" "}
                <span className="text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">
                  Chess
                </span>
              </span>
            </Link>

            <p className="font-sans text-sm text-gray-400 leading-relaxed mb-8 max-w-sm">
              Sri Lanka&apos;s first premium chess learning platform. Master the
              game with structured video courses from titled players and
              Grandmasters.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="mailto:hello@caissachess.lk"
                className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary-red/20 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                hello@caissachess.lk
              </a>
              <a
                href="tel:+94771234567"
                className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary-red/20 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                +94 77 123 4567
              </a>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                Colombo, Sri Lanka
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title} className="lg:col-span-2">
              <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-5">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter / CTA Column */}
          <div className="lg:col-span-2">
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-5">
              Stay Updated
            </h4>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Get notified about new courses, tournaments, and chess tips.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.06]"></div>

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Caissa Chess Academy. All rights
            reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            Proudly built with{" "}
            <Heart className="w-3 h-3 text-primary-red fill-primary-red" /> for
            the chess community
          </p>
        </div>
      </div>
    </footer>
  );
}
