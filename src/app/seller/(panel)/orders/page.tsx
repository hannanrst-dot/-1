import { ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { SellerOrderTable } from "@/components/seller/SellerOrderTable";
import { Empty } from "@/components/ui/Empty";
import { parseJSON } from "@/lib/utils";

export const metadata = { title: "سفارش‌های فروشگاه" };
export const dynamic = "force-dynamic";

export default async function SellerOrders() {
  const user = await requireRole(["SELLER", "ADMIN"]);
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) return null;

  const items = await prisma.orderItem.findMany({
    where: { sellerId: seller.id },
    orderBy: { id: "desc" },
    include: {
      order: {
        select: {
          code: true, status: true, createdAt: true, addressSnap: true,
          user: { select: { name: true, phone: true } },
        },
      },
    },
  });

  if (items.length === 0) {
    return (
      <Empty
        title="هنوز سفارشی دریافت نکرده‌اید"
        desc="پس از اولین فروش، سفارش‌های مربوط به محصولات شما اینجا نمایش داده می‌شود."
        icon={<ShoppingBag className="size-8" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-ink-900">سفارش‌های فروشگاه</h1>
      <SellerOrderTable
        items={items.map((it) => {
          const addr = parseJSON<Record<string, string>>(it.order.addressSnap, {});
          return {
            id: it.id,
            title: it.title,
            image: it.image,
            variant: it.variant,
            price: it.price,
            qty: it.qty,
            status: it.status,
            orderCode: it.order.code,
            orderStatus: it.order.status,
            createdAt: it.order.createdAt.toISOString(),
            customer: it.order.user.name,
            phone: addr.phone ?? it.order.user.phone ?? "",
            city: `${addr.province ?? ""}، ${addr.city ?? ""}`,
            address: addr.line ?? "",
          };
        })}
      />
    </div>
  );
}
