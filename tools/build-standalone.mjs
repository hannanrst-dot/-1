/**
 * ساخت نسخه‌ی «تک‌فایلی» هر بازی.
 * ────────────────────────────────
 * هر بازی به یک فایل HTML مستقل تبدیل می‌شود که CSS، موتور مشترک و کد بازی
 * همه داخلش هستند. این فایل بدون سرور و فقط با دوبار کلیک باز می‌شود، و
 * همان فایل داخل Artifact و داخل زیپ هم کار می‌کند.
 *
 * اجرا:  node tools/build-standalone.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist');

const games = JSON.parse(await fs.readFile(path.join(ROOT, 'data/games.json'), 'utf8'))
  .grades.flatMap((g) => g.games.map((x) => ({ ...x, grade: g.title })));

const cssRaw = await fs.readFile(path.join(ROOT, 'public/assets/css/base.css'), 'utf8');

// در نسخه‌ی تک‌فایلی، بلوک‌های @font-face به فایل‌های محلی پروژه اشاره می‌کنند
// که کنار این فایل وجود ندارند؛ فونت را به‌جایش از گوگل‌فونتس می‌گیریم.
const css = cssRaw.replace(/@font-face\s*\{[\s\S]*?\}/g, '')
                  .replace(/\/\* فونت وزیرمتن[\s\S]*?\*\//, '');
const engine = await fs.readFile(path.join(ROOT, 'public/assets/js/engine.js'), 'utf8');

/** موتور را از حالت ماژول درمی‌آورد تا بشود کنار کد بازی گذاشت. */
const engineInline = engine.replace(/^export\s+/gm, '');

/** فونت وزیرمتن از گوگل‌فونتس — هم داخل Artifact مجاز است هم عموماً در دسترس. */
const FONT_LINK =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;800;900&display=swap">';

/** کلیکِ «خانه» داخل iframe به صفحه‌ی والد پیام می‌دهد، نه اینکه ناوبری کند. */
const HOME_BRIDGE = `<script>
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-home]');
  if (!a) return;
  if (window.parent !== window) { e.preventDefault(); parent.postMessage('bazi:home', '*'); }
});
<\/script>`;

await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });

for (const game of games) {
  const dir = path.join(ROOT, 'public', game.path);
  let html = await fs.readFile(path.join(dir, 'index.html'), 'utf8');
  const js = await fs.readFile(path.join(dir, 'game.js'), 'utf8');

  // حذف دستور import و چسباندن موتور به ابتدای کد بازی
  const jsInline = js.replace(/^import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"];\s*$/m, '');

  html = html
    .replace('<link rel="stylesheet" href="/assets/css/base.css">',
             `${FONT_LINK}\n<style>\n${css}\n</style>`)
    // اسکریپت معمولی، نه module: اسکریپت‌های module داخل iframe با srcdoc
    // بی‌صدا اجرا نمی‌شوند، و چون همه‌چیز درون‌ریزی شده اصلاً نیازی به module نیست.
    .replace('<script type="module" src="./game.js"></script>',
             `<script>\n${engineInline}\n\n/* ── کد بازی ── */\n${jsInline}\n<\/script>\n${HOME_BRIDGE}`)
    .replace('<a class="btn btn--ghost" href="/">◀ خانه</a>',
             '<a class="btn btn--ghost" href="index.html" data-home>◀ خانه</a>');

  const file = path.join(OUT, `${game.id}.html`);
  await fs.writeFile(file, html, 'utf8');
  console.log(`✔ ${path.relative(ROOT, file)}  (${Math.round(Buffer.byteLength(html) / 1024)} کیلوبایت)`);
}

/* ── صفحه‌ی خانه‌ی آفلاین ─────────────────────────────────────── */

const hubSrc = await fs.readFile(path.join(ROOT, 'public/index.html'), 'utf8');
const cards = games.map((g) => `
      <a class="gcard" href="${g.id}.html" style="border-color:${g.color}22">
        <div class="gcard__emoji" style="background:${g.color}1a">${g.emoji}</div>
        <h3 class="gcard__title">${g.title}</h3>
        <div class="gcard__meta"><span class="tag">${g.subject}</span><span>${g.chapter}</span></div>
        <p class="gcard__goal">${g.goal}</p>
        <span class="gcard__go" style="color:${g.color}">شروع بازی ←</span>
      </a>`).join('');

const hub = hubSrc
  .replace('<link rel="stylesheet" href="/assets/css/base.css">', `${FONT_LINK}\n<style>\n${css}\n</style>`)
  .replace('<div id="catalog" class="loading">در حال بارگذاری بازی‌ها…</div>', `
    <section>
      <div class="grade-head">
        <h2 style="color:#4b7bec">پایه‌ی سوم دبستان</h2>
        <div class="grade-head__bar" style="background:#4b7bec33"></div>
        <span class="chip">${['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'][games.length] ?? games.length} بازی</span>
      </div>
      <div class="grid">${cards}</div>
    </section>`)
  .replace(/<script type="module">[\s\S]*?<\/script>/, '');

await fs.writeFile(path.join(OUT, 'index.html'), hub, 'utf8');
console.log(`✔ dist/index.html  (${Math.round(Buffer.byteLength(hub) / 1024)} کیلوبایت)`);
