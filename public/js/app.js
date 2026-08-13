/* =====================================================================
   هستهٔ برنامه: روتر ساده مبتنی بر hash، پوستهٔ اصلی، مدیریت تم و کاربر،
   و دستیار صوتی مرکزی که کل pipeline (تفسیر → پرسش → تأیید → اجرا) را مدیریت می‌کند.
   ===================================================================== */
(function (global) {
  'use strict';
  const Pages = global.Pages = global.Pages || {};
  const App = global.App = {};
  App.state = { user: null };

  const NAV = [
    { path: 'dashboard', label: 'داشبورد', ico: '🏠' },
    { path: 'invoice-new', label: 'فاکتور جدید', ico: '🧾' },
    { path: 'invoices', label: 'فاکتورها', ico: '📄' },
    { path: 'products', label: 'کالاها', ico: '📦' },
    { path: 'product-new', label: 'ثبت کالا', ico: '➕' },
    { path: 'purchase-new', label: 'ثبت خرید', ico: '🛒' },
    { path: 'customers', label: 'مشتریان', ico: '👥' },
    { path: 'suppliers', label: 'تأمین‌کنندگان', ico: '🚚' },
    { path: 'reports', label: 'گزارش‌ها', ico: '📊' },
    { path: 'settings', label: 'تنظیمات', ico: '⚙️' },
  ];

  // --- تم ---
  function applyTheme(t) {
    document.body.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
  }
  App.toggleTheme = () => applyTheme(document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');

  App.navigate = (path) => { location.hash = '#/' + path; };

  // --- پوسته ---
  function renderShell() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="layout">
        <aside class="sidebar" id="sidebar">
          <div class="brand"><span class="logo">ث</span><span>ثبت‌یار</span></div>
          <nav id="nav"></nav>
          <div class="nav-spacer"></div>
          <div class="nav-item" id="theme-toggle"><span class="ico">🌓</span><span>تغییر تم</span></div>
          <div class="nav-item" id="logout"><span class="ico">🚪</span><span>خروج</span></div>
          <div class="muted" style="padding:8px 14px;font-size:12px">${UI.esc(App.state.user.fullName)} • ${roleLabel(App.state.user.role)}</div>
        </aside>
        <div class="main">
          <div class="topbar">
            <button class="btn ghost icon hamburger" id="ham">☰</button>
            <h1 id="page-title">داشبورد</h1>
            <div class="spacer"></div>
            <button class="mic-btn" id="assistant-btn" style="padding:9px 16px;font-size:15px">🎙️ با صدا انجام بده</button>
          </div>
          <div class="content" id="page"></div>
        </div>
      </div>
      <button class="mic-btn mic-fab" id="assistant-fab" title="دستیار صوتی">🎙️</button>`;

    const nav = document.getElementById('nav');
    NAV.forEach((n) => {
      const item = UI.el(`<div class="nav-item" data-path="${n.path}"><span class="ico">${n.ico}</span><span>${n.label}</span></div>`);
      item.onclick = () => { App.navigate(n.path); document.getElementById('sidebar').classList.remove('open'); };
      nav.appendChild(item);
    });
    document.getElementById('theme-toggle').onclick = App.toggleTheme;
    document.getElementById('logout').onclick = App.logout;
    document.getElementById('ham').onclick = () => document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('assistant-btn').onclick = App.assistant;
    document.getElementById('assistant-fab').onclick = App.assistant;
  }

  function roleLabel(r) { return { admin: 'مدیر', seller: 'فروشنده', stockkeeper: 'انباردار' }[r] || r; }

  function setActiveNav(path) {
    document.querySelectorAll('.nav-item[data-path]').forEach((i) => i.classList.toggle('active', i.dataset.path === path));
    const nav = NAV.find((n) => n.path === path);
    const t = document.getElementById('page-title');
    if (t && nav) t.textContent = nav.label;
  }

  // --- روتر ---
  async function route() {
    if (!App.state.user) return;
    const hash = location.hash.replace(/^#\/?/, '') || 'dashboard';
    const [path, ...rest] = hash.split('/');
    const page = document.getElementById('page');
    if (!page) { renderShell(); }
    const container = document.getElementById('page');
    setActiveNav(path);
    const handler = Pages[path];
    if (!handler) { container.innerHTML = UI.emptyState('🤷', 'صفحه یافت نشد.'); return; }
    container.innerHTML = UI.spinner();
    try { await handler(container, rest); }
    catch (e) { container.innerHTML = UI.emptyState('⚠️', e.message); }
    window.scrollTo(0, 0);
  }

  // --- ورود / خروج ---
  App.logout = async () => {
    try { await API.post('/auth/logout'); } catch (_) {}
    App.state.user = null;
    location.hash = '';
    Pages.login(document.getElementById('app'));
  };

  App.onLoggedIn = (user) => {
    App.state.user = user;
    renderShell();
    if (!location.hash) location.hash = '#/dashboard';
    else route();
  };

  global.addEventListener('unauthorized', () => {
    App.state.user = null;
    Pages.login(document.getElementById('app'));
  });
  global.addEventListener('hashchange', route);

  // =====================================================================
  //  دستیار صوتی مرکزی — کل مسیر امن گفتار تا اجرا
  // =====================================================================
  App.assistant = function () {
    let listening = false;
    let controller = null;
    let currentPlan = null;
    const overrides = {}; // پاسخ‌های کاربر به پرسش‌های رفع ابهام (نام کالا → انتخاب)

    const body = UI.el(`<div>
      <div class="row between mb">
        <button class="mic-btn" id="v-mic">🎙️ شروع صحبت</button>
        <span class="muted" id="v-status">${Voice.supported() ? 'روی دکمه بزنید و صحبت کنید' : 'مرورگر از گفتار پشتیبانی نمی‌کند؛ می‌توانید متن را بنویسید.'}</span>
      </div>
      <div class="field mb">
        <label>متن گفتار (قابل ویرایش)</label>
        <textarea class="input" id="v-text" placeholder="مثلاً: دو تا دفتر پاپکو و سه تا مداد استدلر بزن"></textarea>
      </div>
      <div class="row mb">
        <button class="btn primary" id="v-interpret">🔎 تحلیل</button>
        <button class="btn" id="v-clear">پاک کردن</button>
      </div>
      <div id="v-result"></div>
    </div>`);

    const close = UI.modal({ title: '🎙️ دستیار صوتی فروشگاه', body, wide: true });
    const $ = (s) => body.querySelector(s);
    const status = (t) => { $('#v-status').textContent = t; };

    $('#v-mic').onclick = () => {
      if (listening) { controller && controller.stop(); return; }
      listening = true; $('#v-mic').classList.add('listening'); $('#v-mic').textContent = '⏹️ توقف';
      status('در حال شنیدن…');
      controller = Voice.listen({
        onInterim: (t) => { $('#v-text').value = t; },
        onFinal: (t) => { $('#v-text').value = t; doInterpret(); },
        onError: (m) => { UI.error(m); },
        onEnd: () => { listening = false; $('#v-mic').classList.remove('listening'); $('#v-mic').textContent = '🎙️ شروع صحبت'; status('آماده'); },
      });
    };
    $('#v-clear').onclick = () => { $('#v-text').value = ''; $('#v-result').innerHTML = ''; currentPlan = null; };
    $('#v-interpret').onclick = doInterpret;

    async function doInterpret() {
      const text = $('#v-text').value.trim();
      if (!text) return;
      status('در حال تحلیل…');
      try {
        currentPlan = await Voice.interpret(text);
        renderPlan(currentPlan);
      } catch (e) { UI.error(e.message); }
      status('آماده');
    }

    function renderPlan(plan) {
      const box = $('#v-result');
      // درخواست‌های اطلاعاتی دستیار (بخش ۲۸)
      if (plan.action === 'query') { runQuery(plan.query, box); return; }
      if (plan.action === 'none') { box.innerHTML = `<div class="voice-question">${UI.esc(plan.message)}</div>`; return; }

      let html = `<div class="card card-pad"><div class="card-title">${actionTitle(plan.action)}</div>`;

      // پرسش‌های رفع ابهام (بخش ۸)
      if (plan.questions && plan.questions.length) {
        for (const q of plan.questions) {
          html += `<div class="voice-question">❓ ${UI.esc(q.prompt)}</div>`;
          if (q.options && q.options.length) {
            html += `<div class="option-list" data-term="${UI.esc(q.term)}">`;
            q.options.forEach((o) => {
              html += `<div class="option-item" data-id="${o.id}" data-name="${UI.esc(o.name)}" data-price="${o.price || ''}" data-qty="${q.quantity || ''}">
                <span>${UI.esc(o.name)}</span>${o.price ? `<span class="badge blue">${Fmt.toman(o.price)}</span>` : (o.phone ? `<span class="muted">${Fmt.toFa(o.phone)}</span>` : '')}</div>`;
            });
            html += `</div>`;
          } else if (q.field === 'quantity') {
            html += `<div class="row mb"><input type="number" class="input" style="max-width:140px" placeholder="تعداد" data-qtyfor="${UI.esc(q.name || q.term)}"><button class="btn" data-setqty>ثبت تعداد</button></div>`;
          }
        }
      }

      // خلاصه اقلام/کالا
      if (plan.action === 'create_invoice' && plan.items) {
        html += invoiceSummary(plan);
      } else if (plan.action === 'add_product') {
        const p = plan.product;
        html += `<table class="mt"><tbody>
          <tr><th>نام کالا</th><td>${UI.esc(p.name || '—')}</td></tr>
          <tr><th>موجودی</th><td>${Fmt.num(p.stock)}</td></tr>
          <tr><th>قیمت خرید</th><td>${Fmt.toman(p.buy_price)}</td></tr>
          <tr><th>قیمت فروش</th><td>${Fmt.toman(p.sell_price)}</td></tr></tbody></table>`;
      } else if (plan.action === 'create_purchase') {
        html += `<table class="mt"><tbody>${(plan.items || []).map((it) => `<tr><td>${UI.esc(it.name)}</td><td>${it.quantity ? Fmt.num(it.quantity) : '—'}</td><td>${it.unit_price ? Fmt.toman(it.unit_price) : '—'}</td></tr>`).join('')}</tbody></table>`;
      }

      // مرحله تأیید (بخش ۹ و ۲۹)
      if (plan.needsConfirmation && plan.confirmText) {
        html += `<div class="voice-question mt" style="background:var(--success-soft)">✅ ${UI.esc(plan.confirmText)}</div>
          <div class="row"><button class="btn success big" id="v-confirm">تأیید و ثبت</button>
          <button class="btn" id="v-edit">ویرایش دستی</button></div>`;
      } else if (plan.questions && plan.questions.length) {
        html += `<div class="muted mt">پس از پاسخ به پرسش‌ها، برای ثبت نهایی تأیید بگیرید.</div>`;
      }
      html += `</div>`;
      box.innerHTML = html;

      // اتصال رویدادها
      box.querySelectorAll('.option-item').forEach((op) => {
        op.onclick = () => resolveAmbiguity(op);
      });
      box.querySelectorAll('[data-setqty]').forEach((b) => {
        b.onclick = () => {
          const inp = b.previousElementSibling;
          const name = inp.getAttribute('data-qtyfor');
          const val = Number(Fmt.toEn(inp.value));
          if (val > 0) { overrides['qty:' + name] = val; UI.success('تعداد ثبت شد.'); applyOverridesAndReinterpret(); }
        };
      });
      const cf = box.querySelector('#v-confirm');
      if (cf) cf.onclick = () => executePlan(plan);
      const ed = box.querySelector('#v-edit');
      if (ed) ed.onclick = () => { close(); routeToEdit(plan); };
    }

    function invoiceSummary(plan) {
      let total = 0;
      const rows = plan.items.map((it) => {
        const q = it.quantity || overrides['qty:' + it.name];
        const line = q ? q * it.unit_price : 0; total += line;
        return `<tr><td>${UI.esc(it.name)}</td><td class="num">${q ? Fmt.num(q) : '—'}</td><td class="num">${Fmt.toman(it.unit_price)}</td><td class="num">${q ? Fmt.toman(line) : '—'}</td></tr>`;
      }).join('');
      return `<table class="mt"><thead><tr><th>کالا</th><th>تعداد</th><th>قیمت</th><th>جمع</th></tr></thead>
        <tbody>${rows}</tbody></table>
        <div class="row between mt"><strong>جمع تقریبی</strong><strong>${Fmt.toman(total)}</strong></div>`;
    }

    // انتخاب یک گزینه از موارد مبهم → متن را اصلاح و دوباره تفسیر می‌کنیم
    function resolveAmbiguity(op) {
      const term = op.closest('.option-list').getAttribute('data-term');
      const name = op.getAttribute('data-name');
      overrides['pick:' + term] = name;
      // جایگزینی عبارت مبهم با نام دقیق در متن و تفسیر مجدد
      let text = $('#v-text').value;
      if (term && text.includes(term)) text = text.replace(term, name);
      else text += (text ? '، ' : '') + name;
      $('#v-text').value = text;
      const qty = op.getAttribute('data-qty');
      if (qty) overrides['qty:' + name] = Number(qty);
      applyOverridesAndReinterpret();
    }

    async function applyOverridesAndReinterpret() {
      try {
        currentPlan = await Voice.interpret($('#v-text').value.trim());
        // اعمال تعدادهای دستی روی اقلام حل‌شده
        if (currentPlan.items) currentPlan.items.forEach((it) => { if (!it.quantity && overrides['qty:' + it.name]) it.quantity = overrides['qty:' + it.name]; });
        // اگر همه اقلام تعداد دارند و ابهامی نیست، آماده تأیید کن
        recomputeReadiness(currentPlan);
        renderPlan(currentPlan);
      } catch (e) { UI.error(e.message); }
    }

    function recomputeReadiness(plan) {
      if (plan.action === 'create_invoice') {
        const unresolved = (plan.questions || []).filter((q) => q.field === 'product');
        const missingQty = (plan.items || []).filter((it) => !(it.quantity || overrides['qty:' + it.name]));
        if (unresolved.length === 0 && missingQty.length === 0 && plan.items.length) {
          plan.needsConfirmation = true;
          const total = plan.items.reduce((s, it) => s + (it.quantity || overrides['qty:' + it.name]) * it.unit_price, 0);
          plan.confirmText = `فاکتور شامل ${Fmt.toFa(plan.items.length)} قلم و مبلغ ${Fmt.tomanNum(total)} تومان است. ثبت شود؟`;
          plan.questions = plan.questions.filter((q) => q.field !== 'quantity');
        }
      }
    }

    async function executePlan(plan) {
      try {
        if (plan.action === 'create_invoice') {
          const items = plan.items.map((it) => ({ product_id: it.product_id, quantity: it.quantity || overrides['qty:' + it.name], unit_price: it.unit_price }));
          const payload = { items, discountPercent: plan.discountPercent || 0, payment_method: 'cash' };
          if (plan.customer) { if (plan.customer.id) payload.customer_id = plan.customer.id; else payload.customer_name = plan.customer.name; }
          const { invoice } = await API.post('/invoices', payload);
          UI.success('فاکتور با موفقیت ثبت شد.');
          (invoice.warnings || []).forEach((w) => UI.toast('⚠️ ' + w, 'info', 5000));
          Voice.speak('فاکتور ثبت شد');
          close(); App.navigate('invoices');
        } else if (plan.action === 'add_product') {
          const p = plan.product;
          await API.post('/products', p);
          UI.success('کالا ثبت شد.'); Voice.speak('کالا ثبت شد');
          close(); App.navigate('products');
        } else if (plan.action === 'create_purchase') {
          const payload = { items: plan.items.map((it) => ({ product_id: it.product_id, name: it.name, quantity: it.quantity, unit_price: it.unit_price })) };
          if (plan.supplier) payload.supplier_name = plan.supplier.name;
          await API.post('/purchases', payload);
          UI.success('خرید ثبت و موجودی افزایش یافت.'); close(); App.navigate('products');
        }
      } catch (e) { UI.error(e.message); }
    }

    function routeToEdit(plan) {
      if (plan.action === 'add_product') { App.navigate('product-new'); setTimeout(() => Pages.prefillProduct && Pages.prefillProduct(plan.product), 300); }
      else App.navigate('invoice-new');
    }

    async function runQuery(query, box) {
      try {
        const r = await API.post('/voice/query', { query });
        box.innerHTML = `<div class="card card-pad"><div class="card-title">💬 پاسخ دستیار</div><div style="font-size:17px">${UI.esc(r.answer || '—')}</div></div>`;
        if (r.answer) Voice.speak(r.answer);
        if (r.invoiceId) { box.querySelector('.card-pad').innerHTML += `<div class="mt"><button class="btn primary" id="v-open">باز کردن فاکتور</button></div>`; box.querySelector('#v-open').onclick = () => { close(); App.navigate('invoices/' + r.invoiceId); }; }
      } catch (e) { UI.error(e.message); }
    }

    function actionTitle(a) {
      return { create_invoice: '🧾 پیش‌نمایش فاکتور', add_product: '📦 ثبت کالای جدید', create_purchase: '🛒 ثبت خرید' }[a] || 'نتیجه';
    }
  };

  // --- شروع برنامه ---
  (async function boot() {
    applyTheme(localStorage.getItem('theme') || 'light');
    try {
      const { user } = await API.get('/auth/me');
      App.onLoggedIn(user);
    } catch (_) {
      Pages.login(document.getElementById('app'));
    }
  })();
})(window);
