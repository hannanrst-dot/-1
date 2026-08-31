"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  FilePlus,
  Search,
  Barcode,
  Mic,
  Plus,
  Trash2,
  CheckCircle,
  CreditCard,
  UserPlus,
  Sparkles,
  Printer,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { formatToman, toPersianDigits } from "@/lib/persian/utils";
import { BarcodeScannerModal } from "@/components/barcode/BarcodeScannerModal";
import { VoiceAssistantModal } from "@/components/voice/VoiceAssistantModal";
import { PrintableInvoice } from "@/components/invoice/PrintableInvoice";

export default function NewInvoicePage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("مشتری عمومی");
  const [customerPhone, setCustomerPhone] = useState("");

  // Invoice Items state
  const [items, setItems] = useState<
    {
      productId: number;
      productName: string;
      unit: string;
      quantity: number;
      buyPrice: number;
      unitPrice: number;
      discount: number;
      totalPrice: number;
      stock: number;
    }[]
  >([]);

  // Payment fields
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<any>(null);

  // چند مشتریِ هم‌زمان: فاکتورهای «پارک‌شده» (کنارگذاشته‌شده تا بعد ادامه دهید)
  const [parked, setParked] = useState<any[]>([]);
  const snapshot = () => ({ items, selectedCustomerId, customerName, customerPhone, discountAmount, taxAmount, paymentMethod, notes });
  const loadSnapshot = (s: any) => {
    setItems(s.items || []); setSelectedCustomerId(s.selectedCustomerId || ""); setCustomerName(s.customerName || "مشتری عمومی");
    setCustomerPhone(s.customerPhone || ""); setDiscountAmount(s.discountAmount || 0); setTaxAmount(s.taxAmount || 0);
    setPaymentMethod(s.paymentMethod || "cash"); setNotes(s.notes || "");
  };
  const resetWorkspace = () => {
    setItems([]); setSelectedCustomerId(""); setCustomerName("مشتری عمومی"); setCustomerPhone("");
    setDiscountAmount(0); setTaxAmount(0); setPaymentMethod("cash"); setNotes(""); setSearchTerm("");
  };
  // پارکِ فاکتورِ فعلی و شروعِ مشتریِ جدید
  const parkCurrent = () => {
    if (items.length === 0) return;
    const label = customerName && customerName !== "مشتری عمومی" ? customerName : `مشتری ${toPersianDigits(parked.length + 1)}`;
    setParked((p) => [...p, { ...snapshot(), label, _total: items.reduce((s, it) => s + it.totalPrice, 0) }]);
    resetWorkspace();
  };
  // بازگشت به یک فاکتورِ پارک‌شده (فاکتورِ فعلی هم اگر خالی نبود پارک می‌شود)
  const resumeParked = (idx: number) => {
    const target = parked[idx];
    const rest = parked.filter((_, i) => i !== idx);
    if (items.length > 0) {
      const label = customerName && customerName !== "مشتری عمومی" ? customerName : `مشتری ${toPersianDigits(parked.length + 1)}`;
      rest.push({ ...snapshot(), label, _total: items.reduce((s, it) => s + it.totalPrice, 0) });
    }
    setParked(rest);
    loadSnapshot(target);
  };

  const [stockAlert, setStockAlert] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));

    fetch("/api/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers || []));

    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setStockAlert(!!d?.settings?.store_info?.stockAlert))
      .catch(() => {});
  }, []);

  const handleCustomerChange = (idStr: string) => {
    setSelectedCustomerId(idStr);
    if (!idStr) {
      setCustomerName("مشتری عمومی");
    } else {
      const cust = customers.find((c) => String(c.id) === idStr);
      if (cust) { setCustomerName(cust.name); if (cust.phone) setCustomerPhone(cust.phone); }
    }
  };

  const addProductToInvoice = (product: any) => {
    const existingIndex = items.findIndex((i) => i.productId === product.id);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice =
        updated[existingIndex].quantity * updated[existingIndex].unitPrice - updated[existingIndex].discount;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          unit: product.unit || "عدد",
          quantity: 1,
          buyPrice: product.buyPrice,
          unitPrice: product.sellPrice,
          discount: product.discount || 0,
          totalPrice: product.sellPrice - (product.discount || 0),
          stock: product.stock,
        },
      ]);
    }
  };

  const updateItemQty = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const updated = [...items];
    updated[index].quantity = newQty;
    updated[index].totalPrice = newQty * updated[index].unitPrice - updated[index].discount;
    setItems(updated);
  };

  const updateItemPrice = (index: number, newPrice: number) => {
    const updated = [...items];
    updated[index].unitPrice = newPrice;
    updated[index].totalPrice = updated[index].quantity * newPrice - updated[index].discount;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const rawSubtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const finalTotal = Math.max(0, rawSubtotal - discountAmount + taxAmount);

  const handleCreateInvoice = async () => {
    if (items.length === 0) {
      alert("لطفاً حداقل یک کالا به فاکتور اضافه کنید.");
      return;
    }
    // هشدارِ (غیرمسدودکنندهٔ) کمبود موجودی — فقط اگر در تنظیمات فعال باشد.
    if (stockAlert) {
      const short = items.filter((it) => it.quantity > it.stock);
      if (short.length > 0) {
        const list = short.map((it) => `• ${it.productName}: موجودی ${it.stock}، درخواست ${it.quantity}`).join("\n");
        const ok = confirm(`⚠️ موجودیِ این کالاها کافی نیست:\n\n${list}\n\nبا این حال فاکتور ثبت شود؟`);
        if (!ok) return;
      }
    }
    setLoading(true);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId || null,
          customerName,
          customerPhone: customerPhone || null,
          items,
          discountAmount,
          taxAmount,
          paymentMethod,
          // فروشِ «نسیه/اعتباری» به‌صورت پرداخت‌نشده ثبت می‌شود تا در «طلب از مشتریان» بیاید.
          paidAmount: paymentMethod === "credit" ? 0 : undefined,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCreatedInvoice({ ...data.invoice, items, customerPhone });
      } else {
        alert(data.error || "خطا در صدور فاکتور");
      }
    } catch (e) {
      alert("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.barcode && p.barcode.includes(term))
    );
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Top Title & Voice Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/30">
              <FilePlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">فاکتور فروش جدید (POS)</h2>
              <p className="text-xs text-gray-500">صدور بسیار سریع فاکتور با جستجو، بارکد یا فاکتور صوتی</p>
            </div>
          </div>

          <button
            onClick={() => setIsVoiceOpen(true)}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition transform hover:scale-105 active:scale-95"
          >
            <Mic className="w-4 h-4 animate-pulse text-emerald-200" />
            <span>🎙️ صدور صوتی فاکتور («برای علی رضایی سه تا دفتر...»)</span>
          </button>
        </div>

        {/* نوارِ چند مشتریِ هم‌زمان (پارکِ فاکتور) */}
        <div className="flex items-center gap-2 flex-wrap bg-white dark:bg-gray-900 p-2.5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <span className="text-[11px] font-bold text-gray-500 px-1">مشتریان هم‌زمان:</span>
          <button onClick={parkCurrent} disabled={items.length === 0} className="bg-amber-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5" /> پارک و مشتریِ جدید
          </button>
          {parked.map((p, i) => (
            <button key={i} onClick={() => resumeParked(i)} className="bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-gray-300 dark:border-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
              🅿️ {p.label} <span className="text-emerald-600">({formatToman(p._total)})</span>
            </button>
          ))}
          {parked.length === 0 && <span className="text-[11px] text-gray-400">فاکتوری پارک نشده — برای رسیدگی به مشتریِ دیگر «پارک» را بزنید و بعد برگردید.</span>}
        </div>

        {/* POS Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left / Top: Product Catalog Picker (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
                <input
                  type="text"
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && filteredProducts.length > 0) { addProductToInvoice(filteredProducts[0]); setSearchTerm(""); } }}
                  placeholder="جستجوی کالا یا بارکد... (Enter = افزودنِ اولین نتیجه)"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl pr-10 pl-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 text-emerald-600 px-3 py-2.5 rounded-xl text-xs font-bold transition"
                title="اسکن بارکد"
              >
                <Barcode className="w-4 h-4" />
              </button>
            </div>

            {/* Catalog Grid */}
            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addProductToInvoice(p)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-2xl border border-gray-200 dark:border-gray-700/60 flex items-center justify-between text-right transition group text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      موجودی: {toPersianDigits(p.stock)} {p.unit}
                    </div>
                  </div>
                  <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-left">
                    {formatToman(p.sellPrice)}
                  </div>
                </button>
              ))}
            </div>

          </div>

          {/* Right: Invoice Items Table & Checkout Panel (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 flex flex-col justify-between">
            
            <div className="space-y-4">
              
              {/* Customer Selector */}
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-200 dark:border-gray-700">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">مشتری:</span>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
                >
                  <option value="">مشتری عمومی (نقدی)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </option>
                  ))}
                </select>
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  inputMode="tel"
                  placeholder="📱 موبایل مشتری"
                  className="w-36 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs text-left font-mono focus:outline-none"
                />
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto min-h-[220px]">
                {items.length === 0 ? (
                  <div className="p-12 text-center text-xs text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                    کالایی انتخاب نشده است. روی محصولات سمت راست کلیک کنید یا با میکروفون سفارش دهید.
                  </div>
                ) : (
                  <table className="w-full text-right text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 font-semibold border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th className="p-2">نام کالا</th>
                        <th className="p-2 text-center">تعداد</th>
                        <th className="p-2">قیمت واحد</th>
                        <th className="p-2">جمع کل</th>
                        <th className="p-2 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td className="p-2 font-bold text-gray-900 dark:text-gray-100">{item.productName}</td>
                          <td className="p-2">
                            <div className="flex items-center justify-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-24 mx-auto">
                              <button
                                onClick={() => updateItemQty(index, item.quantity - 1)}
                                className="w-6 h-6 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-200 font-bold"
                              >
                                -
                              </button>
                              <span className="font-bold">{toPersianDigits(item.quantity)}</span>
                              <button
                                onClick={() => updateItemQty(index, item.quantity + 1)}
                                className="w-6 h-6 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-200 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItemPrice(index, Number(e.target.value))}
                              className="w-24 bg-gray-50 dark:bg-gray-800 border rounded-lg px-2 py-1 text-xs font-bold"
                            />
                          </td>
                          <td className="p-2 font-black text-emerald-600">{formatToman(item.totalPrice)}</td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => removeItem(index)}
                              className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>

            {/* Bottom Checkout & Payment Section */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-3">
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-gray-500 mb-1">تخفیف کلی (تومان)</label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full bg-gray-50 dark:bg-gray-800 border rounded-xl p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 mb-1">روش پرداخت</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border rounded-xl p-2 font-bold"
                  >
                    <option value="cash">نقدی</option>
                    <option value="card">کارت‌خوان (پوز)</option>
                    <option value="transfer">کارت به کارت</option>
                    <option value="credit">اعتباری / نسیه</option>
                    <option value="split">ترکیبی</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1 text-left flex flex-col justify-end">
                  <span className="text-[10px] text-gray-500 font-semibold">مبلغ نهایی قابل پرداخت</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {formatToman(finalTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreateInvoice}
                disabled={loading || items.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{loading ? "در حال صدور فاکتور..." : "ثبت نهایی و صدور فاکتور"}</span>
              </button>

            </div>

          </div>

        </div>

      </div>

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        continuous
        onDetected={(code) => {
          const match = products.find((p) => p.barcode === code || p.sku === code);
          if (match) {
            addProductToInvoice(match);
            return match.name; // نمایش نام کالا در لیست اسکن‌ها
          }
          return null; // پیدا نشد
        }}
      />

      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onActionExecute={() => router.push("/invoices")}
      />

      {createdInvoice && (
        <PrintableInvoice
          invoice={createdInvoice}
          isOpen={!!createdInvoice}
          onClose={() => {
            setCreatedInvoice(null);
            // اگر مشتریِ پارک‌شده‌ای هست، به آن برگرد؛ وگرنه به لیست فاکتورها.
            if (parked.length > 0) {
              const first = parked[0];
              setParked((p) => p.slice(1));
              loadSnapshot(first);
              fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products || [])).catch(() => {});
            } else {
              resetWorkspace();
              router.push("/invoices");
            }
          }}
        />
      )}
    </MainLayout>
  );
}
