"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  TrendingUp,
  Receipt,
  Package,
  AlertTriangle,
  Wallet,
  DollarSign,
  FilePlus,
  PlusCircle,
  Search,
  ShoppingCart,
  UserPlus,
  Mic,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatToman, toPersianDigits, toJalaliDateTime } from "@/lib/persian/utils";
import { VoiceAssistantModal } from "@/components/voice/VoiceAssistantModal";
import { PrintableInvoice } from "@/components/invoice/PrintableInvoice";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports/summary");
      const data = await res.json();
      if (res.ok) {
        setSummaryData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const summary = summaryData?.summary || {};

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Top Banner / Hero with Prominent Voice Microphone */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> نسخه کامل هوشمند صوتی
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                نوشت‌افزار حنان
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                صدور سریع فاکتور، ثبت کالا و بررسی آمار فروش با گفتار مستقیم به زبان فارسی.
              </p>
            </div>

            {/* Big Mic Button */}
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="group bg-white hover:bg-emerald-50 text-emerald-800 px-6 py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-2xl transition transform hover:scale-105 active:scale-95 shrink-0 border border-emerald-200"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:animate-bounce shadow-md">
                <Mic className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 font-semibold">دستیار گفتاری</div>
                <div className="font-extrabold text-emerald-800">🎙️ با صدا انجام بده</div>
              </div>
            </button>
          </div>
        </div>

        {/* Key KPI Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {/* Today Sales */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">فروش امروز</span>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              {formatToman(summary.todaySales)}
            </div>
          </div>

          {/* Today Invoice Count */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">فاکتورهای امروز</span>
              <div className="p-2 bg-blue-100 dark:bg-blue-950/50 text-blue-600 rounded-xl">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              {toPersianDigits(summary.todayInvoiceCount || 0)} <span className="text-xs font-normal">عدد</span>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">تعداد کالاها</span>
              <div className="p-2 bg-purple-100 dark:bg-purple-950/50 text-purple-600 rounded-xl">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              {toPersianDigits(summary.totalProductsCount || 0)} <span className="text-xs font-normal">قلم</span>
            </div>
          </div>

          {/* Low Stock Count */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">کالاهای کم‌موجود</span>
              <div className="p-2 bg-rose-100 dark:bg-rose-950/50 text-rose-600 rounded-xl">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400">
              {toPersianDigits(summary.lowStockCount || 0)} <span className="text-xs font-normal">کالا</span>
            </div>
          </div>

          {/* Total Inventory Value */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">ارزش انبار</span>
              <div className="p-2 bg-amber-100 dark:bg-amber-950/50 text-amber-600 rounded-xl">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
              {formatToman(summary.totalInventoryValue)}
            </div>
          </div>

          {/* Profit */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">سود تخمینی امروز</span>
              <div className="p-2 bg-teal-100 dark:bg-teal-950/50 text-teal-600 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
              {formatToman(summary.todayEstimatedProfit)}
            </div>
          </div>

          {/* Receivables (طلب از مشتریان) */}
          <Link href="/customers" className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2 hover:border-rose-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">طلب از مشتریان (نسیه)</span>
              <div className="p-2 bg-rose-100 dark:bg-rose-950/50 text-rose-600 rounded-xl">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400">
              {formatToman(summary.totalReceivables || 0)}
            </div>
            <div className="text-[10px] text-gray-400">{toPersianDigits(summary.debtorCount || 0)} بدهکار</div>
          </Link>

        </div>

        {/* بدهکاران در یک نگاه */}
        {summaryData?.topDebtors && summaryData.topDebtors.length > 0 && (
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-rose-600" />
              <span className="font-bold text-sm text-gray-900 dark:text-white">بدهکاران (طلب از مشتریان)</span>
            </div>
            <div className="space-y-1.5">
              {summaryData.topDebtors.map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs bg-rose-50 dark:bg-rose-950/20 rounded-xl px-3 py-2">
                  <span className="font-medium">{d.name}</span>
                  <span className="font-black text-rose-700 dark:text-rose-400">{formatToman(d.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions Shortcuts */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-gray-500 dark:text-gray-400">میانبرهای سریع عملیاتی</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Link
              href="/invoices/new"
              className="flex items-center gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-2xl font-bold text-xs transition border border-emerald-200 dark:border-emerald-800/50"
            >
              <FilePlus className="w-5 h-5 text-emerald-600" />
              <span>فاکتور جدید (POS)</span>
            </Link>

            <Link
              href="/products/new"
              className="flex items-center gap-3 p-3.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-200 rounded-2xl font-bold text-xs transition border border-blue-200 dark:border-blue-800/50"
            >
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <span>ثبت کالا</span>
            </Link>

            <Link
              href="/products"
              className="flex items-center gap-3 p-3.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-200 rounded-2xl font-bold text-xs transition border border-purple-200 dark:border-purple-800/50"
            >
              <Search className="w-5 h-5 text-purple-600" />
              <span>جستجوی کالا</span>
            </Link>

            <Link
              href="/purchases"
              className="flex items-center gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded-2xl font-bold text-xs transition border border-amber-200 dark:border-amber-800/50"
            >
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              <span>ثبت خرید</span>
            </Link>

            <Link
              href="/customers"
              className="flex items-center gap-3 p-3.5 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 rounded-2xl font-bold text-xs transition border border-teal-200 dark:border-teal-800/50"
            >
              <UserPlus className="w-5 h-5 text-teal-600" />
              <span>ثبت مشتری</span>
            </Link>
          </div>
        </div>

        {/* Charts & Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Weekly Sales Chart (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">روند فروش هفته گذشته</h3>
              <span className="text-xs text-gray-500">بر حسب تومان</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summaryData?.weeklyData || []}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any) => [formatToman(Number(value)), "فروش"]}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Selling Items (1 col) */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">پرفروش‌ترین کالاها</h3>
            <div className="space-y-3">
              {(summaryData?.topSellingProducts || []).length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-8">هنوز فروش ثبت نشده است.</div>
              ) : (
                summaryData?.topSellingProducts.map((p: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px]">
                        {toPersianDigits(idx + 1)}
                      </span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{p.productName}</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {toPersianDigits(p.totalQty)} عدد
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Recent Invoices Table */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">آخرین فاکتورهای فروش</h3>
            <Link href="/invoices" className="text-xs font-bold text-emerald-600 hover:underline">
              مشاهده همه فاکتورها ←
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="p-3">شماره فاکتور</th>
                  <th className="p-3">مشتری</th>
                  <th className="p-3">تاریخ</th>
                  <th className="p-3">مبلغ نهایی</th>
                  <th className="p-3">وضعیت</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(summaryData?.recentInvoices || []).map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{inv.invoiceNumber}</td>
                    <td className="p-3 font-medium">{inv.customerName}</td>
                    <td className="p-3 text-gray-500">{toJalaliDateTime(inv.createdAt)}</td>
                    <td className="p-3 font-bold">{formatToman(inv.finalAmount)}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" /> ثبت شده
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/invoices/${inv.id}`);
                          const data = await res.json();
                          if (res.ok) {
                            setSelectedInvoice({ ...data.invoice, items: data.items });
                          }
                        }}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-gray-700 dark:text-gray-300 rounded-xl transition text-[11px] font-bold"
                      >
                        نمایش فاکتور
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onActionExecute={() => fetchSummary()}
      />

      {selectedInvoice && (
        <PrintableInvoice
          invoice={selectedInvoice}
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </MainLayout>
  );
}
