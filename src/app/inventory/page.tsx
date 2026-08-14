"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Boxes, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";
import { formatToman, toPersianDigits } from "@/lib/persian/utils";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) setProducts(data.products || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/30">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">انبارداری و مدیریت موجودی</h2>
            <p className="text-xs text-gray-500">پایش کالاهای کم‌موجود و کنترل تراکنش‌های انبار</p>
          </div>
        </div>

        {/* Stock Alert Warning Box */}
        {lowStockProducts.length > 0 && (
          <div className="bg-rose-50 dark:bg-rose-950/40 p-5 rounded-3xl border border-rose-200 dark:border-rose-900/60 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-extrabold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
              <span>هشدار کمبود موجودی ({toPersianDigits(lowStockProducts.length)} کالا نیاز به سفارش دارند)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="bg-white dark:bg-gray-900 p-3 rounded-2xl border border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">{p.name}</div>
                    <div className="text-[10px] text-gray-500">حداقل: {toPersianDigits(p.minStock)} {p.unit}</div>
                  </div>
                  <span className="font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2 py-1 rounded-xl">
                    ⚠️ {toPersianDigits(p.stock)} {p.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Inventory List */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden p-5 space-y-3">
          <h3 className="font-bold text-xs text-gray-900 dark:text-white">وضعیت موجودی تمام کالاها</h3>
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-500">در حال دریافت داده‌های انبار...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 font-bold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="p-3">نام کالا</th>
                    <th className="p-3">کد / SKU</th>
                    <th className="p-3">دسته‌بندی</th>
                    <th className="p-3">موجودی فعلی</th>
                    <th className="p-3">ارزش موجودی (تومان)</th>
                    <th className="p-3">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {products.map((p) => {
                    const isLow = p.stock <= p.minStock;
                    return (
                      <tr key={p.id}>
                        <td className="p-3 font-bold">{p.name}</td>
                        <td className="p-3 text-gray-500 font-mono">{p.sku}</td>
                        <td className="p-3 text-gray-600">{p.categoryName || "عمومی"}</td>
                        <td className="p-3 font-black">{toPersianDigits(p.stock)} {p.unit}</td>
                        <td className="p-3 font-bold text-emerald-600">{formatToman(p.stock * p.sellPrice)}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${isLow ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {isLow ? "کم‌موجود" : "کافی"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
}
