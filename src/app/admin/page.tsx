import Link from "next/link";
import {
  Wallet, ShoppingBag, Package, Users, Store, Clock, ChevronLeft, TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatPrice, toFaDigits, formatDate, ORDER_STATUS } from "@/lib/utils";

export const metadata = { title: "پنل مدیریت" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireRole(["ADMIN"]);

  const [orders, orderCount, productCount, userCount, sellerCount,
    pendingProducts, pendingSellers, recentOrders, topProducts] = await Promise.all([
    prisma.order.findMany({ select: { total: true, createdAt: true } }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count(),
    prisma.seller.count({ where: { status: "APPROVED" } }),
    prisma.product.count({ where: { status: "PENDING" } }),
    prisma.seller.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" }, take: 8,
      include: { user: { select: { name: true } }, items: { select: { id: true } } },
    }),
    prisma.product.findMany({
      orderBy: { sold: "desc" }, take: 5, where: { sold: { gt: 0 } },
      select: { id: true, title: true, sold: true, slug: true, price: true },
    }),
  ]);

  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const last30 = orders.filter((o) => o.createdAt > new Date(Date.now() - 30 * 864e5));
  const revenue30 = last30.reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: "درآمد کل", value: `${formatPrice(revenue)}`, unit: "تومان", icon: Wallet, color: "bg-emerald-50 text-emerald-600" },
    { label: "درآمد ۳۰ روز اخیر", value: `${formatPrice(revenue30)}`, unit: "تومان", icon: TrendingUp, color: "bg-sky-50 text-sky-600" },
    { label: "سفارش‌ها", value: toFaDigits(orderCount), icon: ShoppingBag, color: "bg-indigo-50 text-indigo-600" },
    { label: "محصولات", value: toFaDigits(productCount), icon: Package, color: "bg-violet-50 text-violet-600" },
    { label: "کاربران", value: toFaDigits(userCount), icon: Users, color: "bg-amber-50 text-amber-600" },
    { label: "فروشندگان فعال", value: toFaDigits(sellerCount), icon: Store, color: "bg-rose-50 text-rose-600" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-ink-900">داشبورد مدیریت</h1>

      {(pendingProducts > 0 || pendingSellers > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {pendingProducts > 0 && (
            <Link href="/admin/products" className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 transition-colors hover:bg-amber-100">
              <Clock className="size-6 shrink-0 text-amber-600" />
              <div className="flex-1">
                <p className="text-[13px] font-bold text-amber-900">
                  {toFaDigits(pendingProducts)} محصول در انتظار تأیید
                </p>
                <p className="text-[11px] text-amber-700">برای بررسی کلیک کنید</p>
              </div>
              <ChevronLeft className="size-4 text-amber-600" />
            </Link>
          )}
          {pendingSellers > 0 && (
            <Link href="/admin/sellers" className="flex items-center gap-3 rounded-2xl bg-sky-50 p-4 transition-colors hover:bg-sky-100">
              <Store className="size-6 shrink-0 text-sky-600" />
              <div className="flex-1">
                <p className="text-[13px] font-bold text-sky-900">
                  {toFaDigits(pendingSellers)} درخواست فروشندگی جدید
                </p>
                <p className="text-[11px] text-sky-700">برای بررسی کلیک کنید</p>
              </div>
              <ChevronLeft className="size-4 text-sky-600" />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-4 shadow-card">
            <span className={`grid size-10 place-items-center rounded-xl ${s.color}`}>
              <s.icon className="size-5" />
            </span>
            <p className="mt-3 text-[17px] font-bold text-ink-900">
              {s.value}
              {s.unit && <span className="mr-1 text-[11px] font-normal text-ink-500">{s.unit}</span>}
            </p>
            <p className="text-[12px] text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-ink-800">آخرین سفارش‌ها</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-[13px] text-brand-600">
              همه <ChevronLeft className="size-4" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-ink-500">سفارشی ثبت نشده است.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center gap-3 py-2.5 text-[12px]">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink-800" dir="ltr">{o.code}</p>
                    <p className="mt-0.5 text-ink-400">{o.user.name} — {formatDate(o.createdAt)}</p>
                  </div>
                  <span className={`badge shrink-0 ${ORDER_STATUS[o.status].color}`}>
                    {ORDER_STATUS[o.status].label}
                  </span>
                  <span className="shrink-0 font-bold text-ink-800">{formatPrice(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="mb-3 font-bold text-ink-800">پرفروش‌ترین محصولات</h2>
          {topProducts.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-ink-500">فروشی ثبت نشده است.</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-ink-50 text-[12px] font-bold text-ink-500">
                    {toFaDigits(i + 1)}
                  </span>
                  <Link href={`/product/${p.slug}`} className="line-clamp-2-fa min-w-0 flex-1 text-[12px] leading-5 text-ink-700 hover:text-brand-600">
                    {p.title}
                  </Link>
                  <span className="shrink-0 text-[12px] text-ink-500">{toFaDigits(p.sold)} فروش</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
