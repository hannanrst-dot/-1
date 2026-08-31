"use client";

import React, { useState, useEffect } from "react";
import { Printer, Download, X, Store, Calendar, FileText, CheckCircle2, CalendarClock, Send, Image as ImageIcon } from "lucide-react";
import { formatToman, toJalaliDateTime, toPersianDigits } from "@/lib/persian/utils";
import { shareInvoiceImage } from "@/lib/invoice/share";

interface InvoicePrintItem {
  productName: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InvoicePrintData {
  id?: number;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  createdAt: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  paidAmount: number;
  balance: number;
  paymentMethod: string;
  notes?: string;
  items: InvoicePrintItem[];
}

interface PrintableInvoiceProps {
  invoice: InvoicePrintData;
  isOpen: boolean;
  onClose: () => void;
}

export function PrintableInvoice({ invoice, isOpen, onClose }: PrintableInvoiceProps) {
  const [printLayout, setPrintLayout] = useState<"A4" | "THERMAL">("A4");
  const [store, setStore] = useState<{ storeName: string; phone: string; address: string; receiptFooter: string }>({
    storeName: "نوشت‌افزار حنان",
    phone: "",
    address: "",
    receiptFooter: "از خرید و اعتماد شما سپاسگزاریم.",
  });

  // بارگذاری مشخصات فروشگاه (نام، تلفن، آدرس) از تنظیمات تا روی فاکتور چاپی نمایش داده شود.
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const info = data?.settings?.store_info;
        if (info) {
          setStore((prev) => ({
            storeName: info.storeName || prev.storeName,
            phone: info.phone || "",
            address: info.address || "",
            receiptFooter: info.receiptFooter || prev.receiptFooter,
          }));
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodPersian = (method: string) => {
    switch (method) {
      case "cash": return "نقدی";
      case "card": return "کارت‌خوان (پوز)";
      case "transfer": return "کارت به کارت / واریز";
      case "credit": return "اعتباری / نسیه";
      case "split": return "ترکیبی";
      default: return method;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-8 border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
        
        {/* Top Control Header */}
        <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">قالب چاپ:</span>
            <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-xl flex gap-1 text-xs font-bold">
              <button
                onClick={() => setPrintLayout("A4")}
                className={`px-3 py-1.5 rounded-lg transition ${printLayout === "A4" ? "bg-emerald-600 text-white shadow" : "text-gray-600 dark:text-gray-300"}`}
              >
                A4 استاندارد
              </button>
              <button
                onClick={() => setPrintLayout("THERMAL")}
                className={`px-3 py-1.5 rounded-lg transition ${printLayout === "THERMAL" ? "bg-emerald-600 text-white shadow" : "text-gray-600 dark:text-gray-300"}`}
              >
                فاکتور حرارتی (۸۰mm)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/installments?invoiceId=${invoice.id ?? ""}&invoiceNumber=${encodeURIComponent(invoice.invoiceNumber || "")}&customer=${encodeURIComponent(invoice.customerName || "")}&total=${Math.round(invoice.finalAmount || 0)}`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
            >
              <CalendarClock className="w-4 h-4" /> فروش قسطی
            </a>
            <button
              onClick={() => shareInvoiceImage({
                storeName: store.storeName, storePhone: store.phone,
                invoiceNumber: invoice.invoiceNumber, customerName: invoice.customerName,
                items: invoice.items.map((it) => ({ productName: it.productName, quantity: it.quantity, unitPrice: it.unitPrice, totalPrice: it.totalPrice })),
                total: invoice.finalAmount,
              }, invoice.customerPhone)}
              className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-sky-600/30"
            >
              <ImageIcon className="w-4 h-4" /> ارسال عکسِ فاکتور
            </button>
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/30"
            >
              <Printer className="w-4 h-4" /> چاپ فاکتور
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable View Container */}
        <div className="p-8 overflow-y-auto bg-white text-gray-900 flex-1 flex justify-center">
          {printLayout === "A4" ? (
            /* A4 Layout */
            <div id="printable-area" className="w-full max-w-2xl bg-white border border-gray-300 p-8 rounded-xl space-y-6 text-sm">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl">
                    <Store className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{store.storeName}</h2>
                    <p className="text-xs text-gray-500">فاکتور رسمی فروش کالا و خدمات</p>
                    {store.phone && <p className="text-[11px] text-gray-600 mt-0.5">📞 {toPersianDigits(store.phone)}</p>}
                    {store.address && <p className="text-[11px] text-gray-600">📍 {store.address}</p>}
                  </div>
                </div>
                <div className="text-left text-xs space-y-1">
                  <div><strong>شماره فاکتور:</strong> {invoice.invoiceNumber}</div>
                  <div><strong>تاریخ:</strong> {toJalaliDateTime(invoice.createdAt)}</div>
                </div>
              </div>

              {/* Customer & Payment Info */}
              <div className="bg-gray-50 p-4 rounded-xl grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500 block mb-1">خریدار / مشتری:</span>
                  <strong className="text-sm font-bold text-gray-900">{invoice.customerName}</strong>
                </div>
                <div className="text-left">
                  <span className="text-gray-500 block mb-1">روش پرداخت:</span>
                  <strong className="text-sm font-bold text-gray-900">{getPaymentMethodPersian(invoice.paymentMethod)}</strong>
                </div>
              </div>

              {/* Table */}
              <table className="w-full border-collapse border border-gray-200 text-xs">
                <thead className="bg-gray-100 text-gray-800 font-bold">
                  <tr>
                    <th className="border border-gray-200 p-2 text-center w-10">ردیف</th>
                    <th className="border border-gray-200 p-2 text-right">نام کالا / خدمات</th>
                    <th className="border border-gray-200 p-2 text-center">تعداد</th>
                    <th className="border border-gray-200 p-2 text-left">قیمت واحد</th>
                    <th className="border border-gray-200 p-2 text-left">جمع کل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-200 p-2 text-center">{toPersianDigits(index + 1)}</td>
                      <td className="border border-gray-200 p-2 font-medium">{item.productName}</td>
                      <td className="border border-gray-200 p-2 text-center">{toPersianDigits(item.quantity)} {item.unit || "عدد"}</td>
                      <td className="border border-gray-200 p-2 text-left">{formatToman(item.unitPrice)}</td>
                      <td className="border border-gray-200 p-2 text-left font-bold">{formatToman(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div className="flex justify-between items-start text-xs border-t pt-4">
                <div className="w-1/2 space-y-1">
                  {invoice.notes && <p><strong>توضیحات:</strong> {invoice.notes}</p>}
                  <p className="text-gray-500 pt-2">{store.receiptFooter}</p>
                </div>
                <div className="w-1/2 space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-500">مبلغ کل کالاها:</span>
                    <span>{formatToman(invoice.totalAmount)}</span>
                  </div>
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>تخفیف:</span>
                      <span>-{formatToman(invoice.discountAmount)}</span>
                    </div>
                  )}
                  {invoice.taxAmount > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>مالیات:</span>
                      <span>+{formatToman(invoice.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold pt-2 border-t text-emerald-700">
                    <span>مبلغ قابل پرداخت:</span>
                    <span>{formatToman(invoice.finalAmount)}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Thermal POS Receipt Layout (80mm) */
            <div id="printable-area" className="w-[80mm] bg-white border border-gray-300 p-4 rounded-xl text-center space-y-4 text-xs font-mono">
              <div className="border-b pb-2 space-y-1">
                <h3 className="font-bold text-base">{store.storeName}</h3>
                {store.phone && <p className="text-[10px]">📞 {toPersianDigits(store.phone)}</p>}
                {store.address && <p className="text-[10px]">📍 {store.address}</p>}
                <p>شماره فاکتور: {invoice.invoiceNumber}</p>
                <p>{toJalaliDateTime(invoice.createdAt)}</p>
              </div>

              <div className="text-right text-[11px] border-b pb-2 space-y-1">
                <p>مشتری: <strong>{invoice.customerName}</strong></p>
                <p>روش پرداخت: {getPaymentMethodPersian(invoice.paymentMethod)}</p>
              </div>

              <div className="space-y-2 text-right text-[11px]">
                {invoice.items.map((item, idx) => (
                  <div key={idx} className="border-b border-dashed pb-1">
                    <div className="font-bold">{item.productName}</div>
                    <div className="flex justify-between text-gray-600">
                      <span>{toPersianDigits(item.quantity)} × {formatToman(item.unitPrice)}</span>
                      <span className="font-bold text-black">{formatToman(item.totalPrice)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2 text-right space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>جمع:</span>
                  <span>{formatToman(invoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-emerald-800 border-t pt-1">
                  <span>مبلغ نهایی:</span>
                  <span>{formatToman(invoice.finalAmount)}</span>
                </div>
              </div>

              <div className="text-[10px] text-gray-500 pt-2 border-t border-dashed">
                {store.receiptFooter}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
