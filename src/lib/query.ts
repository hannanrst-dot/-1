import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export type SearchParams = {
  q?: string;
  category?: string;
  brand?: string;
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
  discount?: string;
  available?: string;
  memory?: string;
  screen?: string;
  wiring?: string;
  rating?: string;
};

export const PAGE_SIZE = 20;

export const productSelect = {
  id: true, title: true, slug: true, price: true, discountPercent: true,
  images: true, stock: true, rating: true, ratingCount: true,
  hasMemory: true, screenSize: true,
  brand: { select: { name: true } },
  seller: { select: { shopName: true } },
} as const;

/** Collect a category and all its descendants. */
export async function categoryTreeIds(slug: string) {
  const root = await prisma.category.findUnique({
    where: { slug },
    include: { children: { include: { children: true } } },
  });
  if (!root) return null;
  const ids = [root.id];
  for (const c of root.children) {
    ids.push(c.id);
    for (const g of c.children) ids.push(g.id);
  }
  return { root, ids };
}

export async function searchProducts(sp: SearchParams, categoryIds?: string[]) {
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.ProductWhereInput = {
    status: "APPROVED",
    isActive: true,
    ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
  };

  const and: Prisma.ProductWhereInput[] = [];

  if (sp.q?.trim()) {
    const q = sp.q.trim();
    and.push({ OR: [{ title: { contains: q } }, { tags: { contains: q } }, { description: { contains: q } }] });
  }
  if (sp.brand) {
    const slugs = sp.brand.split(",").filter(Boolean);
    and.push({ brand: { slug: { in: slugs } } });
  }
  if (sp.min) and.push({ price: { gte: Number(sp.min) } });
  if (sp.max) and.push({ price: { lte: Number(sp.max) } });
  if (sp.discount === "1") and.push({ discountPercent: { gt: 0 } });
  if (sp.available === "1") and.push({ stock: { gt: 0 } });
  if (sp.memory === "1") and.push({ hasMemory: true });
  if (sp.rating) and.push({ rating: { gte: Number(sp.rating) } });
  if (sp.screen) {
    const sizes = sp.screen.split(",").filter(Boolean);
    and.push({ OR: sizes.map((s) => ({ screenSize: { contains: s } })) });
  }
  if (sp.wiring) {
    const w = sp.wiring.split(",").filter(Boolean);
    and.push({ OR: w.map((s) => ({ wiring: { contains: s } })) });
  }
  if (and.length) where.AND = and;

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sp.sort === "cheap" ? { price: "asc" }
      : sp.sort === "expensive" ? { price: "desc" }
        : sp.sort === "bestselling" ? { sold: "desc" }
          : sp.sort === "rating" ? { rating: "desc" }
            : sp.sort === "discount" ? { discountPercent: "desc" }
              : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where, orderBy, select: productSelect,
      skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export const SORT_OPTIONS = [
  { id: "newest", label: "جدیدترین" },
  { id: "bestselling", label: "پرفروش‌ترین" },
  { id: "cheap", label: "ارزان‌ترین" },
  { id: "expensive", label: "گران‌ترین" },
  { id: "rating", label: "بیشترین امتیاز" },
  { id: "discount", label: "بیشترین تخفیف" },
];

export const SCREEN_SIZES = ["۴.۳", "۵", "۷", "۱۰"];
export const WIRING_TYPES = ["۲ سیمه", "۴ سیمه", "Wi-Fi"];
