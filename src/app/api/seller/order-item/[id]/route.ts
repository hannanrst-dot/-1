import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const ALLOWED = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"];

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });

  const item = await prisma.orderItem.findFirst({ where: { id, sellerId: seller.id } });
  if (!item) return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });

  const { status } = await req.json().catch(() => ({}));
  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: "وضعیت نامعتبر است" }, { status: 400 });
  }

  await prisma.orderItem.update({ where: { id }, data: { status } });

  // وضعیت کل سفارش = کم‌پیشرفت‌ترین قلم آن
  const siblings = await prisma.orderItem.findMany({ where: { orderId: item.orderId } });
  const RANK = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const lowest = siblings.reduce((min, s) => {
    const r = RANK.indexOf(s.status);
    return r >= 0 && r < min ? r : min;
  }, RANK.length - 1);

  await prisma.order.update({
    where: { id: item.orderId },
    data: { status: RANK[lowest] },
  });

  return NextResponse.json({ ok: true });
}
