"use client";

import { useState } from "react";
import NavbarClient from "@/components/landing/NavbarClient";
import Footer from "@/components/landing/Footer";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import faqsData from "@/data/faqs.json";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<{
    categoryIndex: number;
    itemIndex: number;
  } | null>(null);

  const toggleAccordion = (categoryIndex: number, itemIndex: number) => {
    if (
      openIndex?.categoryIndex === categoryIndex &&
      openIndex.itemIndex === itemIndex
    ) {
      setOpenIndex(null); // Close if clicking the same item
    } else {
      setOpenIndex({ categoryIndex, itemIndex }); // Open the new item
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
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-purple-500/[0.04] rounded-full blur-[120px]"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold mb-6">
              <MessageCircleQuestion className="w-4 h-4 text-primary-red" />
              Frequently Asked Questions
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              How can we{" "}
              <span className="text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">
                Help?
              </span>
            </h1>
            <p className="font-sans text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Find answers to the most common questions about the Caissa Course
              Platform, billing, and learning experience.
            </p>
          </div>
        </section>

        {/* Content Section (Light Theme) */}
        <section className="flex-1 py-16 lg:py-24 relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {faqsData.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-6">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                  {category.category}
                </h2>

                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => {
                    const isOpen =
                      openIndex?.categoryIndex === categoryIndex &&
                      openIndex?.itemIndex === itemIndex;

                    return (
                      <div
                        key={itemIndex}
                        className={`bg-white rounded-2xl border ${
                          isOpen
                            ? "border-primary-red/30 shadow-md ring-1 ring-primary-red/10"
                            : "border-gray-100 shadow-sm"
                        } overflow-hidden transition-all duration-300`}
                      >
                        <button
                          onClick={() =>
                            toggleAccordion(categoryIndex, itemIndex)
                          }
                          className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                        >
                          <h3
                            className={`font-semibold text-lg transition-colors ${isOpen ? "text-primary-red" : "text-gray-900"}`}
                          >
                            {item.question}
                          </h3>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform duration-300 shrink-0 ${
                              isOpen ? "rotate-180 text-primary-red" : ""
                            }`}
                          />
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpen
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-50 bg-gray-50/50">
                            {item.answer}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              If you couldn't find the answer you need in our knowledge base,
              our support team is ready to help.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-lg hover:-translate-y-0.5"
            >
              Contact Support
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
