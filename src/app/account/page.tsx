import Link from "next/link";
import { Package, MapPin, Heart, Clock, ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatPrice, toFaDigits, formatDate, ORDER_STATUS } from "@/lib/utils";

export const metadata = { title: "پیشخوان" };
export const dynamic = "force-dynamic";

export default async function AccountHome() {
  const user = await requireUser();

  const [orderCount, addressCount, wishCount, recent, pendingCount] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.address.count({ where: { userId: user.id } }),
    prisma.wishlist.count({ where: { userId: user.id } }),
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { items: { take: 3 } },
    }),
    prisma.order.count({ where: { userId: user.id, status: { in: ["PAID", "PROCESSING", "SHIPPED"] } } }),
  ]);

  const stats = [
    { label: "کل سفارش‌ها", value: orderCount, icon: Package, href: "/account/orders", color: "bg-sky-50 text-sky-600" },
    { label: "در حال پیگیری", value: pendingCount, icon: Clock, href: "/account/orders", color: "bg-amber-50 text-amber-600" },
    { label: "علاقه‌مندی‌ها", value: wishCount, icon: Heart, href: "/account/wishlist", color: "bg-rose-50 text-rose-600" },
    { label: "آدرس‌ها", value: addressCount, icon: MapPin, href: "/account/addresses", color: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-l from-brand-700 to-brand-500 p-5 text-white">
        <h1 className="text-lg font-bold">سلام {user.name} 👋</h1>
        <p className="mt-1 text-[13px] text-white/80">
          به پیشخوان حساب کاربری خود خوش آمدید. از این بخش سفارش‌ها و اطلاعات خود را مدیریت کنید.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-pop">
            <span className={`grid size-10 place-items-center rounded-xl ${s.color}`}>
              <s.icon className="size-5" />
            </span>
            <p className="mt-3 text-xl font-bold text-ink-900">{toFaDigits(s.value)}</p>
            <p className="text-[12px] text-ink-500">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-ink-800">آخرین سفارش‌ها</h2>
          <Link href="/account/orders" className="flex items-center gap-1 text-[13px] text-brand-600">
            همه سفارش‌ها <ChevronLeft className="size-4" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-ink-500">هنوز سفارشی ثبت نکرده‌اید.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {recent.map((o) => (
              <li key={o.id}>
                <Link href={`/account/orders/${o.id}`} className="flex items-center gap-3 py-3 hover:bg-ink-50/50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-ink-800" dir="ltr">{o.code}</span>
                      <span className={`badge ${ORDER_STATUS[o.status].color}`}>{ORDER_STATUS[o.status].label}</span>
                    </div>
                    <p className="mt-1 truncate text-[12px] text-ink-500">
                      {o.items.map((i) => i.title).join("، ")}
                    </p>
                  </div>
                  <div className="shrink-0 text-left">
                    <p className="text-[13px] font-bold text-ink-800">{formatPrice(o.total)}</p>
                    <p className="text-[11px] text-ink-400">{formatDate(o.createdAt)}</p>
                  </div>
                  <ChevronLeft className="size-4 shrink-0 text-ink-300" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
