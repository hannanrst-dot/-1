import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { HeaderClient } from "./HeaderClient";

type NavCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  children: { id: string; name: string; slug: string }[];
};

/**
 * دسته‌بندی‌های منو. هدر در تمام صفحات رندر می‌شود، بنابراین اگر دیتابیس
 * در دسترس نباشد (مثلاً هنگام build اولیه روی سرور) نباید کل سایت بشکند.
 */
async function loadCategories(): Promise<NavCategory[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      include: { children: { orderBy: { order: "asc" } } },
    });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      children: c.children.map((ch) => ({ id: ch.id, name: ch.name, slug: ch.slug })),
    }));
  } catch {
    return [];
  }
}

export async function Header() {
  const [categories, session] = await Promise.all([loadCategories(), getSession()]);
  return <HeaderClient categories={categories} session={session} />;
}

export function TopBanner() {
  return (
    <div className="bg-gradient-to-l from-brand-700 via-brand-600 to-brand-500 text-white">
      <div className="container-app flex h-9 items-center justify-center gap-2 text-[12px] lg:text-[13px]">
        <span>ارسال رایگان برای سفارش‌های بالای ۵ میلیون تومان</span>
        <span className="hidden text-white/60 sm:inline">•</span>
        <Link href="/installation" className="hidden underline-offset-4 hover:underline sm:inline">
          خدمات نصب و راه‌اندازی در محل
        </Link>
      </div>
    </div>
  );
}
