"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

const navLinks = [
  { name: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
  { name: "Coaches", href: "/manager/coaches", icon: Users },
  { name: "Courses", href: "/manager/courses", icon: BookOpen },
  { name: "Students", href: "/manager/students", icon: GraduationCap },
  { name: "Payments", href: "/manager/payments", icon: CreditCard },
  { name: "Enrollments", href: "/manager/enrollments", icon: BookOpen },
  { name: "Platform Fees", href: "/manager/platform-fees", icon: CreditCard },
  { name: "Managers", href: "/manager/managers", icon: ShieldCheck },
];

export default function ManagerNavLinks() {
  const pathname = usePathname();

  return (
    <>
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname.startsWith(link.href);

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`
              flex items-center gap-3.5 px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300
              ${
                isActive
                  ? "bg-red-600 text-white shadow-md shadow-red-600/25 translate-x-1"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }
            `}
          >
            <Icon
              className={`w-5 h-5 ${
                isActive
                  ? "text-white"
                  : "text-gray-400 group-hover:text-gray-600"
              }`}
            />
            {link.name}
          </Link>
        );
      })}
    </>
  );
}
