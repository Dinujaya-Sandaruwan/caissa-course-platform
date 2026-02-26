"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen } from "lucide-react";

const links = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Browse Courses", icon: BookOpen },
];

export default function StudentNavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap ${
              isActive
                ? "text-red-600 bg-red-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
