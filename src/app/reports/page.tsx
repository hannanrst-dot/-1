"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { BarChart3, TrendingUp, DollarSign, Wallet, FileSpreadsheet } from "lucide-react";
import { formatToman, toPersianDigits } from "@/lib/persian/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/summary")
      .then((r) => r.json())
      .then((d) => setSummaryData(d))
      .finally(() => setLoading(false));
  }, []);

  const summary = summaryData?.summary || {};

  const exportExcel = () => {
    if (!summaryData) return;
    const worksheet = XLSX.utils.json_to_sheet([
      { "شاخص": "فروش امروز", "مقدار (تومان)": summary.todaySales },
      { "شاخص": "سود تخمینی امروز", "مقدار (تومان)": summary.todayEstimatedProfit },
      { "شاخص": "ارزش کل انبار", "مقدار (تومان)": summary.totalInventoryValue },
      { "شاخص": "تعداد فاکتورهای امروز", "مقدار": summary.todayInvoiceCount },
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "گزارش فروش");
    XLSX.writeFile(workbook, `report-${Date.now()}.xlsx`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">گزارش‌های جامع و تحلیل سود</h2>
              <p className="text-xs text-gray-500">تحلیل نموداری فروش، سود و خروجی اکسل</p>
            </div>
          </div>

          <button
            onClick={exportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" /> دریافت گزارش Excel
          </button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-gray-500">فروش امروز</span>
            <div className="text-xl font-black text-gray-900 dark:text-white">{formatToman(summary.todaySales)}</div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-gray-500">سود تخمینی امروز</span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatToman(summary.todayEstimatedProfit)}</div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-gray-500">ارزش کل موجودی کالاها</span>
            <div className="text-xl font-black text-purple-600 dark:text-purple-400">{formatToman(summary.totalInventoryValue)}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">روند فروش ۷ روز گذشته</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summaryData?.weeklyData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(val: any) => [formatToman(Number(val)), "فروش"]} />
                <Area type="monotone" dataKey="sales" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
