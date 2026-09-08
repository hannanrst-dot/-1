// اهداف برنامهٔ درسی، پیشنهادهای کلاسی و گزارش قابل چاپ آزمایش
import { fa, num, escapeHtml } from '../core/format.js';

export const CURRICULUM = [
  { title: 'اصطکاک، چرخ و غلتک', text: 'اصطکاک مانع حرکت است؛ چرخ و غلتک با تبدیل مالش به غلتش، نیروی لازم را چند برابر کم می‌کنند.' },
  { title: 'سطح شیب‌دار', text: 'رمپ درازتر نیروی کمتری می‌خواهد اما مسیر بلندتری دارد؛ کارِ انجام‌شده تقریباً ثابت می‌ماند.' },
  { title: 'اهرم و بازوی نیرو', text: 'قانون تعادل گشتاور و تشخیص سه نوع اهرم از روی جای تکیه‌گاه، بار و نیرو.' },
  { title: 'قرقره‌های ثابت، متحرک و مرکب', text: 'تفاوت تغییر جهت نیرو با کاهش مقدار نیرو؛ شمردن رشته‌های نگهدارندهٔ بار.' },
  { title: 'چرخ و محور', text: 'چرخ و محور اهرمی چرخان است و مزیت مکانیکی آن نسبت شعاع چرخ به شعاع محور است.' },
  { title: 'گوه و پیچ', text: 'گوه سطح شیب‌دارِ متحرک است و پیچ سطح شیب‌داری که دور استوانه پیچیده شده.' },
  { title: 'چرخ‌دنده‌ها', text: 'دادوستد سرعت و گشتاور در جفت چرخ‌دنده و کاربرد آن در دوچرخه و آسیاب.' },
  { title: 'کار، انرژی و بازده', text: 'هیچ ماشینی مقدار کار را کم نمی‌کند؛ فقط آن را آسان‌تر می‌کند و بخشی از انرژی صرف اصطکاک می‌شود.' }
];

export const CLASSROOM_TIPS = [
  'هر بار فقط یک متغیر را عوض کنید و بقیه را ثابت نگه دارید — این همان «آزمایش منصفانه» است.',
  'پیش از زدن دکمهٔ اجرا، از دانش‌آموز بپرسید نیرو زیاد می‌شود یا کم، سپس عدد جدول را با حدس او مقایسه کنید.',
  'دو ستون «مسافت جابه‌جایی بار» و «مسافتی که ما طی می‌کنیم» را کنار هم بخوانید؛ کلید فهم پایستگی کار همین‌جاست.',
  'کلید «اصطکاک: آرمانی» را بزنید تا اختلاف مزیت مکانیکی آرمانی و واقعی و معنای بازده روشن شود.',
  'با «شتاب گرانش» می‌توانید بین مقدار کتاب درسی (۱۰) و مقدار واقعی (۹٫۸۱) جابه‌جا شوید و اثرش را نشان دهید.',
  'چند تنظیم مختلف را «ثبت اندازه‌گیری» کنید تا جدول مقایسه ساخته شود، بعد گزارش را چاپ بگیرید.'
];

const row = (cells, tag = 'td') => `<tr>${cells.map((c) => `<${tag}>${c}</${tag}>`).join('')}</tr>`;

