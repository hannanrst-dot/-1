import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Package, Home } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatPrice, toFaDigits, parseJSON, ORDER_STATUS } from "@/lib/utils";

export const metadata = { title: "ثبت سفارش" };
export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { code } = await searchParams;
  if (!code) redirect("/");

  const order = await prisma.order.findFirst({
    where: { code, userId: session.uid },
    include: { items: true },
  });
  if (!order) redirect("/account/orders");

  const addr = parseJSON<Record<string, string>>(order.addressSnap, {});
  const status = ORDER_STATUS[order.status];

  return (
    <div className="container-app py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center shadow-card">
          <span className="grid size-20 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-11" />
          </span>
          <h1 className="text-xl font-bold text-ink-900">سفارش شما با موفقیت ثبت شد</h1>
          <p className="text-[13px] text-ink-500">
            کد پیگیری سفارش: <b className="text-ink-800" dir="ltr">{order.code}</b>
          </p>
          <span className={`badge ${status.color}`}>{status.label}</span>

          <div className="mt-4 w-full space-y-2.5 rounded-xl bg-ink-50 p-4 text-right text-[13px]">
            <div className="flex justify-between"><span className="text-ink-500">مبلغ پرداختی</span><span className="font-bold text-ink-800">{formatPrice(order.total)} تومان</span></div>
            <div className="flex justify-between"><span className="text-ink-500">تعداد اقلام</span><span className="text-ink-800">{toFaDigits(order.items.length)} کالا</span></div>
            <div className="flex justify-between"><span className="text-ink-500">روش ارسال</span><span className="text-ink-800">{addr.shipping}</span></div>
            <div className="flex justify-between gap-4"><span className="shrink-0 text-ink-500">آدرس</span><span className="text-left leading-6 text-ink-800">{addr.province}، {addr.city}، {addr.line}</span></div>
          </div>

          <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row">
            <Link href={`/account/orders/${order.id}`} className="btn-primary flex-1">
              <Package className="size-4" /> پیگیری سفارش
            </Link>
            <Link href="/" className="btn-outline flex-1">
              <Home className="size-4" /> بازگشت به فروشگاه
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
