import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const b = await req.json().catch(() => ({}));
  const code = String(b.code ?? "").trim().toUpperCase();
  const percent = Number(b.percent);

  if (!/^[A-Z0-9_-]{3,24}$/.test(code)) {
    return NextResponse.json({ error: "کد باید ۳ تا ۲۴ کاراکتر انگلیسی یا عدد باشد" }, { status: 400 });
  }
  if (!Number.isInteger(percent) || percent < 1 || percent > 90) {
    return NextResponse.json({ error: "درصد تخفیف باید بین ۱ تا ۹۰ باشد" }, { status: 400 });
  }

  const exists = await prisma.coupon.findUnique({ where: { code } });
  if (exists) return NextResponse.json({ error: "این کد قبلاً ثبت شده است" }, { status: 409 });

  const coupon = await prisma.coupon.create({
    data: {
      code, percent,
      maxAmount: Number(b.maxAmount) || 0,
      minCart: Number(b.minCart) || 0,
      usageLimit: Number(b.usageLimit) || 0,
      expiresAt: b.expiresAt ? new Date(b.expiresAt) : null,
    },
  });

  return NextResponse.json(coupon);
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }
  const { id } = await req.json().catch(() => ({}));
  const c = await prisma.coupon.findUnique({ where: { id } });
  if (!c) return NextResponse.json({ error: "کد یافت نشد" }, { status: 404 });
  await prisma.coupon.update({ where: { id }, data: { isActive: !c.isActive } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }
  const id = new URL(req.url).searchParams.get("id") ?? "";
  await prisma.coupon.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
