"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Store, ShoppingBag, Users, Tag, FolderTree, ArrowRight,
} from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/products", label: "تأیید محصولات", icon: Package },
  { href: "/admin/sellers", label: "فروشندگان", icon: Store },
  { href: "/admin/orders", label: "سفارش‌ها", icon: ShoppingBag },
  { href: "/admin/users", label: "کاربران", icon: Users },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: FolderTree },
  { href: "/admin/coupons", label: "کدهای تخفیف", icon: Tag },
];

export function AdminNav() {
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
      <Link href="/" className="mt-2 flex items-center gap-2.5 rounded-xl border-t border-ink-100 px-3 pt-4 text-[13px] text-ink-500 hover:text-brand-600">
        <ArrowRight className="size-4" /> بازگشت به فروشگاه
      </Link>
    </nav>
  );
}
