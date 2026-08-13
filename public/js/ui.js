/* کمک‌ابزارهای رابط کاربری: توست، مودال، تأیید، ساخت المان */
(function (global) {
  'use strict';

  /** ساخت المان از HTML */
  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  /** فرار از HTML برای جلوگیری از XSS */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function toast(message, type = 'info', ms = 3200) {
    const c = document.getElementById('toast-container');
    const t = el(`<div class="toast ${type}">${esc(message)}</div>`);
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 250); }, ms);
  }
  const success = (m) => toast(m, 'success');
  const error = (m) => toast(m, 'error', 4200);

  /** مودال دلخواه. onClose برای پاکسازی. برمی‌گرداند تابع بستن. */
  function modal({ title, body, footer, onMount, wide }) {
    const root = document.getElementById('modal-root');
    const overlay = el(`<div class="modal-overlay"></div>`);
    const box = el(`<div class="modal" ${wide ? 'style="max-width:720px"' : ''}></div>`);
    box.innerHTML = `
      <div class="modal-head"><span>${esc(title || '')}</span>
        <button class="btn ghost icon" data-close>✕</button></div>
      <div class="modal-body"></div>
      ${footer ? `<div class="modal-foot"></div>` : ''}`;
    box.querySelector('.modal-body').append(typeof body === 'string' ? el(`<div>${body}</div>`) : body);
    if (footer) box.querySelector('.modal-foot').append(footer);
    overlay.appendChild(box);
    root.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    box.querySelector('[data-close]').addEventListener('click', close);
    if (onMount) onMount(box, close);
    return close;
  }

  /** پنجره تأیید عملیات حساس (بخش ۹) */
  function confirm({ title = 'تأیید', message, confirmText = 'تأیید', danger }) {
    return new Promise((resolve) => {
      const foot = el(`<div class="row">
        <button class="btn ${danger ? 'danger' : 'primary'}" data-ok>${esc(confirmText)}</button>
        <button class="btn" data-cancel>انصراف</button></div>`);
      const close = modal({
        title,
        body: `<div style="font-size:16px">${esc(message)}</div>`,
        footer: foot,
        onMount: (box, close) => {
          foot.querySelector('[data-ok]').onclick = () => { close(); resolve(true); };
          foot.querySelector('[data-cancel]').onclick = () => { close(); resolve(false); };
        },
      });
    });
  }

  function spinner(text = 'در حال بارگذاری…') {
    return `<div class="empty"><span class="ico">⏳</span>${esc(text)}</div>`;
  }
  function emptyState(icon, text) {
    return `<div class="empty"><span class="ico">${icon}</span>${esc(text)}</div>`;
  }

  global.UI = { el, esc, toast, success, error, modal, confirm, spinner, emptyState };
})(window);
