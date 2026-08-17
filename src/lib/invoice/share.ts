import { formatToman, toPersianDigits } from "@/lib/persian/utils";

export interface ShareInvoiceData {
  storeName?: string;
  storePhone?: string;
  invoiceNumber: string;
  customerName?: string;
  items: { productName: string; quantity: number; unitPrice: number; totalPrice: number }[];
  total: number;
}

/** ساختِ متنِ خواناِی فاکتور برای ارسال به مشتری از طریق پیام‌رسان‌ها. */
export function buildInvoiceText(inv: ShareInvoiceData): string {
  const lines: string[] = [];
  lines.push(`🧾 فاکتور فروش — ${inv.storeName || "نوشت‌افزار حنان"}`);
  lines.push(`شماره: ${toPersianDigits(inv.invoiceNumber)}`);
  if (inv.customerName && inv.customerName !== "مشتری عمومی") lines.push(`مشتری: ${inv.customerName}`);
  lines.push("—————————————");
  inv.items.forEach((it, i) => {
    lines.push(`${toPersianDigits(i + 1)}. ${it.productName} — ${toPersianDigits(it.quantity)} عدد × ${formatToman(it.unitPrice)} = ${formatToman(it.totalPrice)}`);
  });
  lines.push("—————————————");
  lines.push(`💰 مبلغ کل: ${formatToman(inv.total)}`);
  if (inv.storePhone) lines.push(`📞 ${toPersianDigits(inv.storePhone)}`);
  lines.push("با تشکر از خرید شما 🌹");
  return lines.join("\n");
}

/** شمارهٔ ایرانی را به فرمتِ بین‌المللیِ واتساپ (۹۸...) تبدیل می‌کند. */
export function toWhatsappNumber(phone: string): string {
  const d = phone.replace(/[^\d]/g, "");
  if (!d) return "";
  if (d.startsWith("0098")) return d.slice(2);
  if (d.startsWith("98")) return d;
  if (d.startsWith("0")) return "98" + d.slice(1);
  return "98" + d;
}

/**
 * ارسالِ فاکتور: اول شیتِ اشتراک‌گذاریِ گوشی (همهٔ پیام‌رسان‌ها) باز می‌شود؛ اگر مرورگر
 * پشتیبانی نکند، به واتساپِ همان شماره (در صورت وجود) یا پیامک برمی‌گردیم.
 */
export async function shareInvoice(inv: ShareInvoiceData, customerPhone?: string): Promise<void> {
  const text = buildInvoiceText(inv);
  const nav = typeof navigator !== "undefined" ? (navigator as any) : null;
  if (nav?.share) {
    try {
      await nav.share({ title: `فاکتور ${inv.invoiceNumber}`, text });
      return;
    } catch {
      // کاربر لغو کرد یا خطا — به روش‌های جایگزین می‌رویم.
    }
  }
  const wa = customerPhone ? toWhatsappNumber(customerPhone) : "";
  if (wa) {
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, "_blank");
  } else {
    window.open(`sms:?&body=${encodeURIComponent(text)}`, "_blank");
  }
}

/** ارسالِ مستقیم به واتساپِ مشتری (وقتی شماره داریم). */
export function sendToWhatsapp(inv: ShareInvoiceData, customerPhone: string): void {
  const wa = toWhatsappNumber(customerPhone);
  const text = buildInvoiceText(inv);
  window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, "_blank");
}

