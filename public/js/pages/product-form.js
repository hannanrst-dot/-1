/* فرم ثبت/ویرایش کالا با دو روش: دستی و صوتی (بخش‌های ۴ و ۵) */
(function () {
  'use strict';
  window.Pages = window.Pages || {};

  async function renderForm(root, editId) {
    const [{ categories }, { brands }] = await Promise.all([
      API.get('/catalog/categories'), API.get('/catalog/brands'),
    ]);
    let product = { unit: 'عدد', is_active: 1, stock: 0, discount: 0, tax: 0 };
    if (editId) { const r = await API.get('/products/' + editId); product = r.product; }

    root.innerHTML = `
      <div class="card card-pad mb no-print">
        <div class="card-title">🎙️ ثبت با صدا</div>
        <p class="muted mb">روی میکروفون بزنید و بگویید؛ مثلاً: «دفتر پاپکو ۸۰ برگ، تعداد ۵۰ تا، قیمت خرید ۴۵ هزار تومان، قیمت فروش ۶۰ هزار تومان»</p>
        <div class="row"><button class="mic-btn" id="mic">🎙️ شروع صحبت</button>
          <span class="voice-transcript grow" id="transcript">…</span></div>
      </div>

      <form class="card card-pad" id="pform">
        <div class="card-title">${editId ? '✏️ ویرایش کالا' : '➕ افزودن کالای جدید'}</div>
        <div class="form-grid">
          <div class="field full"><label>نام کالا *</label><input class="input" name="name" required></div>
          <div class="field"><label>کد کالا / SKU</label><input class="input" name="sku"></div>
          <div class="field"><label>بارکد</label><input class="input" name="barcode"></div>
          <div class="field"><label>دسته‌بندی</label><select class="select" name="category_id"><option value="">—</option>${categories.map((c) => `<option value="${c.id}">${UI.esc(c.name)}</option>`).join('')}</select></div>
          <div class="field"><label>برند</label><select class="select" name="brand_id"><option value="">—</option>${brands.map((b) => `<option value="${b.id}">${UI.esc(b.name)}</option>`).join('')}</select></div>
          <div class="field"><label>واحد</label><input class="input" name="unit" value="عدد"></div>
          <div class="field"><label>تعداد موجودی</label><input class="input" name="stock" inputmode="numeric" ${editId ? 'disabled title="موجودی از طریق تاریخچه اصلاح می‌شود"' : ''}></div>
          <div class="field"><label>حداقل موجودی</label><input class="input" name="min_stock" inputmode="numeric"></div>
          <div class="field"><label>قیمت خرید (تومان)</label><input class="input" name="buy_price" inputmode="numeric"></div>
          <div class="field"><label>قیمت فروش (تومان)</label><input class="input" name="sell_price" inputmode="numeric"></div>
          <div class="field"><label>تخفیف (٪)</label><input class="input" name="discount" inputmode="numeric"></div>
          <div class="field"><label>مالیات (٪)</label><input class="input" name="tax" inputmode="numeric"></div>
          <div class="field full"><label>توضیحات</label><textarea class="input" name="description"></textarea></div>
          <div class="field full"><label class="row"><input type="checkbox" name="is_active" checked> فعال</label></div>
        </div>
        <div class="row mt"><button class="btn success big" type="submit">${editId ? 'ذخیره تغییرات' : 'ثبت کالا'}</button>
          <button class="btn" type="button" id="cancel">انصراف</button></div>
      </form>`;

    const form = root.querySelector('#pform');
    // پر کردن مقادیر (قیمت‌ها از ریال به تومان)
    const set = (name, val) => { const f = form.elements[name]; if (f) { if (f.type === 'checkbox') f.checked = !!val; else f.value = val == null ? '' : val; } };
    if (editId) {
      set('name', product.name); set('sku', product.sku); set('barcode', product.barcode);
      set('category_id', product.category_id); set('brand_id', product.brand_id); set('unit', product.unit);
      set('stock', product.stock); set('min_stock', product.min_stock);
      set('buy_price', Math.round(product.buy_price / 10)); set('sell_price', Math.round(product.sell_price / 10));
      set('discount', product.discount); set('tax', product.tax); set('description', product.description);
      set('is_active', product.is_active);
    }

    root.querySelector('#cancel').onclick = () => App.navigate('products');

    // ثبت صوتی
    let listening = false, ctrl = null;
    const micBtn = root.querySelector('#mic');
    const transcriptEl = root.querySelector('#transcript');
    micBtn.onclick = () => {
      if (listening) { ctrl && ctrl.stop(); return; }
      listening = true; micBtn.classList.add('listening'); micBtn.textContent = '⏹️ توقف';
      ctrl = Voice.listen({
        onInterim: (t) => transcriptEl.textContent = t,
        onFinal: async (t) => { transcriptEl.textContent = t; await fillFromVoice(t); },
        onError: (m) => UI.error(m),
        onEnd: () => { listening = false; micBtn.classList.remove('listening'); micBtn.textContent = '🎙️ شروع صحبت'; },
      });
    };

    async function fillFromVoice(text) {
      try {
        const plan = await Voice.interpret(text);
        if (plan.action !== 'add_product') { UI.toast('این جمله به ثبت کالا مربوط نیست.', 'info'); return; }
        const p = plan.product;
        if (p.name) set('name', p.name);
        if (p.stock) set('stock', p.stock);
        if (p.buy_price) set('buy_price', Math.round(p.buy_price / 10));
        if (p.sell_price) set('sell_price', Math.round(p.sell_price / 10));
        // نمایش اطلاعات استخراج‌شده قبل از ثبت (بخش ۵)
        UI.success('اطلاعات از گفتار استخراج و در فرم پر شد. بررسی و «ثبت کالا» را بزنید.');
        if (plan.questions && plan.questions.length) plan.questions.forEach((q) => UI.toast('❓ ' + q.prompt, 'info', 5000));
      } catch (e) { UI.error(e.message); }
    }

    form.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        name: fd.get('name'), sku: fd.get('sku'), barcode: fd.get('barcode'),
        category_id: fd.get('category_id') || null, brand_id: fd.get('brand_id') || null,
        unit: fd.get('unit'), min_stock: num(fd.get('min_stock')),
        buy_price: num(fd.get('buy_price')) * 10, sell_price: num(fd.get('sell_price')) * 10,
        discount: num(fd.get('discount')), tax: num(fd.get('tax')),
        description: fd.get('description'), is_active: form.elements['is_active'].checked,
      };
      if (!editId) payload.stock = num(fd.get('stock'));
      try {
        if (editId) { await API.put('/products/' + editId, payload); UI.success('تغییرات ذخیره شد.'); }
        else { await API.post('/products', payload); UI.success('کالا با موفقیت ثبت شد.'); }
        App.navigate('products');
      } catch (err) { UI.error(err.message); }
    };
    function num(v) { return Number(Fmt.toEn(v || '0')) || 0; }

    // امکان پرکردن از دستیار صوتی مرکزی
    window.Pages.prefillProduct = (p) => {
      set('name', p.name); set('stock', p.stock);
      set('buy_price', Math.round((p.buy_price || 0) / 10)); set('sell_price', Math.round((p.sell_price || 0) / 10));
    };
  }

  window.Pages['product-new'] = (root) => renderForm(root, null);
  window.Pages['product-edit'] = (root, rest) => renderForm(root, rest[0]);
})();
