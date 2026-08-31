import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { id, action, note } = await req.json().catch(() => ({}));
  const seller = await prisma.seller.findUnique({ where: { id } });
  if (!seller) return NextResponse.json({ error: "فروشنده یافت نشد" }, { status: 404 });

  if (action === "approve") {
    await prisma.$transaction([
      prisma.seller.update({ where: { id }, data: { status: "APPROVED", rejectNote: null } }),
      prisma.user.update({ where: { id: seller.userId }, data: { role: "SELLER" } }),
    ]);
  } else if (action === "reject") {
    await prisma.$transaction([
      prisma.seller.update({
        where: { id },
        data: { status: "REJECTED", rejectNote: String(note ?? "").slice(0, 400) || "مدارک ارسالی کافی نبود." },
      }),
      prisma.user.update({ where: { id: seller.userId }, data: { role: "CUSTOMER" } }),
    ]);
  } else {
    return NextResponse.json({ error: "عملیات نامعتبر است" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
