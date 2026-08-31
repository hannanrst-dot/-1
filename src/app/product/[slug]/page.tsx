import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ChevronLeft, ShieldCheck, Truck, RotateCcw, Wrench, MessageSquare,
  HelpCircle, Store, Package, Eye,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseJSON, toFaDigits, formatDate } from "@/lib/utils";
import { Gallery } from "@/components/product/Gallery";
import { BuyBox } from "@/components/product/BuyBox";
import { ReviewForm } from "@/components/product/ReviewForm";
import { QuestionForm } from "@/components/product/QuestionForm";
import { Stars, StarRow } from "@/components/ui/Stars";
import { ProductRow } from "@/components/product/ProductRow";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug } });
  if (!p) return { title: "کالا یافت نشد" };
  return { title: p.title, description: p.shortDesc ?? p.description.slice(0, 150) };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { slug, status: "APPROVED", isActive: true },
    include: {
      brand: true,
      category: { include: { parent: true } },
      seller: true,
      variants: { orderBy: { priceDiff: "asc" } },
      reviews: {
        where: { status: "APPROVED" },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      questions: {
        include: {
          user: { select: { name: true } },
          answers: { include: { user: { select: { name: true, role: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!product) notFound();

  const [session, related] = await Promise.all([
    getSession(),
    prisma.product.findMany({
      where: {
        status: "APPROVED", isActive: true,
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 12,
      orderBy: { sold: "desc" },
      select: {
        id: true, title: true, slug: true, price: true, discountPercent: true,
        images: true, stock: true, rating: true, ratingCount: true,
        hasMemory: true, screenSize: true,
        brand: { select: { name: true } }, seller: { select: { shopName: true } },
      },
    }),
  ]);

  await prisma.product.update({ where: { id: product.id }, data: { views: { increment: 1 } } });

  const images = parseJSON<string[]>(product.images, []);
  const specs = parseJSON<{ key: string; value: string }[]>(product.specs, []);

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: product.reviews.filter((r) => r.rating === star).length,
  }));
  const totalReviews = product.reviews.length;

  const quickFacts = [
    product.screenSize && { label: "اندازه صفحه", value: product.screenSize },
    product.wiring && { label: "نوع اتصال", value: product.wiring },
    product.panelType && { label: "نوع پنل", value: product.panelType },
    product.unitCount && { label: "تعداد واحد", value: `${toFaDigits(product.unitCount)} واحد` },
    { label: "وضعیت", value: product.hasMemory ? "حافظه‌دار" : "بدون حافظه" },
    { label: "اصالت", value: product.isOriginal ? "کالای اصل" : "درجه دو" },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="pb-8">
      <div className="container-app py-4">
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-[12px] text-ink-500">
          <Link href="/" className="hover:text-brand-600">خانه</Link>
          <ChevronLeft className="size-3.5" />
          {product.category.parent && (
            <>
              <Link href={`/category/${product.category.parent.slug}`} className="hover:text-brand-600">
                {product.category.parent.name}
              </Link>
              <ChevronLeft className="size-3.5" />
            </>
          )}
          <Link href={`/category/${product.category.slug}`} className="hover:text-brand-600">
            {product.category.name}
          </Link>
        </nav>

        <div className="grid gap-5 lg:grid-cols-[440px_1fr_320px]">
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <Gallery images={images} title={product.title} />
          </div>

          <div className="min-w-0 space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-card">
              {product.brand && (
                <Link href={`/search?brand=${product.brand.slug}`} className="text-[12px] font-medium text-brand-600 hover:underline">
                  {product.brand.name}
                </Link>
              )}
              <h1 className="mt-1 text-lg font-bold leading-8 text-ink-900 lg:text-xl lg:leading-9">
                {product.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 border-b border-ink-100 pb-3 text-[12px] text-ink-500">
                {product.ratingCount > 0 && <Stars rating={product.rating} count={product.ratingCount} />}
                <span className="flex items-center gap-1"><MessageSquare className="size-3.5" /> {toFaDigits(totalReviews)} دیدگاه</span>
                <span className="flex items-center gap-1"><Eye className="size-3.5" /> {toFaDigits(product.views)} بازدید</span>
                <span className="flex items-center gap-1"><Package className="size-3.5" /> {toFaDigits(product.sold)} فروش</span>
              </div>

              {product.shortDesc && (
                <p className="mt-3 text-[13px] leading-7 text-ink-600">{product.shortDesc}</p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {quickFacts.map((f) => (
                  <div key={f.label} className="rounded-xl bg-ink-50 px-3 py-2">
                    <p className="text-[11px] text-ink-400">{f.label}</p>
                    <p className="text-[13px] font-medium text-ink-800">{f.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-ink-100 pt-4 text-[12px] lg:grid-cols-4">
                {[
                  { icon: ShieldCheck, t: "ضمانت اصالت" },
                  { icon: RotateCcw, t: "۷ روز بازگشت" },
                  { icon: Truck, t: "ارسال سریع" },
                  { icon: Wrench, t: "نصب در محل" },
                ].map((f) => (
                  <div key={f.t} className="flex items-center gap-1.5 text-ink-600">
                    <f.icon className="size-4 text-brand-500" /> {f.t}
                  </div>
                ))}
              </div>
            </div>

            {specs.length > 0 && (
              <section id="specs" className="rounded-2xl bg-white p-4 shadow-card">
                <h2 className="section-title mb-3">مشخصات فنی</h2>
                <dl className="divide-y divide-ink-100">
                  {specs.map((s, i) => (
                    <div key={i} className="grid grid-cols-3 gap-3 py-2.5 text-[13px]">
                      <dt className="text-ink-500">{s.key}</dt>
                      <dd className="col-span-2 text-ink-800">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section className="rounded-2xl bg-white p-4 shadow-card">
              <h2 className="section-title mb-3">معرفی محصول</h2>
              <div className="whitespace-pre-line text-[13px] leading-8 text-ink-600">
                {product.description}
              </div>
            </section>

            <section id="reviews" className="rounded-2xl bg-white p-4 shadow-card">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <MessageSquare className="size-5 text-brand-600" /> دیدگاه کاربران
              </h2>

              {totalReviews > 0 && (
                <div className="mb-5 grid gap-5 rounded-xl bg-ink-50 p-4 sm:grid-cols-[160px_1fr]">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-3xl font-bold text-ink-900">{toFaDigits(product.rating.toFixed(1))}</span>
                    <StarRow rating={product.rating} />
                    <span className="text-[12px] text-ink-500">از {toFaDigits(product.ratingCount)} امتیاز</span>
                  </div>
                  <div className="space-y-1.5">
                    {dist.map((d) => (
                      <div key={d.star} className="flex items-center gap-2 text-[12px]">
                        <span className="w-8 text-ink-500">{toFaDigits(d.star)} ★</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-gold"
                            style={{ width: `${totalReviews ? (d.count / totalReviews) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="w-8 text-left text-ink-400">{toFaDigits(d.count)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-5">
                <ReviewForm productId={product.id} canReview={Boolean(session)} />
              </div>

              {product.reviews.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-ink-500">
                  هنوز دیدگاهی ثبت نشده است. اولین نفر باشید!
                </p>
              ) : (
                <ul className="divide-y divide-ink-100">
                  {product.reviews.map((r) => {
                    const pros = parseJSON<string[]>(r.pros, []);
                    const cons = parseJSON<string[]>(r.cons, []);
                    return (
                      <li key={r.id} className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-[12px] font-bold text-brand-700">
                              {r.user.name.slice(0, 1)}
                            </span>
                            <div>
                              <p className="text-[13px] font-medium text-ink-800">{r.user.name}</p>
                              <p className="text-[11px] text-ink-400">{formatDate(r.createdAt)}</p>
                            </div>
                          </div>
                          <StarRow rating={r.rating} size={14} />
                        </div>
                        {r.title && <p className="mt-2.5 text-[13px] font-bold text-ink-800">{r.title}</p>}
                        <p className="mt-1.5 text-[13px] leading-7 text-ink-600">{r.comment}</p>
                        {(pros.length > 0 || cons.length > 0) && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {pros.map((p, i) => (
                              <span key={`p${i}`} className="badge bg-emerald-50 text-emerald-700">+ {p}</span>
                            ))}
                            {cons.map((c, i) => (
                              <span key={`c${i}`} className="badge bg-rose-50 text-rose-700">− {c}</span>
                            ))}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section id="questions" className="rounded-2xl bg-white p-4 shadow-card">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <HelpCircle className="size-5 text-brand-600" /> پرسش و پاسخ
              </h2>
              <div className="mb-4">
                <QuestionForm
                  productId={product.id}
                  loggedIn={Boolean(session)}
                  placeholder="پرسش خود درباره این کالا را بنویسید…"
                />
              </div>
              {product.questions.length === 0 ? (
                <p className="py-4 text-center text-[13px] text-ink-500">هنوز پرسشی ثبت نشده است.</p>
              ) : (
                <ul className="space-y-4">
                  {product.questions.map((q) => (
                    <li key={q.id} className="rounded-xl border border-ink-100 p-3">
                      <p className="text-[13px] font-medium text-ink-800">{q.body}</p>
                      <p className="mt-1 text-[11px] text-ink-400">
                        {q.user.name} — {formatDate(q.createdAt)}
                      </p>
                      {q.answers.map((a) => (
                        <div key={a.id} className="mt-3 rounded-lg bg-ink-50 p-3">
                          <p className="text-[13px] leading-7 text-ink-700">{a.body}</p>
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-400">
                            {a.user.role !== "CUSTOMER" && (
                              <span className="badge bg-brand-50 py-0 text-brand-600">پاسخ فروشنده</span>
                            )}
                            {a.user.name} — {formatDate(a.createdAt)}
                          </p>
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="lg:w-80">
            <BuyBox
              productId={product.id}
              title={product.title}
              slug={product.slug}
              image={images[0] ?? null}
              price={product.price}
              discountPercent={product.discountPercent}
              stock={product.stock}
              variants={product.variants}
              sellerName={product.seller.shopName}
              sellerSlug={product.seller.slug}
              sellerRating={product.seller.rating}
              warranty={product.warranty}
            />

            <Link
              href={`/seller/shop/${product.seller.slug}`}
              className="mt-3 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card transition-colors hover:bg-ink-50"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-ink-950 text-white">
                <Store className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-ink-800">{product.seller.shopName}</p>
                <Stars rating={product.seller.rating} size={12} />
              </div>
              <ChevronLeft className="mr-auto size-4 text-ink-300" />
            </Link>
          </div>
        </div>
      </div>

      <ProductRow title="کالاهای مشابه" products={related} accent="#e51b45" />
    </div>
  );
}
