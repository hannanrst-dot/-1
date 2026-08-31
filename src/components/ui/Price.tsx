import { formatPrice } from "@/lib/utils";

export function Price({
  value,
  size = "md",
  className = "",
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const s =
    size === "lg" ? "text-2xl font-bold" : size === "sm" ? "text-sm font-medium" : "text-base font-bold";
  return (
    <span className={`inline-flex items-center gap-1 ${s} ${className}`}>
      {formatPrice(value)}
      <span className="text-[11px] font-normal text-ink-500">تومان</span>
    </span>
  );
}

export function DiscountBadge({ percent }: { percent: number }) {
  if (!percent) return null;
  return (
    <span className="badge bg-brand-600 text-white">
      ٪{formatPrice(percent)}
    </span>
  );
}
