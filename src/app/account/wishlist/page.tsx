import { Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ProductGrid } from "@/components/product/ProductRow";
import { Empty } from "@/components/ui/Empty";
import { toFaDigits } from "@/lib/utils";

export const metadata = { title: "علاقه‌مندی‌ها" };
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await requireUser();
  const list = await prisma.wishlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true, title: true, slug: true, price: true, discountPercent: true,
          images: true, stock: true, rating: true, ratingCount: true,
          hasMemory: true, screenSize: true,
          brand: { select: { name: true } }, seller: { select: { shopName: true } },
        },
      },
    },
  });

  if (list.length === 0) {
    return (
      <Empty
        title="لیست علاقه‌مندی‌های شما خالی است"
        desc="با کلیک روی آیکن قلب در کارت محصولات، آن‌ها را اینجا ذخیره کنید."
        actionHref="/"
        actionLabel="مشاهده محصولات"
        icon={<Heart className="size-8" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-ink-900">
        علاقه‌مندی‌ها ({toFaDigits(list.length)} کالا)
      </h1>
      <ProductGrid products={list.map((w) => w.product)} />
    </div>
  );
}
