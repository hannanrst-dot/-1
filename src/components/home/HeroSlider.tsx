"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SITE } from "@/lib/site";

type Slide = { id: string; title: string; image: string; link: string };

const COPY = [
  { sub: "کنترل درب از هر جای دنیا با گوشی موبایل", cta: "مشاهده مدل‌ها" },
  { sub: "نصب رایگان در تهران و کرج برای سفارش‌های بالای ۱۰ میلیون تومان", cta: "سفارش نصب" },
  { sub: "پشتیبانی تا ۲۰۰ واحد با بدنه استیل ضدزنگ", cta: "خرید پنل" },
];

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const n = slides.length;

  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n]);

  if (n === 0) return null;
  const s = slides[i];
  const copy = COPY[i % COPY.length];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-ink-950 via-ink-900 to-ink-800">
      <div className="grid items-center gap-4 p-6 sm:p-10 lg:grid-cols-2 lg:p-12">
        <div className="order-2 text-white lg:order-1">
          <span className="badge bg-white/10 text-white/90">پیشنهاد ویژه {SITE.name}</span>
          <h2 className="mt-3 text-xl font-bold leading-9 sm:text-2xl lg:text-[32px] lg:leading-[52px]">
            {s.title}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-7 text-white/70">{copy.sub}</p>
          <Link href={s.link} className="btn mt-5 bg-white px-6 py-3 text-ink-900 hover:bg-white/90">
            {copy.cta}
          </Link>
        </div>
        <div className="order-1 flex justify-center lg:order-2">
          <div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-2xl bg-white/5">
            <Image src={s.image} alt={s.title} fill className="object-contain p-2" sizes="300px" priority />
          </div>
        </div>
      </div>

      {n > 1 && (
        <>
          <button
            onClick={() => setI((v) => (v + 1) % n)}
            className="absolute right-3 top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 lg:grid"
            aria-label="بعدی"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            onClick={() => setI((v) => (v - 1 + n) % n)}
            className="absolute left-3 top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 lg:grid"
            aria-label="قبلی"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, k) => (
              <button
                key={k}
                onClick={() => setI(k)}
                className={`h-1.5 rounded-full transition-all ${k === i ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                aria-label={`اسلاید ${k + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
