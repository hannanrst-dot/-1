import Link from "next/link";
import {
  ShieldCheck, Truck, Wrench, Headphones, Instagram, Send, Phone, MapPin, Clock,
} from "lucide-react";
import { LogoMark } from "@/components/ui/LogoMark";
import { SITE } from "@/lib/site";

const FEATURES = [
  { icon: ShieldCheck, title: "ضمانت اصالت کالا", desc: "کالای اصل با گارانتی شرکتی" },
  { icon: Wrench, title: "نصب تخصصی", desc: "اعزام تکنسین در تهران و کرج" },
  { icon: Truck, title: "ارسال به سراسر ایران", desc: "بسته‌بندی ایمن و بیمه‌شده" },
  { icon: Headphones, title: "مشاوره فنی رایگان", desc: "انتخاب درست پیش از خرید" },
];

const LINKS = [
  {
    title: "دسته‌بندی‌ها",
    items: [
      { label: "آیفون تصویری", href: "/category/video-intercom" },
      { label: "پنل ورودی", href: "/category/entrance-panel" },
      { label: "جک درب پارکینگ", href: "/category/gate-opener" },
      { label: "دوربین مداربسته", href: "/category/cctv" },
    ],
  },
  {
    title: "خدمات مشتریان",
    items: [
      { label: "پیگیری سفارش", href: "/account/orders" },
      { label: "درخواست نصب", href: "/installation" },
      { label: "شرایط گارانتی", href: "/help/warranty" },
      { label: "رویه بازگشت کالا", href: "/help/returns" },
    ],
  },
  {
    title: "راهنما",
    items: [
      { label: "راهنمای خرید", href: "/help/order" },
      { label: "درباره ما", href: "/about" },
      { label: "همکاری در فروش", href: "/seller/register" },
      { label: "تماس با ما", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-10 border-t border-ink-100 bg-white">
      <div className="container-app">
        <div className="grid grid-cols-2 gap-4 border-b border-ink-100 py-8 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-2 text-center">
              <f.icon className="size-8 text-ink-400" strokeWidth={1.4} />
              <p className="text-[13px] font-bold text-ink-800">{f.title}</p>
              <p className="text-[11px] text-ink-500">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 py-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white">
                <LogoMark className="size-6" />
              </span>
              <div>
                <p className="text-lg font-bold text-ink-900">{SITE.name}</p>
                <p className="text-[11px] text-ink-500">{SITE.tagline}</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-[13px] leading-7 text-ink-500">
              {SITE.name} با بیش از یک دهه سابقه در تأمین و نصب سیستم‌های آیفون تصویری و
              کنترل تردد، محصولات برندهای معتبر را با قیمت نمایندگی و گارانتی معتبر عرضه می‌کند.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href={SITE.instagram} className="grid size-9 place-items-center rounded-xl bg-ink-50 text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-600" aria-label="اینستاگرام">
                <Instagram className="size-4" />
              </a>
              <a href={SITE.telegram} className="grid size-9 place-items-center rounded-xl bg-ink-50 text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-600" aria-label="تلگرام">
                <Send className="size-4" />
              </a>
            </div>
          </div>

          {LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-bold text-ink-800">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.items.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[13px] text-ink-500 transition-colors hover:text-brand-600">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-ink-100 py-5 text-[12px] text-ink-500 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="flex items-center gap-1.5"><Phone className="size-3.5" /> {SITE.phone}</span>
            <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {SITE.address}</span>
            <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {SITE.workHours}</span>
          </div>
          <p>© تمامی حقوق برای {SITE.name} محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}
