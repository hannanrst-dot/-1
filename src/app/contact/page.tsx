import { Phone, Mail, MapPin, Clock, Instagram, Send } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata = { title: "تماس با ما" };

export default function ContactPage() {
  const items = [
    { icon: Phone, label: "تلفن فروشگاه", value: SITE.phone },
    { icon: Phone, label: "همراه / واتساپ", value: SITE.mobile },
    { icon: Mail, label: "ایمیل", value: SITE.email, ltr: true },
    { icon: MapPin, label: "نشانی", value: SITE.address },
    { icon: Clock, label: "ساعات کاری", value: SITE.workHours },
  ];

  return (
    <div className="container-app py-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-xl font-bold text-ink-900">تماس با ما</h1>

        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((it) => (
            <div key={it.label} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-card">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <it.icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] text-ink-400">{it.label}</p>
                <p className={`mt-0.5 text-[13px] leading-6 text-ink-800 ${it.ltr ? "text-left" : ""}`} dir={it.ltr ? "ltr" : undefined}>
                  {it.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="mb-3 font-bold text-ink-800">شبکه‌های اجتماعی</h2>
          <div className="flex gap-3">
            <a href={SITE.instagram} className="btn-outline">
              <Instagram className="size-4" /> اینستاگرام
            </a>
            <a href={SITE.telegram} className="btn-outline">
              <Send className="size-4" /> تلگرام
            </a>
          </div>
          <p className="mt-4 text-[13px] leading-7 text-ink-500">
            برای مشاوره پیش از خرید می‌توانید عکس پنل و مانیتور فعلی ساختمان خود را از طریق واتساپ
            ارسال کنید تا کارشناسان ما سازگارترین گزینه را پیشنهاد دهند.
          </p>
        </div>
      </div>
    </div>
  );
}
