import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, setSessionCookie } from "@/lib/auth";
import { sellerSchema, zodMessage } from "@/lib/validators";
import { uniqueSlug } from "@/lib/utils";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "ابتدا وارد حساب کاربری شوید" }, { status: 401 });

  const existing = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (existing) {
    return NextResponse.json({ error: "شما قبلاً درخواست فروشندگی ثبت کرده‌اید" }, { status: 409 });
  }

  const parsed = sellerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });
  const d = parsed.data;

  await prisma.seller.create({
    data: {
      userId: user.id,
      shopName: d.shopName,
      slug: uniqueSlug(d.shopName),
      description: d.description || null,
      nationalId: d.nationalId,
      iban: d.iban || null,
      province: d.province,
      city: d.city,
      address: d.address,
      status: "PENDING",
    },
  });

  return NextResponse.json({ ok: true });
}
