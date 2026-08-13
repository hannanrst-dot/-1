/* مدیریت کالا: فهرست، جستجو، فیلتر، ویرایش، حذف، تاریخچه (بخش ۱۰) */
(function () {
  'use strict';
  window.Pages = window.Pages || {};

  window.Pages.products = async function (root) {
    const [{ categories }, { brands }] = await Promise.all([
      API.get('/catalog/categories'), API.get('/catalog/brands'),
    ]);
    root.innerHTML = `
      <div class="toolbar">
        <input class="input grow" id="q" placeholder="🔍 جستجو با نام، کد یا بارکد…">
        <select class="select" id="f-cat"><option value="">همه دسته‌ها</option>${categories.map((c) => `<option value="${c.id}">${UI.esc(c.name)}</option>`).join('')}</select>
        <select class="select" id="f-brand"><option value="">همه برندها</option>${brands.map((b) => `<option value="${b.id}">${UI.esc(b.name)}</option>`).join('')}</select>
        <select class="select" id="f-stock"><option value="">موجودی: همه</option><option value="in">موجود</option><option value="out">ناموجود</option></select>
        <select class="select" id="f-sort"><option value="newest">جدیدترین</option><option value="name">نام</option><option value="stock_asc">موجودی کم به زیاد</option><option value="price_desc">گران‌ترین</option></select>
        <label class="btn"><input type="checkbox" id="f-low" style="margin-inline-end:6px">کم‌موجود</label>
        <button class="btn primary" id="add">➕ کالای جدید</button>
      </div>
      <div id="list">${UI.spinner()}</div>`;

    const listEl = root.querySelector('#list');
    root.querySelector('#add').onclick = () => App.navigate('product-new');

    async function load() {
      listEl.innerHTML = UI.spinner();
      const params = {
        q: root.querySelector('#q').value.trim(),
        category: root.querySelector('#f-cat').value,
        brand: root.querySelector('#f-brand').value,
        stock: root.querySelector('#f-stock').value,
        sort: root.querySelector('#f-sort').value,
        lowStock: root.querySelector('#f-low').checked ? '1' : '',
      };
      const { products } = await API.get('/products', params);
      if (!products.length) { listEl.innerHTML = UI.emptyState('📦', 'کالایی یافت نشد.'); return; }
      listEl.innerHTML = `<div class="table-wrap"><table>
        <thead><tr><th>نام کالا</th><th>دسته/برند</th><th>موجودی</th><th>قیمت فروش</th><th>وضعیت</th><th></th></tr></thead>
        <tbody>${products.map(rowHtml).join('')}</tbody></table></div>`;
      listEl.querySelectorAll('[data-edit]').forEach((b) => b.onclick = () => App.navigate('product-edit/' + b.dataset.edit));
      listEl.querySelectorAll('[data-hist]').forEach((b) => b.onclick = () => showHistory(b.dataset.hist));
      listEl.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => remove(b.dataset.del, b.dataset.name));
    }

    function rowHtml(p) {
      const low = p.stock <= p.min_stock;
      return `<tr>
        <td><strong>${UI.esc(p.name)}</strong>${p.sku ? `<div class="muted" style="font-size:12px">کد: ${UI.esc(p.sku)}</div>` : ''}</td>
        <td class="muted">${UI.esc(p.category_name || '—')} / ${UI.esc(p.brand_name || '—')}</td>
        <td class="num"><span class="badge ${low ? 'amber' : 'green'}">${Fmt.num(p.stock)} ${UI.esc(p.unit)}</span></td>
        <td class="num">${Fmt.toman(p.sell_price)}</td>
        <td>${p.is_active ? '<span class="badge green">فعال</span>' : '<span class="badge red">غیرفعال</span>'}</td>
        <td><div class="row" style="gap:6px">
          <button class="btn icon" data-edit="${p.id}" title="ویرایش">✏️</button>
          <button class="btn icon" data-hist="${p.id}" title="تاریخچه">📜</button>
          <button class="btn icon" data-del="${p.id}" data-name="${UI.esc(p.name)}" title="حذف">🗑️</button>
        </div></td></tr>`;
    }

    async function remove(id, name) {
      const ok = await UI.confirm({ title: 'حذف کالا', message: `آیا از حذف «${name}» مطمئن هستید؟ این کار قابل بازگشت نیست.`, confirmText: 'حذف', danger: true });
      if (!ok) return;
      try { await API.del('/products/' + id); UI.success('کالا حذف شد.'); load(); }
      catch (e) { UI.error(e.message); }
    }

    async function showHistory(id) {
      const { product, history } = await API.get('/products/' + id);
      const reasonLabel = { sale: 'فروش', purchase: 'خرید', manual: 'دستی', initial: 'موجودی اولیه', adjust: 'اصلاح' };
      const body = UI.el(`<div>
        <div class="row between mb"><strong>${UI.esc(product.name)}</strong><span class="badge blue">موجودی فعلی: ${Fmt.num(product.stock)}</span></div>
        ${history.length ? `<div class="table-wrap"><table><thead><tr><th>تاریخ</th><th>نوع</th><th>تغییر</th><th>مانده</th></tr></thead><tbody>
          ${history.map((h) => `<tr><td>${Fmt.jalali(h.created_at, true)}</td><td>${reasonLabel[h.reason] || h.reason}</td><td class="num" style="color:${h.change >= 0 ? 'var(--success)' : 'var(--danger)'}">${h.change >= 0 ? '+' : ''}${Fmt.num(h.change)}</td><td class="num">${Fmt.num(h.balance)}</td></tr>`).join('')}
        </tbody></table></div>` : UI.emptyState('📜', 'تاریخچه‌ای نیست.')}
        <div class="row mt"><input type="number" class="input" id="adj" placeholder="تغییر موجودی (+/-)" style="max-width:180px"><button class="btn primary" id="adj-btn">اعمال</button></div>
      </div>`);
      UI.modal({ title: 'تاریخچه و موجودی', body, wide: true, onMount: (box, close) => {
        box.querySelector('#adj-btn').onclick = async () => {
          const change = Number(Fmt.toEn(box.querySelector('#adj').value));
          if (!change) return;
          try { const r = await API.post(`/products/${id}/adjust-stock`, { change }); UI.success('موجودی به‌روزرسانی شد.'); if (r.belowMin) UI.toast('⚠️ موجودی کمتر از حد مجاز است.', 'info'); close(); load(); }
          catch (e) { UI.error(e.message); }
        };
      }});
    }

    ['input', 'change'].forEach((ev) => {
      root.querySelector('#q').addEventListener('input', debounce(load, 300));
      ['f-cat', 'f-brand', 'f-stock', 'f-sort', 'f-low'].forEach((id) => root.querySelector('#' + id).addEventListener('change', load));
    });
    function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
    load();
  };
})();
