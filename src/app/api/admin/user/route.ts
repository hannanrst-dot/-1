import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { id, action, role } = await req.json().catch(() => ({}));
  if (id === session.uid) {
    return NextResponse.json({ error: "نمی‌توانید حساب خودتان را تغییر دهید" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });

  if (action === "toggle") {
    await prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
  } else if (action === "role" && ["CUSTOMER", "SELLER", "ADMIN"].includes(role)) {
    await prisma.user.update({ where: { id }, data: { role } });
  } else {
    return NextResponse.json({ error: "عملیات نامعتبر است" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