/** ساختِ «عکسِ فاکتور» روی canvas و برگرداندنِ Blob (PNG). */
export async function invoiceToImageBlob(inv: ShareInvoiceData): Promise<Blob | null> {
  if (typeof document === "undefined") return null;
  try { await (document as any).fonts?.ready; } catch { /* ignore */ }
  const font = (px: number, w = "") => `${w} ${px}px Vazirmatn, Tahoma, Arial, sans-serif`;
  const scale = 2;
  const W = 640, pad = 28, rowH = 44, headH = 150, footH = 150;
  const H = headH + inv.items.length * rowH + footH;
  const canvas = document.createElement("canvas");
  canvas.width = W * scale; canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(scale, scale);
  ctx.textBaseline = "middle";

  // پس‌زمینه
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
  // نوارِ سرصفحه
  ctx.fillStyle = "#059669"; ctx.fillRect(0, 0, W, 88);
  ctx.direction = "rtl"; ctx.textAlign = "right";
  ctx.fillStyle = "#ffffff"; ctx.font = font(28, "bold");
  ctx.fillText(inv.storeName || "نوشت‌افزار حنان", W - pad, 38);
  ctx.font = font(15);
  ctx.fillText("فاکتور فروش", W - pad, 66);
  if (inv.storePhone) { ctx.textAlign = "left"; ctx.fillText("تلفن: " + toPersianDigits(inv.storePhone), pad, 66); ctx.textAlign = "right"; }

  // مشخصات
  let y = 118;
  ctx.fillStyle = "#111827"; ctx.font = font(15);
  ctx.textAlign = "right"; ctx.fillText(`شماره فاکتور: ${toPersianDigits(inv.invoiceNumber)}`, W - pad, y);
  if (inv.customerName && inv.customerName !== "مشتری عمومی") { ctx.textAlign = "left"; ctx.fillText(`مشتری: ${inv.customerName}`, pad, y); }
  y = headH - 8;
  ctx.strokeStyle = "#059669"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();

  // اقلام
  y += 26;
  ctx.font = font(15);
  for (const it of inv.items) {
    ctx.fillStyle = "#111827"; ctx.textAlign = "right";
    ctx.fillText(it.productName, W - pad, y);
    ctx.fillStyle = "#374151"; ctx.textAlign = "left";
    ctx.fillText(`${toPersianDigits(it.quantity)} × ${formatToman(it.unitPrice)} = ${formatToman(it.totalPrice)}`, pad, y);
    ctx.strokeStyle = "#f0f0f0"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad, y + rowH / 2 - 4); ctx.lineTo(W - pad, y + rowH / 2 - 4); ctx.stroke();
    y += rowH;
  }

  // جمع کل
  y += 8;
  ctx.fillStyle = "#ecfdf5"; ctx.fillRect(pad, y - 4, W - 2 * pad, 44);
  ctx.fillStyle = "#065f46"; ctx.font = font(20, "bold");
  ctx.textAlign = "right"; ctx.fillText("مبلغ کل", W - pad - 8, y + 20);
  ctx.textAlign = "left"; ctx.fillText(formatToman(inv.total), pad + 8, y + 20);
  y += 68;
  ctx.fillStyle = "#6b7280"; ctx.font = font(14); ctx.textAlign = "center";
  ctx.fillText("با تشکر از خرید شما 🌹", W / 2, y);

  return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

/**
 * ارسالِ «عکسِ فاکتور»: اگر مرورگر اشتراکِ فایل را پشتیبانی کند، عکس مستقیماً از طریق
 * پیام‌رسان‌ها به اشتراک گذاشته می‌شود؛ وگرنه عکس در تبِ جدید باز می‌شود تا کاربر ذخیره/ارسال کند.
 */
export async function shareInvoiceImage(inv: ShareInvoiceData, customerPhone?: string): Promise<void> {
  const blob = await invoiceToImageBlob(inv);
  const nav = typeof navigator !== "undefined" ? (navigator as any) : null;
  if (blob && nav?.canShare) {
    const file = new File([blob], `factor-${inv.invoiceNumber}.png`, { type: "image/png" });
    if (nav.canShare({ files: [file] })) {
      try { await nav.share({ files: [file], title: `فاکتور ${inv.invoiceNumber}`, text: `فاکتور ${inv.invoiceNumber}` }); return; }
      catch { /* لغو یا خطا → روش جایگزین */ }
    }
  }
  if (blob) { const url = URL.createObjectURL(blob); window.open(url, "_blank"); return; }
  await shareInvoice(inv, customerPhone); // اگر عکس ساخته نشد، متن ارسال شود
}
