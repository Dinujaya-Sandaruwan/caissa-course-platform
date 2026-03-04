"use client";

import { useState } from "react";
import NavbarClient from "@/components/landing/NavbarClient";
import Footer from "@/components/landing/Footer";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactUsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      toast.success("Your message has been sent successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NavbarClient session={null} />
      <main className="min-h-screen bg-gray-50 flex flex-col">
        {/* Dark Theme Hero Section */}
        <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-gray-900 border-b border-white/5">
          {/* Background texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
          {/* Glows */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary-red/[0.08] rounded-full blur-[120px]"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold mb-6">
              <MessageSquare className="w-4 h-4 text-primary-red" />
              We're Here to Help
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Get in Touch with{" "}
              <span className="text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">
                Caissa
              </span>
            </h1>
            <p className="font-sans text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Have a question about our courses, your enrollments, or need
              technical support? Drop us a line and our team will get back to
              you as soon as possible.
            </p>
          </div>
        </section>

        {/* Content Section (Light Theme) */}
        <section className="flex-1 py-16 lg:py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              {/* Contact Information (Left Column) */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Contact Information
                </h2>
                <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                  Whether you're looking to partner with us or just need help
                  navigating the platform, we're ready to assist.
                </p>

                <div className="space-y-8">
                  {/* Phone */}
                  <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-primary-red" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        Call Support
                      </h3>
                      <p className="text-gray-600 mb-1">
                        Mon-Fri from 8am to 5pm.
                      </p>
                      <a
                        href="tel:+94771234567"
                        className="text-primary-red font-semibold hover:underline"
                      >
                        +94 77 123 4567
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-primary-red" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        Email Support
                      </h3>
                      <p className="text-gray-600 mb-1">
                        Our team will reply within 24 hours.
                      </p>
                      <a
                        href="mailto:hello@caissachess.lk"
                        className="text-primary-red font-semibold hover:underline"
                      >
                        hello@caissachess.lk
                      </a>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary-red" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        Headquarters
                      </h3>
                      <p className="text-gray-600">
                        Caissa Chess Academy
                        <br />
                        Colombo, Sri Lanka
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form (Right Column) */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
                  {/* Decorative faint glow top right inside the form card */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-60 pointer-events-none -translate-y-1/2 translate-x-1/2" />

                  <h3 className="font-heading font-bold text-2xl text-gray-900 mb-6 relative z-10">
                    Send us a Message
                  </h3>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6 relative z-10"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red transition-all"
                          placeholder="+94 77 123 4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Subject
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red transition-all"
                          placeholder="How can we help?"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red transition-all resize-none"
                        placeholder="Please describe your inquiry..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary-red hover:bg-accent-red text-white font-bold transition-all shadow-lg shadow-primary-red/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                      {!isSubmitting && (
                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      )}
                    </button>
                  </form>
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