/** صفحهٔ HTML قابل چاپ از آزمایش جاری به‌همراه جدول ثبت‌شده‌ها */
export function reportHTML({ machineName, setup, lab, steps, result, log = [] }) {
  const date = new Date().toLocaleDateString('fa-IR');
  const stepRows = steps.map((s, i) => row([
    fa(i + 1),
    escapeHtml(s.name),
    `<code>${escapeHtml(s.formula)}</code>`,
    s.work && s.work !== '—' ? escapeHtml(s.work) : '—',
    `<b>${escapeHtml(String(s.value))}</b> ${escapeHtml(s.unit || '')}`
  ])).join('');

  const logRows = log.length
    ? log.map((r, i) => row([
      fa(i + 1), escapeHtml(r.machineName), escapeHtml(r.setup),
      fa(num(r.effortN, 1)), fa(num(r.maActual, 2)), fa(num(r.effortDistanceM, 2)), fa(r.efficiencyPercent)
    ])).join('')
    : `<tr><td colspan="7">اندازه‌گیری ثبت‌شده‌ای نیست.</td></tr>`;

  return `<!DOCTYPE html>
<html dir="rtl" lang="fa"><head><meta charset="UTF-8">
<title>گزارش آزمایش — ${escapeHtml(machineName)}</title>
<style>
  body { font-family: Vazirmatn, Tahoma, sans-serif; direction: rtl; color: #16283c; line-height: 1.75; padding: 24px; max-width: 940px; margin: auto; }
  h1 { font-size: 19px; margin-bottom: 2px; } h2 { font-size: 14.5px; margin: 20px 0 6px; color: #0b5f96; }
  .head { border-bottom: 2px solid #0b5f96; padding-bottom: 10px; }
  .meta { display: flex; flex-wrap: wrap; gap: 16px; font-size: 12.5px; color: #4a627a; margin-top: 4px; }
  table { border-collapse: collapse; width: 100%; font-size: 12px; }
  th, td { border: 1px solid #ccd7e1; padding: 5px 7px; text-align: center; }
  th { background: #eef4f9; }
  td:nth-child(2), td:nth-child(3) { text-align: right; }
  code { font-family: Consolas, monospace; direction: ltr; display: inline-block; }
  ul { padding-right: 20px; font-size: 12.5px; }
  .sign { margin-top: 22px; border-top: 1px dashed #9fb3c4; padding-top: 10px; font-size: 12.5px; }
  .box { height: 60px; border: 1px solid #ccd7e1; border-radius: 6px; margin-top: 5px; }
  @media print { .noprint { display: none } body { padding: 0 } }
</style></head><body>
<div class="head">
  <h1>گزارش آزمایش — ${escapeHtml(machineName)}</h1>
  <div class="meta">
    <span><b>تنظیم:</b> ${escapeHtml(setup)}</span>
    <span><b>g =</b> ${fa(lab.g)} m/s²</span>
    <span><b>اصطکاک:</b> ${lab.ideal ? 'آرمانی (صفر)' : 'واقعی'}</span>
    <span><b>تاریخ:</b> ${date}</span>
  </div>
</div>

<h2>۱) محاسبهٔ گام‌به‌گام</h2>
<table>
  <thead>${row(['#', 'گام', 'فرمول', 'جای‌گذاری اعداد', 'نتیجه'], 'th')}</thead>
  <tbody>${stepRows}</tbody>
</table>

<h2>۲) نتیجهٔ نهایی</h2>
<table>
  <thead>${row(['نیروی لازم (N)', 'مزیت مکانیکی', 'مسافت بار (m)', 'مسافت نیرو (m)', 'کار مفید (J)', 'کارِ ما (J)', 'بازده (٪)'], 'th')}</thead>
  <tbody>${row([
    fa(num(result.effortN, 1)),
    fa(num(result.maActual ?? 1, 2)),
    fa(num(result.loadDistanceM ?? 0, 2)),
    fa(num(result.effortDistanceM ?? 0, 2)),
    fa(num(result.workOutJ ?? 0, 1)),
    fa(num(result.workInJ ?? 0, 1)),
    fa(Math.round((result.efficiency ?? 1) * 100))
  ])}</tbody>
</table>
<p style="font-size:12.5px">${escapeHtml(result.insightFa || '')}</p>

<h2>۳) جدول اندازه‌گیری‌های ثبت‌شده</h2>
<table>
  <thead>${row(['#', 'ماشین', 'تنظیم', 'نیرو (N)', 'مزیت مکانیکی', 'مسافت نیرو (m)', 'بازده (٪)'], 'th')}</thead>
  <tbody>${logRows}</tbody>
</table>

<h2>۴) اهداف یادگیری</h2>
<ul>${CURRICULUM.map((g) => `<li><b>${escapeHtml(g.title)}:</b> ${escapeHtml(g.text)}</li>`).join('')}</ul>

<div class="sign">
  <b>نتیجه‌گیری دانش‌آموز:</b><div class="box"></div>
  <b style="display:block;margin-top:10px">بازخورد آموزگار:</b><div class="box"></div>
</div>

<p class="noprint" style="text-align:center;margin-top:20px">
  <button onclick="window.print()" style="padding:9px 20px;font-size:13px;border:0;border-radius:7px;background:#0b5f96;color:#fff;cursor:pointer">🖨 چاپ / ذخیره PDF</button>
</p>
</body></html>`;
}
