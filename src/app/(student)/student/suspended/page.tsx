import Link from "next/link";
import { AlertTriangle, UserCog, Home, PhoneCall } from "lucide-react";

export default function SuspendedPage() {
  const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE_NUMBER || "";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] mb-3">
          Account Suspended
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Your student account has been temporarily suspended by an
          administrator. This is typically due to incomplete or inaccurate
          profile information, or a violation of our terms of service.
        </p>

        <div className="space-y-4 mb-8">
          <Link
            href="/student/profile"
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <UserCog className="w-5 h-5" />
            Review & Edit Profile
          </Link>

          {supportPhone && (
            <a
              href={`tel:${supportPhone.replace(/\s+/g, "")}`}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 rounded-xl font-bold transition-all active:scale-[0.98]"
            >
              <PhoneCall className="w-5 h-5" />
              Contact Support ({supportPhone})
            </a>
          )}
        </div>

        <div className="pt-6 border-t border-gray-100">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Home className="w-4 h-4" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
