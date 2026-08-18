"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Package,
  PlusCircle,
  Search,
  Barcode,
  Edit2,
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  X,
  Save,
  Filter,
} from "lucide-react";
import { formatToman, toPersianDigits } from "@/lib/persian/utils";
import { BarcodeScannerModal } from "@/components/barcode/BarcodeScannerModal";
import * as XLSX from "xlsx";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  // اسکنر مخصوص فرم ویرایش (برای افزودن/اصلاح بارکد کالای موجود)
  const [isEditScannerOpen, setIsEditScannerOpen] = useState(false);

  // Edit Modal State
  const [editProduct, setEditProduct] = useState<any>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCat) params.append("categoryId", selectedCat);
      if (lowStockOnly) params.append("lowStock", "true");

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (res.ok) setCategories(data.categories || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCat, lowStockOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این کالا اطمینان دارید؟")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        alert("کالا با موفقیت حذف شد.");
        fetchProducts();
      } else {
        alert(data.error || "خطا در حذف کالا");
      }
    } catch (e) {
      alert("خطا در حذف کالا");
    }
  };

  const handleSaveEdit = async () => {
    if (!editProduct) return;
    try {
      const res = await fetch(`/api/products/${editProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProduct),
      });
      if (res.ok) {
        alert("کالا با موفقیت ویرایش شد.");
        setEditProduct(null);
        fetchProducts();
      } else {
        alert("خطا در ثبت ویرایش");
      }
    } catch (e) {
      alert("خطا در ویرایش کالا");
    }
  };

  const exportExcel = () => {
    const dataToExport = products.map((p) => ({
      "کد کالا": p.sku,
      "نام کالا": p.name,
      "بارکد": p.barcode || "",
      "دسته‌بندی": p.categoryName || "",
      "واحد": p.unit,
      "موجودی": p.stock,
      "قیمت خرید (تومان)": p.buyPrice,
      "قیمت فروش (تومان)": p.sellPrice,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "کالاها");
    XLSX.writeFile(workbook, `products-${Date.now()}.xlsx`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/30">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">مدیریت محصولات و کالاها</h2>
              <p className="text-xs text-gray-500">لیست، جستجو، تغییر موجودی و قیمت کالاها</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportExcel}
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> خروجی Excel
            </button>
            <Link
              href="/products/import"
              className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-600/30 transition"
            >
              <FileSpreadsheet className="w-4 h-4" /> ورود از اکسل
            </Link>
            <Link
              href="/products/new"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
            >
              <PlusCircle className="w-4 h-4" /> افزودن کالای جدید
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="sm:col-span-6 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو با نام، کد کالا یا بارکد..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl pr-10 pl-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-emerald-600 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                title="اسکن بارکد"
              >
                <Barcode className="w-4 h-4" />
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition"
              >
                جستجو
              </button>
            </form>

            {/* Category Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">همه دسته‌بندی‌ها</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Low Stock Filter Button */}
            <div className="sm:col-span-3 flex items-center">
              <button
                type="button"
                onClick={() => setLowStockOnly(!lowStockOnly)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition border ${
                  lowStockOnly
                    ? "bg-rose-600 text-white border-rose-600 shadow-md"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>کالاهای کم‌موجود ({toPersianDigits(products.filter(p => p.stock <= p.minStock).length)})</span>
              </button>
            </div>

          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500">در حال دریافت لیست کالاها...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">هیچ کالایی پیدا نشد.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="p-3">نام کالا</th>
                    <th className="p-3">کد / SKU</th>
                    <th className="p-3">بارکد</th>
                    <th className="p-3">دسته‌بندی</th>
                    <th className="p-3">موجودی</th>
                    <th className="p-3">قیمت خرید</th>
                    <th className="p-3">قیمت فروش</th>
                    <th className="p-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {products.map((p) => {
                    const isLow = p.stock <= p.minStock;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                        <td className="p-3 font-bold text-gray-900 dark:text-gray-100">
                          {p.name}
                        </td>
                        <td className="p-3 text-gray-500 font-mono">{p.sku}</td>
                        <td className="p-3 text-gray-500 font-mono">{p.barcode || "—"}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{p.categoryName || "عمومی"}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              isLow
                                ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 animate-pulse"
                                : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            }`}
                          >
                            {isLow && <AlertTriangle className="w-3 h-3" />}
                            {toPersianDigits(p.stock)} {p.unit}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-gray-600 dark:text-gray-400">{formatToman(p.buyPrice)}</td>
                        <td className="p-3 font-extrabold text-emerald-600 dark:text-emerald-400">{formatToman(p.sellPrice)}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setEditProduct(p)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition"
                              title="ویرایش کالا"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                              title="حذف کالا"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDetected={(code) => {
          setSearch(code);
          fetchProducts();
        }}
      />

      {/* Barcode Scanner for Edit Modal */}
      <BarcodeScannerModal
        isOpen={isEditScannerOpen}
        onClose={() => setIsEditScannerOpen(false)}
        onDetected={(code) => setEditProduct((prev: any) => (prev ? { ...prev, barcode: code } : prev))}
      />

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">ویرایش کالا</h3>
              <button onClick={() => setEditProduct(null)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">نام کالا</label>
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="w-full bg-gray-100 dark:bg-gray-800 border p-2.5 rounded-xl"
                />
              </div>

              {/* بارکد کالا با امکان اسکن با دوربین */}
              <div>
                <label className="block font-semibold mb-1">بارکد کالا</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editProduct.barcode || ""}
                    onChange={(e) => setEditProduct({ ...editProduct, barcode: e.target.value })}
                    placeholder="بارکد را وارد یا اسکن کنید"
                    className="flex-1 bg-gray-100 dark:bg-gray-800 border p-2.5 rounded-xl font-mono text-left"
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditScannerOpen(true)}
                    className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                    title="اسکن بارکد"
                  >
                    <Barcode className="w-4 h-4" /> اسکن
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">تعداد موجودی</label>
                  <input
                    type="number"
                    value={editProduct.stock}
                    onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                    className="w-full bg-gray-100 dark:bg-gray-800 border p-2.5 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">حداقل موجودی هشدار</label>
                  <input
                    type="number"
                    value={editProduct.minStock}
                    onChange={(e) => setEditProduct({ ...editProduct, minStock: e.target.value })}
                    className="w-full bg-gray-100 dark:bg-gray-800 border p-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">قیمت خرید (تومان)</label>
                  <input
                    type="number"
                    value={editProduct.buyPrice}
                    onChange={(e) => setEditProduct({ ...editProduct, buyPrice: e.target.value })}
                    className="w-full bg-gray-100 dark:bg-gray-800 border p-2.5 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">قیمت فروش (تومان)</label>
                  <input
                    type="number"
                    value={editProduct.sellPrice}
                    onChange={(e) => setEditProduct({ ...editProduct, sellPrice: e.target.value })}
                    className="w-full bg-gray-100 dark:bg-gray-800 border p-2.5 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" /> ذخیره تغییرات
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
