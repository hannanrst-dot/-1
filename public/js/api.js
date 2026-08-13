/* لایه ارتباط با API — یک نقطه واحد برای همه درخواست‌ها */
(function (global) {
  'use strict';
  async function request(method, url, body) {
    const opts = { method, headers: {}, credentials: 'same-origin' };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    let res;
    try {
      res = await fetch('/api' + url, opts);
    } catch (e) {
      throw new Error('اتصال به سرور برقرار نشد. اینترنت یا سرور را بررسی کنید.');
    }
    let data = {};
    try { data = await res.json(); } catch (_) {}
    if (res.status === 401 && url !== '/auth/me' && url !== '/auth/login') {
      global.dispatchEvent(new CustomEvent('unauthorized'));
    }
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || 'خطایی رخ داد. دوباره تلاش کنید.');
    }
    return data;
  }

  function qs(params) {
    const p = Object.entries(params || {}).filter(([, v]) => v !== '' && v != null);
    return p.length ? '?' + p.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&') : '';
  }

  global.API = {
    get: (u, params) => request('GET', u + qs(params)),
    post: (u, b) => request('POST', u, b || {}),
    put: (u, b) => request('PUT', u, b || {}),
    del: (u) => request('DELETE', u),
  };
})(window);
