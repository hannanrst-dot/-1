import Link from "next/link";
import { Store, TrendingUp, Wallet, Headphones, Clock, CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SellerRegisterForm } from "@/components/seller/SellerRegisterForm";
import { SITE } from "@/lib/site";

export const metadata = { title: "ثبت‌نام فروشندگان" };
export const dynamic = "force-dynamic";

const BENEFITS = [
  { icon: TrendingUp, title: "دسترسی به هزاران خریدار", desc: "محصولات شما در معرض دید مشتریان سراسر کشور قرار می‌گیرد." },
  { icon: Wallet, title: "تسویه هفتگی", desc: "درآمد فروش هر هفته به حساب بانکی شما واریز می‌شود." },
  { icon: Headphones, title: "پشتیبانی اختصاصی", desc: "کارشناس فروش برای راهنمایی و رفع مشکلات در کنار شماست." },
  { icon: Store, title: "ویترین اختصاصی", desc: "صفحه فروشگاه مستقل با نام و معرفی کسب‌وکار شما." },
];

export default async function SellerRegisterPage() {
  const user = await getCurrentUser();
  const seller = user ? await prisma.seller.findUnique({ where: { userId: user.id } }) : null;

  return (
    <div className="pb-8">
      <section className="bg-gradient-to-l from-ink-950 via-ink-900 to-ink-800 py-12 text-white">
        <div className="container-app text-center">
          <h1 className="text-2xl font-bold lg:text-3xl">در {SITE.name} بفروشید</h1>
          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-8 text-white/70">
            اگر در زمینه آیفون تصویری، دربازکن، جک پارکینگ یا تجهیزات کنترل تردد فعالیت می‌کنید،
            محصولات خود را در فروشگاه ما عرضه کنید و فروشتان را چند برابر کنید.
          </p>
        </div>
      </section>

      <div className="container-app -mt-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl bg-white p-5 shadow-card">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <b.icon className="size-5" />
              </span>
              <h3 className="mt-3 text-[14px] font-bold text-ink-800">{b.title}</h3>
              <p className="mt-1.5 text-[12px] leading-6 text-ink-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="container-app mt-6">
        <div className="mx-auto max-w-3xl">
          {!user ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-card">
              <Store className="mx-auto size-12 text-ink-300" strokeWidth={1.4} />
              <h2 className="mt-3 text-lg font-bold text-ink-800">برای ثبت‌نام فروشندگی وارد شوید</h2>
              <p className="mt-2 text-[13px] text-ink-500">
                ابتدا یک حساب کاربری بسازید یا وارد حساب خود شوید، سپس فرم فروشندگی را تکمیل کنید.
              </p>
              <div className="mt-5 flex justify-center gap-2">
                <Link href="/login?next=/seller/register" className="btn-primary px-6">ورود</Link>
                <Link href="/register?next=/seller/register" className="btn-outline px-6">ثبت‌نام</Link>
              </div>
            </div>
          ) : seller ? (
            <StatusCard status={seller.status} shopName={seller.shopName} note={seller.rejectNote} />
          ) : (
            <SellerRegisterForm />
          )}
        </div>
      </div>

      <div className="container-app mt-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-card">
          <h2 className="section-title mb-4">مراحل شروع همکاری</h2>
          <ol className="space-y-4">
            {[
              "تکمیل فرم ثبت‌نام و ارسال اطلاعات کسب‌وکار",
              "بررسی و تأیید مدارک توسط کارشناسان (حداکثر ۴۸ ساعت کاری)",
              "بارگذاری محصولات از طریق پنل فروشندگی",
              "دریافت سفارش، ارسال کالا و تسویه هفتگی",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-[12px] font-bold text-brand-700">
                  {["۱", "۲", "۳", "۴"][i]}
                </span>
                <p className="pt-0.5 text-[13px] leading-7 text-ink-600">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ status, shopName, note }: { status: string; shopName: string; note: string | null }) {
  if (status === "APPROVED") {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-card">
        <CheckCircle2 className="mx-auto size-14 text-emerald-500" strokeWidth={1.4} />
        <h2 className="mt-3 text-lg font-bold text-ink-800">فروشندگی شما تأیید شده است</h2>
        <p className="mt-2 text-[13px] text-ink-500">
          فروشگاه «{shopName}» فعال است. از پنل فروشندگی محصولات خود را مدیریت کنید.
        </p>
        <Link href="/seller" className="btn-primary mt-5 px-6">ورود به پنل فروشندگی</Link>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-card">
        <XCircle className="mx-auto size-14 text-rose-500" strokeWidth={1.4} />
        <h2 className="mt-3 text-lg font-bold text-ink-800">درخواست شما تأیید نشد</h2>
        {note && (
          <p className="mx-auto mt-3 max-w-md rounded-xl bg-rose-50 p-3 text-[13px] leading-7 text-rose-700">
            {note}
          </p>
        )}
        <p className="mt-3 text-[13px] text-ink-500">
          برای پیگیری با پشتیبانی تماس بگیرید.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 text-center shadow-card">
      <Clock className="mx-auto size-14 text-amber-500" strokeWidth={1.4} />
      <h2 className="mt-3 text-lg font-bold text-ink-800">درخواست شما در حال بررسی است</h2>
      <p className="mt-2 text-[13px] leading-7 text-ink-500">
        اطلاعات فروشگاه «{shopName}» ثبت شد و توسط کارشناسان بررسی می‌شود.
        نتیجه حداکثر تا ۴۸ ساعت کاری اعلام خواهد شد.
      </p>
    </div>
  );
}
