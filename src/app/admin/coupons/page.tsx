import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { AdminCouponManager } from "@/components/admin/AdminCouponManager";

export const metadata = { title: "کدهای تخفیف" };
export const dynamic = "force-dynamic";

export default async function AdminCoupons() {
  await requireRole(["ADMIN"]);
  const coupons = await prisma.coupon.findMany({ orderBy: { id: "desc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-ink-900">کدهای تخفیف</h1>
      <AdminCouponManager
        coupons={coupons.map((c) => ({
          id: c.id, code: c.code, percent: c.percent, maxAmount: c.maxAmount,
          minCart: c.minCart, usageLimit: c.usageLimit, usedCount: c.usedCount,
          isActive: c.isActive, expiresAt: c.expiresAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
