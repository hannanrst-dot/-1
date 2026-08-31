"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Users, UserPlus, Search, Phone, MapPin, DollarSign, X, Save } from "lucide-react";
import { formatToman, toPersianDigits } from "@/lib/persian/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Customer Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [debt, setDebt] = useState("0");
  const [notes, setNotes] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const res = await fetch(`/api/customers?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setCustomers(data.customers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("نام مشتری الزامی است.");

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address, debt, notes }),
      });
      if (res.ok) {
        alert("مشتری با موفقیت ثبت شد.");
        setIsModalOpen(false);
        setName(""); setPhone(""); setAddress(""); setDebt("0"); setNotes("");
        fetchCustomers();
      } else {
        alert("خطا در ثبت مشتری");
      }
    } catch (e) {
      alert("خطا در ارتباط با سرور");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">مدیریت مشتریان</h2>
              <p className="text-xs text-gray-500">لیست خریداران، مانده بدهی و حساب مشتریان</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition shrink-0"
          >
            <UserPlus className="w-4 h-4" /> افزودن مشتری جدید
          </button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <form onSubmit={(e) => { e.preventDefault(); fetchCustomers(); }} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی نام یا شماره تماس مشتری..."
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

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full p-12 text-center text-xs text-gray-500">در حال دریافت مشتریان...</div>
          ) : customers.length === 0 ? (
            <div className="col-span-full p-12 text-center text-xs text-gray-500">هیچ مشتری پیدا نشد.</div>
          ) : (
            customers.map((c) => (
              <div key={c.id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">{c.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    خریدهای کل: {formatToman(c.totalPurchases)}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                  {c.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" /> {c.phone}</div>}
                  {c.address && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {c.address}</div>}
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-500">بدهی فعلی:</span>
                  <span className={`font-black ${c.debt > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {formatToman(c.debt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* New Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateCustomer} className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">افزودن مشتری جدید</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">نام و نام خانوادگی <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: علی رضایی"
                  className="w-full bg-gray-100 dark:bg-gray-800 border p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">شماره تماس</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09123456789"
                  className="w-full bg-gray-100 dark:bg-gray-800 border p-2.5 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">آدرس</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="آدرس خریدار..."
                  className="w-full bg-gray-100 dark:bg-gray-800 border p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">مانده بدهی اولیه (تومان)</label>
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
              <Save className="w-4 h-4" /> ذخیره مشتری
            </button>
          </form>
        </div>
      )}
    </MainLayout>
  );
}
