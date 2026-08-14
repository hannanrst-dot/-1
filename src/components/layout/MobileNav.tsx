"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FilePlus, Package, Receipt, MoreHorizontal } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "داشبورد", icon: LayoutDashboard },
    { href: "/invoices/new", label: "فاکتور جدید", icon: FilePlus, highlight: true },
    { href: "/products", label: "کالاها", icon: Package },
    { href: "/invoices", label: "فاکتورها", icon: Receipt },
    { href: "/settings", label: "سایر", icon: MoreHorizontal },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-2 py-1 flex justify-around items-center shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        if (item.highlight) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-2xl shadow-lg shadow-emerald-600/30 transform -translate-y-2 transition active:scale-95"
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
              isActive
                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
