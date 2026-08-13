/* مدیریت تأمین‌کنندگان (بخش ۱۵) */
(function () {
  'use strict';
  window.Pages = window.Pages || {};

  window.Pages.suppliers = async function (root) {
    root.innerHTML = `
      <div class="toolbar"><input class="input grow" id="q" placeholder="🔍 جستجوی تأمین‌کننده…">
        <button class="btn primary" id="add">➕ تأمین‌کننده جدید</button></div>
      <div id="list">${UI.spinner()}</div>`;
    const listEl = root.querySelector('#list');
    root.querySelector('#add').onclick = () => editModal();
    root.querySelector('#q').addEventListener('input', debounce(load, 300));

    async function load() {
      const { suppliers } = await API.get('/suppliers', { q: root.querySelector('#q').value.trim() });
      if (!suppliers.length) { listEl.innerHTML = UI.emptyState('🚚', 'تأمین‌کننده‌ای یافت نشد.'); return; }
      listEl.innerHTML = `<div class="table-wrap"><table><thead><tr><th>نام</th><th>تلفن</th><th>اطلاعات</th><th></th></tr></thead><tbody>
        ${suppliers.map((s) => `<tr><td data-view="${s.id}" style="cursor:pointer"><strong>${UI.esc(s.name)}</strong></td><td>${Fmt.toFa(s.phone || '—')}</td><td class="muted">${UI.esc(s.contact || '—')}</td>
          <td><div class="row" style="gap:6px"><button class="btn icon" data-view="${s.id}">👁️</button><button class="btn icon" data-edit='${encodeURIComponent(JSON.stringify(s))}'>✏️</button></div></td></tr>`).join('')}
      </tbody></table></div>`;
      listEl.querySelectorAll('[data-view]').forEach((b) => b.onclick = () => viewSupplier(b.dataset.view));
      listEl.querySelectorAll('[data-edit]').forEach((b) => b.onclick = () => editModal(JSON.parse(decodeURIComponent(b.dataset.edit))));
    }

    async function viewSupplier(id) {
      const { supplier: s, summary: sm, purchases } = await API.get('/suppliers/' + id);
      const body = UI.el(`<div>
        <div class="grid grid-stats mb">
          <div class="stat"><div class="label">تعداد خرید</div><div class="value sm">${Fmt.num(sm.purchase_count)}</div></div>
          <div class="stat"><div class="label">مبلغ خرید</div><div class="value sm">${Fmt.toman(sm.total_bought)}</div></div>
          <div class="stat ${sm.total_due > 0 ? 'warn' : ''}"><div class="label">بدهی به تأمین‌کننده</div><div class="value sm">${Fmt.toman(sm.total_due)}</div></div>
        </div>
        <div class="card-title">سابقه خرید</div>
        ${purchases.length ? `<div class="table-wrap"><table><thead><tr><th>شماره</th><th>مبلغ</th><th>بدهی</th><th>تاریخ</th></tr></thead><tbody>
          ${purchases.map((p) => `<tr><td>${Fmt.toFa(p.number)}</td><td class="num">${Fmt.toman(p.total)}</td><td class="num">${Fmt.toman(p.due)}</td><td>${Fmt.jalaliShort(p.created_at)}</td></tr>`).join('')}
        </tbody></table></div>` : UI.emptyState('🛒', 'خریدی ثبت نشده است.')}
      </div>`);
      UI.modal({ title: s.name, body, wide: true });
    }

    function editModal(s) {
      const body = UI.el(`<div class="form-grid">
        <div class="field full"><label>نام *</label><input class="input" id="s-name" value="${UI.esc(s && s.name || '')}"></div>
        <div class="field"><label>تلفن</label><input class="input" id="s-phone" value="${UI.esc(s && s.phone || '')}"></div>
        <div class="field"><label>اطلاعات تماس</label><input class="input" id="s-contact" value="${UI.esc(s && s.contact || '')}"></div>
        <div class="field full"><label>توضیحات</label><textarea class="input" id="s-note">${UI.esc(s && s.note || '')}</textarea></div>
      </div>`);
      const foot = UI.el(`<button class="btn success">ذخیره</button>`);
      const close = UI.modal({ title: s ? 'ویرایش تأمین‌کننده' : 'تأمین‌کننده جدید', body, footer: foot });
      foot.onclick = async () => {
        const payload = { name: body.querySelector('#s-name').value.trim(), phone: body.querySelector('#s-phone').value.trim(), contact: body.querySelector('#s-contact').value.trim(), note: body.querySelector('#s-note').value.trim() };
        if (!payload.name) { UI.error('نام الزامی است.'); return; }
        try { if (s) await API.put('/suppliers/' + s.id, payload); else await API.post('/suppliers', payload); UI.success('ذخیره شد.'); close(); load(); }
        catch (e) { UI.error(e.message); }
      };
    }

    function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
    load();
  };
})();
