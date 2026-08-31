"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, PlusCircle, ShoppingBag, Store, ArrowRight } from "lucide-react";

const ITEMS = [
  { href: "/seller", label: "داشبورد", icon: LayoutDashboard },
  { href: "/seller/products", label: "محصولات من", icon: Package },
  { href: "/seller/products/new", label: "افزودن محصول", icon: PlusCircle },
  { href: "/seller/orders", label: "سفارش‌ها", icon: ShoppingBag },
];

export function SellerNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-0.5">
      {ITEMS.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${
              active ? "bg-brand-50 font-medium text-brand-700" : "text-ink-600 hover:bg-ink-50"
            }`}
          >
            <it.icon className="size-4" /> {it.label}
          </Link>
        );
      })}
      <Link href="/account" className="mt-2 flex items-center gap-2.5 rounded-xl border-t border-ink-100 px-3 pt-4 text-[13px] text-ink-500 hover:text-brand-600">
        <ArrowRight className="size-4" /> بازگشت به حساب کاربری
      </Link>
    </nav>
  );
}
