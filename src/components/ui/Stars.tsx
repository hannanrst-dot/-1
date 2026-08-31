import { Star } from "lucide-react";
import { toFaDigits } from "@/lib/utils";

export function Stars({
  rating,
  count,
  size = 14,
  showNumber = true,
}: {
  rating: number;
  count?: number;
  size?: number;
  showNumber?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink-600">
      <Star className="text-gold" style={{ width: size, height: size }} fill="currentColor" />
      {showNumber && <b className="font-medium text-ink-800">{toFaDigits(rating.toFixed(1))}</b>}
      {count !== undefined && <span className="text-ink-400">({toFaDigits(count)})</span>}
    </span>
  );
}

export function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex flex-row-reverse items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(rating) ? "text-gold" : "text-ink-200"}
          fill="currentColor"
        />
      ))}
    </span>
  );
}
