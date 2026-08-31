import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const b = await req.json().catch(() => ({}));
  const name = String(b.name ?? "").trim();
  if (name.length < 2) return NextResponse.json({ error: "نام دسته‌بندی معتبر نیست" }, { status: 400 });

  const slug = String(b.slug ?? "").trim() || slugify(name);
  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) return NextResponse.json({ error: "این نشانی (slug) قبلاً استفاده شده است" }, { status: 409 });

  const category = await prisma.category.create({
    data: {
      name, slug,
      icon: String(b.icon ?? "").slice(0, 4) || null,
      parentId: b.parentId || null,
      order: Number(b.order) || 0,
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }
  const id = new URL(req.url).searchParams.get("id") ?? "";

  const [products, children] = await Promise.all([
    prisma.product.count({ where: { categoryId: id } }),
    prisma.category.count({ where: { parentId: id } }),
  ]);
  if (products > 0 || children > 0) {
    return NextResponse.json(
      { error: "این دسته‌بندی دارای محصول یا زیرشاخه است و حذف نمی‌شود" },
      { status: 400 }
    );
  }

  await prisma.category.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
