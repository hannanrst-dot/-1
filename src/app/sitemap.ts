import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: { status: "APPROVED", isActive: true },
      select: { slug: true, updatedAt: true },
      take: 5000,
    }),
    prisma.category.findMany({ select: { slug: true } }),
    prisma.brand.findMany({ select: { slug: true } }),
  ]);

  const staticPages = [
    "", "/search", "/brands", "/about", "/contact", "/installation", "/terms",
    "/seller/register", "/help/order", "/help/payment", "/help/shipping",
    "/help/warranty", "/help/returns", "/help/registry",
  ];

  return [
    ...staticPages.map((p) => ({ url: p || "/", changeFrequency: "weekly" as const, priority: p ? 0.6 : 1 })),
    ...categories.map((c) => ({ url: `/category/${c.slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...brands.map((b) => ({ url: `/search?brand=${b.slug}`, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...products.map((p) => ({
      url: `/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
