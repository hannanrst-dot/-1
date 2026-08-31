"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, MapPin, Heart, Store, ShieldCheck, LogOut } from "lucide-react";

const ITEMS = [
  { href: "/account", label: "پیشخوان", icon: User },
  { href: "/account/orders", label: "سفارش‌های من", icon: Package },
  { href: "/account/addresses", label: "آدرس‌ها", icon: MapPin },
  { href: "/account/wishlist", label: "علاقه‌مندی‌ها", icon: Heart },
  { href: "/account/profile", label: "اطلاعات حساب", icon: User },
];

export function AccountNav({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

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

      {role === "SELLER" && (
        <Link href="/seller" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-ink-600 hover:bg-ink-50">
          <Store className="size-4" /> پنل فروشندگی
        </Link>
      )}
      {role === "ADMIN" && (
        <Link href="/admin" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-ink-600 hover:bg-ink-50">
          <ShieldCheck className="size-4" /> پنل مدیریت
        </Link>
      )}
      {role === "CUSTOMER" && (
        <Link href="/seller/register" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-ink-600 hover:bg-ink-50">
          <Store className="size-4" /> فروشنده شوید
        </Link>
      )}

      <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-rose-600 hover:bg-rose-50">
        <LogOut className="size-4" /> خروج از حساب
      </button>
    </nav>
  );
}
