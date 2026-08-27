// اهداف برنامهٔ درسی و دفترچهٔ گزارش دانش‌آموز
import { fa, num, escapeHtml } from '../core/format.js';

export const CURRICULUM = [
  { code: 'م-۱', title: 'اصطکاک، چرخ و غلتک', text: 'دانش‌آموز درمی‌یابد اصطکاک مانع حرکت است و چرخ و غلتک با تبدیل مالش به غلتش، نیروی لازم را تا حدود یک‌دهم کاهش می‌دهند.' },
  { code: 'م-۲', title: 'سطح شیب‌دار', text: 'کشف رابطهٔ معکوس نیرو و مسافت: رمپ درازتر نیروی کمتری می‌خواهد اما مسیر بلندتری دارد؛ کارِ انجام‌شده تقریباً ثابت می‌ماند.' },
  { code: 'م-۳', title: 'اهرم و بازوی نیرو', text: 'شناخت تکیه‌گاه، بار و نیرو؛ درک قانون تعادل گشتاور و تشخیص سه نوع اهرم در ابزارهای روزمره.' },
  { code: 'م-۴', title: 'قرقره‌های ثابت، متحرک و مرکب', text: 'تمایز میان تغییر جهت نیرو (قرقرهٔ ثابت) و کاهش مقدار نیرو (قرقرهٔ متحرک)، و شمردن رشته‌های نگهدارندهٔ بار.' },
  { code: 'م-۵', title: 'چرخ و محور', text: 'درک اینکه چرخ و محور یک اهرم چرخان است و مزیت مکانیکی آن از نسبت شعاع‌ها به دست می‌آید.' },
  { code: 'م-۶', title: 'گوه و پیچ', text: 'شناخت گوه به‌عنوان سطح شیب‌دار متحرک و پیچ به‌عنوان سطح شیب‌دار پیچیده‌شده دور استوانه.' },
  { code: 'م-۷', title: 'چرخ‌دنده‌ها', text: 'درک دادوستد سرعت و گشتاور در جفت چرخ‌دنده و کاربرد آن در دوچرخه و آسیاب.' },
  { code: 'م-۸', title: 'کار، انرژی و بازده', text: 'شناخت اینکه هیچ ماشینی کار را کم نمی‌کند؛ فقط آن را آسان‌تر می‌کند، و بخشی از انرژی صرف اصطکاک می‌شود.' },
  { code: 'م-۹', title: 'طراحی مهندسی و تفکر سیستمی', text: 'ترکیب چند ماشین ساده برای حل یک مسئلهٔ واقعی، با در نظر گرفتن ایمنی، نیرو و محدودیت منابع.' }
];

export const CLASSROOM_TIPS = [
  'پیش از هر آزمایش، از دانش‌آموز بخواهید پیش‌بینی خود را انتخاب کند؛ یادگیری وقتی عمیق می‌شود که پیش‌بینی با نتیجه مقایسه شود.',
  'در حالت آزمایشگاه، فقط یک متغیر را هر بار تغییر دهید و بقیه را ثابت نگه دارید — این همان «آزمایش منصفانه» است.',
  'از نمودار کنار کنترل‌ها استفاده کنید تا دانش‌آموز رابطهٔ عددی را به شکل دیداری هم ببیند.',
  'روی «مسافت کشیدن» تأکید کنید: هر بار که نیرو کم می‌شود، مسافت زیاد می‌شود. این کلید فهم پایستگی کار است.',
  'دکمهٔ «بردارهای نیرو» را روشن کنید تا وزن، اصطکاک، نیروی تکیه‌گاه و نیروی دست هم‌زمان دیده شوند.',
  'جدول اندازه‌گیری را در پایان کلاس چاپ کنید و از دانش‌آموز بخواهید نتیجه‌گیری خود را زیر آن بنویسد.'
];

