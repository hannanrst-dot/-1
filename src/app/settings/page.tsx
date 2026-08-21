"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Settings, Download, Upload, Server, Save, Store, CheckCircle } from "lucide-react";
import { IranianDeployGuideModal } from "@/components/deploy/IranianDeployGuideModal";

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("نوشت‌افزار حنان");
  const [phone, setPhone] = useState("02188776655");
  const [address, setAddress] = useState("تهران، خیابان آزادی، پلاک ۱۲");
  const [receiptFooter, setReceiptFooter] = useState("از خرید و اعتماد شما سپاسگزاریم");
  const [stockAlert, setStockAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings && data.settings.store_info) {
          const info = data.settings.store_info;
          setStoreName(info.storeName || storeName);
          setPhone(info.phone || phone);
          setAddress(info.address || address);
          setReceiptFooter(info.receiptFooter || receiptFooter);
          setStockAlert(!!info.stockAlert);
        }
      });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "store_info",
          value: { storeName, phone, address, receiptFooter, stockAlert },
        }),
      });
      if (res.ok) {
        alert("تنظیمات فروشگاه با موفقیت ذخیره شد.");
      } else {
        alert("خطا در ذخیره تنظیمات");
      }
    } catch (e) {
      alert("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = () => {
    window.location.href = "/api/backup";
  };

  const handleRestore = async (file: File) => {
    if (!window.confirm("⚠️ بازیابی، همهٔ اطلاعاتِ فعلی را با محتوای این فایل جایگزین می‌کند. مطمئنید؟")) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await fetch("/api/restore", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(json) });
      const data = await res.json();
      if (res.ok) { alert("اطلاعات با موفقیت بازیابی شد ✅ (کالاها: " + (data.counts?.products ?? 0) + ")"); window.location.reload(); }
      else alert(data.error || "خطا در بازیابی");
    } catch { alert("فایل بک‌آپ نامعتبر است یا خوانده نشد."); }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/30">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">تنظیمات سیستم و پشتیبان‌گیری</h2>
            <p className="text-xs text-gray-500">اطلاعات سربرگ فاکتور، دانلود بک‌آپ و راهنمای استقرار هاست ایرانی</p>
          </div>
        </div>

        {/* Store Info Form */}
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-600" /> مشخصات عمومی فروشگاه
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">نام فروشگاه (در سربرگ فاکتور چاپی)</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border rounded-xl p-2.5 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">شماره تماس فروشگاه</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">آدرس فروشگاه</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border rounded-xl p-2.5"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">متن پاورقی فاکتور چاپی</label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border rounded-xl p-2.5"
              />
            </div>

            {/* هشدار موجودی */}
            <label className="flex items-start gap-2 cursor-pointer bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
              <input type="checkbox" checked={stockAlert} onChange={(e) => setStockAlert(e.target.checked)} className="mt-0.5 w-4 h-4 accent-amber-600" />
              <span>
                <span className="font-bold text-amber-800 dark:text-amber-300">هشدار کمبود موجودی هنگام فروش</span>
                <span className="block text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">اگر روشن باشد، وقتی موجودی کالایی کافی نباشد یا تمام شده باشد، هنگام ثبت فاکتور هشدار می‌دهد — ولی باز هم می‌توانید تأیید کنید و ادامه دهید (جلوی فروش گرفته نمی‌شود).</span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30"
          >
            <Save className="w-4 h-4" /> ذخیره تنظیمات فروشگاه
          </button>
        </form>

        {/* Backup & Deployment Card */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">پشتیبان‌گیری و استقرار سیستم</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Backup Download */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 space-y-2">
              <div className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Download className="w-4 h-4" /> دریافت فایل پشتیبان (JSON)
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-300">
                دانلود تمام کالاها، فاکتورها، مشتریان و اطلاعات دیتابیس در قالب JSON
              </p>
              <button
                onClick={handleDownloadBackup}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition mt-2"
              >
                دانلود بک‌آپ کامل
              </button>
            </div>

            {/* Restore from backup */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/40 space-y-2">
              <div className="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Upload className="w-4 h-4" /> بازیابی از فایل پشتیبان
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-300">
                فایل بک‌آپ (JSON) را بارگذاری کنید تا اطلاعات برگردد. مثلاً بعد از وصل‌کردنِ دیسکِ دائمی.
              </p>
              <label className="w-full block text-center cursor-pointer bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-xl text-xs font-bold transition mt-2">
                انتخاب فایل بک‌آپ و بازیابی
                <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRestore(f); e.target.value = ""; }} />
              </label>
            </div>

            {/* Iranian Deploy Guide */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/40 space-y-2">
              <div className="font-bold text-xs text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                <Server className="w-4 h-4" /> راهنمای استقرار روی هاست ایرانی
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-300">
                دستورالعمل گام‌به‌گام اجرای اپلیکیشن روی VPS، Liara، cPanel و Docker
              </p>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold transition mt-2"
              >
                مشاهده راهنمای هاست ایرانی
              </button>
            </div>

          </div>
        </div>

      </div>

      <IranianDeployGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </MainLayout>
  );
}
