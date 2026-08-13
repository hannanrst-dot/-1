/* فهرست فاکتورها و نمایش/چاپ/خروجی (بخش‌های ۱۲، ۱۹) */
(function () {
  'use strict';
  window.Pages = window.Pages || {};
  const PAY = { cash: 'نقدی', card: 'کارت', transfer: 'انتقال', mixed: 'ترکیبی', credit: 'اعتباری' };

  window.Pages.invoices = async function (root, rest) {
    if (rest && rest[0]) return viewInvoice(root, rest[0]);
    const { invoices } = await API.get('/invoices');
    root.innerHTML = `
      <div class="toolbar"><div class="card-title" style="margin:0">📄 فاکتورها</div><div class="spacer" style="flex:1"></div>
        <button class="btn primary" id="new">🧾 فاکتور جدید</button></div>
      ${invoices.length ? `<div class="table-wrap"><table><thead><tr><th>شماره</th><th>مشتری</th><th>مبلغ</th><th>پرداخت</th><th>بدهی</th><th>روش</th><th>تاریخ</th></tr></thead><tbody>
        ${invoices.map((i) => `<tr data-id="${i.id}" style="cursor:pointer">
          <td><strong>${Fmt.toFa(i.number)}</strong></td><td>${UI.esc(i.customer_name || 'نقدی')}</td>
          <td class="num">${Fmt.toman(i.total)}</td><td class="num">${Fmt.toman(i.paid)}</td>
          <td class="num">${i.due > 0 ? `<span class="badge red">${Fmt.toman(i.due)}</span>` : '<span class="badge green">تسویه</span>'}</td>
          <td>${PAY[i.payment_method] || i.payment_method}</td><td>${Fmt.jalaliShort(i.created_at)}</td></tr>`).join('')}
      </tbody></table></div>` : UI.emptyState('📄', 'هنوز فاکتوری ثبت نشده است.')}`;
    root.querySelector('#new').onclick = () => App.navigate('invoice-new');
    root.querySelectorAll('[data-id]').forEach((r) => r.onclick = () => App.navigate('invoices/' + r.dataset.id));
  };

  async function viewInvoice(root, id) {
    const { invoice: inv } = await API.get('/invoices/' + id);
    const settings = (await API.get('/settings')).settings || {};
    const shopName = settings.shop_name || 'فروشگاه';

    root.innerHTML = `
      <div class="row between mb no-print">
        <button class="btn" id="back">→ بازگشت</button>
        <div class="row">
          <button class="btn" id="print">🖨️ چاپ</button>
          <button class="btn" id="csv">📊 خروجی CSV</button>
        </div>
      </div>
      <div class="card card-pad" id="invoice-doc">
        <div class="row between mb">
          <div><h2 style="font-weight:800">${UI.esc(shopName)}</h2>
            ${settings.shop_phone ? `<div class="muted">${Fmt.toFa(settings.shop_phone)}</div>` : ''}
            ${settings.shop_address ? `<div class="muted">${UI.esc(settings.shop_address)}</div>` : ''}</div>
          <div style="text-align:left">
            <div><strong>فاکتور فروش</strong></div>
            <div class="muted">شماره: ${Fmt.toFa(inv.number)}</div>
            <div class="muted">تاریخ: ${Fmt.jalali(inv.created_at, true)}</div>
          </div>
        </div>
        <div class="row between mb" style="padding:10px;background:var(--surface-2);border-radius:10px">
          <div>مشتری: <strong>${UI.esc(inv.customer_name || 'نقدی')}</strong> ${inv.customer_phone ? `(${Fmt.toFa(inv.customer_phone)})` : ''}</div>
          <div>فروشنده: ${UI.esc(inv.seller_name || '—')}</div>
        </div>
        <div class="table-wrap"><table><thead><tr><th>ردیف</th><th>کالا</th><th>تعداد</th><th>قیمت واحد</th><th>تخفیف٪</th><th>جمع</th></tr></thead><tbody>
          ${inv.items.map((it, n) => `<tr><td>${Fmt.toFa(n + 1)}</td><td>${UI.esc(it.name)}</td><td class="num">${Fmt.num(it.quantity)}</td><td class="num">${Fmt.toman(it.unit_price)}</td><td class="num">${Fmt.toFa(it.discount)}</td><td class="num">${Fmt.toman(it.line_total)}</td></tr>`).join('')}
        </tbody></table></div>
        <div style="max-width:320px;margin-inline-start:auto" class="mt">
          <div class="row between"><span class="muted">جمع اقلام</span><span>${Fmt.toman(inv.subtotal)}</span></div>
          <div class="row between"><span class="muted">تخفیف</span><span>${Fmt.toman(inv.discount)}</span></div>
          <div class="row between"><span class="muted">مالیات</span><span>${Fmt.toman(inv.tax)}</span></div>
          <div class="row between" style="font-size:19px;font-weight:800;margin-top:6px"><span>مبلغ نهایی</span><span>${Fmt.toman(inv.total)}</span></div>
          <div class="row between"><span class="muted">پرداخت‌شده</span><span>${Fmt.toman(inv.paid)}</span></div>
          ${inv.due > 0 ? `<div class="row between" style="color:var(--danger)"><span>بدهکاری</span><span>${Fmt.toman(inv.due)}</span></div>` : ''}
        </div>
        ${inv.note ? `<div class="muted mt">توضیحات: ${UI.esc(inv.note)}</div>` : ''}
        <div class="muted mt" style="text-align:center">${UI.esc(shopName)} — با تشکر از خرید شما</div>
      </div>`;
    root.querySelector('#back').onclick = () => App.navigate('invoices');
    root.querySelector('#print').onclick = () => window.print();
    root.querySelector('#csv').onclick = () => exportCsv(inv);
  }

  function exportCsv(inv) {
    const rows = [['کالا', 'تعداد', 'قیمت واحد(تومان)', 'جمع(تومان)']];
    inv.items.forEach((it) => rows.push([it.name, it.quantity, Math.round(it.unit_price / 10), Math.round(it.line_total / 10)]));
    const csv = '﻿' + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `invoice-${inv.number}.csv`; a.click(); URL.revokeObjectURL(url);
  }
})();
