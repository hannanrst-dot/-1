import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const ALLOWED = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"];

export async function PATCH(req: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { id, status, trackingCode } = await req.json().catch(() => ({}));
  if (status && !ALLOWED.includes(status)) {
    return NextResponse.json({ error: "وضعیت نامعتبر است" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(trackingCode !== undefined ? { trackingCode: String(trackingCode).slice(0, 40) || null } : {}),
    },
  });

  if (status) {
    await prisma.orderItem.updateMany({ where: { orderId: id }, data: { status } });
  }

  return NextResponse.json({ ok: true });
}
