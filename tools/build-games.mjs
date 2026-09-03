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

/** نام‌هایی که هسته در بالاترین سطح اعلام می‌کند. اگر بازی هم‌نامشان را
    اعلام کند، مرورگر همان اوّل «Identifier has already been declared»
    می‌دهد و کلِّ بازی بالا نمی‌آید — پس قبل از ساخت جلویش را می‌گیریم. */
function topNames(code) {
  const out = new Set();
  const re = /^(?:function|class)\s+([A-Za-z_$][\w$]*)/gm;
  let m;
  while ((m = re.exec(code))) out.add(m[1]);
  /* «let ctx, SW, SH, CV» هم باید همه‌اش دیده شود، نه فقط اوّلی */
  const re2 = /^(?:const|let|var)\s+([^;=\n]+?)(?:\s*=|;|$)/gm;
  while ((m = re2.exec(code))) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/[\s=]/)[0];
      if (/^[A-Za-z_$][\w$]*$/.test(name)) out.add(name);
    }
  }
  return out;
}
const coreNames = topNames(core);
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

  /* رنگِ خراب در مرورگر بی‌صدا نادیده گرفته می‌شود و شکل را خالی می‌گذارد،
     پس همین‌جا جلویش را می‌گیریم. */
  /* «'#'» تنها برای چسباندن به کار می‌رود و ایراد ندارد؛ بقیه باید هگزِ درست باشند. */
  const badCol = [...body.matchAll(/['"](#[^'"]{1,40})['"]/g)]
    .map((m) => m[1])
    .filter((c) => !/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(c));
  if (badCol.length) {
    console.error(`✗ ${f}: رنگِ نامعتبر → ${[...new Set(badCol)].join('، ')}`);
    process.exitCode = 1;
    continue;
  }

  const clash = [...topNames(body)].filter((n) => coreNames.has(n));
  if (clash.length) {
    console.error(`✗ ${f}: نامِ تکراری با هسته → ${clash.join('، ')}`);
    process.exitCode = 1;
    continue;
  }

  const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="${info.bg || '#241a13'}">
<title>${info.title || f}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lalezar&family=Vazirmatn:wght@400;500;700;900&display=swap">
<style>
  /* صفحه نباید هیچ‌جا اسکرول یا زوم شود؛ بازی باید مثل یک برنامه رفتار کند. */
  html, body {
    margin: 0; padding: 0; background: ${info.bg || '#241a13'};
    overflow: hidden; overscroll-behavior: none;
    -webkit-user-select: none; user-select: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-text-size-adjust: 100%;
  }
  body {
    position: fixed; inset: 0;          /* جلوی کشیده‌شدنِ صفحه در سافاریِ گوشی */
    width: 100%; height: 100vh; height: 100dvh;
  }
  canvas {
    display: block; width: 100%; height: 100%;
    touch-action: none; -webkit-touch-callout: none;
  }

  /* گوشیِ عمودی صحنه را ریز می‌کند؛ بچه باید گوشی را بچرخاند. */
  #rotate { display: none; }
  @media (orientation: portrait) and (max-width: 860px) {
    #stage { display: none; }
    #rotate {
      display: flex; position: fixed; inset: 0;
      z-index: 9;
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
