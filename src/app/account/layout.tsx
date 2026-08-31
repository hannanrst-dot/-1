import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AccountNav } from "@/components/account/AccountNav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  return (
    <div className="container-app py-5">
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-[136px] lg:self-start">
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <div className="mb-4 flex items-center gap-3 border-b border-ink-100 pb-4">
              <span className="grid size-11 place-items-center rounded-full bg-brand-50 text-base font-bold text-brand-700">
                {user.name.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-ink-800">{user.name}</p>
                <p className="truncate text-[11px] text-ink-500" dir="ltr">{user.email}</p>
              </div>
            </div>
            <AccountNav role={user.role} />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
