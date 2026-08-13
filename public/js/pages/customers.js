/* مدیریت مشتریان (بخش ۱۴) */
(function () {
  'use strict';
  window.Pages = window.Pages || {};

  window.Pages.customers = async function (root) {
    root.innerHTML = `
      <div class="toolbar"><input class="input grow" id="q" placeholder="🔍 جستجوی مشتری…">
        <button class="btn primary" id="add">➕ مشتری جدید</button></div>
      <div id="list">${UI.spinner()}</div>`;
    const listEl = root.querySelector('#list');
    root.querySelector('#add').onclick = () => editModal();
    root.querySelector('#q').addEventListener('input', debounce(load, 300));

    async function load() {
      const { customers } = await API.get('/customers', { q: root.querySelector('#q').value.trim() });
      if (!customers.length) { listEl.innerHTML = UI.emptyState('👥', 'مشتری‌ای یافت نشد.'); return; }
      listEl.innerHTML = `<div class="table-wrap"><table><thead><tr><th>نام</th><th>تلفن</th><th>آدرس</th><th></th></tr></thead><tbody>
        ${customers.map((c) => `<tr><td data-view="${c.id}" style="cursor:pointer"><strong>${UI.esc(c.name)}</strong></td><td>${Fmt.toFa(c.phone || '—')}</td><td class="muted">${UI.esc(c.address || '—')}</td>
          <td><div class="row" style="gap:6px"><button class="btn icon" data-view="${c.id}">👁️</button><button class="btn icon" data-edit='${encodeURIComponent(JSON.stringify(c))}'>✏️</button></div></td></tr>`).join('')}
      </tbody></table></div>`;
      listEl.querySelectorAll('[data-view]').forEach((b) => b.onclick = () => viewCustomer(b.dataset.view));
      listEl.querySelectorAll('[data-edit]').forEach((b) => b.onclick = () => editModal(JSON.parse(decodeURIComponent(b.dataset.edit))));
    }

    async function viewCustomer(id) {
      const { customer: c, summary: s, invoices } = await API.get('/customers/' + id);
      const body = UI.el(`<div>
        <div class="grid grid-stats mb">
          <div class="stat"><div class="label">تعداد خرید</div><div class="value sm">${Fmt.num(s.invoice_count)}</div></div>
          <div class="stat"><div class="label">مبلغ خرید</div><div class="value sm">${Fmt.toman(s.total_bought)}</div></div>
          <div class="stat"><div class="label">پرداختی</div><div class="value sm">${Fmt.toman(s.total_paid)}</div></div>
          <div class="stat ${s.total_due > 0 ? 'warn' : ''}"><div class="label">بدهی</div><div class="value sm">${Fmt.toman(s.total_due)}</div></div>
        </div>
        ${c.phone ? `<div class="muted mb">📞 ${Fmt.toFa(c.phone)}</div>` : ''}
        <div class="card-title">تاریخچه فاکتورها</div>
        ${invoices.length ? `<div class="table-wrap"><table><thead><tr><th>شماره</th><th>مبلغ</th><th>بدهی</th><th>تاریخ</th></tr></thead><tbody>
          ${invoices.map((i) => `<tr data-inv="${i.id}" style="cursor:pointer"><td>${Fmt.toFa(i.number)}</td><td class="num">${Fmt.toman(i.total)}</td><td class="num">${Fmt.toman(i.due)}</td><td>${Fmt.jalaliShort(i.created_at)}</td></tr>`).join('')}
        </tbody></table></div>` : UI.emptyState('📄', 'فاکتوری ندارد.')}
      </div>`);
      const close = UI.modal({ title: c.name, body, wide: true });
      body.querySelectorAll('[data-inv]').forEach((r) => r.onclick = () => { close(); App.navigate('invoices/' + r.dataset.inv); });
    }

    function editModal(c) {
      const body = UI.el(`<div class="form-grid">
        <div class="field full"><label>نام *</label><input class="input" id="c-name" value="${UI.esc(c && c.name || '')}"></div>
        <div class="field"><label>تلفن</label><input class="input" id="c-phone" value="${UI.esc(c && c.phone || '')}"></div>
        <div class="field"><label>آدرس</label><input class="input" id="c-address" value="${UI.esc(c && c.address || '')}"></div>
        <div class="field full"><label>توضیحات</label><textarea class="input" id="c-note">${UI.esc(c && c.note || '')}</textarea></div>
      </div>`);
      const foot = UI.el(`<button class="btn success">ذخیره</button>`);
      const close = UI.modal({ title: c ? 'ویرایش مشتری' : 'مشتری جدید', body, footer: foot });
      foot.onclick = async () => {
        const payload = { name: body.querySelector('#c-name').value.trim(), phone: body.querySelector('#c-phone').value.trim(), address: body.querySelector('#c-address').value.trim(), note: body.querySelector('#c-note').value.trim() };
        if (!payload.name) { UI.error('نام الزامی است.'); return; }
        try { if (c) await API.put('/customers/' + c.id, payload); else await API.post('/customers', payload); UI.success('ذخیره شد.'); close(); load(); }
        catch (e) { UI.error(e.message); }
      };
    }

    function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
    load();
  };
})();
