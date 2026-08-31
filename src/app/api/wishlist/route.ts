import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const { productId } = await req.json().catch(() => ({ productId: "" }));
  if (!productId) return NextResponse.json({ error: "محصول نامعتبر" }, { status: 400 });

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: session.uid, productId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    return NextResponse.json({ added: false });
  }
  await prisma.wishlist.create({ data: { userId: session.uid, productId } });
  return NextResponse.json({ added: true });
}
