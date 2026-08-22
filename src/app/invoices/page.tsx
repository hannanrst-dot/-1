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
  PlusCircle,
  Trash2,
  X,
} from "lucide-react";
import { formatToman, toPersianDigits, toEnglishDigits, toJalaliDateTime } from "@/lib/persian/utils";
import { PrintableInvoice } from "@/components/invoice/PrintableInvoice";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  // ویرایشِ فاکتور: افزودنِ کالا
  const [products, setProducts] = useState<any[]>([]);
  const [editInv, setEditInv] = useState<any>(null); // {id, invoiceNumber}
  const [editItems, setEditItems] = useState<any[]>([]); // اقلامِ فعلیِ فاکتور
  const [addRows, setAddRows] = useState<any[]>([]);
  const [prodSearch, setProdSearch] = useState("");
  const [savingAdd, setSavingAdd] = useState(false);

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
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products || [])).catch(() => {});
  }, []);

  const openEdit = async (inv: any) => {
    setEditInv(inv); setAddRows([]); setProdSearch(""); setEditItems([]);
    try { const res = await fetch(`/api/invoices/${inv.id}`); const d = await res.json(); if (res.ok) setEditItems(d.items || []); } catch { /* ignore */ }
  };
  const patchItem = async (itemId: number, quantity: number) => {
    if (!editInv) return;
    try {
      const res = await fetch(`/api/invoices/${editInv.id}/items`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId, quantity }) });
      const d = await res.json(); if (res.ok) { setEditItems(d.items || []); fetchInvoices(); }
    } catch { /* ignore */ }
  };
  const deleteItem = async (itemId: number) => {
    if (!editInv) return;
    try {
      const res = await fetch(`/api/invoices/${editInv.id}/items?itemId=${itemId}`, { method: "DELETE" });
      const d = await res.json(); if (res.ok) { setEditItems(d.items || []); fetchInvoices(); }
    } catch { /* ignore */ }
  };
  const addProdRow = (p: any) => {
    setAddRows((prev) => {
      const idx = prev.findIndex((x) => x.productId === p.id);
      if (idx > -1) return prev.map((x, i) => i === idx ? { ...x, quantity: x.quantity + 1 } : x);
      return [...prev, { productId: p.id, productName: p.name, unitPrice: p.sellPrice, quantity: 1, stock: p.stock }];
    });
  };
  const saveAddItems = async () => {
    if (!editInv || !addRows.length) return;
    setSavingAdd(true);
    try {
      const res = await fetch(`/api/invoices/${editInv.id}/items`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: addRows.map((r) => ({ productId: r.productId, productName: r.productName, quantity: r.quantity, unitPrice: r.unitPrice, totalPrice: r.unitPrice * r.quantity })) }),
      });
      const data = await res.json();
      if (res.ok) { alert("کالاها به فاکتور اضافه شد."); setEditInv(null); setAddRows([]); fetchInvoices(); }
      else alert(data.error || "خطا در افزودن کالا");
    } catch { alert("خطا در ارتباط با سرور"); } finally { setSavingAdd(false); }
  };
  const filteredProds = products.filter((p) => !prodSearch || p.name.includes(prodSearch) || (p.barcode && p.barcode.includes(prodSearch)));

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
                    <th className="p-3">سود</th>
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
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{inv.profit != null ? formatToman(inv.profit) : "—"}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openInvoiceDetails(inv.id)}
                            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl font-bold transition flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" /> مشاهده / چاپ
                          </button>
                          <button
                            onClick={() => openEdit(inv)}
                            className="px-3 py-1.5 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 hover:bg-sky-100 rounded-xl font-bold transition flex items-center gap-1"
                            title="ویرایش فاکتور"
                          >
                            <PlusCircle className="w-3.5 h-3.5" /> ویرایش
                          </button>
                        </div>
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

      {/* مودالِ افزودن کالا به فاکتور (ویرایش) */}
      {editInv && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4">
          <div className="bg-white dark:bg-gray-900 w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-sky-600 text-white flex items-center justify-between shrink-0">
              <div className="font-bold text-sm">ویرایش فاکتور {toPersianDigits(editInv.invoiceNumber)}</div>
              <button onClick={() => setEditInv(null)} className="p-1 rounded-lg hover:bg-sky-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto">
              {/* اقلامِ فعلیِ فاکتور — قابلِ حذف و تغییرِ تعداد */}
              {editItems.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-200">اقلامِ فعلی:</div>
                  {editItems.map((it) => (
                    <div key={it.id} className="rounded-xl p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium flex-1 truncate">{it.productName}</span>
                        <button onClick={() => deleteItem(it.id)} className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center shrink-0"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <div className="flex items-center gap-1"><span className="text-gray-500">تعداد:</span>
                          <button onClick={() => patchItem(it.id, it.quantity - 1)} disabled={it.quantity <= 1} className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold disabled:opacity-40">−</button>
                          <span className="w-8 text-center font-bold">{toPersianDigits(it.quantity)}</span>
                          <button onClick={() => patchItem(it.id, it.quantity + 1)} className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold">+</button>
                        </div>
                        <span className="font-bold">{formatToman(it.totalPrice)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-dashed border-gray-300 dark:border-gray-700 pt-2 text-xs font-bold text-gray-600 dark:text-gray-300">افزودنِ کالای جدید:</div>
                </div>
              )}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                <input value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} placeholder="جستجوی کالا برای افزودن..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl pr-10 pl-3 py-2.5 text-xs" />
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredProds.slice(0, 30).map((p) => (
                  <button key={p.id} onClick={() => addProdRow(p)} className="w-full flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/60 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-xl text-right text-xs">
                    <span className="font-bold">{p.name}</span>
                    <span className="text-emerald-600 font-bold">{formatToman(p.sellPrice)}</span>
                  </button>
                ))}
              </div>

              {addRows.length > 0 && (
                <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="text-xs font-bold">کالاهای در حالِ افزودن:</div>
                  {addRows.map((r, i) => (
                    <div key={i} className="rounded-xl p-2.5 border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/30">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium flex-1 truncate">{r.productName}</span>
                        <button onClick={() => setAddRows((prev) => prev.filter((_, idx) => idx !== i))} className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center shrink-0"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <div className="flex items-center gap-1"><span className="text-gray-500">تعداد:</span>
                          <button onClick={() => setAddRows((prev) => prev.map((x, idx) => idx === i ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))} className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold">−</button>
                          <input type="text" inputMode="numeric" value={toPersianDigits(r.quantity)} onChange={(e) => { const v = Number(toEnglishDigits(e.target.value)) || 0; setAddRows((prev) => prev.map((x, idx) => idx === i ? { ...x, quantity: v } : x)); }} className="w-12 text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1" />
                          <button onClick={() => setAddRows((prev) => prev.map((x, idx) => idx === i ? { ...x, quantity: x.quantity + 1 } : x))} className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold">+</button>
                        </div>
                        <span className="font-bold">{formatToman(r.unitPrice * r.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 shrink-0">
              <button onClick={saveAddItems} disabled={savingAdd || !addRows.length} className="w-full bg-sky-600 disabled:opacity-50 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> افزودن به فاکتور</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
