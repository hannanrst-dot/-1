"use client";

import React from "react";
import { X, Server, Globe, Database, ShieldCheck, Terminal, HelpCircle } from "lucide-react";

interface IranianDeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IranianDeployGuideModal({ isOpen, onClose }: IranianDeployGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 my-8">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-blue-200" />
            <div>
              <h3 className="font-bold text-lg">راهنمای جامع استقرار روی هاست و سرورهای ایرانی</h3>
              <p className="text-xs text-blue-100">اجرا روی VPS، Liara، cPanel، DirectAdmin و Docker ایرانی</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs leading-relaxed max-h-[75vh] overflow-y-auto">

          {/* Intro */}
          <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50">
            <h4 className="font-bold text-sm text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1.5">
              <Globe className="w-4 h-4" /> ویژگی‌های کلیدی جهت اجرا روی زیرساخت داخل ایران:
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              این نرم‌افزار کاملاً خوداتکا (Self-Contained) طراحی شده و وابستگی مستقیم به تحریم‌ها یا سرویس‌های خارجی مسدود شده ندارد.
              موتور پردازش صوتی و تشخیص گفتار آن از استانداردهای استاندارد مرورگر Web Speech API و پردازش داخلی استاندارد استفاده می‌کند.
            </p>
          </div>

          {/* Option 1: VPS */}
          <div className="space-y-2 border-b dark:border-gray-800 pb-4">
            <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Terminal className="w-4 h-4" /> روش اول: استقرار روی سرور مجازی ایران (Ubuntu VPS)
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>نصب Node.js نسخه ۲۰ روی سرور</li>
              <li>کلون یا آپلود پروژه (دیتابیس SQLite داخلی است؛ به سرویس دیتابیس جداگانه نیاز نیست)</li>
              <li>نصب وابستگی‌ها: <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono">npm install</code></li>
              <li>ساخت نسخه نهایی: <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono">npm run build</code></li>
              <li>مدیریت پروسه با PM2: <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono">pm2 start npm --name "sabtyar" -- start</code></li>
              <li>دیتابیس به‌صورت خودکار در پوشه <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono">data/store.db</code> ساخته و مقداردهی می‌شود.</li>
            </ol>
          </div>

          {/* Option 2: Liara or Iranian Cloud */}
          <div className="space-y-2 border-b dark:border-gray-800 pb-4">
            <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Database className="w-4 h-4" /> روش دوم: استقرار روی ابر لیارا (Liara) یا ابر آروان
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              ۱. یک برنامه‌ی <b>Next.js</b> جدید در کنسول لیارا بسازید (نیازی به دیتابیس جداگانه نیست).<br />
              ۲. در پوشه پروژه دستور <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono">liara deploy --port 3000</code> را اجرا کنید.<br />
              ۳. برنامه بالا می‌آید و کاربر <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono">admin</code> با رمز <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono">admin123</code> آماده است.<br />
              ۴. برای ماندگاری دائمی داده‌ها یک «دیسک» با مسیر <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono">/app/data</code> بسازید و متغیر <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono">DATABASE_FILE=/app/data/store.db</code> را تنظیم کنید.
            </p>
          </div>

          {/* Security */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/40">
            <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> نکته امنیتی مهم:
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              برای کارکرد صحیح دسترسی به میکروفون در مرورگرهای موبایل و کامپیوتر، دامنه حتماً باید دارای گواهی امنیتی HTTPS (مانند Let&apos;s Encrypt رایگان) باشد.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
