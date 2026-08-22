"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FilePlus,
  Receipt,
  Users,
  Truck,
  ShoppingCart,
  Boxes,
  BarChart3,
  Settings,
  CalendarClock,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "داشبورد", icon: LayoutDashboard },
    { href: "/invoices/new", label: "فاکتور جدید (POS)", icon: FilePlus, highlight: true },
    { href: "/products", label: "مدیریت کالاها", icon: Package },
    { href: "/products/new", label: "ثبت کالا", icon: PlusCircle },
    { href: "/invoices", label: "فاکتورهای فروش", icon: Receipt },
    { href: "/customers", label: "مشتریان", icon: Users },
    { href: "/installments", label: "خرید قسطی", icon: CalendarClock },
    { href: "/suppliers", label: "تأمین‌کنندگان", icon: Truck },
    { href: "/purchases", label: "ثبت خرید", icon: ShoppingCart },
    { href: "/inventory", label: "انبار و موجودی", icon: Boxes },
    { href: "/reports", label: "گزارش‌ها", icon: BarChart3 },
    { href: "/settings", label: "تنظیمات و پشتیبان", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shrink-0 hidden md:block min-h-[calc(100vh-4rem)] p-4 space-y-1">
      <div className="px-3 py-2 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        منوی اصلی
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        if (item.highlight) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs transition-all my-2 shadow-md ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400"
                  : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
              }`}
            >
              <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-colors ${
              isActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
