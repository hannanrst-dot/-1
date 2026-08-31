import Link from "next/link";
import { Wrench, Clock, ShieldCheck, Phone, CheckCircle2 } from "lucide-react";
import { SITE } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "نصب و راه‌اندازی" };

const SERVICES = [
  { title: "تعویض مانیتور آیفون تصویری", price: 350_000, time: "۳۰ تا ۶۰ دقیقه" },
  { title: "نصب کامل آیفون تصویری تک‌واحدی", price: 850_000, time: "۲ تا ۳ ساعت" },
  { title: "نصب پنل کدینگ مجتمع", price: 1_500_000, time: "نیم‌روز کاری" },
  { title: "نصب جک درب پارکینگ (ست دوقلو)", price: 3_500_000, time: "۱ روز کاری" },
  { title: "نصب دوربین مداربسته (هر دوربین)", price: 450_000, time: "۴۵ دقیقه" },
  { title: "عیب‌یابی و رفع ایراد سیم‌کشی", price: 400_000, time: "بازدید اولیه" },
];

export default function InstallationPage() {
  return (
    <div className="pb-8">
      <section className="bg-gradient-to-l from-ink-950 via-ink-900 to-ink-800 py-12 text-white">
        <div className="container-app text-center">
          <Wrench className="mx-auto size-12 text-brand-400" strokeWidth={1.4} />
          <h1 className="mt-3 text-2xl font-bold">نصب و راه‌اندازی تخصصی</h1>
          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-8 text-white/70">
            تکنسین‌های آموزش‌دیده {SITE.name} در تهران و کرج، نصب و راه‌اندازی تجهیزات را
            با ضمانت اجرا انجام می‌دهند.
          </p>
          <a href={`tel:${SITE.mobile}`} className="btn mt-5 bg-white px-6 py-3 text-ink-900 hover:bg-white/90">
            <Phone className="size-4" /> تماس برای هماهنگی: {SITE.mobile}
          </a>
        </div>
      </section>

      <div className="container-app -mt-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Clock, t: "اعزام سریع", d: "حداکثر ۴۸ ساعت پس از هماهنگی" },
            { icon: ShieldCheck, t: "ضمانت اجرا", d: "۶ ماه گارانتی خدمات نصب" },
            { icon: CheckCircle2, t: "قیمت شفاف", d: "تعرفه اعلامی، بدون هزینه پنهان" },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl bg-white p-5 shadow-card">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-3 text-[14px] font-bold text-ink-800">{f.t}</h3>
              <p className="mt-1.5 text-[12px] leading-6 text-ink-500">{f.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="container-app mt-6">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="section-title mb-4">تعرفه خدمات نصب</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-[13px]">
              <thead>
                <tr className="border-b border-ink-100 text-[12px] text-ink-500">
                  <th className="p-3 text-right font-medium">نوع خدمت</th>
                  <th className="p-3 text-right font-medium">زمان تقریبی</th>
                  <th className="p-3 text-left font-medium">هزینه (تومان)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {SERVICES.map((s) => (
                  <tr key={s.title}>
                    <td className="p-3 text-ink-800">{s.title}</td>
                    <td className="p-3 text-ink-500">{s.time}</td>
                    <td className="p-3 text-left font-bold text-ink-900">{formatPrice(s.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 rounded-xl bg-sky-50 p-3 text-[12px] leading-6 text-sky-800">
            هزینه‌های بالا تقریبی و برای شرایط استاندارد است. در صورت نیاز به سیم‌کشی جدید یا
            شرایط خاص، هزینه پس از بازدید اعلام می‌شود. هنگام تکمیل سفارش می‌توانید گزینه
            «نصب و راه‌اندازی» را انتخاب کنید تا هماهنگی توسط ما انجام شود.
          </p>
          <Link href="/category/video-intercom" className="btn-primary mt-4">
            مشاهده محصولات و ثبت سفارش
          </Link>
        </div>
      </div>
    </div>
  );
}
