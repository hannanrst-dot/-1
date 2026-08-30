/**
 * ساخت نسخه‌ی مناسبِ Artifact از هر بازی.
 * ───────────────────────────────────────
 * صفحه‌ی Artifact خودش پوسته‌ی <!doctype>/<html>/<head>/<body> را اضافه می‌کند،
 * پس اینجا فقط محتوای داخل بدنه را بیرون می‌کشیم و اسکلت سند را حذف می‌کنیم.
 *
 * اجرا:  node tools/build-artifact.mjs <پوشه-خروجی>
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = process.argv[2] || path.join(ROOT, 'dist', 'artifact');

const catalog = JSON.parse(await fs.readFile(path.join(ROOT, 'data/games.json'), 'utf8'))
  .grades.flatMap((g) => g.games);

/** دکمه‌ی «خانه» در Artifact باید به صفحه‌ی قبلی برگردد، نه به فایل محلی. */
const HOME_SCRIPT = `<script>
document.documentElement.lang = 'fa';
document.documentElement.dir = 'rtl';
(function () {
  const home = document.querySelector('a[data-home]');
  if (!home) return;
  if (history.length > 1) {
    home.addEventListener('click', (e) => { e.preventDefault(); history.back(); });
  } else {
    home.hidden = true;              // اگر مستقیم باز شده، جایی برای برگشتن نیست
  }
})();
<\/script>`;

await fs.mkdir(outDir, { recursive: true });

for (const g of catalog) {
  let html = await fs.readFile(path.join(ROOT, 'dist', `${g.id}.html`), 'utf8');

  html = html
    .replace(/<!doctype html>\s*/i, '')
    .replace(/<html[^>]*>\s*/i, '')
    .replace(/<\/html>\s*$/i, '')
    .replace(/<head>\s*/i, '')
    .replace(/<\/head>\s*/i, '')
    .replace(/<body>\s*/i, '')
    .replace(/<\/body>\s*/i, '')
    .replace(/<meta[^>]*>\s*/gi, '')                 // charset و viewport را خود Artifact می‌گذارد
    .replace(/<link rel="icon"[^>]*>\s*/i, '')       // آیکن از پارامتر favicon می‌آید
    // پل پیام‌رسانی iframe لازم نیست؛ جایش رفتار «برگشت» می‌نشیند
    .replace(/<script>\s*document\.addEventListener\('click'[\s\S]*?<\/script>\s*/i, '')
    .trim() + '\n' + HOME_SCRIPT + '\n';

  const file = path.join(outDir, `${g.id}.html`);
  await fs.writeFile(file, html, 'utf8');
  console.log(`✔ ${path.relative(ROOT, file)}  (${Math.round(Buffer.byteLength(html) / 1024)} کیلوبایت)`);
}
