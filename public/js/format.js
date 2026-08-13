/* =====================================================================
   ابزارهای قالب‌بندی: اعداد فارسی، پول (تومان)، و تاریخ شمسی (جلالی).
   الگوریتم تبدیل تاریخ کاملاً محلی و بدون کتابخانه خارجی است.
   ===================================================================== */
(function (global) {
  'use strict';
  const FA = '۰۱۲۳۴۵۶۷۸۹';

  function toFa(n) {
    return String(n).replace(/[0-9]/g, (d) => FA[+d]);
  }
  function toEn(s) {
    return String(s).replace(/[۰-۹]/g, (d) => FA.indexOf(d)).replace(/٬|,/g, '');
  }
  /** جداکننده هزارگان + رقم فارسی */
  function num(n) {
    if (n == null || n === '') return '۰';
    const x = Math.round(Number(n));
    return toFa(x.toLocaleString('en-US'));
  }
  /** مبلغ ریالی ذخیره‌شده را به تومان با واحد نمایش می‌دهد */
  function toman(rial) {
    const t = Math.round(Number(rial || 0) / 10);
    return toFa(t.toLocaleString('en-US')) + ' تومان';
  }
  /** فقط عدد تومان بدون واحد */
  function tomanNum(rial) {
    return toFa(Math.round(Number(rial || 0) / 10).toLocaleString('en-US'));
  }

  // --- تبدیل میلادی به شمسی ---
  function gregorianToJalali(gy, gm, gd) {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = gy <= 1600 ? 0 : 979;
    gy -= gy <= 1600 ? 621 : 1600;
    const gy2 = gm > 2 ? gy + 1 : gy;
    let days = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100)
      + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
    jy += 33 * Math.floor(days / 12053); days %= 12053;
    jy += 4 * Math.floor(days / 1461); days %= 1461;
    if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
    const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
    return [jy, jm, jd];
  }

  const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

  /** ورودی رشته تاریخ SQLite (UTC) → تاریخ شمسی خوانا */
  function jalali(dateStr, withTime) {
    if (!dateStr) return '';
    const d = new Date(dateStr.replace(' ', 'T') + (dateStr.includes('Z') ? '' : 'Z'));
    if (isNaN(d)) return '';
    const [jy, jm, jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    let out = `${toFa(jd)} ${MONTHS[jm - 1]} ${toFa(jy)}`;
    if (withTime) {
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      out += ` - ${toFa(hh)}:${toFa(mm)}`;
    }
    return out;
  }
  function jalaliShort(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr.replace(' ', 'T') + (dateStr.includes('Z') ? '' : 'Z'));
    if (isNaN(d)) return '';
    const [jy, jm, jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return `${toFa(jy)}/${toFa(String(jm).padStart(2, '0'))}/${toFa(String(jd).padStart(2, '0'))}`;
  }

  global.Fmt = { toFa, toEn, num, toman, tomanNum, jalali, jalaliShort, MONTHS, gregorianToJalali };
})(window);
