import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { reviewSchema, zodMessage } from "@/lib/validators";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "برای ثبت دیدگاه وارد شوید" }, { status: 401 });

  const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });

  const { productId, rating, title, comment, pros, cons } = parsed.data;

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId: session.uid } },
  });
  if (existing) {
    return NextResponse.json({ error: "شما قبلاً برای این کالا دیدگاه ثبت کرده‌اید" }, { status: 409 });
  }

  await prisma.review.create({
    data: {
      productId,
      userId: session.uid,
      rating,
      title: title || null,
      comment,
      pros: JSON.stringify(pros.filter(Boolean)),
      cons: JSON.stringify(cons.filter(Boolean)),
    },
  });

  const agg = await prisma.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      ratingCount: agg._count,
    },
  });

  return NextResponse.json({ ok: true });
}
