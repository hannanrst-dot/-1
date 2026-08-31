import { ShieldCheck, Wrench, Users, Award } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata = { title: "درباره ما" };

export default function AboutPage() {
  return (
    <div className="container-app py-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-2xl bg-gradient-to-l from-ink-950 to-ink-800 p-8 text-white">
          <h1 className="text-2xl font-bold">درباره {SITE.name}</h1>
          <p className="mt-3 text-[14px] leading-8 text-white/70">
            {SITE.tagline} — عرضه‌کننده مستقیم محصولات برندهای معتبر با گارانتی شرکتی و خدمات نصب تخصصی.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="space-y-4 text-[13px] leading-8 text-ink-600">
            <p>
              {SITE.name} با بیش از یک دهه فعالیت در حوزه سیستم‌های آیفون تصویری، دربازکن و کنترل تردد،
              به‌عنوان یکی از تأمین‌کنندگان اصلی این محصولات در بازار ایران شناخته می‌شود. ما با همکاری
              مستقیم نمایندگی‌های رسمی برندهایی مانند سیماران، تابا، کوماکس، الکتروپیک و سوزوکی، محصولات
              را با قیمت نمایندگی و بدون واسطه در اختیار مشتریان قرار می‌دهیم.
            </p>
            <p>
              تمرکز ما تنها بر فروش نیست؛ انتخاب درست دستگاه متناسب با سیم‌کشی موجود ساختمان، تعداد واحدها
              و بودجه شما، مهم‌ترین بخش کار است. به همین دلیل مشاوره پیش از خرید را رایگان ارائه می‌کنیم و
              تیم فنی ما آماده بررسی شرایط ساختمان شما پیش از ثبت سفارش است.
            </p>
            <p>
              خدمات نصب و راه‌اندازی در تهران و کرج توسط تکنسین‌های آموزش‌دیده انجام می‌شود و تمام محصولات
              فروخته‌شده دارای گارانتی معتبر و خدمات پس از فروش هستند.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-ink-100 pt-6 lg:grid-cols-4">
            {[
              { icon: Award, n: "۱۲+", t: "سال سابقه" },
              { icon: Users, n: "۸٬۰۰۰+", t: "مشتری راضی" },
              { icon: Wrench, n: "۳٬۵۰۰+", t: "پروژه نصب" },
              { icon: ShieldCheck, n: "۱۰+", t: "برند معتبر" },
            ].map((s) => (
              <div key={s.t} className="rounded-xl bg-ink-50 p-4 text-center">
                <s.icon className="mx-auto size-6 text-brand-600" strokeWidth={1.5} />
                <p className="mt-2 text-lg font-bold text-ink-900">{s.n}</p>
                <p className="text-[11px] text-ink-500">{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
