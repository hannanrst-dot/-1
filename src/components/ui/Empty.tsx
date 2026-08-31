import { PackageOpen } from "lucide-react";
import Link from "next/link";

export function Empty({
  title,
  desc,
  actionHref,
  actionLabel,
  icon,
}: {
  title: string;
  desc?: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white px-6 py-16 text-center shadow-card">
      <div className="grid size-16 place-items-center rounded-full bg-ink-50 text-ink-300">
        {icon ?? <PackageOpen className="size-8" />}
      </div>
      <h3 className="text-base font-bold text-ink-800">{title}</h3>
      {desc && <p className="max-w-sm text-sm text-ink-500">{desc}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-2">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
