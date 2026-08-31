"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Search, ShoppingCart, User, Menu, X, ChevronLeft, Heart,
  LayoutGrid, Store, LogOut, Package, Headphones, ShieldCheck,
} from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { toFaDigits } from "@/lib/utils";
import type { SessionPayload } from "@/lib/auth";
import { CartDrawer } from "./CartDrawer";
import { LogoMark } from "@/components/ui/LogoMark";
import { SITE } from "@/lib/site";

type Cat = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  children: { id: string; name: string; slug: string }[];
};

export function HeaderClient({
  categories,
  session,
}: {
  categories: Cat[];
  session: SessionPayload | null;
}) {
  const router = useRouter();
  const { count } = useCart();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [suggests, setSuggests] = useState<{ id: string; title: string; slug: string; image: string | null }[]>([]);
  const [showSug, setShowSug] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (q.trim().length < 2) return setSuggests([]);
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`);
        if (res.ok) setSuggests(await res.json());
      } catch {
        /* ignore */
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setShowSug(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSug(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/95 backdrop-blur">
        <div className="container-app">
          <div className="flex h-16 items-center gap-3 lg:h-[72px] lg:gap-5">
            <button
              className="grid size-10 shrink-0 place-items-center rounded-xl text-ink-700 hover:bg-ink-50 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="منو"
            >
              <Menu className="size-6" />
            </button>

            <Link href="/" className="flex shrink-0 items-center gap-2">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white lg:size-11">
                <LogoMark className="size-6" />
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-lg font-bold tracking-tight text-ink-900">{SITE.name}</span>
                <span className="block text-[10px] text-ink-500">{SITE.tagline}</span>
              </span>
            </Link>

            <div ref={boxRef} className="relative flex-1">
              <form onSubmit={submitSearch}>
                <div className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100">
                  <Search className="size-5 shrink-0 text-ink-400" />
                  <input
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setShowSug(true);
                    }}
                    onFocus={() => setShowSug(true)}
                    placeholder="جستجوی محصول، برند یا مدل… (مثلاً آیفون تصویری ۷ اینچ سیماران)"
                    className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-ink-400"
                  />
                  {q && (
                    <button type="button" onClick={() => setQ("")} aria-label="پاک کردن">
                      <X className="size-4 text-ink-400 hover:text-ink-600" />
                    </button>
                  )}
                </div>
              </form>

              {showSug && suggests.length > 0 && (
                <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-ink-100 bg-white py-2 shadow-pop">
                  {suggests.map((s) => (
                    <Link
                      key={s.id}
                      href={`/product/${s.slug}`}
                      onClick={() => setShowSug(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-ink-50"
                    >
                      <Search className="size-4 shrink-0 text-ink-300" />
                      <span className="truncate text-sm text-ink-700">{s.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden items-center gap-1 lg:flex">
              <div className="relative">
                <button
                  onClick={() => setUserOpen((v) => !v)}
                  onBlur={() => setTimeout(() => setUserOpen(false), 180)}
                  className="btn-outline h-11"
                >
                  <User className="size-5" />
                  <span>{session ? session.name.split(" ")[0] : "ورود | ثبت‌نام"}</span>
                </button>
                {userOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-60 animate-fade-in overflow-hidden rounded-2xl border border-ink-100 bg-white py-2 shadow-pop">
                    {session ? (
                      <>
                        <div className="border-b border-ink-100 px-4 pb-2.5">
                          <p className="text-sm font-bold text-ink-800">{session.name}</p>
                          <p className="text-xs text-ink-500">
                            {session.role === "ADMIN"
                              ? "مدیر سیستم"
                              : session.role === "SELLER"
                                ? "فروشنده"
                                : "کاربر"}
                          </p>
                        </div>
                        <MenuLink href="/account" icon={<User className="size-4" />} label="حساب کاربری" />
                        <MenuLink href="/account/orders" icon={<Package className="size-4" />} label="سفارش‌های من" />
                        <MenuLink href="/account/wishlist" icon={<Heart className="size-4" />} label="علاقه‌مندی‌ها" />
                        {session.role === "SELLER" && (
                          <MenuLink href="/seller" icon={<Store className="size-4" />} label="پنل فروشندگی" />
                        )}
                        {session.role === "ADMIN" && (
                          <MenuLink href="/admin" icon={<ShieldCheck className="size-4" />} label="پنل مدیریت" />
                        )}
                        <button
                          onClick={logout}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="size-4" /> خروج از حساب
                        </button>
                      </>
                    ) : (
                      <div className="p-3">
                        <Link href="/login" className="btn-primary w-full">ورود</Link>
                        <Link href="/register" className="btn-outline mt-2 w-full">ساخت حساب جدید</Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link href="/account/wishlist" className="grid size-11 place-items-center rounded-xl text-ink-600 hover:bg-ink-50" aria-label="علاقه‌مندی‌ها">
                <Heart className="size-5" />
              </Link>
            </div>

            <button
              onClick={() => setCartOpen(true)}
              className="relative grid size-11 shrink-0 place-items-center rounded-xl text-ink-700 hover:bg-ink-50"
              aria-label="سبد خرید"
            >
              <ShoppingCart className="size-6" />
              {count > 0 && (
                <span className="absolute -left-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  {toFaDigits(count)}
                </span>
              )}
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden h-11 items-center gap-1 text-sm lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button className="flex h-11 items-center gap-1.5 px-3 font-medium text-ink-700 hover:text-brand-600">
                <LayoutGrid className="size-4" /> دسته‌بندی کالاها
              </button>
              {catOpen && (
                <div className="absolute right-0 top-full z-50 flex w-[820px] animate-fade-in gap-2 rounded-2xl border border-ink-100 bg-white p-3 shadow-pop">
                  <div className="w-56 shrink-0 border-l border-ink-100 pl-2">
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/category/${c.slug}`}
                        className="flex items-center justify-between rounded-lg px-3 py-2.5 text-ink-700 hover:bg-brand-50 hover:text-brand-600"
                      >
                        <span className="flex items-center gap-2">
                          <span>{c.icon}</span> {c.name}
                        </span>
                        <ChevronLeft className="size-4 text-ink-300" />
                      </Link>
                    ))}
                  </div>
                  <div className="grid flex-1 grid-cols-3 content-start gap-x-4 gap-y-1 p-2">
                    {categories.flatMap((c) =>
                      c.children.slice(0, 4).map((ch) => (
                        <Link
                          key={ch.id}
                          href={`/category/${ch.slug}`}
                          className="truncate rounded-lg px-2 py-1.5 text-[13px] text-ink-600 hover:bg-ink-50 hover:text-brand-600"
                        >
                          {ch.name}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link href="/category/video-intercom" className="px-3 py-2 font-medium text-ink-700 hover:text-brand-600">
              آیفون تصویری
            </Link>
            <Link href="/brands" className="px-3 py-2 font-medium text-ink-700 hover:text-brand-600">
              برندها
            </Link>
            <Link href="/search?discount=1" className="px-3 py-2 font-medium text-ink-700 hover:text-brand-600">
              تخفیف‌دارها
            </Link>
            <Link href="/installation" className="px-3 py-2 font-medium text-ink-700 hover:text-brand-600">
              نصب و راه‌اندازی
            </Link>
            <div className="mr-auto flex items-center gap-4 text-[13px] text-ink-500">
              <span className="flex items-center gap-1.5"><ShieldCheck className="size-4" /> ضمانت اصالت کالا</span>
              <span className="flex items-center gap-1.5"><Headphones className="size-4" /> {SITE.phone}</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-ink-950/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-white">
            <div className="flex items-center justify-between border-b border-ink-100 p-4">
              <span className="font-bold">منو</span>
              <button onClick={() => setMenuOpen(false)} aria-label="بستن">
                <X className="size-5 text-ink-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {session ? (
                <div className="mb-3 rounded-xl bg-ink-50 p-3">
                  <p className="text-sm font-bold">{session.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link href="/account" onClick={() => setMenuOpen(false)} className="btn-outline px-3 py-1.5 text-xs">حساب من</Link>
                    {session.role === "SELLER" && (
                      <Link href="/seller" onClick={() => setMenuOpen(false)} className="btn-outline px-3 py-1.5 text-xs">پنل فروشنده</Link>
                    )}
                    {session.role === "ADMIN" && (
                      <Link href="/admin" onClick={() => setMenuOpen(false)} className="btn-outline px-3 py-1.5 text-xs">پنل مدیریت</Link>
                    )}
                    <button onClick={logout} className="btn px-3 py-1.5 text-xs text-rose-600">خروج</button>
                  </div>
                </div>
              ) : (
                <div className="mb-3 flex gap-2">
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-primary flex-1">ورود</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-outline flex-1">ثبت‌نام</Link>
                </div>
              )}
              {categories.map((c) => (
                <details key={c.id} className="border-b border-ink-100">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-2 py-3 text-sm font-medium text-ink-800">
                    <span className="flex items-center gap-2">{c.icon} {c.name}</span>
                    <ChevronLeft className="size-4 text-ink-300" />
                  </summary>
                  <div className="pb-2 pr-6">
                    <Link href={`/category/${c.slug}`} onClick={() => setMenuOpen(false)} className="block py-2 text-[13px] text-brand-600">
                      همه محصولات {c.name}
                    </Link>
                    {c.children.map((ch) => (
                      <Link
                        key={ch.id}
                        href={`/category/${ch.slug}`}
                        onClick={() => setMenuOpen(false)}
                        className="block py-2 text-[13px] text-ink-600"
                      >
                        {ch.name}
                      </Link>
                    ))}
                  </div>
                </details>
              ))}
              <Link href="/installation" onClick={() => setMenuOpen(false)} className="mt-3 block rounded-xl bg-ink-950 p-3 text-center text-sm font-medium text-white">
                درخواست نصب و راه‌اندازی
              </Link>
              <Link href="/seller/register" onClick={() => setMenuOpen(false)} className="mt-2 block rounded-xl bg-brand-50 p-3 text-center text-sm font-medium text-brand-700">
                همکاری به عنوان فروشنده
              </Link>
            </div>
          </div>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

function MenuLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50">
      {icon} {label}
    </Link>
  );
}
