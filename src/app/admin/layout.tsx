import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/account");

  return (
    <div className="container-app py-5">
      <div className="grid gap-4 lg:grid-cols-[228px_1fr]">
        <aside className="lg:sticky lg:top-[136px] lg:self-start">
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <div className="mb-4 border-b border-ink-100 pb-4">
              <p className="text-[11px] text-ink-400">پنل مدیریت</p>
              <p className="mt-0.5 text-[14px] font-bold text-ink-800">{user.name}</p>
            </div>
            <AdminNav />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
