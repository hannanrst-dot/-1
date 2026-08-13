/* ثبت خرید — دستی و صوتی، افزایش موجودی (بخش ۱۶) */
(function () {
  'use strict';
  window.Pages = window.Pages || {};

  window.Pages['purchase-new'] = async function (root) {
    const cart = []; // {product_id?, name, quantity, unit_price}
    let supplier = null;

    root.innerHTML = `
      <div class="grid grid-2" style="grid-template-columns:1.4fr 1fr;align-items:start">
        <div class="card card-pad">
          <div class="row between mb"><div class="card-title" style="margin:0">🛒 ثبت خرید</div>
            <button class="mic-btn" id="mic" style="padding:9px 16px;font-size:14px">🎙️ با صدا</button></div>
          <p class="muted mb">مثلاً بگویید: «از شرکت پاپکو ۱۰۰ تا دفتر خریدم، قیمت خرید هرکدام ۴۵ هزار تومان.»</p>
          <div class="row mb"><input class="input grow" id="search" placeholder="🔍 جستجوی کالای موجود…">
            <button class="btn" id="add-new">➕ کالای جدید</button></div>
          <div id="suggest"></div>
          <div id="items">${UI.emptyState('🛒', 'قلمی اضافه نشده است.')}</div>
        </div>
        <div class="card card-pad">
          <div class="card-title">اطلاعات خرید</div>
          <div class="field mb"><label>تأمین‌کننده</label><input class="input" id="sup" placeholder="نام تأمین‌کننده"><div id="sup-suggest"></div></div>
          <div class="row between" style="font-size:19px;margin-top:8px"><strong>جمع کل</strong><strong id="t-total">۰ تومان</strong></div>
          <div class="field mt"><label>پرداخت‌شده (تومان)</label><input class="input" id="paid" inputmode="numeric"></div>
          <button class="btn success big block mt" id="save">✅ ثبت خرید</button>
        </div>
      </div>`;
    const $ = (s) => root.querySelector(s);

    $('#search').addEventListener('input', debounce(async () => {
      const q = $('#search').value.trim(); if (q.length < 2) { $('#suggest').innerHTML = ''; return; }
      const { products } = await API.get('/products', { q });
      $('#suggest').innerHTML = products.length ? `<div class="option-list mb">${products.slice(0, 6).map((p) => `<div class="option-item" data-id="${p.id}" data-name="${UI.esc(p.name)}" data-buy="${p.buy_price}"><span>${UI.esc(p.name)}</span><span class="badge blue">خرید: ${Fmt.toman(p.buy_price)}</span></div>`).join('')}</div>` : '';
      $('#suggest').querySelectorAll('[data-id]').forEach((op) => op.onclick = () => { addItem({ product_id: Number(op.dataset.id), name: op.dataset.name, unit_price: Number(op.dataset.buy), quantity: 1 }); $('#suggest').innerHTML = ''; $('#search').value = ''; });
    }, 250));

    $('#add-new').onclick = () => addItem({ product_id: null, name: '', quantity: 1, unit_price: 0 });

    $('#sup').addEventListener('input', debounce(async () => {
      supplier = null; const q = $('#sup').value.trim(); if (q.length < 2) { $('#sup-suggest').innerHTML = ''; return; }
      const { suppliers } = await API.get('/suppliers', { q });
      $('#sup-suggest').innerHTML = suppliers.length ? `<div class="option-list mt">${suppliers.slice(0, 5).map((s) => `<div class="option-item" data-id="${s.id}" data-name="${UI.esc(s.name)}"><span>${UI.esc(s.name)}</span></div>`).join('')}</div>` : '';
      $('#sup-suggest').querySelectorAll('[data-id]').forEach((op) => op.onclick = () => { supplier = { id: Number(op.dataset.id), name: op.dataset.name }; $('#sup').value = op.dataset.name; $('#sup-suggest').innerHTML = ''; });
    }, 250));

    let listening = false, ctrl = null;
    $('#mic').onclick = () => {
      if (listening) { ctrl && ctrl.stop(); return; }
      listening = true; $('#mic').classList.add('listening'); $('#mic').textContent = '⏹️ توقف';
      ctrl = Voice.listen({ onFinal: (t) => addFromVoice(t), onError: (m) => UI.error(m), onEnd: () => { listening = false; $('#mic').classList.remove('listening'); $('#mic').textContent = '🎙️ با صدا'; } });
    };
    async function addFromVoice(text) {
      try {
        const plan = await Voice.interpret(text);
        if (plan.action !== 'create_purchase') { UI.toast('این جمله به ثبت خرید مربوط نیست.', 'info'); return; }
        if (plan.supplier) { supplier = null; $('#sup').value = plan.supplier.name; }
        (plan.items || []).forEach((it) => addItem({ product_id: it.product_id, name: it.name, quantity: it.quantity || 1, unit_price: it.unit_price || 0 }));
        (plan.questions || []).forEach((q) => UI.toast('❓ ' + q.prompt, 'info', 5000));
        if (plan.items && plan.items.length) UI.success('اقلام خرید از گفتار اضافه شد؛ مقادیر را بررسی کنید.');
      } catch (e) { UI.error(e.message); }
    }

    function addItem(it) { cart.push(it); renderCart(); }
    function renderCart() {
      const box = $('#items');
      if (!cart.length) { box.innerHTML = UI.emptyState('🛒', 'قلمی اضافه نشده است.'); recalc(); return; }
      box.innerHTML = `<div class="table-wrap"><table><thead><tr><th>کالا</th><th>تعداد</th><th>قیمت خرید(تومان)</th><th>جمع</th><th></th></tr></thead><tbody>
        ${cart.map((it, i) => `<tr>
          <td><input class="input" data-name="${i}" value="${UI.esc(it.name)}" placeholder="نام کالا" style="min-width:160px"></td>
          <td><input class="input" data-qty="${i}" value="${Fmt.toFa(it.quantity)}" style="width:70px" inputmode="numeric"></td>
          <td><input class="input" data-price="${i}" value="${Fmt.toFa(Math.round(it.unit_price / 10))}" style="width:120px" inputmode="numeric"></td>
          <td class="num">${Fmt.toman(it.unit_price * it.quantity)}</td>
          <td><button class="btn icon danger" data-rm="${i}">🗑️</button></td></tr>`).join('')}
      </tbody></table></div>`;
      box.querySelectorAll('[data-name]').forEach((inp) => inp.onchange = () => cart[inp.dataset.name].name = inp.value.trim());
      box.querySelectorAll('[data-qty]').forEach((inp) => inp.onchange = () => { cart[inp.dataset.qty].quantity = Number(Fmt.toEn(inp.value)) || 1; renderCart(); });
      box.querySelectorAll('[data-price]').forEach((inp) => inp.onchange = () => { cart[inp.dataset.price].unit_price = (Number(Fmt.toEn(inp.value)) || 0) * 10; renderCart(); });
      box.querySelectorAll('[data-rm]').forEach((b) => b.onclick = () => { cart.splice(b.dataset.rm, 1); renderCart(); });
      recalc();
    }
    function recalc() { const total = cart.reduce((s, it) => s + it.unit_price * it.quantity, 0); $('#t-total').textContent = Fmt.toman(total); root._total = total; }

    $('#save').onclick = async () => {
      if (!cart.length) { UI.error('حداقل یک قلم اضافه کنید.'); return; }
      if (cart.some((it) => !it.name)) { UI.error('نام همه اقلام را وارد کنید.'); return; }
      const ok = await UI.confirm({ title: 'تأیید خرید', message: `ثبت خرید ${Fmt.toFa(cart.length)} قلم به مبلغ ${Fmt.toman(root._total)} و افزایش موجودی انجام شود؟`, confirmText: 'ثبت خرید' });
      if (!ok) return;
      const payload = { items: cart.map((it) => ({ product_id: it.product_id, name: it.name, quantity: it.quantity, unit_price: it.unit_price })) };
      if (supplier) payload.supplier_id = supplier.id; else if ($('#sup').value.trim()) payload.supplier_name = $('#sup').value.trim();
      if ($('#paid').value !== '') payload.paid = (Number(Fmt.toEn($('#paid').value)) || 0) * 10;
      try { await API.post('/purchases', payload); UI.success('خرید ثبت و موجودی افزایش یافت.'); App.navigate('products'); }
      catch (e) { UI.error(e.message); }
    };

    function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
  };
})();
