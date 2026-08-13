/* فاکتور جدید — سریع، با جستجوی کالا، صوتی، تخفیف/مالیات و تأیید (بخش‌های ۹، ۱۲، ۱۳) */
(function () {
  'use strict';
  window.Pages = window.Pages || {};

  window.Pages['invoice-new'] = async function (root) {
    const cart = []; // {product_id,name,unit_price,quantity,discount,tax,stock}
    let customer = null;

    root.innerHTML = `
      <div class="grid grid-2" style="grid-template-columns: 1.4fr 1fr; align-items:start">
        <div class="card card-pad">
          <div class="row between mb">
            <div class="card-title" style="margin:0">🧾 فاکتور جدید</div>
            <button class="mic-btn" id="mic" style="padding:9px 16px;font-size:14px">🎙️ افزودن با صدا</button>
          </div>
          <div class="row mb">
            <input class="input grow" id="search" placeholder="🔍 جستجوی کالا با نام یا بارکد و Enter…">
            <button class="btn" id="scan" title="اسکن بارکد">📷</button>
          </div>
          <div id="suggest"></div>
          <div id="items">${UI.emptyState('🛒', 'هنوز کالایی اضافه نشده است.')}</div>
        </div>

        <div class="card card-pad">
          <div class="card-title">اطلاعات فاکتور</div>
          <div class="field mb"><label>مشتری</label>
            <input class="input" id="cust" placeholder="نام مشتری (اختیاری)">
            <div id="cust-suggest"></div></div>
          <div class="field mb"><label>روش پرداخت</label>
            <select class="select" id="pay-method">
              <option value="cash">نقدی</option><option value="card">کارت</option>
              <option value="transfer">انتقال</option><option value="mixed">ترکیبی</option>
              <option value="credit">اعتباری (نسیه)</option></select></div>
          <div class="field mb"><label>تخفیف کل (تومان)</label><input class="input" id="disc" inputmode="numeric" value="0"></div>
          <hr style="border:none;border-top:1px solid var(--border);margin:14px 0">
          <div class="row between"><span class="muted">جمع اقلام</span><strong id="t-sub">۰</strong></div>
          <div class="row between"><span class="muted">تخفیف</span><strong id="t-disc">۰</strong></div>
          <div class="row between"><span class="muted">مالیات</span><strong id="t-tax">۰</strong></div>
          <div class="row between" style="font-size:20px;margin-top:8px"><strong>مبلغ نهایی</strong><strong id="t-total">۰ تومان</strong></div>
          <div class="field mt"><label>پرداخت‌شده (تومان)</label><input class="input" id="paid" inputmode="numeric"></div>
          <div class="row between"><span class="muted">بدهکاری</span><strong id="t-due">۰</strong></div>
          <button class="btn success big block mt" id="save">✅ ثبت فاکتور</button>
        </div>
      </div>`;

    const $ = (s) => root.querySelector(s);

    // --- جستجوی کالا ---
    const search = $('#search');
    search.addEventListener('input', debounce(async () => {
      const q = search.value.trim();
      if (q.length < 2) { $('#suggest').innerHTML = ''; return; }
      const { products } = await API.get('/products', { q, stock: 'in' });
      $('#suggest').innerHTML = products.length ? `<div class="option-list mb">${products.slice(0, 6).map((p) => `
        <div class="option-item" data-add='${JSON.stringify({ id: p.id, name: p.name, price: p.sell_price, stock: p.stock, discount: p.discount, tax: p.tax }).replace(/'/g, "&#39;")}'>
          <span>${UI.esc(p.name)}</span><span class="badge blue">${Fmt.toman(p.sell_price)} • موجودی ${Fmt.num(p.stock)}</span></div>`).join('')}</div>` : '';
      $('#suggest').querySelectorAll('[data-add]').forEach((op) => op.onclick = () => {
        addItem(JSON.parse(op.dataset.add)); $('#suggest').innerHTML = ''; search.value = ''; search.focus();
      });
    }, 250));
    search.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const first = $('#suggest .option-item'); if (first) first.click(); } });
    $('#scan').onclick = () => barcodeScan();

    // --- مشتری ---
    const cust = $('#cust');
    cust.addEventListener('input', debounce(async () => {
      customer = null;
      const q = cust.value.trim();
      if (q.length < 2) { $('#cust-suggest').innerHTML = ''; return; }
      const { customers } = await API.get('/customers', { q });
      $('#cust-suggest').innerHTML = customers.length ? `<div class="option-list mt">${customers.slice(0, 5).map((c) => `<div class="option-item" data-cid="${c.id}" data-cname="${UI.esc(c.name)}"><span>${UI.esc(c.name)}</span><span class="muted">${Fmt.toFa(c.phone || '')}</span></div>`).join('')}</div>` : '';
      $('#cust-suggest').querySelectorAll('[data-cid]').forEach((op) => op.onclick = () => { customer = { id: Number(op.dataset.cid), name: op.dataset.cname }; cust.value = op.dataset.cname; $('#cust-suggest').innerHTML = ''; });
    }, 250));

    // --- صوتی ---
    let listening = false, ctrl = null;
    $('#mic').onclick = () => {
      if (listening) { ctrl && ctrl.stop(); return; }
      listening = true; $('#mic').classList.add('listening'); $('#mic').textContent = '⏹️ توقف';
      ctrl = Voice.listen({
        onFinal: async (t) => { await addFromVoice(t); },
        onError: (m) => UI.error(m),
        onEnd: () => { listening = false; $('#mic').classList.remove('listening'); $('#mic').textContent = '🎙️ افزودن با صدا'; },
      });
    };

    async function addFromVoice(text) {
      try {
        const plan = await Voice.interpret(text);
        if (plan.customer && plan.customer.name) { customer = plan.customer.id ? { id: plan.customer.id, name: plan.customer.name } : null; cust.value = plan.customer.name; }
        if (plan.discountPercent) { /* اعمال به‌صورت درصدی روی جمع */ pendingDiscountPercent = plan.discountPercent; }
        (plan.items || []).forEach((it) => {
          if (it.product_id && it.quantity) addItem({ id: it.product_id, name: it.name, price: it.unit_price, stock: it.stock, quantity: it.quantity });
        });
        // پرسش‌های رفع ابهام
        if (plan.questions && plan.questions.length) {
          plan.questions.forEach((q) => {
            if (q.type === 'ambiguous' && q.options) askChoose(q);
            else UI.toast('❓ ' + q.prompt, 'info', 5000);
          });
        } else if (!plan.items || !plan.items.some((i) => i.product_id)) {
          UI.toast('کالایی برای افزودن پیدا نشد.', 'info');
        } else { UI.success('اقلام از گفتار اضافه شد.'); }
      } catch (e) { UI.error(e.message); }
    }
    let pendingDiscountPercent = 0;

    function askChoose(q) {
      const body = UI.el(`<div><p class="mb">${UI.esc(q.prompt)}</p><div class="option-list">${q.options.map((o) => `<div class="option-item" data-id="${o.id}" data-name="${UI.esc(o.name)}" data-price="${o.price || ''}"><span>${UI.esc(o.name)}</span>${o.price ? `<span class="badge blue">${Fmt.toman(o.price)}</span>` : ''}</div>`).join('')}</div></div>`);
      const close = UI.modal({ title: 'انتخاب کالا', body });
      body.querySelectorAll('[data-id]').forEach((op) => op.onclick = () => {
        addItem({ id: Number(op.dataset.id), name: op.dataset.name, price: Number(op.dataset.price), quantity: q.quantity || 1 });
        close();
      });
    }

    // --- سبد ---
    function addItem(p) {
      const existing = cart.find((i) => i.product_id === p.id);
      if (existing) { existing.quantity += (p.quantity || 1); }
      else cart.push({ product_id: p.id, name: p.name, unit_price: p.price, quantity: p.quantity || 1, discount: p.discount || 0, tax: p.tax || 0, stock: p.stock });
      renderCart();
    }
    function renderCart() {
      const box = $('#items');
      if (!cart.length) { box.innerHTML = UI.emptyState('🛒', 'هنوز کالایی اضافه نشده است.'); recalc(); return; }
      box.innerHTML = `<div class="table-wrap"><table><thead><tr><th>کالا</th><th>تعداد</th><th>قیمت واحد</th><th>تخفیف٪</th><th>جمع</th><th></th></tr></thead><tbody>
        ${cart.map((it, i) => {
          const line = it.unit_price * it.quantity * (1 - it.discount / 100) * (1 + it.tax / 100);
          const low = it.stock != null && it.quantity > it.stock;
          return `<tr>
            <td>${UI.esc(it.name)}${low ? '<div class="badge red" style="font-size:11px">بیش از موجودی</div>' : ''}</td>
            <td><input class="input" data-qty="${i}" value="${Fmt.toFa(it.quantity)}" style="width:70px" inputmode="numeric"></td>
            <td><input class="input" data-price="${i}" value="${Fmt.toFa(Math.round(it.unit_price / 10))}" style="width:110px" inputmode="numeric"></td>
            <td><input class="input" data-disc="${i}" value="${Fmt.toFa(it.discount)}" style="width:60px" inputmode="numeric"></td>
            <td class="num">${Fmt.toman(line)}</td>
            <td><button class="btn icon danger" data-rm="${i}">🗑️</button></td></tr>`;
        }).join('')}</tbody></table></div>`;
      box.querySelectorAll('[data-qty]').forEach((inp) => inp.onchange = () => { cart[inp.dataset.qty].quantity = Number(Fmt.toEn(inp.value)) || 1; renderCart(); });
      box.querySelectorAll('[data-price]').forEach((inp) => inp.onchange = () => { cart[inp.dataset.price].unit_price = (Number(Fmt.toEn(inp.value)) || 0) * 10; renderCart(); });
      box.querySelectorAll('[data-disc]').forEach((inp) => inp.onchange = () => { cart[inp.dataset.disc].discount = Number(Fmt.toEn(inp.value)) || 0; renderCart(); });
      box.querySelectorAll('[data-rm]').forEach((b) => b.onclick = () => { cart.splice(b.dataset.rm, 1); renderCart(); });
      recalc();
    }

    function recalc() {
      let sub = 0, taxTotal = 0, lineDisc = 0;
      cart.forEach((it) => {
        const gross = it.unit_price * it.quantity;
        const d = gross * it.discount / 100;
        const taxable = gross - d; const tax = taxable * it.tax / 100;
        sub += gross; lineDisc += d; taxTotal += tax;
      });
      let headerDisc = (Number(Fmt.toEn($('#disc').value)) || 0) * 10;
      if (!headerDisc && pendingDiscountPercent) headerDisc = Math.round((sub - lineDisc) * pendingDiscountPercent / 100);
      const totalDisc = lineDisc + headerDisc;
      const total = Math.max(0, sub - totalDisc + taxTotal);
      $('#t-sub').textContent = Fmt.toman(sub);
      $('#t-disc').textContent = Fmt.toman(totalDisc);
      $('#t-tax').textContent = Fmt.toman(taxTotal);
      $('#t-total').textContent = Fmt.toman(total);
      const paid = $('#paid').value === '' ? total : (Number(Fmt.toEn($('#paid').value)) || 0) * 10;
      $('#t-due').textContent = Fmt.toman(Math.max(0, total - paid));
      root._total = total; root._headerDisc = headerDisc;
    }
    $('#disc').addEventListener('input', recalc);
    $('#paid').addEventListener('input', recalc);

    // --- ثبت با تأیید (بخش ۹) ---
    $('#save').onclick = async () => {
      if (!cart.length) { UI.error('حداقل یک کالا اضافه کنید.'); return; }
      recalc();
      const ok = await UI.confirm({
        title: 'تأیید فاکتور',
        message: `فاکتور شامل ${Fmt.toFa(cart.length)} قلم و مبلغ ${Fmt.toman(root._total)} است. ثبت شود؟`,
        confirmText: 'ثبت فاکتور',
      });
      if (!ok) return;
      const payload = {
        items: cart.map((it) => ({ product_id: it.product_id, quantity: it.quantity, unit_price: it.unit_price, discount: it.discount, tax: it.tax })),
        discount: root._headerDisc || 0,
        payment_method: $('#pay-method').value,
        paid: $('#paid').value === '' ? undefined : (Number(Fmt.toEn($('#paid').value)) || 0) * 10,
      };
      if (customer) payload.customer_id = customer.id;
      else if (cust.value.trim()) payload.customer_name = cust.value.trim();
      try {
        const { invoice } = await API.post('/invoices', payload);
        UI.success('فاکتور ' + Fmt.toFa(invoice.number) + ' ثبت شد.');
        (invoice.warnings || []).forEach((w) => UI.toast('⚠️ ' + w, 'info', 5000));
        App.navigate('invoices/' + invoice.id);
      } catch (e) { UI.error(e.message); }
    };

    function barcodeScan() {
      // اسکن بارکد با دوربین موبایل با BarcodeDetector (در صورت پشتیبانی مرورگر) — بخش ۱۸
      if (!('BarcodeDetector' in window)) { UI.toast('اسکنر بارکد در این مرورگر پشتیبانی نمی‌شود؛ بارکد را در کادر جستجو وارد کنید.', 'info', 5000); return; }
      const body = UI.el(`<div><video id="cam" style="width:100%;border-radius:12px;background:#000"></video><p class="muted mt">بارکد را مقابل دوربین بگیرید…</p></div>`);
      const close = UI.modal({ title: '📷 اسکن بارکد', body, onMount: async (box, close) => {
        const video = box.querySelector('#cam');
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          video.srcObject = stream; await video.play();
          const detector = new window.BarcodeDetector();
          const tick = async () => {
            if (!video.srcObject) return;
            try { const codes = await detector.detect(video); if (codes.length) { onCode(codes[0].rawValue); stream.getTracks().forEach((t) => t.stop()); close(); return; } } catch (_) {}
            requestAnimationFrame(tick);
          };
          tick();
        } catch (e) { UI.error('دسترسی به دوربین ممکن نشد.'); close(); }
      }});
      async function onCode(code) {
        const { products } = await API.get('/products', { q: code });
        if (products.length) { addItem({ id: products[0].id, name: products[0].name, price: products[0].sell_price, stock: products[0].stock, quantity: 1 }); UI.success('کالا افزوده شد.'); }
        else UI.toast('کالایی با این بارکد یافت نشد.', 'info');
      }
    }

    function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
  };
})();
