"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Truck, Plus, Search, Phone, Building, MapPin, Save, X } from "lucide-react";
import { formatToman } from "@/lib/persian/utils";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [debt, setDebt] = useState("0");
  const [notes, setNotes] = useState("");

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const res = await fetch(`/api/suppliers?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setSuppliers(data.suppliers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("نام تأمین‌کننده الزامی است.");

    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company, phone, address, debt, notes }),
      });
      if (res.ok) {
        alert("تأمین‌کننده با موفقیت ثبت شد.");
        setIsModalOpen(false);
        setName(""); setCompany(""); setPhone(""); setAddress(""); setDebt("0"); setNotes("");
        fetchSuppliers();
      } else {
        alert("خطا در ثبت تأمین‌کننده");
      }
    } catch (e) {
      alert("خطا در سیستم");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">تأمین‌کنندگان کالا</h2>
              <p className="text-xs text-gray-500">لیست شرکت‌ها و توزیع‌کنندگان کالای فروشگاه</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition shrink-0"
          >
            <Plus className="w-4 h-4" /> افزودن تأمین‌کننده جدید
          </button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <form onSubmit={(e) => { e.preventDefault(); fetchSuppliers(); }} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی نام، شرکت یا شماره تماس..."
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

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full p-12 text-center text-xs text-gray-500">در حال دریافت لیست...</div>
          ) : suppliers.length === 0 ? (
            <div className="col-span-full p-12 text-center text-xs text-gray-500">تأمین‌کننده‌ای یافت نشد.</div>
          ) : (
            suppliers.map((s) => (
              <div key={s.id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">{s.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    خریدهای کل: {formatToman(s.totalPurchases)}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                  {s.company && <div className="flex items-center gap-2"><Building className="w-3.5 h-3.5 text-gray-400" /> {s.company}</div>}
                  {s.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" /> {s.phone}</div>}
                  {s.address && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {s.address}</div>}
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-500">بدهی ما به شرکت:</span>
                  <span className={`font-black ${s.debt > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {formatToman(s.debt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">افزودن تأمین‌کننده جدید</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">نام مسئول / رابط <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: آقای احمدی"
                  className="w-full bg-gray-100 dark:bg-gray-800 border p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">نام شرکت / پخش</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="مثال: بازرگانی پاپکو"
                  className="w-full bg-gray-100 dark:bg-gray-800 border p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">شماره تماس</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="02188880000"
                  className="w-full bg-gray-100 dark:bg-gray-800 border p-2.5 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">بدهی اولیه (تومان)</label>
                <input
                  type="number"
                  value={debt}
                  onChange={(e) => setDebt(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-gray-800 border p-2.5 rounded-xl font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" /> ذخیره تأمین‌کننده
            </button>
          </form>
        </div>
      )}
    </MainLayout>
  );
}
