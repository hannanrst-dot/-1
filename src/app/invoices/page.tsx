"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Receipt,
  FilePlus,
  Search,
  CheckCircle2,
  Printer,
  Calendar,
  User,
} from "lucide-react";
import { formatToman, toPersianDigits, toJalaliDateTime } from "@/lib/persian/utils";
import { PrintableInvoice } from "@/components/invoice/PrintableInvoice";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const res = await fetch(`/api/invoices?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setInvoices(data.invoices || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openInvoiceDetails = async (id: number) => {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedInvoice({ ...data.invoice, items: data.items });
      }
    } catch (e) {
      alert("خطا در دریافت فاکتور");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/30">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">لیست فاکتورهای فروش</h2>
              <p className="text-xs text-gray-500">مشاهده سوابق فاکتورهای صادر شده و چاپ مجدد</p>
            </div>
          </div>

          <Link
            href="/invoices/new"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition shrink-0"
          >
            <FilePlus className="w-4 h-4" /> فاکتور جدید (POS)
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <form onSubmit={(e) => { e.preventDefault(); fetchInvoices(); }} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو با شماره فاکتور یا نام مشتری..."
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl pr-10 pl-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition"
            >
              جستجو
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500">در حال بارگذاری فاکتورها...</div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">فاکتوری ثبت نشده است.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 font-bold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="p-3">شماره فاکتور</th>
                    <th className="p-3">نام مشتری</th>
                    <th className="p-3">تاریخ و زمان</th>
                    <th className="p-3">روش پرداخت</th>
                    <th className="p-3">مبلغ نهایی</th>
                    <th className="p-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{inv.invoiceNumber}</td>
                      <td className="p-3 font-medium">{inv.customerName}</td>
                      <td className="p-3 text-gray-500">{toJalaliDateTime(inv.createdAt)}</td>
                      <td className="p-3 font-semibold">{inv.paymentMethod === "cash" ? "نقدی" : inv.paymentMethod === "card" ? "کارت‌خوان" : inv.paymentMethod}</td>
                      <td className="p-3 font-black text-gray-900 dark:text-gray-100">{formatToman(inv.finalAmount)}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => openInvoiceDetails(inv.id)}
                          className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl font-bold transition flex items-center gap-1 mx-auto"
                        >
                          <Printer className="w-3.5 h-3.5" /> مشاهده / چاپ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

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
