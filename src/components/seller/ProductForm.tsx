"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Upload, X, Plus, Trash2, Loader2, Save, ImageIcon, Info, Layers, Settings2,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { formatPrice, toEnDigits, toFaDigits } from "@/lib/utils";

type Option = { id: string; name: string };
type Spec = { key: string; value: string };
type Variant = { name: string; value: string; colorHex: string; priceDiff: number; stock: number };

export type ProductFormValues = {
  id?: string;
  title: string; description: string; shortDesc: string;
  price: number; discountPercent: number; stock: number;
  categoryId: string; brandId: string;
  images: string[]; specs: Spec[]; variants: Variant[];
  tags: string; warranty: string; warrantyMonths: number;
  condition: "NEW" | "REFURBISHED" | "USED";
  screenSize: string; hasMemory: boolean; panelType: string;
  unitCount: number | ""; wiring: string; isOriginal: boolean;
};

const EMPTY: ProductFormValues = {
  title: "", description: "", shortDesc: "", price: 0, discountPercent: 0, stock: 1,
  categoryId: "", brandId: "", images: [], specs: [], variants: [],
  tags: "", warranty: "", warrantyMonths: 12, condition: "NEW",
  screenSize: "", hasMemory: false, panelType: "", unitCount: "", wiring: "", isOriginal: true,
};

const SPEC_PRESETS = [
  "اندازه صفحه نمایش", "نوع اتصال", "حافظه", "تعداد واحد", "جنس بدنه",
  "ولتاژ کاری", "ابعاد", "دید در شب", "استاندارد ضدآب", "گارانتی", "کشور سازنده",
];

