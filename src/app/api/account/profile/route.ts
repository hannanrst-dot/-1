import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, verifyPassword, setSessionCookie } from "@/lib/auth";

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const { name, phone, password, newPassword } = await req.json().catch(() => ({}));
  const user = await prisma.user.findUnique({ where: { id: session.uid } });
  if (!user) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });

  const data: { name?: string; phone?: string | null; passwordHash?: string } = {};

  if (typeof name === "string" && name.trim().length >= 3) data.name = name.trim();

  if (typeof phone === "string") {
    const p = phone.trim();
    if (p && !/^09\d{9}$/.test(p)) {
      return NextResponse.json({ error: "شماره موبایل معتبر نیست" }, { status: 400 });
    }
    if (p && p !== user.phone) {
      const taken = await prisma.user.findFirst({ where: { phone: p, id: { not: user.id } } });
      if (taken) return NextResponse.json({ error: "این شماره قبلاً ثبت شده است" }, { status: 409 });
    }
    data.phone = p || null;
  }

  if (newPassword) {
    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: "رمز جدید باید حداقل ۶ کاراکتر باشد" }, { status: 400 });
    }
    if (!password || !(await verifyPassword(String(password), user.passwordHash))) {
      return NextResponse.json({ error: "رمز عبور فعلی نادرست است" }, { status: 403 });
    }
    data.passwordHash = await hashPassword(String(newPassword));
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data });
  await setSessionCookie({
    uid: updated.id,
    role: updated.role as "CUSTOMER" | "SELLER" | "ADMIN",
    name: updated.name,
  });

  return NextResponse.json({ ok: true });
}
