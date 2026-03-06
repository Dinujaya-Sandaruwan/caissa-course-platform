"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to subscribe.");
      }

      toast.success(data.message || "Successfully subscribed!");
      setEmail(""); // clear the input
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3"
      suppressHydrationWarning
    >
      <div className="relative">
        {isMounted ? (
          <input
            type="email"
            placeholder="Your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-red/50 focus:ring-1 focus:ring-primary-red/30 transition-all disabled:opacity-50"
          />
        ) : (
          <div className="h-[46px] w-full rounded-xl bg-white/5 border border-white/10"></div>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2.5 rounded-xl bg-primary-red hover:bg-accent-red text-white text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary-red/20 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Subscribing..." : "Subscribe"}
      </button>
    </form>
  );
}
