import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { registerSchema, zodMessage } from "@/lib/validators";
import { toEnDigits } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse({
    ...body,
    phone: body?.phone ? toEnDigits(String(body.phone)) : "",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });
  }
  const { name, email, phone, password } = parsed.data;

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
  });
  if (exists) {
    return NextResponse.json(
      { error: "کاربری با این ایمیل یا شماره موبایل قبلاً ثبت‌نام کرده است" },
      { status: 409 }
    );
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash: await hashPassword(password),
    },
  });

  await setSessionCookie({ uid: user.id, role: "CUSTOMER", name: user.name });
  return NextResponse.json({ ok: true, role: user.role });
}
