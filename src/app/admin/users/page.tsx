import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { AdminUserList } from "@/components/admin/AdminUserList";

export const metadata = { title: "مدیریت کاربران" };
export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const me = await requireRole(["ADMIN"]);
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-ink-900">مدیریت کاربران</h1>
      <AdminUserList
        meId={me.id}
        users={users.map((u) => ({
          id: u.id, name: u.name, email: u.email, phone: u.phone ?? "",
          role: u.role, isActive: u.isActive,
          createdAt: u.createdAt.toISOString(), orders: u._count.orders,
        }))}
      />
    </div>
  );
}
