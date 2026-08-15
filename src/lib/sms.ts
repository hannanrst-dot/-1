/**
 * ارسال پیامک — پشت یک Interface مستقل.
 * پیش‌فرض: حالت «شبیه‌سازی» (فقط در لاگ می‌نویسد) تا برنامه بدون کلید هم کار کند.
 * برای فعال‌سازی واقعی، در تنظیمات محیطی (.env یا متغیرهای لیارا) این مقادیر را بگذارید:
 *   SMS_PROVIDER=kavenegar
 *   KAVENEGAR_API_KEY=کلید-شما
 *   KAVENEGAR_SENDER=خط-فرستنده   (اختیاری)
 * (به‌راحتی می‌توان provider دیگری مثل sms.ir یا ملی‌پیامک هم اضافه کرد.)
 */
export interface SmsResult {
  sent: boolean;
  simulated?: boolean;
  error?: string;
}

export async function sendSms(phone: string, message: string): Promise<SmsResult> {
  const provider = process.env.SMS_PROVIDER || "simulate";

  if (!phone) return { sent: false, error: "شماره موبایل خالی است." };

  if (provider === "kavenegar") {
    try {
      const key = process.env.KAVENEGAR_API_KEY;
      const sender = process.env.KAVENEGAR_SENDER || "";
      if (!key) return { sent: false, error: "کلید کاوه‌نگار تنظیم نشده است." };
      const url =
        `https://api.kavenegar.com/v1/${key}/sms/send.json` +
        `?receptor=${encodeURIComponent(phone)}` +
        (sender ? `&sender=${encodeURIComponent(sender)}` : "") +
        `&message=${encodeURIComponent(message)}`;
      const res = await fetch(url, { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.return?.status === 200) return { sent: true };
      return { sent: false, error: data?.return?.message || "ارسال ناموفق بود." };
    } catch (e) {
      return { sent: false, error: (e as Error).message };
    }
  }

  // حالت پیش‌فرض: شبیه‌سازی
  console.log(`[SMS شبیه‌سازی] به ${phone}: ${message}`);
  return { sent: false, simulated: true };
}