/** ساخت صفحهٔ HTML قابل چاپ از گزارش آزمایش‌ها */
export function notebookHTML({ studentName = 'مخترع کوهستان', rows = [], discoveries = [], badges = [] }) {
  const date = new Date().toLocaleDateString('fa-IR');
  const rowsHTML = rows.length
    ? rows.map((r, i) => `
      <tr>
        <td>${fa(i + 1)}</td>
        <td>${escapeHtml(r.machineName)}</td>
        <td class="right">${escapeHtml(r.setup)}</td>
        <td><b>${fa(num(r.effortN, 0))}</b></td>
        <td>${fa(num(r.effortDistanceM, 1))}</td>
        <td>${fa(num(r.workInJ, 0))}</td>
        <td>${r.success ? '✅' : '⚠️'}</td>
      </tr>`).join('')
    : '<tr><td colspan="7">هنوز آزمایشی ثبت نشده است.</td></tr>';

  return `<!DOCTYPE html>
<html dir="rtl" lang="fa"><head><meta charset="UTF-8">
<title>دفترچهٔ مخترع — کارگاه ماشین‌های ساده</title>
<style>
  body { font-family: Vazirmatn, Tahoma, sans-serif; direction: rtl; color: #16283c; line-height: 1.8; padding: 28px; max-width: 900px; margin: auto; }
  h1 { font-size: 20px; } h2 { font-size: 15px; margin-top: 22px; color: #0b7fc4; }
  .head { text-align: center; border-bottom: 3px solid #0b7fc4; padding-bottom: 12px; }
  .meta { display: flex; gap: 18px; justify-content: center; font-size: 13px; color: #4a627a; }
  table { border-collapse: collapse; width: 100%; font-size: 12.5px; margin-top: 8px; }
  th, td { border: 1px solid #cbd8e3; padding: 6px 8px; text-align: center; }
  th { background: #eef5fa; } td.right { text-align: right; }
  ul { padding-right: 20px; font-size: 13px; }
  .cards { display: flex; flex-wrap: wrap; gap: 8px; }
  .c { border: 1px solid #cbd8e3; border-radius: 8px; padding: 8px 12px; font-size: 12.5px; background: #f7fbfd; }
  .sign { margin-top: 26px; border-top: 1px dashed #9fb3c4; padding-top: 12px; font-size: 13px; }
  .box { height: 70px; border: 1px solid #cbd8e3; border-radius: 8px; margin-top: 6px; }
  @media print { .noprint { display: none; } body { padding: 0; } }
</style></head><body>
<div class="head">
  <h1>🏔️ دفترچهٔ ثبت آزمایش و اختراع</h1>
  <p>کارگاه ماشین‌های ساده — علوم تجربی پایهٔ پنجم دبستان</p>
  <div class="meta"><span><b>نام پژوهشگر:</b> ${escapeHtml(studentName)}</span><span><b>تاریخ:</b> ${date}</span></div>
</div>

<h2>۱) اهداف یادگیری این درس</h2>
<ul>${CURRICULUM.map((g) => `<li><b>${escapeHtml(g.title)}:</b> ${escapeHtml(g.text)}</li>`).join('')}</ul>

<h2>۲) جدول اندازه‌گیری‌های ثبت‌شده</h2>
<table>
  <thead><tr><th>#</th><th>ماشین ساده</th><th>پیکربندی</th><th>نیرو (نیوتون)</th><th>مسافت (متر)</th><th>کار (ژول)</th><th>نتیجه</th></tr></thead>
  <tbody>${rowsHTML}</tbody>
</table>

<h2>۳) کارت‌های کشف باز شده (${fa(discoveries.length)} از ${fa(9)})</h2>
<div class="cards">${discoveries.length
    ? discoveries.map((d) => `<div class="c"><b>${escapeHtml(d.icon)} ${escapeHtml(d.title)}</b><br>${escapeHtml(d.summary)}</div>`).join('')
    : '<div class="c">هنوز کارتی باز نشده است.</div>'}</div>

${badges.length ? `<h2>۴) نشان‌های مهندسی</h2><div class="cards">${badges.map((b) => `<div class="c">${escapeHtml(b.icon)} ${escapeHtml(b.title)}</div>`).join('')}</div>` : ''}

<div class="sign">
  <b>نتیجه‌گیری دانش‌آموز:</b><div class="box"></div>
  <b style="display:block;margin-top:12px">بازخورد آموزگار / والد:</b><div class="box"></div>
</div>

<p class="noprint" style="text-align:center;margin-top:22px">
  <button onclick="window.print()" style="padding:10px 22px;font-size:14px;border:0;border-radius:8px;background:#0b7fc4;color:#fff;cursor:pointer">🖨 چاپ یا ذخیره به صورت PDF</button>
</p>
</body></html>`;
}
