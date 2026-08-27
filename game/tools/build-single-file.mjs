// ساخت نسخهٔ تک‌فایلی و کاملاً خودکفا از برنامه
// خروجی‌ها:
//   dist/kargah-mashinhaye-sadeh.html  → یک فایل HTML مستقل برای اجرای آفلاین
//   dist/artifact.html                 → همان محتوا بدون تگ‌های html/head/body
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

// ترتیب وابستگی ماژول‌ها (از پایه به بالا)
const MODULES = [
  'src/core/format.js',
  'src/physics/constants.js',
  'src/physics/machines.js',
  'src/physics/capstone.js',
  'src/content/controls.js',
  'src/content/missions.js',
  'src/content/curriculum.js',
  'src/render/draw.js',
  'src/render/world.js',
  'src/render/scenes.js',
  'src/render/stage.js',
  'src/ui/components.js',
  'src/audio.js',
  'src/app.js'
];

/** حذف دستورهای import/export تا همهٔ ماژول‌ها در یک دامنه ادغام شوند */
function stripModuleSyntax(code) {
  return code
    .replace(/import\s+\{[\s\S]*?\}\s+from\s+['"][^'"]+['"];?/g, '')
    .replace(/import\s+[\w*]+(?:\s*,\s*\{[\s\S]*?\})?\s+from\s+['"][^'"]+['"];?/g, '')
    .replace(/^\s*export\s*\{[^}]*\}\s*(?:from\s*['"][^'"]+['"]\s*)?;?\s*$/gm, '')
    .replace(/^(\s*)export\s+(?=(?:const|let|var|function|class|async))/gm, '$1');
}

const bundle = MODULES
  .map((m) => `\n/* ══════ ${m} ══════ */\n${stripModuleSyntax(read(m))}`)
  .join('\n');

// فونت‌ها به صورت data URI
const fontData = (file) => readFileSync(join(root, 'assets/fonts', file)).toString('base64');
let css = read('src/style.css')
  .replace("url('../assets/fonts/vazirmatn-arabic.woff2')", `url(data:font/woff2;base64,${fontData('vazirmatn-arabic.woff2')})`)
  .replace("url('../assets/fonts/vazirmatn-latin.woff2')", `url(data:font/woff2;base64,${fontData('vazirmatn-latin.woff2')})`);

// بدنهٔ صفحه از index.html
const html = read('index.html');
const body = html
  .slice(html.indexOf('<body>') + 6, html.indexOf('</body>'))
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .trim();

const title = 'کارگاه ماشین‌های ساده';
const inner = `<title>${title}</title>
<style>
${css}
/* در نسخهٔ تک‌فایلی، ریشهٔ سند ممکن است در اختیار ما نباشد */
html, body { direction: rtl; }
</style>

${body}

<script>
(function () {
'use strict';
${bundle}
})();
</script>`;

mkdirSync(join(root, 'dist'), { recursive: true });

writeFileSync(join(root, 'dist/artifact.html'), inner, 'utf8');
writeFileSync(join(root, 'dist/kargah-mashinhaye-sadeh.html'),
  `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="آزمایشگاه تعاملی ماشین‌های ساده برای علوم تجربی پایهٔ پنجم دبستان">
${inner.replace(/^<title>/, '<title>').replace('</style>', '</style>\n</head>\n<body>').replace('<script>', '<script>')}
</body>
</html>`, 'utf8');

const size = (p) => (readFileSync(join(root, p)).length / 1024).toFixed(0);
console.log(`ساخته شد:
  dist/kargah-mashinhaye-sadeh.html  (${size('dist/kargah-mashinhaye-sadeh.html')} کیلوبایت)
  dist/artifact.html                 (${size('dist/artifact.html')} کیلوبایت)`);
