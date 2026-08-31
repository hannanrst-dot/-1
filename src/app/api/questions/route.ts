import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "برای ثبت پرسش وارد شوید" }, { status: 401 });

  const { productId, body, questionId } = await req.json().catch(() => ({}));
  const text = String(body ?? "").trim();
  if (text.length < 5) {
    return NextResponse.json({ error: "متن حداقل ۵ حرف باشد" }, { status: 400 });
  }

  if (questionId) {
    await prisma.answer.create({
      data: { questionId, userId: session.uid, body: text.slice(0, 1000) },
    });
  } else {
    if (!productId) return NextResponse.json({ error: "کالا نامعتبر است" }, { status: 400 });
    await prisma.question.create({
      data: { productId, userId: session.uid, body: text.slice(0, 500) },
    });
  }
  return NextResponse.json({ ok: true });
}
