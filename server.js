/**
 * سرور ساده و بدون وابستگی برای میزبانی بازی‌های آموزشی.
 * اجرا:  node server.js      (یا  npm start)
 * پورت پیش‌فرض ۳۰۰۰ — با متغیر محیطی PORT قابل تغییر است.
 */
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const BOOKS_DIR = path.join(__dirname, 'books');
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
};

/** مسیر درخواست را امن می‌کند تا از دایرکتوری ریشه بیرون نزند. */
function safeJoin(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const target = path.normalize(path.join(root, decoded));
  return target.startsWith(root) ? target : null;
}

async function sendFile(res, filePath, status = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const stat = await fsp.stat(filePath);
  res.writeHead(status, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
  });
  fs.createReadStream(filePath).pipe(res);
}

function sendJSON(res, obj, status = 200) {
  const body = JSON.stringify(obj, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  try {
    let urlPath = req.url.split('?')[0];

    // ── API: فهرست بازی‌ها ───────────────────────────────────────────
    if (urlPath === '/api/games') {
      const raw = await fsp.readFile(path.join(DATA_DIR, 'games.json'), 'utf8');
      return sendJSON(res, JSON.parse(raw));
    }

    // ── فایل کتاب‌های درسی ───────────────────────────────────────────
    if (urlPath.startsWith('/books/')) {
      const target = safeJoin(BOOKS_DIR, urlPath.slice('/books'.length));
      if (target && fs.existsSync(target) && fs.statSync(target).isFile()) {
        return sendFile(res, target);
      }
    }

    if (urlPath === '/') urlPath = '/index.html';
    let target = safeJoin(PUBLIC_DIR, urlPath);
    if (!target) {
      res.writeHead(403).end('403');
      return;
    }

    // مسیرهای پوشه‌ای → index.html همان پوشه
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      target = path.join(target, 'index.html');
    }
    if (!fs.existsSync(target)) {
      const notFound = path.join(PUBLIC_DIR, '404.html');
      if (fs.existsSync(notFound)) return sendFile(res, notFound, 404);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('صفحه پیدا نشد');
    }
    return sendFile(res, target);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('خطای سرور');
  }
});

server.listen(PORT, () => {
  console.log(`\n  🎮  سرور بازی‌ها بالا آمد →  http://localhost:${PORT}\n`);
});
