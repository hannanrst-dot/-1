import Link from "next/link";
import Image from "next/image";
import { Package, ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatPrice, toFaDigits, formatDate, ORDER_STATUS } from "@/lib/utils";
import { Empty } from "@/components/ui/Empty";

export const metadata = { title: "سفارش‌های من" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (orders.length === 0) {
    return (
      <Empty
        title="هنوز سفارشی ثبت نکرده‌اید"
        desc="پس از اولین خرید، سفارش‌های شما در این بخش نمایش داده می‌شود."
        actionHref="/"
        actionLabel="شروع خرید"
        icon={<Package className="size-8" />}
      />
    );
  }

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-bold text-ink-900">سفارش‌های من ({toFaDigits(orders.length)})</h1>
      {orders.map((o) => (
        <Link key={o.id} href={`/account/orders/${o.id}`} className="block rounded-2xl bg-white p-4 shadow-card transition-shadow hover:shadow-pop">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-3">
            <div className="flex items-center gap-2">
              <span className={`badge ${ORDER_STATUS[o.status].color}`}>{ORDER_STATUS[o.status].label}</span>
              <span className="text-[12px] text-ink-500">{formatDate(o.createdAt)}</span>
            </div>
            <span className="text-[12px] text-ink-500" dir="ltr">{o.code}</span>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <div className="flex flex-1 gap-2 overflow-hidden">
              {o.items.slice(0, 5).map((it) => (
                <div key={it.id} className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                  {it.image && <Image src={it.image} alt={it.title} fill className="object-cover" sizes="56px" />}
                </div>
              ))}
              {o.items.length > 5 && (
                <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-ink-50 text-[12px] text-ink-500">
                  +{toFaDigits(o.items.length - 5)}
                </div>
              )}
            </div>
            <div className="shrink-0 text-left">
              <p className="text-[11px] text-ink-400">مبلغ کل</p>
              <p className="text-[14px] font-bold text-ink-900">{formatPrice(o.total)}</p>
            </div>
            <ChevronLeft className="size-4 shrink-0 text-ink-300" />
          </div>
        </Link>
      ))}
    </div>
  );
}