export function ProductForm({
  categories, brands, initial, mode,
}: {
  categories: Option[]; brands: Option[];
  initial?: ProductFormValues; mode: "create" | "edit";
}) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState<ProductFormValues>(initial ?? EMPTY);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"basic" | "specs" | "variants">("basic");

  const set = <K extends keyof ProductFormValues>(k: K, v: ProductFormValues[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((file) => fd.append("files", file));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) return toast(data.error ?? "خطا در بارگذاری تصویر", "error");
    set("images", [...f.images, ...data.urls]);
    toast(`${toFaDigits(data.urls.length)} تصویر بارگذاری شد`);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.images.length === 0) {
      setTab("basic");
      return toast("حداقل یک تصویر برای محصول بارگذاری کنید", "error");
    }
    setBusy(true);
    const url = mode === "create" ? "/api/seller/products" : `/api/seller/products/${f.id}`;
    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, unitCount: f.unitCount === "" ? undefined : f.unitCount }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(data.error ?? "خطا در ذخیره محصول", "error");
    toast(mode === "create" ? "محصول ثبت شد و در انتظار تأیید مدیر است" : "تغییرات ذخیره شد");
    router.push("/seller/products");
    router.refresh();
  };

  const finalPrice = Math.round((f.price * (100 - f.discountPercent)) / 100);

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex gap-1 rounded-2xl bg-white p-1.5 shadow-card">
        {([
          ["basic", "اطلاعات اصلی", Info],
          ["specs", "مشخصات فنی", Settings2],
          ["variants", "تنوع محصول", Layers],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id} type="button" onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${
              tab === id ? "bg-brand-50 font-medium text-brand-700" : "text-ink-500 hover:bg-ink-50"
            }`}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "basic" && (
        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-ink-800">
              <ImageIcon className="size-4.5 text-brand-600" /> تصاویر محصول
            </h2>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {f.images.map((src, i) => (
                <div key={src + i} className="group relative aspect-square overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
                  <Image src={src} alt={`تصویر ${i + 1}`} fill className="object-cover" sizes="140px" />
                  {i === 0 && (
                    <span className="absolute bottom-1 right-1 rounded-md bg-brand-600 px-1.5 py-0.5 text-[10px] text-white">
                      اصلی
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => set("images", f.images.filter((_, k) => k !== i))}
                    className="absolute left-1 top-1 grid size-6 place-items-center rounded-lg bg-white/90 text-rose-600 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="حذف تصویر"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="grid aspect-square place-items-center gap-1 rounded-xl border-2 border-dashed border-ink-200 text-ink-400 transition-colors hover:border-brand-400 hover:text-brand-600"
              >
                {uploading ? <Loader2 className="size-6 animate-spin" /> : <Upload className="size-6" />}
                <span className="text-[11px]">افزودن تصویر</span>
              </button>
            </div>

            <input
              ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => upload(e.target.files)}
            />
            <p className="mt-3 text-[11px] leading-5 text-ink-400">
              اولین تصویر به‌عنوان تصویر اصلی محصول نمایش داده می‌شود. فرمت‌های JPG، PNG و WebP تا ۵ مگابایت.
            </p>
          </section>

          <section className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
            <div>
              <label className="label">عنوان محصول *</label>
              <input
                className="input" value={f.title} onChange={(e) => set("title", e.target.value)}
                required minLength={5} maxLength={160}
                placeholder="مثلاً: آیفون تصویری سیماران مدل HS-43TK لمسی ۴.۳ اینچ"
              />
            </div>

            <div>
              <label className="label">توضیح کوتاه</label>
              <input
                className="input" value={f.shortDesc} onChange={(e) => set("shortDesc", e.target.value)}
                maxLength={220} placeholder="یک جمله معرفی کوتاه که زیر عنوان نمایش داده می‌شود"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">دسته‌بندی *</label>
                <select className="input" value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)} required>
                  <option value="">انتخاب کنید…</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">برند</label>
                <select className="input" value={f.brandId} onChange={(e) => set("brandId", e.target.value)}>
                  <option value="">بدون برند</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">قیمت (تومان) *</label>
                <input
                  className="input" inputMode="numeric" required
                  value={f.price ? toFaDigits(f.price.toLocaleString("en-US")) : ""}
                  onChange={(e) => set("price", Number(toEnDigits(e.target.value).replace(/\D/g, "")) || 0)}
                  placeholder="۳٬۸۵۰٬۰۰۰"
                />
              </div>
              <div>
                <label className="label">درصد تخفیف</label>
                <input
                  className="input" inputMode="numeric" value={f.discountPercent || ""}
                  onChange={(e) => set("discountPercent", Math.min(90, Number(toEnDigits(e.target.value).replace(/\D/g, "")) || 0))}
                  placeholder="۰"
                />
              </div>
              <div>
                <label className="label">موجودی انبار *</label>
                <input
                  className="input" inputMode="numeric" required value={f.stock}
                  onChange={(e) => set("stock", Number(toEnDigits(e.target.value).replace(/\D/g, "")) || 0)}
                />
              </div>
            </div>

            {f.price > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3 text-[13px]">
                <span className="text-ink-600">قیمت نهایی برای خریدار</span>
                <span className="font-bold text-ink-900">{formatPrice(finalPrice)} تومان</span>
              </div>
            )}

            <div>
              <label className="label">توضیحات کامل *</label>
              <textarea
                className="input min-h-40 resize-y" value={f.description}
                onChange={(e) => set("description", e.target.value)} required minLength={20}
                placeholder="ویژگی‌ها، کاربرد، نکات نصب و هر آنچه خریدار باید بداند…"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">گارانتی</label>
                <input className="input" value={f.warranty} onChange={(e) => set("warranty", e.target.value)} placeholder="مثلاً ۱۸ ماه گارانتی سیماران" />
              </div>
              <div>
                <label className="label">مدت گارانتی (ماه)</label>
                <input
                  className="input" inputMode="numeric" value={f.warrantyMonths}
                  onChange={(e) => set("warrantyMonths", Number(toEnDigits(e.target.value).replace(/\D/g, "")) || 0)}
                />
              </div>
            </div>

            <div>
              <label className="label">کلمات کلیدی (برای جستجو)</label>
              <input
                className="input" value={f.tags} onChange={(e) => set("tags", e.target.value)}
                placeholder="آیفون تصویری، سیماران، ۴.۳ اینچ، دربازکن"
              />
            </div>
          </section>
        </div>
      )}

      {tab === "specs" && (
        <div className="space-y-4">
          <section className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
            <h2 className="font-bold text-ink-800">ویژگی‌های تخصصی</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">اندازه صفحه نمایش</label>
                <input className="input" value={f.screenSize} onChange={(e) => set("screenSize", e.target.value)} placeholder="مثلاً ۷ اینچ" />
              </div>
              <div>
                <label className="label">نوع اتصال</label>
                <select className="input" value={f.wiring} onChange={(e) => set("wiring", e.target.value)}>
                  <option value="">انتخاب کنید…</option>
                  <option>۲ سیمه</option>
                  <option>۴ سیمه</option>
                  <option>۴ سیمه + Wi-Fi</option>
                  <option>تحت شبکه (IP)</option>
                </select>
              </div>
              <div>
                <label className="label">نوع پنل</label>
                <select className="input" value={f.panelType} onChange={(e) => set("panelType", e.target.value)}>
                  <option value="">مرتبط نیست</option>
                  <option>کدینگ</option>
                  <option>تک‌واحدی</option>
                  <option>چندواحدی</option>
                </select>
              </div>
              <div>
                <label className="label">تعداد واحد قابل پشتیبانی</label>
                <input
                  className="input" inputMode="numeric" value={f.unitCount}
                  onChange={(e) => {
                    const v = toEnDigits(e.target.value).replace(/\D/g, "");
                    set("unitCount", v === "" ? "" : Number(v));
                  }}
                  placeholder="مثلاً ۱۰۰"
                />
              </div>
              <div>
                <label className="label">وضعیت کالا</label>
                <select className="input" value={f.condition} onChange={(e) => set("condition", e.target.value as ProductFormValues["condition"])}>
                  <option value="NEW">نو / آکبند</option>
                  <option value="REFURBISHED">بازسازی‌شده</option>
                  <option value="USED">کارکرده</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 border-t border-ink-100 pt-4">
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-700">
                <input type="checkbox" className="size-4 accent-brand-600" checked={f.hasMemory} onChange={(e) => set("hasMemory", e.target.checked)} />
                این محصول حافظه‌دار است
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-700">
                <input type="checkbox" className="size-4 accent-brand-600" checked={f.isOriginal} onChange={(e) => set("isOriginal", e.target.checked)} />
                کالای اصل (اورجینال)
              </label>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-ink-800">جدول مشخصات فنی</h2>
              <button
                type="button"
                onClick={() => set("specs", [...f.specs, { key: "", value: "" }])}
                className="btn-soft px-3 py-1.5 text-xs"
              >
                <Plus className="size-3.5" /> افزودن ردیف
              </button>
            </div>

            {f.specs.length === 0 && (
              <p className="mb-3 rounded-xl bg-ink-50 p-4 text-center text-[13px] text-ink-500">
                هنوز مشخصه‌ای اضافه نکرده‌اید. از دکمه‌های زیر برای افزودن سریع استفاده کنید.
              </p>
            )}

            <div className="space-y-2">
              {f.specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input flex-1" value={s.key} placeholder="عنوان (مثلاً ولتاژ کاری)"
                    onChange={(e) => set("specs", f.specs.map((x, k) => k === i ? { ...x, key: e.target.value } : x))}
                  />
                  <input
                    className="input flex-[1.4]" value={s.value} placeholder="مقدار (مثلاً ۱۲ ولت DC)"
                    onChange={(e) => set("specs", f.specs.map((x, k) => k === i ? { ...x, value: e.target.value } : x))}
                  />
                  <button
                    type="button" onClick={() => set("specs", f.specs.filter((_, k) => k !== i))}
                    className="grid size-11 shrink-0 place-items-center rounded-xl text-ink-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="حذف"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-ink-100 pt-4">
              <span className="text-[12px] text-ink-400">افزودن سریع:</span>
              {SPEC_PRESETS.filter((p) => !f.specs.some((s) => s.key === p)).map((p) => (
                <button
                  key={p} type="button"
                  onClick={() => set("specs", [...f.specs, { key: p, value: "" }])}
                  className="rounded-lg bg-ink-50 px-2 py-1 text-[11px] text-ink-600 hover:bg-brand-50 hover:text-brand-600"
                >
                  + {p}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "variants" && (
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-ink-800">تنوع محصول (رنگ، مدل و…)</h2>
              <p className="mt-1 text-[12px] text-ink-500">
                اگر محصول در چند رنگ یا مدل عرضه می‌شود، اینجا اضافه کنید. در غیر این صورت خالی بگذارید.
              </p>
            </div>
            <button
              type="button"
              onClick={() => set("variants", [...f.variants, { name: "رنگ", value: "", colorHex: "#000000", priceDiff: 0, stock: 0 }])}
              className="btn-soft shrink-0 px-3 py-1.5 text-xs"
            >
              <Plus className="size-3.5" /> افزودن
            </button>
          </div>

          {f.variants.length === 0 ? (
            <p className="rounded-xl bg-ink-50 p-6 text-center text-[13px] text-ink-500">
              تنوعی تعریف نشده است — موجودی از فیلد «موجودی انبار» خوانده می‌شود.
            </p>
          ) : (
            <div className="space-y-3">
              {f.variants.map((v, i) => (
                <div key={i} className="grid gap-2 rounded-xl border border-ink-200 p-3 sm:grid-cols-[1fr_1fr_auto_1fr_1fr_auto]">
                  <input
                    className="input" value={v.name} placeholder="نوع (رنگ)"
                    onChange={(e) => set("variants", f.variants.map((x, k) => k === i ? { ...x, name: e.target.value } : x))}
                  />
                  <input
                    className="input" value={v.value} placeholder="مقدار (مشکی)"
                    onChange={(e) => set("variants", f.variants.map((x, k) => k === i ? { ...x, value: e.target.value } : x))}
                  />
                  <input
                    type="color" className="h-11 w-14 cursor-pointer rounded-xl border border-ink-200" value={v.colorHex}
                    onChange={(e) => set("variants", f.variants.map((x, k) => k === i ? { ...x, colorHex: e.target.value } : x))}
                    aria-label="رنگ"
                  />
                  <input
                    className="input" inputMode="numeric" value={v.priceDiff || ""} placeholder="اختلاف قیمت"
                    onChange={(e) => set("variants", f.variants.map((x, k) => k === i ? { ...x, priceDiff: Number(toEnDigits(e.target.value).replace(/[^\d-]/g, "")) || 0 } : x))}
                  />
                  <input
                    className="input" inputMode="numeric" value={v.stock} placeholder="موجودی"
                    onChange={(e) => set("variants", f.variants.map((x, k) => k === i ? { ...x, stock: Number(toEnDigits(e.target.value).replace(/\D/g, "")) || 0 } : x))}
                  />
                  <button
                    type="button" onClick={() => set("variants", f.variants.filter((_, k) => k !== i))}
                    className="grid size-11 place-items-center rounded-xl text-ink-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="حذف"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="sticky bottom-0 flex gap-2 rounded-2xl bg-white p-4 shadow-pop">
        <button disabled={busy} className="btn-primary flex-1 py-3">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {mode === "create" ? "ثبت محصول" : "ذخیره تغییرات"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost">انصراف</button>
      </div>
    </form>
  );
}
