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
</style>
</head>
<body>
<canvas id="stage"></canvas>
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
