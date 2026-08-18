"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { FileSpreadsheet, Trash2, Plus, CheckCircle, Download, ArrowLeft, AlertTriangle } from "lucide-react";
import { toPersianDigits, toEnglishDigits, normalizePersianText, calculateSimilarity } from "@/lib/persian/utils";
import * as XLSX from "xlsx";

interface Row { name: string; buyPrice: number; sellPrice: number; stock: number; barcode: string; }

const emptyRow = (): Row => ({ name: "", buyPrice: 0, sellPrice: 0, stock: 0, barcode: "" });
const parseNum = (v: any): number => {
  if (v == null) return 0;
  const s = toEnglishDigits(String(v)).replace(/[^\d.]/g, "");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : Math.round(n);
};

export default function ImportProductsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);
  const excelInput = useRef<HTMLInputElement>(null);
  // کالاهای موجود (برای هشدارِ تکراری داخلِ جدول، پیش از ثبت)
  const [existing, setExisting] = useState<{ name: string; n: string; bc: string }[]>([]);
  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((d) => setExisting((d.products || []).map((p: any) => ({ name: p.name, n: normalizePersianText(p.name), bc: (p.barcode || "").trim() })))).catch(() => {});
  }, []);
  const dupOf = (r: Row): string | null => {
    const nn = normalizePersianText(r.name);
    if (!nn) return null;
    const bc = (r.barcode || "").trim();
    let m = bc ? existing.find((p) => p.bc && p.bc === bc) : undefined;
    if (!m) m = existing.find((p) => calculateSimilarity(nn, p.n) >= 0.8);
    return m ? m.name : null;
  };

  // ---------- اکسل ----------
  const handleExcel = async (file: File) => {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (!json.length) { alert("فایل خالی است یا خوانده نشد."); return; }

      const findVal = (obj: any, pats: string[]) => {
        for (const k of Object.keys(obj)) { const kk = k.trim(); if (pats.some((p) => kk.includes(p)) && String(obj[k]).trim() !== "") return obj[k]; }
        return undefined;
      };
      const parsed: Row[] = [];
      for (const obj of json) {
        const name = String(findVal(obj, ["نام", "کالا", "محصول", "name", "title", "شرح"]) ?? "").trim();
        if (!name) continue;
        const buy = findVal(obj, ["خرید", "buy"]);
        const sell = findVal(obj, ["فروش", "sell"]);
        const anyPrice = findVal(obj, ["قیمت", "price", "مبلغ"]);
        const stock = findVal(obj, ["موجودی", "تعداد", "انبار", "stock", "qty", "quantity", "count"]);
        const barcode = findVal(obj, ["بارکد", "barcode"]);
        parsed.push({
          name,
          buyPrice: parseNum(buy ?? (sell ? undefined : anyPrice)),
          sellPrice: parseNum(sell ?? anyPrice),
          stock: parseNum(stock),
          barcode: barcode ? String(barcode).trim() : "",
        });
      }
      if (!parsed.length) { alert("هیچ ردیفی با نامِ کالا پیدا نشد. ستون «نام کالا» را بررسی کنید."); return; }
      setRows((prev) => [...prev, ...parsed]);
    } catch (e) {
      console.error(e); alert("خطا در خواندن فایل اکسل.");
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { "نام کالا": "دفتر ۸۰ برگ میکرو", "قیمت خرید": 150000, "قیمت فروش": 200000, "موجودی": 50, "بارکد": "6260000111" },
      { "نام کالا": "مداد آریا", "قیمت خرید": 20000, "قیمت فروش": 30000, "موجودی": 100, "بارکد": "" },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "کالاها");
    XLSX.writeFile(wb, "نمونه-لیست-کالا.xlsx");
  };

  // ---------- ویرایش جدول ----------
  const setCell = (i: number, key: keyof Row, value: any) => setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [key]: value } : r));

  const postItems = async (items: any[]) => {
    const res = await fetch("/api/products/bulk-create", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    return { ok: res.ok, data: await res.json() };
  };

  const submitAll = async () => {
    const valid = rows.filter((r) => r.name.trim());
    if (!valid.length) { alert("حداقل یک کالا با نام لازم است."); return; }
    setSaving(true);
    try {
      const { ok, data } = await postItems(valid.map((r) => ({ ...r })));
      if (!ok) { alert(data.error || "خطا در ثبت کالاها"); return; }

      const skipped = (data.skipped || []) as { name: string; matchedName: string }[];
      if (skipped.length > 0) {
        const list = skipped.slice(0, 15).map((s) => `• ${s.name}  (مشابهِ: ${s.matchedName})`).join("\n");
        const more = skipped.length > 15 ? `\n… و ${toPersianDigits(skipped.length - 15)} مورد دیگر` : "";
        const ok2 = window.confirm(
          `${toPersianDigits(data.count)} کالا ثبت شد.\n\n${toPersianDigits(skipped.length)} کالا چون «مشابهِ کالای موجود» بودند ثبت نشدند:\n${list}${more}\n\nاین‌ها را هم به‌عنوانِ کالای جدید ثبت کنم؟`
        );
        if (ok2) {
          const skipNames = new Set(skipped.map((s) => s.name));
          const forceItems = valid.filter((r) => skipNames.has(r.name.trim())).map((r) => ({ ...r, force: true }));
          const r2 = await postItems(forceItems);
          if (r2.ok) alert(`در مجموع ${toPersianDigits((data.count || 0) + (r2.data.count || 0))} کالا ثبت شد.`);
          router.push("/products");
        } else {
          router.push("/products");
        }
      } else {
        alert(`${toPersianDigits(data.count)} کالا با موفقیت ثبت شد.`);
        router.push("/products");
      }
    } catch { alert("خطا در ارتباط با سرور"); } finally { setSaving(false); }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg"><FileSpreadsheet className="w-6 h-6" /></div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">ورودِ گروهیِ کالا از اکسل</h2>
            <p className="text-xs text-gray-500">لیست کالاها را از اکسل بیاورید، تک‌تک ویرایش کنید و یکجا ثبت کنید. کالاهای مشابهِ موجود، هشدار داده می‌شوند.</p>
          </div>
        </div>

        {/* روش ورود: اکسل */}
        <div className="bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 space-y-2">
          <div className="font-bold text-sm flex items-center gap-2 text-emerald-700 dark:text-emerald-300"><FileSpreadsheet className="w-5 h-5" /> از فایل اکسل</div>
          <p className="text-[11px] text-gray-600 dark:text-gray-300">ستون‌ها: نام کالا، قیمت خرید، قیمت فروش، موجودی، بارکد. (ارقام فارسی و جداکنندهٔ هزارگان پشتیبانی می‌شود.)</p>
          <input ref={excelInput} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleExcel(f); e.target.value = ""; }} />
          <div className="flex gap-2">
            <button onClick={() => excelInput.current?.click()} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold">انتخاب فایل اکسل</button>
            <button onClick={downloadTemplate} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1" title="دانلود فایل نمونه"><Download className="w-4 h-4" /> نمونه</button>
          </div>
        </div>

        {/* جدولِ قابل ویرایش */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
            <span className="font-bold text-sm">کالاها ({toPersianDigits(rows.length)}) — قابل ویرایش</span>
            <div className="flex gap-2">
              <button onClick={() => setRows((p) => [...p, emptyRow()])} className="text-xs text-emerald-600 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> ردیف خالی</button>
              {rows.length > 0 && <button onClick={() => setRows([])} className="text-xs text-rose-600">پاک کردن همه</button>}
            </div>
          </div>
          {rows.length === 0 ? (
            <div className="p-10 text-center text-xs text-gray-400">هنوز کالایی وارد نشده — فایل اکسل را انتخاب کنید، یا «ردیف خالی» بزنید.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 font-bold">
                  <tr>
                    <th className="p-2 text-right">نام کالا</th>
                    <th className="p-2">قیمت خرید</th>
                    <th className="p-2">قیمت فروش</th>
                    <th className="p-2">موجودی</th>
                    <th className="p-2">بارکد</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.map((r, i) => {
                    const dn = dupOf(r);
                    return (
                    <tr key={i} className={dn ? "bg-amber-50 dark:bg-amber-950/20" : ""}>
                      <td className="p-1.5">
                        <input value={r.name} onChange={(e) => setCell(i, "name", e.target.value)} className="w-40 min-w-[120px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5" />
                        {dn && <div className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-0.5 mt-0.5"><AlertTriangle className="w-3 h-3" /> مشابهِ «{dn}» موجود است</div>}
                      </td>
                      <td className="p-1.5"><input inputMode="numeric" value={r.buyPrice ? toPersianDigits(r.buyPrice) : ""} onChange={(e) => setCell(i, "buyPrice", parseNum(e.target.value))} className="w-24 text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-1.5" /></td>
                      <td className="p-1.5"><input inputMode="numeric" value={r.sellPrice ? toPersianDigits(r.sellPrice) : ""} onChange={(e) => setCell(i, "sellPrice", parseNum(e.target.value))} className="w-24 text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-1.5" /></td>
                      <td className="p-1.5"><input inputMode="numeric" value={r.stock ? toPersianDigits(r.stock) : ""} onChange={(e) => setCell(i, "stock", parseNum(e.target.value))} className="w-16 text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-1.5" /></td>
                      <td className="p-1.5"><input value={r.barcode} onChange={(e) => setCell(i, "barcode", e.target.value)} className="w-28 text-center font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-1.5" /></td>
                      <td className="p-1.5"><button onClick={() => setRows((p) => p.filter((_, idx) => idx !== i))} className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={() => router.push("/products")} className="px-4 border border-gray-300 dark:border-gray-700 rounded-2xl text-sm flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> بازگشت</button>
          <button onClick={submitAll} disabled={saving || !rows.some((r) => r.name.trim())} className="flex-1 bg-emerald-600 disabled:opacity-50 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> ثبت همهٔ کالاها</button>
        </div>
      </div>
    </MainLayout>
  );
}
