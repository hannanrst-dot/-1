import Link from "next/link";
import { Package, ShoppingBag, Wallet, Star, Clock, ChevronLeft, PlusCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatPrice, toFaDigits, formatDate, ORDER_STATUS, PRODUCT_STATUS } from "@/lib/utils";

export const metadata = { title: "داشبورد فروشنده" };
export const dynamic = "force-dynamic";

export default async function SellerDashboard() {
  const user = await requireRole(["SELLER", "ADMIN"]);
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-card">
        <p className="text-[13px] text-ink-500">پروفایل فروشندگی برای این حساب ثبت نشده است.</p>
        <Link href="/seller/register" className="btn-primary mt-4">ثبت‌نام فروشندگی</Link>
      </div>
    );
  }

  const [productCount, pendingCount, items, recentOrders, topProducts] = await Promise.all([
    prisma.product.count({ where: { sellerId: seller.id } }),
    prisma.product.count({ where: { sellerId: seller.id, status: "PENDING" } }),
    prisma.orderItem.findMany({ where: { sellerId: seller.id }, select: { price: true, qty: true } }),
    prisma.orderItem.findMany({
      where: { sellerId: seller.id },
      orderBy: { id: "desc" },
      take: 6,
      include: { order: { select: { code: true, status: true, createdAt: true } } },
    }),
    prisma.product.findMany({
      where: { sellerId: seller.id },
      orderBy: { sold: "desc" },
      take: 5,
      select: { id: true, title: true, sold: true, stock: true, status: true, slug: true },
    }),
  ]);

  const revenue = items.reduce((s, i) => s + i.price * i.qty, 0);
  const soldCount = items.reduce((s, i) => s + i.qty, 0);

  const stats = [
    { label: "درآمد کل", value: `${formatPrice(revenue)} تومان`, icon: Wallet, color: "bg-emerald-50 text-emerald-600" },
    { label: "تعداد فروش", value: toFaDigits(soldCount), icon: ShoppingBag, color: "bg-sky-50 text-sky-600" },
    { label: "محصولات", value: toFaDigits(productCount), icon: Package, color: "bg-indigo-50 text-indigo-600" },
    { label: "در انتظار تأیید", value: toFaDigits(pendingCount), icon: Clock, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-l from-ink-950 to-ink-800 p-5 text-white">
        <div>
          <h1 className="text-lg font-bold">{seller.shopName}</h1>
          <p className="mt-1 flex items-center gap-2 text-[13px] text-white/70">
            <Star className="size-4 text-gold" fill="currentColor" />
            امتیاز فروشگاه: {toFaDigits(seller.rating.toFixed(1))} از ۵
          </p>
        </div>
        <Link href="/seller/products/new" className="btn bg-white px-5 py-2.5 text-ink-900 hover:bg-white/90">
          <PlusCircle className="size-4" /> افزودن محصول
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-4 shadow-card">
            <span className={`grid size-10 place-items-center rounded-xl ${s.color}`}>
              <s.icon className="size-5" />
            </span>
            <p className="mt-3 text-[17px] font-bold text-ink-900">{s.value}</p>
            <p className="text-[12px] text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-ink-800">آخرین سفارش‌ها</h2>
            <Link href="/seller/orders" className="flex items-center gap-1 text-[13px] text-brand-600">
              همه <ChevronLeft className="size-4" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-ink-500">هنوز سفارشی ثبت نشده است.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {recentOrders.map((it) => (
                <li key={it.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2-fa text-[12px] leading-5 text-ink-700">{it.title}</p>
                    <p className="mt-0.5 text-[11px] text-ink-400" dir="ltr">{it.order.code}</p>
                  </div>
                  <span className={`badge shrink-0 ${ORDER_STATUS[it.order.status].color}`}>
                    {ORDER_STATUS[it.order.status].label}
                  </span>
                  <span className="shrink-0 text-[12px] font-medium text-ink-800">
                    {formatPrice(it.price * it.qty)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-ink-800">پرفروش‌ترین محصولات شما</h2>
            <Link href="/seller/products" className="flex items-center gap-1 text-[13px] text-brand-600">
              همه <ChevronLeft className="size-4" />
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-ink-500">هنوز محصولی ثبت نکرده‌اید.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {topProducts.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <Link href={`/product/${p.slug}`} className="line-clamp-2-fa min-w-0 flex-1 text-[12px] leading-5 text-ink-700 hover:text-brand-600">
                    {p.title}
                  </Link>
                  <span className={`badge shrink-0 ${PRODUCT_STATUS[p.status].color}`}>
                    {PRODUCT_STATUS[p.status].label}
                  </span>
                  <span className="shrink-0 text-[12px] text-ink-500">
                    {toFaDigits(p.sold)} فروش
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
