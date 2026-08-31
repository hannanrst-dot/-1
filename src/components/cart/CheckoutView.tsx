"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, Plus, Truck, CreditCard, Banknote, Wrench, Loader2, Check } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { formatPrice, toFaDigits, toEnDigits, PROVINCES, SHIPPING_METHODS } from "@/lib/utils";
import { SITE } from "@/lib/site";

type Address = {
  id: string; title: string; receiverName: string; phone: string;
  province: string; city: string; postalCode: string; line: string; isDefault: boolean;
};

export function CheckoutView({
  addresses: initial,
  initialCoupon,
}: {
  addresses: Address[];
  initialCoupon: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { items, subtotal, clear, ready } = useCart();

  const [addresses, setAddresses] = useState(initial);
  const [addressId, setAddressId] = useState(initial[0]?.id ?? "");
  const [showForm, setShowForm] = useState(initial.length === 0);
  const [shippingId, setShippingId] = useState(SHIPPING_METHODS[0].id);
  const [payment, setPayment] = useState<"ONLINE" | "COD">("ONLINE");
  const [installation, setInstallation] = useState(false);
  const [note, setNote] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && items.length === 0) router.replace("/cart");
  }, [ready, items.length, router]);

  useEffect(() => {
    if (!initialCoupon || subtotal === 0) return;
    (async () => {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: initialCoupon, subtotal }),
      });
      if (res.ok) {
        const d = await res.json();
        setCoupon({ code: d.code, discount: d.discount });
      }
    })();
  }, [initialCoupon, subtotal]);

  const shipping = SHIPPING_METHODS.find((s) => s.id === shippingId) ?? SHIPPING_METHODS[0];
  const shippingCost = subtotal >= SITE.freeShippingThreshold ? 0 : shipping.cost;
  const installCost = installation ? SITE.installationFee : 0;
  const payable = subtotal - (coupon?.discount ?? 0) + shippingCost + installCost;

  const submit = async () => {
    if (!addressId) return toast("ابتدا آدرس تحویل را انتخاب کنید", "error");
    setBusy(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty })),
        addressId, shippingId, paymentMethod: payment,
        couponCode: coupon?.code, withInstallation: installation, note,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(data.error ?? "خطا در ثبت سفارش", "error");
    clear();
    router.push(`/checkout/success?code=${data.code}`);
  };

  if (!ready) return <div className="container-app py-10"><div className="skeleton h-72" /></div>;

  return (
    <div className="container-app py-5">
      <h1 className="mb-4 text-xl font-bold text-ink-900">تکمیل سفارش</h1>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-4 shadow-card">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-ink-800">
              <MapPin className="size-4.5 text-brand-600" /> آدرس تحویل
            </h2>

            <div className="space-y-2">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors ${
                    addressId === a.id ? "border-brand-500 bg-brand-50/50" : "border-ink-200 hover:border-ink-300"
                  }`}
                >
                  <input type="radio" name="addr" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1 accent-brand-600" />
                  <div className="min-w-0 flex-1 text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink-800">{a.title}</span>
                      <span className="text-ink-400">— {a.receiverName}</span>
                    </div>
                    <p className="mt-1 leading-6 text-ink-600">
                      {a.province}، {a.city}، {a.line}
                    </p>
                    <p className="mt-0.5 text-[12px] text-ink-400">
                      کد پستی {toFaDigits(a.postalCode)} — {toFaDigits(a.phone)}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {showForm ? (
              <AddressForm
                onCancel={() => setShowForm(false)}
                onCreated={(a) => {
                  setAddresses((p) => [a, ...p]);
                  setAddressId(a.id);
                  setShowForm(false);
                  toast("آدرس جدید ثبت شد");
                }}
              />
            ) : (
              <button onClick={() => setShowForm(true)} className="btn-outline mt-3 w-full">
                <Plus className="size-4" /> افزودن آدرس جدید
              </button>
            )}
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-card">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-ink-800">
              <Truck className="size-4.5 text-brand-600" /> روش ارسال
            </h2>
            <div className="grid gap-2 sm:grid-cols-3">
              {SHIPPING_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`cursor-pointer rounded-xl border p-3 text-center transition-colors ${
                    shippingId === m.id ? "border-brand-500 bg-brand-50/50" : "border-ink-200 hover:border-ink-300"
                  }`}
                >
                  <input type="radio" name="ship" className="hidden" checked={shippingId === m.id} onChange={() => setShippingId(m.id)} />
                  <p className="text-[13px] font-bold text-ink-800">{m.label}</p>
                  <p className="mt-1 text-[11px] text-ink-500">{m.days}</p>
                  <p className="mt-1.5 text-[12px] font-medium text-brand-600">
                    {subtotal >= SITE.freeShippingThreshold ? "رایگان" : `${formatPrice(m.cost)} تومان`}
                  </p>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-card">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-ink-800">
              <Wrench className="size-4.5 text-brand-600" /> خدمات نصب
            </h2>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-ink-200 p-3">
              <div>
                <p className="text-[13px] font-medium text-ink-800">نصب و راه‌اندازی توسط تکنسین</p>
                <p className="mt-1 text-[12px] text-ink-500">
                  اعزام کارشناس در تهران و کرج — {formatPrice(SITE.installationFee)} تومان
                </p>
              </div>
              <input type="checkbox" checked={installation} onChange={(e) => setInstallation(e.target.checked)} className="size-5 accent-brand-600" />
            </label>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-card">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-ink-800">
              <CreditCard className="size-4.5 text-brand-600" /> روش پرداخت
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${payment === "ONLINE" ? "border-brand-500 bg-brand-50/50" : "border-ink-200"}`}>
                <input type="radio" className="accent-brand-600" checked={payment === "ONLINE"} onChange={() => setPayment("ONLINE")} />
                <CreditCard className="size-5 text-ink-500" />
                <div>
                  <p className="text-[13px] font-medium text-ink-800">پرداخت اینترنتی</p>
                  <p className="text-[11px] text-ink-500">درگاه امن بانکی</p>
                </div>
              </label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${payment === "COD" ? "border-brand-500 bg-brand-50/50" : "border-ink-200"}`}>
                <input type="radio" className="accent-brand-600" checked={payment === "COD"} onChange={() => setPayment("COD")} />
                <Banknote className="size-5 text-ink-500" />
                <div>
                  <p className="text-[13px] font-medium text-ink-800">پرداخت در محل</p>
                  <p className="text-[11px] text-ink-500">فقط تهران و کرج</p>
                </div>
              </label>
            </div>

            <textarea
              className="input mt-3 min-h-20 resize-y" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="توضیحات سفارش (اختیاری) — مثلاً ساعت مناسب تحویل"
              maxLength={400}
            />
          </section>
        </div>

        <div className="space-y-3 lg:sticky lg:top-[136px] lg:self-start">
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <h2 className="mb-3 text-sm font-bold text-ink-800">
              کالاهای سفارش ({toFaDigits(items.length)})
            </h2>
            <div className="max-h-56 space-y-2 overflow-y-auto">
              {items.map((it) => (
                <div key={`${it.productId}-${it.variantId ?? ""}`} className="flex items-center gap-2">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                    {it.image && <Image src={it.image} alt={it.title} fill className="object-cover" sizes="48px" />}
                  </div>
                  <p className="line-clamp-2-fa flex-1 text-[11px] leading-5 text-ink-600">{it.title}</p>
                  <span className="text-[11px] text-ink-400">×{toFaDigits(it.qty)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 rounded-2xl bg-white p-4 shadow-card">
            <Row label="جمع کالاها" value={formatPrice(subtotal)} />
            {coupon && <Row label={`کد تخفیف ${coupon.code}`} value={`${formatPrice(coupon.discount)}−`} green />}
            <Row label="هزینه ارسال" value={shippingCost === 0 ? "رایگان" : formatPrice(shippingCost)} />
            {installation && <Row label="خدمات نصب" value={formatPrice(installCost)} />}
            <div className="flex items-center justify-between border-t border-ink-100 pt-3">
              <span className="text-[13px] font-medium text-ink-700">مبلغ قابل پرداخت</span>
              <span className="text-lg font-bold text-ink-900">
                {formatPrice(payable)} <span className="text-[11px] font-normal text-ink-500">تومان</span>
              </span>
            </div>
            <button onClick={submit} disabled={busy || !addressId} className="btn-primary w-full py-3.5">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {payment === "ONLINE" ? "پرداخت و ثبت سفارش" : "ثبت سفارش"}
            </button>
            <p className="text-center text-[11px] leading-5 text-ink-400">
              با ثبت سفارش، قوانین و شرایط {SITE.name} را می‌پذیرید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex justify-between text-[13px]">
      <span className="text-ink-600">{label}</span>
      <span className={green ? "text-emerald-600" : "text-ink-800"}>{value}</span>
    </div>
  );
}

function AddressForm({
  onCreated, onCancel,
}: {
  onCreated: (a: Address) => void; onCancel: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    title: "خانه", receiverName: "", phone: "", province: "تهران",
    city: "", postalCode: "", line: "",
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, phone: toEnDigits(f.phone), postalCode: toEnDigits(f.postalCode) }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(data.error ?? "خطا در ثبت آدرس", "error");
    onCreated(data);
  };

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 rounded-xl border border-ink-200 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">عنوان آدرس</label>
          <input className="input" value={f.title} onChange={set("title")} placeholder="خانه / محل کار" />
        </div>
        <div>
          <label className="label">نام تحویل‌گیرنده</label>
          <input className="input" value={f.receiverName} onChange={set("receiverName")} required />
        </div>
        <div>
          <label className="label">شماره موبایل</label>
          <input className="input" dir="ltr" value={f.phone} onChange={set("phone")} required placeholder="09121234567" />
        </div>
        <div>
          <label className="label">کد پستی</label>
          <input className="input" dir="ltr" value={f.postalCode} onChange={set("postalCode")} required placeholder="1234567890" />
        </div>
        <div>
          <label className="label">استان</label>
          <select className="input" value={f.province} onChange={set("province")}>
            {PROVINCES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">شهر</label>
          <input className="input" value={f.city} onChange={set("city")} required />
        </div>
      </div>
      <div>
        <label className="label">نشانی کامل</label>
        <textarea className="input min-h-20 resize-y" value={f.line} onChange={set("line")} required minLength={10} placeholder="خیابان، کوچه، پلاک، واحد" />
      </div>
      <div className="flex gap-2">
        <button disabled={busy} className="btn-primary flex-1">{busy ? "در حال ثبت…" : "ثبت آدرس"}</button>
        <button type="button" onClick={onCancel} className="btn-ghost">انصراف</button>
      </div>
    </form>
  );
}
