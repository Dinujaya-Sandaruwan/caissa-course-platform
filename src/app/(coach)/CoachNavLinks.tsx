"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  PlusSquare,
  Users,
  CreditCard,
} from "lucide-react";

export default function CoachNavLinks() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/coach/dashboard", icon: LayoutDashboard },
    { name: "My Courses", href: "/coach/courses", icon: BookOpen },
    { name: "Create Course", href: "/coach/courses/new", icon: PlusSquare },
    { name: "Students", href: "/coach/students", icon: Users },
    { name: "Billing", href: "/coach/billing", icon: CreditCard },
  ];

  return (
    <>
      {links.map((link) => {
        const Icon = link.icon;
        const isMyCourses = link.href === "/coach/courses";
        const isActive = isMyCourses
          ? pathname === link.href ||
            (pathname.startsWith(`${link.href}/`) &&
              !pathname.startsWith("/coach/courses/new"))
          : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group ${
              isActive
                ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                : "text-gray-500 hover:bg-slate-50 hover:text-gray-900"
            }`}
          >
            <Icon
              className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                isActive
                  ? "text-white"
                  : "text-gray-400 group-hover:text-red-500"
              }`}
            />
            {link.name}
          </Link>
        );
      })}
    </>
  );
}
