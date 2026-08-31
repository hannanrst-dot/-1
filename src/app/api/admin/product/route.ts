import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { id, action, note } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "شناسه محصول نامعتبر است" }, { status: 400 });

  if (action === "approve") {
    await prisma.product.update({
      where: { id },
      data: { status: "APPROVED", rejectNote: null, isActive: true },
    });
  } else if (action === "reject") {
    await prisma.product.update({
      where: { id },
      data: { status: "REJECTED", rejectNote: String(note ?? "").slice(0, 400) || "مطابق قوانین فروشگاه نیست." },
    });
  } else if (action === "toggle") {
    const p = await prisma.product.findUnique({ where: { id } });
    if (!p) return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    await prisma.product.update({ where: { id }, data: { isActive: !p.isActive } });
  } else {
    return NextResponse.json({ error: "عملیات نامعتبر است" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
