"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  PlusCircle,
  Mic,
  Barcode,
  Save,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Package,
  AlertTriangle,
} from "lucide-react";
import { toPersianDigits } from "@/lib/persian/utils";
import { BarcodeScannerModal } from "@/components/barcode/BarcodeScannerModal";
import { VoiceAssistantModal } from "@/components/voice/VoiceAssistantModal";
import { SafeBoundary } from "@/components/common/SafeBoundary";

export default function NewProductPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"MANUAL" | "VOICE">("MANUAL");
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  // اطلاعات کالای مشابهِ کشف‌شده هنگام ثبت (برای پرسش «جدید است یا همان قبلی؟»)
  const [dupInfo, setDupInfo] = useState<any>(null);

  // Form fields
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [stock, setStock] = useState("10");
  const [minStock, setMinStock] = useState("5");
  const [buyPrice, setBuyPrice] = useState("0");
  const [sellPrice, setSellPrice] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
    fetch("/api/brands")
      .then((r) => r.json())
      .then((d) => setBrands(d.brands || []));
  }, []);

  const doSubmit = async (confirmNew: boolean) => {
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sku,
          barcode,
          categoryId,
          brandId,
          unit,
          stock,
          minStock,
          buyPrice,
          sellPrice,
          discount,
          description,
          confirmNew,
        }),
      });

      const data = await res.json();
      if (res.ok && data.duplicate) {
        // کالای مشابهی پیدا شد — از کاربر بپرس جدید است یا همان قبلی.
        setDupInfo(data.duplicate);
      } else if (res.ok) {
        alert("کالا با موفقیت ثبت شد.");
        router.push("/products");
      } else {
        alert(data.error || "خطا در ثبت کالا");
      }
    } catch (err) {
      alert("خطا در ثبت کالا");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("لطفاً نام کالا را وارد نمایید.");
      return;
    }
    setDupInfo(null);
    await doSubmit(false);
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/30">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">ثبت کالا و محصول جدید</h2>
              <p className="text-xs text-gray-500">ورود دستی اطلاعات یا ثبت هوشمند با گفتار فارسی</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-2xl flex gap-1 text-xs font-bold">
            <button
              onClick={() => setMode("MANUAL")}
              className={`px-4 py-2 rounded-xl transition ${
                mode === "MANUAL" ? "bg-emerald-600 text-white shadow" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              ثبت دستی
            </button>
            <button
              onClick={() => {
                setMode("VOICE");
                setIsVoiceOpen(true);
              }}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                mode === "VOICE" ? "bg-emerald-600 text-white shadow" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              <Mic className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>ثبت صوتی سریع</span>
            </button>
          </div>
        </div>

        {/* Voice Mode Callout */}
        {mode === "VOICE" && (
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-amber-300" /> دستیار ثبت صوتی فعال است
              </div>
              <p className="text-xs text-emerald-100">
                روی دکمه میکروفون بزنید و جمله‌ای مانند «دفتر پاپکو ۸۰ برگ، تعداد ۵۰ تا، قیمت خرید ۴۵ هزار، قیمت فروش ۶۰ هزار» بگویید.
              </p>
            </div>
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="bg-white text-emerald-800 px-5 py-3 rounded-2xl font-black text-xs shrink-0 shadow-lg hover:bg-emerald-50 transition"
            >
              🎙️ شروع گفتار
            </button>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              نام کامل کالا <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: دفتر پاپکو ۸۰ برگ سیمی"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                کد کالا / SKU
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="خودکار خودکار تولید می‌شود یا وارد کنید"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                بارکد
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="بارکد کالا"
                  className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 text-emerald-600 px-3 py-2.5 rounded-xl text-xs font-bold transition"
                  title="اسکن بارکد"
                >
                  <Barcode className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                دسته‌بندی
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">انتخاب دسته‌بندی</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                برند
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">انتخاب برند</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                واحد شمارش
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="عدد">عدد</option>
                <option value="بسته">بسته</option>
                <option value="کیلو">کیلوگرم</option>
                <option value="کارتن">کارتن</option>
                <option value="متر">متر</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                تعداد موجودی اولیه
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                حداقل موجودی برای هشدار
              </label>
              <input
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                قیمت خرید (تومان)
              </label>
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                قیمت فروش (تومان)
              </label>
              <input
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              توضیحات و مشخصات کالا
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات اختیاری کالا..."
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "در حال ثبت کالا..." : "ثبت نهایی کالا در سیستم"}</span>
            </button>
          </div>

        </form>

      </div>

      {/* پرسش کالای تکراری: جدید است یا همان قبلی؟ */}
      {dupInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" /> کالای مشابه پیدا شد
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              کالایی با نام <b className="text-gray-900 dark:text-white">«{dupInfo.name}»</b> از قبل در انبار ثبت شده است
              (موجودی فعلی: {toPersianDigits(dupInfo.stock)} {dupInfo.unit}).
              <br />
              آیا این <b>همان کالای قبلی</b> است یا یک <b>کالای جدید</b>؟
            </p>
            <div className="space-y-2">
              <button
                onClick={() => { const nm = dupInfo.name; setDupInfo(null); router.push(`/products?search=${encodeURIComponent(nm)}`); }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition"
              >
                همان کالای قبلی است (رفتن به کالا برای ویرایش/افزایش موجودی)
              </button>
              <button
                onClick={() => { setDupInfo(null); doSubmit(true); }}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl text-xs font-bold transition"
              >
                کالای جدید است — به‌هرحال ثبت شود
              </button>
              <button
                onClick={() => setDupInfo(null)}
                className="w-full border border-gray-300 dark:border-gray-700 py-2.5 rounded-xl text-xs font-bold"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDetected={(code) => setBarcode(code)}
      />

      {/* پس از ثبت هر کالا، مودال باز می‌ماند تا کالای بعدی را هم صوتی ثبت کنید
          (به صفحهٔ لیست منتقل نمی‌شویم). */}
      <SafeBoundary label="دستیار صوتی">
        <VoiceAssistantModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          onActionExecute={() => { /* در همین مودال بمانید و کالای بعدی را ثبت کنید */ }}
        />
      </SafeBoundary>
    </MainLayout>
  );
}
