"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FilePlus, Package, Receipt, MoreHorizontal, X,
  Users, Truck, ShoppingCart, Boxes, BarChart3, Settings, PlusCircle, CalendarClock, FlaskConical, FileSpreadsheet,
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const bottomItems = [
    { href: "/", label: "داشبورد", icon: LayoutDashboard },
    { href: "/invoices/new", label: "فاکتور جدید", icon: FilePlus, highlight: true },
    { href: "/products", label: "کالاها", icon: Package },
    { href: "/invoices", label: "فاکتورها", icon: Receipt },
  ];

  // همهٔ صفحات در منوی «سایر» تا در موبایل به همه‌چیز دسترسی باشد.
  const moreItems = [
    { href: "/installments", label: "خرید قسطی", icon: CalendarClock },
    { href: "/customers", label: "مشتریان", icon: Users },
    { href: "/suppliers", label: "تأمین‌کنندگان", icon: Truck },
    { href: "/purchases", label: "ثبت خرید", icon: ShoppingCart },
    { href: "/products/new", label: "ثبت کالا", icon: PlusCircle },
    { href: "/products/import", label: "ورود از اکسل/عکس", icon: FileSpreadsheet },
    { href: "/inventory", label: "انبار و موجودی", icon: Boxes },
    { href: "/reports", label: "گزارش‌ها", icon: BarChart3 },
    { href: "/voice-test", label: "فاکتور صوتی (آزمایشی) 🧪", icon: FlaskConical },
    { href: "/settings", label: "تنظیمات و پشتیبان", icon: Settings },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-2 py-1 flex justify-around items-center shadow-lg">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          if (item.highlight) {
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 text-white bg-emerald-600 px-3 py-1.5 rounded-2xl shadow-lg shadow-emerald-600/30 -translate-y-2 active:scale-95">
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            );
          }
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl ${isActive ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
        <button onClick={() => setMoreOpen(true)} className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-gray-500 dark:text-gray-400">
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px]">سایر</span>
        </button>
      </nav>

      {/* منوی کامل «سایر» */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setMoreOpen(false)}>
          <div className="w-full bg-white dark:bg-gray-900 rounded-t-3xl p-4 pb-6 max-h-[80dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold">همهٔ بخش‌ها</span>
              <button onClick={() => setMoreOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border ${isActive ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300"}`}>
                    <Icon className="w-6 h-6" />
                    <span className="text-[11px] font-medium text-center">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
