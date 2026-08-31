import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, CreditCard, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatPrice, toFaDigits, formatDateTime, parseJSON, ORDER_STATUS } from "@/lib/utils";

export const metadata = { title: "جزئیات سفارش" };
export const dynamic = "force-dynamic";

const STEPS = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
const STEP_LABEL: Record<string, string> = {
  PAID: "پرداخت شد", PROCESSING: "آماده‌سازی", SHIPPED: "ارسال شد", DELIVERED: "تحویل شد",
};

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { items: { include: { product: { select: { slug: true } } } } },
  });
  if (!order) notFound();

  const addr = parseJSON<Record<string, string | boolean>>(order.addressSnap, {});
  const status = ORDER_STATUS[order.status];
  const stepIndex = STEPS.indexOf(order.status);

  return (
    <div className="space-y-4">
      <Link href="/account/orders" className="inline-flex items-center gap-1 text-[13px] text-ink-500 hover:text-brand-600">
        <ChevronRight className="size-4" /> بازگشت به سفارش‌ها
      </Link>

      <div className="rounded-2xl bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-4">
          <div>
            <h1 className="text-lg font-bold text-ink-900">سفارش <span dir="ltr">{order.code}</span></h1>
            <p className="mt-1 text-[12px] text-ink-500">ثبت شده در {formatDateTime(order.createdAt)}</p>
          </div>
          <span className={`badge ${status.color} px-3 py-1.5`}>{status.label}</span>
        </div>

        {order.status !== "CANCELED" && (
          <div className="flex items-center justify-between py-6">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span className={`grid size-8 place-items-center rounded-full text-[12px] font-bold ${
                    i <= stepIndex ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-400"
                  }`}>
                    {toFaDigits(i + 1)}
                  </span>
                  <span className={`text-[11px] ${i <= stepIndex ? "font-medium text-ink-800" : "text-ink-400"}`}>
                    {STEP_LABEL[s]}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`mx-1 h-0.5 flex-1 ${i < stepIndex ? "bg-brand-600" : "bg-ink-100"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {order.trackingCode && (
          <div className="rounded-xl bg-sky-50 px-4 py-3 text-[13px] text-sky-800">
            کد رهگیری مرسوله: <b dir="ltr">{order.trackingCode}</b>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="mb-3 font-bold text-ink-800">کالاهای سفارش</h2>
          <ul className="divide-y divide-ink-100">
            {order.items.map((it) => (
              <li key={it.id} className="flex gap-3 py-3">
                <Link href={`/product/${it.product.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                  {it.image && <Image src={it.image} alt={it.title} fill className="object-cover" sizes="80px" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${it.product.slug}`} className="line-clamp-2-fa text-[13px] leading-6 text-ink-800 hover:text-brand-600">
                    {it.title}
                  </Link>
                  {it.variant && <p className="mt-1 text-[11px] text-ink-500">{it.variant}</p>}
                  <div className="mt-2 flex items-center justify-between text-[12px]">
                    <span className="text-ink-500">تعداد: {toFaDigits(it.qty)}</span>
                    <span className="font-bold text-ink-800">{formatPrice(it.price * it.qty)} تومان</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-800">
              <MapPin className="size-4 text-brand-600" /> آدرس تحویل
            </h2>
            <p className="text-[13px] leading-7 text-ink-600">
              {String(addr.receiverName)} — {toFaDigits(String(addr.phone))}
              <br />
              {String(addr.province)}، {String(addr.city)}، {String(addr.line)}
              <br />
              کد پستی: {toFaDigits(String(addr.postalCode ?? ""))}
            </p>
          </div>

          <div className="space-y-2.5 rounded-2xl bg-white p-4 shadow-card text-[13px]">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-ink-800">
              <CreditCard className="size-4 text-brand-600" /> صورتحساب
            </h2>
            <div className="flex justify-between"><span className="text-ink-500">جمع کالاها</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600"><span>تخفیف {order.couponCode}</span><span>{formatPrice(order.discount)}−</span></div>
            )}
            <div className="flex justify-between">
              <span className="flex items-center gap-1 text-ink-500"><Truck className="size-3.5" /> ارسال {addr.installation ? "و نصب" : ""}</span>
              <span>{order.shippingCost === 0 ? "رایگان" : formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between border-t border-ink-100 pt-2.5 font-bold">
              <span>مبلغ کل</span><span>{formatPrice(order.total)} تومان</span>
            </div>
            <p className="pt-1 text-[11px] text-ink-400">
              روش پرداخت: {order.paymentMethod === "COD" ? "پرداخت در محل" : "پرداخت اینترنتی"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
