/* =====================================================================
   ماژول صوتی سمت کلاینت (نیمهٔ مرورگری Voice Engine).
   - تشخیص گفتار با Web Speech API مرورگر (بدون سرویس خارجی).
   - این بخش پشت یک Interface ساده قرار دارد؛ اگر روزی موتور دیگری خواستید،
     فقط createRecognizer را عوض کنید.
   - متن حاصل به /api/voice/interpret فرستاده می‌شود و «طرح عملیات» برمی‌گردد.
   نکته امنیتی (بخش ۲۹): این ماژول هرگز مستقیماً عملیات مالی را اجرا نمی‌کند؛
   همیشه پرسش رفع ابهام و تأیید کاربر پیش از اجرا نمایش داده می‌شود.
   ===================================================================== */
(function (global) {
  'use strict';

  const SR = global.SpeechRecognition || global.webkitSpeechRecognition;

  function supported() { return !!SR; }

  /** ساخت یک تشخیص‌دهنده گفتار فارسی */
  function createRecognizer() {
    if (!SR) return null;
    const rec = new SR();
    rec.lang = 'fa-IR';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    return rec;
  }

  /** گفتن پاسخ با صدا (بازخورد شنیداری دستیار) */
  function speak(text) {
    try {
      if (!global.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'fa-IR';
      global.speechSynthesis.cancel();
      global.speechSynthesis.speak(u);
    } catch (_) {}
  }

  /**
   * شروع شنیدن یک عبارت.
   * callbacks: { onInterim(text), onFinal(text), onError(msg), onEnd() }
   * برمی‌گرداند: { stop() }
   */
  function listen(callbacks = {}) {
    const rec = createRecognizer();
    if (!rec) {
      callbacks.onError && callbacks.onError('مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند. لطفاً از گوگل‌کروم استفاده کنید یا دستی وارد کنید.');
      return { stop() {} };
    }
    let finalText = '';
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (interim && callbacks.onInterim) callbacks.onInterim(interim);
      if (finalText && callbacks.onFinal) callbacks.onFinal(finalText.trim());
    };
    rec.onerror = (e) => {
      const map = {
        'no-speech': 'صدایی شنیده نشد. دوباره تلاش کنید.',
        'audio-capture': 'میکروفون در دسترس نیست.',
        'not-allowed': 'دسترسی به میکروفون رد شد. لطفاً اجازه دهید.',
        'network': 'خطای شبکه در تشخیص گفتار.',
      };
      callbacks.onError && callbacks.onError(map[e.error] || 'خطا در تشخیص گفتار.');
    };
    rec.onend = () => { callbacks.onEnd && callbacks.onEnd(); };
    try { rec.start(); } catch (_) {}
    return { stop() { try { rec.stop(); } catch (_) {} } };
  }

  /** ارسال متن به سرور برای تفسیر */
  async function interpret(text) {
    const { result } = await API.post('/voice/interpret', { text });
    return result;
  }

  global.Voice = { supported, listen, speak, interpret, createRecognizer };
})(window);
