import Link from "next/link";
import { SearchX, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-app py-20">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl bg-white p-10 text-center shadow-card">
        <span className="grid size-20 place-items-center rounded-full bg-ink-50 text-ink-300">
          <SearchX className="size-10" />
        </span>
        <h1 className="text-2xl font-bold text-ink-900">۴۰۴</h1>
        <p className="text-[14px] font-medium text-ink-700">صفحه مورد نظر پیدا نشد</p>
        <p className="text-[13px] leading-7 text-ink-500">
          ممکن است آدرس را اشتباه وارد کرده باشید یا این صفحه حذف شده باشد.
        </p>
        <Link href="/" className="btn-primary mt-2">
          <Home className="size-4" /> بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
