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
