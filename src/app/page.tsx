import Link from "next/link";
import Image from "next/image";
import { Headphones, ShieldCheck, Wrench, Truck, ChevronLeft, Flame } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { HeroSlider } from "@/components/home/HeroSlider";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { ProductRow } from "@/components/product/ProductRow";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const productSelect = {
  id: true, title: true, slug: true, price: true, discountPercent: true,
  images: true, stock: true, rating: true, ratingCount: true,
  hasMemory: true, screenSize: true,
  brand: { select: { name: true } },
  seller: { select: { shopName: true } },
} as const;

export default async function HomePage() {
  const base = { status: "APPROVED", isActive: true } as const;

  const [banners, categories, newest, bestselling, discounted, topRated, brands] = await Promise.all([
    prisma.banner.findMany({ where: { isActive: true, position: "HERO" }, orderBy: { order: "asc" } }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.findMany({ where: base, orderBy: { createdAt: "desc" }, take: 12, select: productSelect }),
    prisma.product.findMany({ where: base, orderBy: { sold: "desc" }, take: 12, select: productSelect }),
    prisma.product.findMany({
      where: { ...base, discountPercent: { gte: 10 } },
      orderBy: { discountPercent: "desc" },
      take: 12,
      select: productSelect,
    }),
    prisma.product.findMany({
      where: { ...base, ratingCount: { gt: 0 } },
      orderBy: { rating: "desc" },
      take: 12,
      select: productSelect,
    }),
    prisma.brand.findMany({ include: { _count: { select: { products: true } } }, take: 10 }),
  ]);

  return (
    <div className="pb-8">
      <section className="container-app pt-4">
        <HeroSlider
          slides={banners.map((b) => ({ id: b.id, title: b.title, image: b.image, link: b.link }))}
        />
      </section>

      <section className="container-app py-5">
        <CategoryStrip categories={categories} />
      </section>

      <section className="container-app">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, t: "ضمانت اصالت", d: "کالای اصل با گارانتی شرکتی" },
            { icon: Wrench, t: "نصب در محل", d: "تکنسین مجرب در تهران و کرج" },
            { icon: Truck, t: "ارسال سریع", d: "ارسال به سراسر کشور" },
            { icon: Headphones, t: "مشاوره رایگان", d: SITE.phone },
          ].map((f) => (
            <div key={f.t} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-ink-800">{f.t}</p>
                <p className="truncate text-[11px] text-ink-500">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {discounted.length > 0 && (
        <section className="container-app py-6">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-l from-brand-700 to-brand-500 p-4">
            <div className="mb-3 flex items-center justify-between px-1 text-white">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Flame className="size-5" /> پیشنهاد شگفت‌انگیز
              </h2>
              <Link href="/search?discount=1" className="flex items-center gap-1 text-[13px] hover:underline">
                مشاهده همه <ChevronLeft className="size-4" />
              </Link>
            </div>
            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
              {discounted.map((p) => {
                const imgs = JSON.parse(p.images || "[]") as string[];
                const final = Math.round((p.price * (100 - p.discountPercent)) / 100);
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="flex w-[150px] shrink-0 flex-col gap-2 rounded-xl bg-white p-3 sm:w-[172px]"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-ink-50">
                      {imgs[0] && <Image src={imgs[0]} alt={p.title} fill className="object-cover" sizes="172px" />}
                    </div>
                    <h3 className="line-clamp-2-fa min-h-[40px] text-[12px] leading-5 text-ink-700">{p.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-brand-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                        {p.discountPercent.toLocaleString("fa-IR")}٪
                      </span>
                      <div className="text-left">
                        <div className="text-[10px] text-ink-400 line-through">
                          {p.price.toLocaleString("fa-IR")}
                        </div>
                        <div className="text-[13px] font-bold text-ink-900">
                          {final.toLocaleString("fa-IR")}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <ProductRow title="پرفروش‌ترین محصولات" href="/search?sort=bestselling" products={bestselling} accent="#e51b45" />
      <ProductRow title="جدیدترین کالاها" href="/search?sort=newest" products={newest} accent="#0ea5e9" />

      <section className="container-app py-6">
        <div className="grid gap-3 lg:grid-cols-2">
          <Link href="/installation" className="group relative overflow-hidden rounded-2xl bg-ink-950 p-6 text-white">
            <div className="relative z-10 max-w-[62%]">
              <h3 className="text-lg font-bold">نصب و راه‌اندازی تخصصی</h3>
              <p className="mt-2 text-[13px] leading-6 text-white/70">
                تکنسین‌های ما در کمتر از ۴۸ ساعت در محل شما حاضر می‌شوند.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-brand-300">
                ثبت درخواست <ChevronLeft className="size-4" />
              </span>
            </div>
            <Wrench className="absolute -left-4 -bottom-4 size-40 text-white/5 transition-transform group-hover:scale-110" strokeWidth={1} />
          </Link>
          <Link href="/seller/register" className="group relative overflow-hidden rounded-2xl bg-gradient-to-l from-brand-700 to-brand-500 p-6 text-white">
            <div className="relative z-10 max-w-[62%]">
              <h3 className="text-lg font-bold">در {SITE.name} بفروشید</h3>
              <p className="mt-2 text-[13px] leading-6 text-white/80">
                محصولات خود را در بزرگ‌ترین بازار تجهیزات درب و کنترل تردد عرضه کنید.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium">
                ثبت‌نام فروشندگان <ChevronLeft className="size-4" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <ProductRow title="محبوب‌ترین‌ها از نگاه کاربران" href="/search?sort=rating" products={topRated} accent="#f0a500" />

      <section className="container-app py-6">
        <h2 className="section-title mb-3">خرید بر اساس برند</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-10">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/search?brand=${b.slug}`}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-pop"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-ink-50 text-base font-bold text-ink-600">
                {b.name.slice(0, 2)}
              </span>
              <span className="text-[12px] font-medium text-ink-700">{b.name}</span>
              <span className="text-[10px] text-ink-400">
                {b._count.products.toLocaleString("fa-IR")} کالا
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-app py-6">
        <div className="rounded-2xl bg-white p-6 shadow-card lg:p-8">
          <h2 className="section-title mb-3">راهنمای خرید آیفون تصویری</h2>
          <div className="grid gap-6 text-[13px] leading-7 text-ink-600 lg:grid-cols-3">
            <div>
              <h3 className="mb-1.5 font-bold text-ink-800">چه سایزی مناسب من است؟</h3>
              <p>
                برای واحدهای مسکونی معمولی مانیتور ۴.۳ یا ۵ اینچ کافی است. اگر می‌خواهید تصویر
                واضح‌تری داشته باشید یا از قابلیت حافظه استفاده کنید، مدل‌های ۷ اینچ گزینه
                بهتری هستند. مانیتورهای ۱۰ اینچ بیشتر برای ویلا و پروژه‌های خاص کاربرد دارند.
              </p>
            </div>
            <div>
              <h3 className="mb-1.5 font-bold text-ink-800">حافظه‌دار بخرم یا معمولی؟</h3>
              <p>
                مدل‌های حافظه‌دار در زمان نبود شما تصویر مراجعین را ذخیره می‌کنند. اگر رفت‌وآمد
                زیادی دارید یا واحد تجاری است، حافظه‌دار توصیه می‌شود. اختلاف قیمت معمولاً
                بین ۱ تا ۲ میلیون تومان است.
              </p>
            </div>
            <div>
              <h3 className="mb-1.5 font-bold text-ink-800">سازگاری با سیم‌کشی موجود</h3>
              <p>
                بیشتر ساختمان‌های ایران سیم‌کشی ۴ سیمه دارند و تعویض مانیتور بدون تغییر
                سیم‌کشی ممکن است. پیش از خرید، مدل پنل فعلی خود را برای کارشناسان ما ارسال
                کنید تا سازگاری بررسی شود.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
