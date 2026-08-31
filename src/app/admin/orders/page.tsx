import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { AdminOrderList } from "@/components/admin/AdminOrderList";
import { parseJSON } from "@/lib/utils";

export const metadata = { title: "مدیریت سفارش‌ها" };
export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  await requireRole(["ADMIN"]);
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { id: true, title: true, qty: true, price: true, image: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-ink-900">مدیریت سفارش‌ها</h1>
      <AdminOrderList
        orders={orders.map((o) => {
          const addr = parseJSON<Record<string, string>>(o.addressSnap, {});
          return {
            id: o.id, code: o.code, status: o.status, total: o.total,
            subtotal: o.subtotal, discount: o.discount, shippingCost: o.shippingCost,
            paymentMethod: o.paymentMethod, trackingCode: o.trackingCode,
            createdAt: o.createdAt.toISOString(), customer: o.user.name, email: o.user.email,
            receiver: addr.receiverName ?? "", phone: addr.phone ?? "",
            address: `${addr.province ?? ""}، ${addr.city ?? ""} — ${addr.line ?? ""}`,
            items: o.items,
          };
        })}
      />
    </div>
  );
}
