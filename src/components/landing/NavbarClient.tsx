"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { SessionUser } from "@/lib/auth";

export default function NavbarClient({
  session,
}: {
  session: SessionUser | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionUser | null>(
    session,
  );

  useEffect(() => {
    // If we didn't get a session from the server prop, fetch it client-side
    if (!session) {
      fetch("/api/auth/session")
        .then((res) => res.json())
        .then((data) => {
          if (data?.session) {
            setCurrentSession(data.session);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const getDashboardText = (role: string) => {
    switch (role) {
      case "student":
        return "My Courses";
      case "coach":
        return "Coach Dashboard";
      case "manager":
        return "Manager Dashboard";
      default:
        return "My Dashboard";
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Area */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 group-hover:scale-105 transition-transform flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Caissa Chess Courses Logo"
                  className="object-contain w-full h-full"
                />
              </div>
              <span className="font-heading font-bold text-2xl tracking-tight text-gray-900">
                Caissa <span className="text-primary-red">Chess Courses</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Group */}
          <div className="hidden md:flex flex-1 items-center justify-end space-x-8">
            {/* Nav Links */}
            <div className="flex space-x-6">
              {[{ label: "Courses", href: "/courses" }].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="font-sans text-gray-600 hover:text-primary-red font-medium text-sm transition-colors py-2"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {currentSession ? (
                <Link
                  href={
                    currentSession.isNewUser
                      ? "/login"
                      : `/${currentSession.role}/dashboard`
                  }
                  className="font-sans text-sm font-semibold bg-primary-red hover:bg-accent-red text-white px-5 py-2.5 rounded-full transition-all shadow-md shadow-primary-red/20 hover:shadow-primary-red/40 hover:-translate-y-0.5"
                >
                  {currentSession.isNewUser
                    ? "My Dashboard"
                    : getDashboardText(currentSession.role)}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="font-sans text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/login"
                    className="font-sans text-sm font-semibold bg-primary-red hover:bg-accent-red text-white px-5 py-2.5 rounded-full transition-all shadow-md shadow-primary-red/20 hover:shadow-primary-red/40 hover:-translate-y-0.5"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-red transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1 sm:px-3 bg-white border-b border-gray-200">
          {[{ label: "Courses", href: "/courses" }].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-primary-red hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-3 px-3">
            {currentSession ? (
              <Link
                href={
                  currentSession.isNewUser
                    ? "/login"
                    : `/${currentSession.role}/dashboard`
                }
                className="block w-full text-center text-base font-semibold bg-primary-red text-white px-4 py-3 rounded-xl hover:bg-accent-red active:scale-[0.98] transition-all"
                onClick={() => setIsOpen(false)}
              >
                {currentSession.isNewUser
                  ? "My Dashboard"
                  : getDashboardText(currentSession.role)}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block w-full text-center text-base font-medium text-gray-600 hover:text-gray-900 py-2 border border-gray-200 rounded-xl"
                  onClick={() => setIsOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/login"
                  className="block w-full text-center text-base font-semibold bg-primary-red text-white px-4 py-3 rounded-xl hover:bg-accent-red active:scale-[0.98] transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
