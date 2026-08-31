import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SellerNav } from "@/components/seller/SellerNav";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login?next=/seller");
  if (user.role !== "SELLER" && user.role !== "ADMIN") redirect("/seller/register");
  if (user.seller && user.seller.status !== "APPROVED") redirect("/seller/register");

  return (
    <div className="container-app py-5">
      <div className="grid gap-4 lg:grid-cols-[236px_1fr]">
        <aside className="lg:sticky lg:top-[136px] lg:self-start">
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <div className="mb-4 border-b border-ink-100 pb-4">
              <p className="text-[11px] text-ink-400">پنل فروشندگی</p>
              <p className="mt-0.5 truncate text-[14px] font-bold text-ink-800">
                {user.seller?.shopName ?? "مدیر سیستم"}
              </p>
            </div>
            <SellerNav />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
