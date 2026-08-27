// Teacher & Parent Mode (راهنمای معلمان و اولیا + دفترچه‌ی مخترع)
import { toPersianDigits } from './physics.js';

export const CURRICULUM_GOALS = [
  {
    code: 'SCI-G5-M1',
    title: 'اصطکاک، چرخ و غلتک',
    text: 'دانش‌آموز درمی‌یابد که اصطکاک مانع حرکت است و استفاده از چرخ و غلتک (تبدیل مالش به غلتش) نیروی لازم برای جابجایی را تا ۹۰٪ کاهش می‌دهد.'
  },
  {
    code: 'SCI-G5-M2',
    title: 'سطح شیب‌دار و دادوستد نیرو و مسافت',
    text: 'کشف اینکه سطح شیب‌دار کار را سبک‌تر می‌کند؛ شیب ملایم‌تر نیروی کمتری نیاز دارد اما مسافت حرکت افزایش می‌یابد (پایستگی کار و انرژی).'
  },
  {
    code: 'SCI-G5-M3',
    title: 'اهرم‌ها و بازوی نیرو',
    text: 'تشخیص تکیه‌گاه، بار و محل اعمال نیرو در اهرم؛ درک اینکه هرچه بازوی نیرو نسبت به بازوی بار بلندتر باشد، نیروی کمتری برای غلبه بر بار لازم است.'
  },
  {
    code: 'SCI-G5-M4',
    title: 'قرقره‌های ثابت و متحرک',
    text: 'مقایسه عملکرد قرقره ثابت (صرفاً تغییر جهت نیرو بدون کاهش مقدار آن) با قرقره متحرک (تقسیم بار بین طناب‌ها و نصف کردن نیروی لازم با دوبرابر شدن طول طناب).'
  },
  {
    code: 'SCI-G5-M5',
    title: 'طراحی مهندسی و تفکر سیستمی',
    text: 'توانایی تلفیق ماشین‌های ساده برای حل یک چالش پیچیده در دنیای واقعی با در نظر گرفتن متغیرهای پایداری، ایمنی و بهینه‌سازی منابع.'
  }
];

export class TeacherManager {
  constructor() {
    this.logs = [];
    this.loadLogs();
  }

  loadLogs() {
    try {
      const saved = localStorage.getItem('rescue_cargo_teacher_logs');
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch (e) {
      this.logs = [];
    }
  }

  saveLogs() {
    try {
      localStorage.setItem('rescue_cargo_teacher_logs', JSON.stringify(this.logs));
    } catch (e) {}
  }

  logExperiment({ missionId, missionTitle, setupDesc, forceN, distanceM, isSuccess, discovery }) {
    const entry = {
      timestamp: new Date().toLocaleTimeString('fa-IR'),
      missionId,
      missionTitle,
      setupDesc,
      forceN,
      distanceM,
      isSuccess,
      discovery
    };
    this.logs.unshift(entry);
    if (this.logs.length > 25) this.logs.pop();
    this.saveLogs();
  }

  generatePrintableNotebookHTML(studentName = 'مخترع کوهستان') {
    const logsHTML = this.logs.map((log, idx) => `
      <div style="border-bottom: 1px solid #ddd; padding: 10px 0; font-size: 13px;">
        <strong>آزمایش ${toPersianDigits(idx + 1)}: ${log.missionTitle}</strong> (${log.timestamp})<br/>
        <span>⚙️ پیکربندی: ${log.setupDesc}</span><br/>
        <span>⚡ نیروی سنجیده‌شده: <strong>${toPersianDigits(log.forceN)} نیوتون</strong> | 📏 مسافت: <strong>${toPersianDigits(log.distanceM)} متر</strong> | وضعیت: ${log.isSuccess ? '✅ موفق و ایمن' : '⚠️ نیازمند بهینه‌سازی'}</span>
        ${log.discovery ? `<br/><span style="color: #2e7d32;">💡 نتیجه‌گیری علمی: ${log.discovery}</span>` : ''}
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <title>دفترچه‌ی گزارش مخترع - بازی نجات بار از کوه</title>
        <style>
          body { font-family: Tahoma, 'Vazirmatn', sans-serif; direction: rtl; padding: 25px; color: #2c3e50; line-height: 1.8; }
          .header { text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 15px; margin-bottom: 20px; }
          .badge { background: #e8f4f8; padding: 5px 12px; border-radius: 6px; font-weight: bold; }
          .section { margin-top: 20px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>🏔️ دفترچه‌ی ثبت آزمایش و اختراع دانش‌آموز</h2>
          <p>درس علوم تجربی پایه پنجم دبستان — مبحث ماشین‌های ساده و نیرو</p>
          <p><strong>نام پژوهشگر:</strong> ${studentName} | <strong>تاریخ گزارش:</strong> ${new Date().toLocaleDateString('fa-IR')}</p>
        </div>

        <div class="section">
          <h3>📋 خلاصه‌ی اهداف یادگیری کسب‌شده:</h3>
          <ul>
            ${CURRICULUM_GOALS.map(g => `<li><strong>${g.title}:</strong> ${g.text}</li>`).join('')}
          </ul>
        </div>

        <div class="section">
          <h3>🔬 گزارش آزمایش‌ها و اندازه‌گیری‌های ثبت‌شده در بازی:</h3>
          ${logsHTML || '<p>هنوز آزمایشی ثبت نشده است.</p>'}
        </div>

        <div class="section" style="margin-top: 30px; border-top: 1px dashed #aaa; padding-top: 15px;">
          <h4>✍️ نظر و بازخورد آموزگار / والد:</h4>
          <p style="height: 60px; border: 1px solid #ccc; border-radius: 4px; padding: 8px;">...................................................................................................</p>
        </div>

        <div style="text-align: center; margin-top: 25px;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer;">🖨️ چاپ یا ذخیره PDF گزارش</button>
        </div>
      </body>
      </html>
    `;
  }
}

export const teacher = new TeacherManager();
