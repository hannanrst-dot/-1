"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ShoppingCart, Plus, Mic, CheckCircle, Trash2, Building } from "lucide-react";
import { formatToman, toPersianDigits, toJalaliDateTime } from "@/lib/persian/utils";
import { VoiceAssistantModal } from "@/components/voice/VoiceAssistantModal";
import { SafeBoundary } from "@/components/common/SafeBoundary";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Purchase Form state
  const [supplierId, setSupplierId] = useState("");
  const [supplierName, setSupplierName] = useState("تامین‌کننده عمومی");
  const [items, setItems] = useState<any[]>([]);
  const [selectedProdId, setSelectedProdId] = useState("");
  const [qty, setQty] = useState("10");
  const [buyPrice, setBuyPrice] = useState("0");
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/purchases");
      const data = await res.json();
      if (res.ok) setPurchases(data.purchases || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products || []));
    fetch("/api/suppliers").then((r) => r.json()).then((d) => setSuppliers(d.suppliers || []));
  }, []);

  const handleAddItem = () => {
    if (!selectedProdId) return alert("کالا را انتخاب نمایید.");
    const prod = products.find((p) => String(p.id) === selectedProdId);
    if (!prod) return;

    const quantity = Number(qty);
    const price = Number(buyPrice) || prod.buyPrice;

    setItems([
      ...items,
      {
        productId: prod.id,
        productName: prod.name,
        quantity,
        unitPrice: price,
        totalPrice: quantity * price,
      },
    ]);

    setSelectedProdId(""); setQty("10"); setBuyPrice("0");
  };

  const handleCreatePurchase = async () => {
    if (items.length === 0) return alert("حداقل یک کالا اضافه فرمایید.");
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: supplierId || null,
          supplierName,
          items,
        }),
      });
      if (res.ok) {
        alert("فاکتور خرید با موفقیت ثبت شد و موجودی انبار افزایش یافت.");
        setItems([]);
        fetchPurchases();
      } else {
        alert("خطا در ثبت فاکتور خرید");
      }
    } catch (e) {
      alert("خطا در ارتباط با سرور");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Title & Voice Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/30">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">ثبت فاکتورهای خرید (انبار)</h2>
              <p className="text-xs text-gray-500">ثبت خرید دستی و صوتی از شرکت‌ها و افزایش خودکار موجودی</p>
            </div>
          </div>

          <button
            onClick={() => setIsVoiceOpen(true)}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition shrink-0"
          >
            <Mic className="w-4 h-4 animate-pulse text-emerald-200" />
            <span>🎙️ ثبت خرید با صدا</span>
          </button>
        </div>

        {/* Add Purchase Form Panel */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-gray-700 dark:text-gray-300">فرم ثبت خرید جدید</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-gray-500 mb-1">تأمین‌کننده</label>
              <select
                value={supplierId}
                onChange={(e) => {
                  setSupplierId(e.target.value);
                  const sup = suppliers.find(s => String(s.id) === e.target.value);
                  setSupplierName(sup ? sup.name : "تامین‌کننده عمومی");
                }}
                className="w-full bg-gray-50 dark:bg-gray-800 border rounded-xl p-2.5 text-xs font-bold"
              >
                <option value="">تأمین‌کننده عمومی</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.company || ""})</option>)}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-gray-500 mb-1">کالا</label>
              <select
                value={selectedProdId}
                onChange={(e) => {
                  setSelectedProdId(e.target.value);
                  const prod = products.find(p => String(p.id) === e.target.value);
                  if (prod) setBuyPrice(String(prod.buyPrice));
                }}
                className="w-full bg-gray-50 dark:bg-gray-800 border rounded-xl p-2.5 text-xs font-bold"
              >
                <option value="">انتخاب کالا...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-gray-500 mb-1">تعداد خرید</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border rounded-xl p-2.5 text-xs font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-gray-500 mb-1">قیمت خرید هر قلم</label>
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border rounded-xl p-2.5 text-xs font-bold"
              />
            </div>

            <div className="sm:col-span-1 flex items-end">
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
              >
                <Plus className="w-4 h-4" /> افزون
              </button>
            </div>

          </div>

          {/* Items Draft List */}
          {items.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="border rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-right">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="p-2">کالا</th>
                      <th className="p-2">تعداد</th>
                      <th className="p-2">قیمت واحد</th>
                      <th className="p-2">جمع</th>
                      <th className="p-2 text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold">{it.productName}</td>
                        <td className="p-2">{toPersianDigits(it.quantity)}</td>
                        <td className="p-2">{formatToman(it.unitPrice)}</td>
                        <td className="p-2 font-bold">{formatToman(it.totalPrice)}</td>
                        <td className="p-2 text-center">
                          <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-rose-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleCreatePurchase}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> ثبت نهایی فاکتور خرید و افزایش موجودی انبار
              </button>
            </div>
          )}

        </div>

        {/* History Table */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden p-5 space-y-3">
          <h3 className="font-bold text-xs text-gray-900 dark:text-white">تاریخچه فاکتورهای خرید</h3>
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-500">در حال بارگذاری...</div>
          ) : purchases.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">خریدی ثبت نشده است.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 font-bold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="p-3">شماره فاکتور</th>
                    <th className="p-3">تأمین‌کننده</th>
                    <th className="p-3">تاریخ</th>
                    <th className="p-3">مبلغ کل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {purchases.map((p) => (
                    <tr key={p.id}>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{p.purchaseNumber}</td>
                      <td className="p-3 font-medium">{p.supplierName}</td>
                      <td className="p-3 text-gray-500">{toJalaliDateTime(p.createdAt)}</td>
                      <td className="p-3 font-black">{formatToman(p.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <SafeBoundary label="دستیار صوتی">
        <VoiceAssistantModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          onActionExecute={() => fetchPurchases()}
        />
      </SafeBoundary>
    </MainLayout>
  );
}
