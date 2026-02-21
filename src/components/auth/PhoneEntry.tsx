"use client";

import { useState } from "react";
import { Phone, ArrowRight, Loader2 } from "lucide-react";

interface PhoneEntryProps {
  onSubmit: (phoneNumber: string) => Promise<void>;
  title?: string;
  subtitle?: string;
}

export default function PhoneEntry({
  onSubmit,
  title = "Welcome",
  subtitle = "Enter your WhatsApp number to get started",
}: PhoneEntryProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleaned = phoneNumber.replace(/\s/g, "");
    if (!cleaned || cleaned.length < 9) {
      setError("Please enter a valid phone number");
      return;
    }

    const fullNumber = cleaned.startsWith("0")
      ? `94${cleaned.slice(1)}`
      : cleaned.startsWith("94")
        ? cleaned
        : `94${cleaned}`;

    setLoading(true);
    try {
      await onSubmit(fullNumber);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-4">
          <Phone className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-outfit)]">
          {title}
        </h1>
        <p className="text-gray-500 mt-2">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp Number
          </label>
          <div className="flex gap-2">
            <div className="flex items-center px-4 bg-gray-100 border border-gray-300 rounded-xl text-gray-600 text-sm font-medium">
              +94
            </div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""));
                setError("");
              }}
              placeholder="7X XXX XXXX"
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              maxLength={10}
              autoFocus
            />
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !phoneNumber.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-red-200 disabled:text-red-400 disabled:shadow-none disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-600/20 hover:shadow-red-600/30"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending Code...
            </>
          ) : (
            <>
              Send Code
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
