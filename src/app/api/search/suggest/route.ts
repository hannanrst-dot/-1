import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      isActive: true,
      OR: [{ title: { contains: q } }, { tags: { contains: q } }],
    },
    select: { id: true, title: true, slug: true, images: true },
    take: 7,
    orderBy: { sold: "desc" },
  });

  return NextResponse.json(
    products.map((p) => ({ ...p, image: JSON.parse(p.images || "[]")[0] ?? null }))
  );
}
