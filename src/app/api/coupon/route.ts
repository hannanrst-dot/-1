import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { code, subtotal } = await req.json().catch(() => ({ code: "", subtotal: 0 }));
  if (!code) return NextResponse.json({ error: "کد تخفیف را وارد کنید" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code: String(code).toUpperCase() } });
  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: "کد تخفیف نامعتبر است" }, { status: 404 });
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: "این کد تخفیف منقضی شده است" }, { status: 410 });
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ error: "ظرفیت استفاده از این کد تمام شده است" }, { status: 410 });
  }
  if (Number(subtotal) < coupon.minCart) {
    return NextResponse.json(
      { error: `حداقل مبلغ سبد برای این کد ${coupon.minCart.toLocaleString("en-US")} تومان است` },
      { status: 400 }
    );
  }

  let discount = Math.floor((Number(subtotal) * coupon.percent) / 100);
  if (coupon.maxAmount > 0) discount = Math.min(discount, coupon.maxAmount);

  return NextResponse.json({ ok: true, code: coupon.code, percent: coupon.percent, discount });
}
