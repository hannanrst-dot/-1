/**
 * ضبطِ یکپارچهٔ صدا در مرورگر (MediaRecorder) برای فرستادن به سرورِ خودمان.
 *
 * برخلافِ تشخیصِ گفتارِ مرورگر که هر چند ثانیه خودش قطع و دوباره وصل می‌شود (بوق و
 * جاافتادنِ کلمات)، اینجا میکروفون یک‌بار باز می‌شود و تا لحظهٔ رهاکردن یکسره ضبط
 * می‌کند. نه بوقی هست، نه قطع‌شدنی.
 */

/** بهترین قالبِ صوتیِ پشتیبانی‌شده در این مرورگر. */
function pickMime(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",           // سافاری
  ];
  if (typeof MediaRecorder === "undefined") return "";
  for (const m of candidates) {
    try { if (MediaRecorder.isTypeSupported(m)) return m; } catch { /* ignore */ }
  }
  return "";
}

export function recorderSupported(): boolean {
  return typeof window !== "undefined"
    && typeof MediaRecorder !== "undefined"
    && !!navigator.mediaDevices?.getUserMedia;
}

export interface VoiceRecorder {
  /** پایانِ ضبط و گرفتنِ فایلِ صدا. اگر چیزی ضبط نشده باشد null برمی‌گرداند. */
  stop: () => Promise<Blob | null>;
  /** لغو بدونِ استفاده از صدا. */
  cancel: () => void;
}

export async function startRecording(): Promise<VoiceRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  const mime = pickMime();
  const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
  rec.start();

  const release = () => { try { stream.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ } };

  return {
    stop: () =>
      new Promise<Blob | null>((resolve) => {
        if (rec.state === "inactive") { release(); resolve(null); return; }
        rec.onstop = () => {
          release();
          const type = rec.mimeType || mime || "audio/webm";
          resolve(chunks.length ? new Blob(chunks, { type }) : null);
        };
        try { rec.stop(); } catch { release(); resolve(null); }
      }),
    cancel: () => { try { if (rec.state !== "inactive") rec.stop(); } catch { /* ignore */ } release(); },
  };
}

/** فرستادنِ صدا به سرورِ خودمان و گرفتنِ متن. */
export async function transcribeBlob(blob: Blob): Promise<string> {
  const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
  const fd = new FormData();
  fd.append("audio", blob, `voice.${ext}`);
  const res = await fetch("/api/voice/transcribe", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "خطا در تبدیلِ گفتار");
  return String(data?.text || "").trim();
}
