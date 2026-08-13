'use strict';
/**
 * رجیستری موتورهای تشخیص گفتار (Speech-to-Text).
 *
 * نکته معماری مهم: تبدیل «صدا به متن» در معماری این پروژه سمت مرورگر و با
 * Web Speech API انجام می‌شود (بدون وابستگی به سرویس خارجی و بدون هزینه).
 * سرور فقط «متن» را دریافت و پردازش می‌کند.
 *
 * این ماژول یک Interface یکسان تعریف می‌کند تا اگر در آینده خواستید تشخیص
 * گفتار را سمت سرور و با موتور دیگری (مثلاً Vosk، گوگل، یا یک سرویس ایرانی)
 * انجام دهید، فقط یک recognizer جدید ثبت کنید و متغیر محیطی VOICE_RECOGNIZER
 * را تغییر دهید — بدون تغییر در بدنه اپ.
 *
 * قرارداد (Interface):
 *   recognizer.info() -> { engine, mode, lang }
 *   recognizer.transcribe(audioBuffer, opts) -> Promise<{ text }>
 */
const config = require('../config');

const registry = new Map();

/** موتور مرورگری: تبدیل صدا سمت کلاینت انجام می‌شود؛ سرور متن آماده می‌گیرد. */
registry.set('web', {
  info: () => ({ engine: 'web', mode: 'client-side', lang: config.voice.lang }),
  transcribe: async () => {
    throw new Error('موتور «web» تبدیل صدا را در مرورگر انجام می‌دهد؛ سرور مستقیماً صدا را پردازش نمی‌کند.');
  },
});

/**
 * نمونه موتور سمت سرور برای توسعه آینده (غیرفعال به‌صورت پیش‌فرض).
 * برای فعال‌سازی، پیاده‌سازی transcribe را تکمیل و VOICE_RECOGNIZER=server کنید.
 */
registry.set('server-stub', {
  info: () => ({ engine: 'server-stub', mode: 'server-side', lang: config.voice.lang }),
  transcribe: async () => {
    throw new Error('موتور سمت سرور هنوز پیاده‌سازی نشده است. این یک نقطه توسعه آینده است.');
  },
});

function getRecognizer(name = config.voice.recognizer) {
  return registry.get(name) || registry.get('web');
}

function registerRecognizer(name, impl) {
  registry.set(name, impl);
}

module.exports = { getRecognizer, registerRecognizer, registry };
