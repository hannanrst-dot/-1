import { NextResponse } from "next/server";

/**
 * تبدیلِ صدا به متن روی «سرورِ خودمان» (به‌جای سرورِ گوگل).
 *
 * چرا؟ تشخیصِ گفتارِ داخلِ مرورگر، صدا را به سرورِ گوگل می‌فرستد؛ اگر اینترنت به آنجا
 * نرسد، ضبط هر چند ثانیه قطع می‌شود، گوشی بوق می‌زند و متن ناقص درمی‌آید. اگر یک
 * سرویسِ تبدیلِ گفتارِ داخلی داشته باشیم، صدا یکجا ضبط و یکجا فرستاده می‌شود:
 * بدونِ بوق، بدونِ قطع‌شدن، و بدونِ وابستگی به گوگل.
 *
 * این مسیر عمداً به هیچ ارائه‌دهندهٔ خاصی گره نخورده است. هر سرویسی که API سازگار با
 * OpenAI داشته باشد (یعنی POST /audio/transcriptions) کار می‌کند. تنظیم با متغیرهای
 * محیطی روی لیارا:
 *   STT_BASE_URL  → مثلاً https://ai.liara.ir/api/v1/<id>
 *   STT_API_KEY   → کلیدِ سرویس
 *   STT_MODEL     → اختیاری، پیش‌فرض whisper-1
 * اگر تنظیم نشده باشد، برنامه دقیقاً مثلِ قبل با تشخیصِ گفتارِ مرورگر کار می‌کند.
 */

const cfg = () => ({
  base: (process.env.STT_BASE_URL || "").replace(/\/+$/, ""),
  key: process.env.STT_API_KEY || "",
  model: process.env.STT_MODEL || "whisper-1",
});

/** آیا تبدیلِ گفتارِ سمتِ سرور پیکربندی شده است؟ */
export async function GET() {
  const { base, key, model } = cfg();
  return NextResponse.json({ available: Boolean(base && key), model: base && key ? model : null });
}

export async function POST(req: Request) {
  const { base, key, model } = cfg();
  if (!base || !key) {
    return NextResponse.json({ error: "سرویسِ تبدیلِ گفتار روی سرور تنظیم نشده است." }, { status: 503 });
  }

  try {
    const inForm = await req.formData();
    const file = inForm.get("audio");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "فایلِ صدا ارسال نشده است." }, { status: 400 });
    }
    // محدودیتِ اندازه: کلیپ‌های ما چند ثانیه‌اند؛ چیزی بزرگ‌تر از ۲۵ مگابایت اشتباه است.
    if (typeof (file as File).size === "number" && (file as File).size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "فایلِ صدا خیلی بزرگ است." }, { status: 413 });
    }

    const out = new FormData();
    out.append("file", file as File, (file as File).name || "voice.webm");
    out.append("model", model);
    out.append("language", "fa");         // فارسی — دقتِ تشخیص را بالا می‌برد
    out.append("response_format", "json");

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45000);
    let res: Response;
    try {
      res = await fetch(`${base}/audio/transcriptions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body: out,
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("STT provider error:", res.status, detail.slice(0, 400));
      return NextResponse.json(
        { error: "سرویسِ تبدیلِ گفتار پاسخ نداد. دوباره تلاش کنید یا از حالتِ معمولیِ صوتی استفاده کنید." },
        { status: 502 }
      );
    }

    const data: any = await res.json().catch(() => ({}));
    const text = String(data?.text ?? "").trim();
    return NextResponse.json({ text });
  } catch (error: any) {
    const aborted = error?.name === "AbortError";
    console.error("Transcribe error:", error);
    return NextResponse.json(
      { error: aborted ? "تبدیلِ گفتار طول کشید و لغو شد." : "خطا در تبدیلِ گفتار به متن." },
      { status: aborted ? 504 : 500 }
    );
  }
}
