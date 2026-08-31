/**
 * هر بازی را با هستهٔ مشترک در یک فایل HTML مستقل می‌ریزد.
 * اجرا:  node tools/build-games.mjs [نامِ بازی]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'games', 'src');
const OUT = path.join(ROOT, 'games');

const core = await fs.readFile(path.join(SRC, '_core.js'), 'utf8');
const only = process.argv[2];

const files = (await fs.readdir(SRC))
  .filter((f) => f.endsWith('.js') && !f.startsWith('_') && (!only || f.startsWith(only)));

for (const f of files) {
  const src = await fs.readFile(path.join(SRC, f), 'utf8');
  const meta = /\/\*!\s*([\s\S]*?)\*\//.exec(src);
  const info = Object.fromEntries(
    (meta ? meta[1] : '').trim().split('\n')
      .map((l) => l.trim().split(/:\s*/))
      .filter((p) => p.length === 2)
  );
  const body = src.replace(/\/\*!\s*[\s\S]*?\*\/\s*/, '');

  const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${info.title || f}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lalezar&family=Vazirmatn:wght@400;500;700;900&display=swap">
<style>
  html, body { margin: 0; height: 100%; background: ${info.bg || '#241a13'}; overflow: hidden; }
  canvas { display: block; width: 100%; height: 100%; touch-action: none; }

  /* گوشیِ عمودی صحنه را ریز می‌کند؛ بچه باید گوشی را بچرخاند. */
  #rotate { display: none; }
  @media (orientation: portrait) and (max-width: 860px) {
    #stage { display: none; }
    #rotate {
      display: flex; position: fixed; inset: 0;
      flex-direction: column; align-items: center; justify-content: center; gap: 26px;
      background: ${info.bg || '#241a13'}; color: #f6ead2;
      font: 700 20px "Vazirmatn", Tahoma, sans-serif; text-align: center; padding: 32px;
    }
    #rotate svg { animation: tilt 2.4s ease-in-out infinite; }
    @keyframes tilt { 0%, 45% { transform: rotate(0deg); } 65%, 100% { transform: rotate(-90deg); } }
  }
</style>
</head>
<body>
<canvas id="stage"></canvas>
<div id="rotate">
  <svg width="86" height="126" viewBox="0 0 86 126" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="80" height="120" rx="12" stroke="#e8b448" stroke-width="5"/>
    <rect x="15" y="19" width="56" height="88" rx="5" fill="#e8b448" opacity=".28"/>
    <circle cx="43" cy="115" r="4" fill="#e8b448"/>
  </svg>
  <div>گوشی را بچرخان</div>
  <div style="font-weight:400;opacity:.7;font-size:16px">این بازی خوابیده بازی می‌شود</div>
</div>
<script>
'use strict';
${core}
/* ═════════════════ بازی ═════════════════ */
${body}
</script>
</body>
</html>
`;
  const out = path.join(OUT, f.replace(/\.js$/, '.html'));
  await fs.writeFile(out, html, 'utf8');
  console.log(`✔ ${path.relative(ROOT, out)}  (${Math.round(Buffer.byteLength(html)/1024)} کیلوبایت)  ${info.title || ''}`);
}
