import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { loginSchema, zodMessage } from "@/lib/validators";
import { toEnDigits } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });
  }
  const identifier = toEnDigits(parsed.data.identifier.trim());

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier.toLowerCase() }, { phone: identifier }] },
  });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "ایمیل/موبایل یا رمز عبور نادرست است" }, { status: 401 });
  }
  if (!user.isActive) {
    return NextResponse.json({ error: "حساب کاربری شما غیرفعال شده است" }, { status: 403 });
  }

  await setSessionCookie({
    uid: user.id,
    role: user.role as "CUSTOMER" | "SELLER" | "ADMIN",
    name: user.name,
  });
  return NextResponse.json({ ok: true, role: user.role });
}
