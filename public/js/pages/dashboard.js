/* داشبورد اصلی (بخش ۳) */
(function () {
  'use strict';
  window.Pages = window.Pages || {};
  window.Pages.dashboard = async function (root) {
    const { dashboard: d } = await API.get('/reports/dashboard');

    const stat = (label, value, cls = '') => `<div class="stat ${cls}"><div class="label">${label}</div><div class="value">${value}</div></div>`;

    root.innerHTML = `
      <div class="grid grid-stats mb">
        ${stat('فروش امروز', Fmt.toman(d.salesToday), 'accent')}
        ${stat('فاکتورهای امروز', Fmt.num(d.invoicesToday))}
        ${stat('سود فروش امروز', Fmt.toman(d.profitToday))}
        ${stat('تعداد کالاها', Fmt.num(d.productCount))}
        ${stat('کالاهای کم‌موجود', Fmt.num(d.lowStockCount), d.lowStockCount ? 'warn' : '')}
        ${stat('موجودی تقریبی انبار', Fmt.toman(d.inventoryValue))}
      </div>

      <div class="card card-pad mb">
        <div class="card-title">میانبرها</div>
        <div class="shortcuts">
          <div class="shortcut" data-go="invoice-new"><span class="ico">🧾</span>فاکتور جدید</div>
          <div class="shortcut" data-go="product-new"><span class="ico">➕</span>ثبت کالا</div>
          <div class="shortcut" data-go="products"><span class="ico">🔍</span>جستجوی کالا</div>
          <div class="shortcut" id="sc-voice"><span class="ico">🎙️</span>با صدا انجام بده</div>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card card-pad">
          <div class="card-title">آخرین فاکتورها</div>
          ${d.recentInvoices.length ? `<div class="table-wrap"><table><thead><tr><th>شماره</th><th>مشتری</th><th>مبلغ</th><th>تاریخ</th></tr></thead><tbody>
            ${d.recentInvoices.map((i) => `<tr data-inv="${i.id}" style="cursor:pointer"><td>${Fmt.toFa(i.number)}</td><td>${UI.esc(i.customer_name || 'نقدی')}</td><td class="num">${Fmt.toman(i.total)}</td><td>${Fmt.jalaliShort(i.created_at)}</td></tr>`).join('')}
          </tbody></table></div>` : UI.emptyState('📄', 'هنوز فاکتوری ثبت نشده است.')}
        </div>
        <div class="card card-pad">
          <div class="card-title">پرفروش‌ترین کالاها</div>
          ${d.topProducts.length ? `<div class="table-wrap"><table><thead><tr><th>کالا</th><th>تعداد فروش</th><th>درآمد</th></tr></thead><tbody>
            ${d.topProducts.map((p) => `<tr><td>${UI.esc(p.name)}</td><td class="num">${Fmt.num(p.qty)}</td><td class="num">${Fmt.toman(p.revenue)}</td></tr>`).join('')}
          </tbody></table></div>` : UI.emptyState('📦', 'داده‌ای موجود نیست.')}
        </div>
      </div>

      ${d.lowStockItems.length ? `<div class="card card-pad mt">
        <div class="card-title">⚠️ کالاهای کم‌موجود</div>
        <div class="row" style="gap:8px">
          ${d.lowStockItems.map((p) => `<span class="badge amber">${UI.esc(p.name)}: ${Fmt.num(p.stock)} ${UI.esc(p.unit)}</span>`).join('')}
        </div></div>` : ''}
    `;

    root.querySelectorAll('[data-go]').forEach((s) => s.onclick = () => App.navigate(s.dataset.go));
    root.querySelector('#sc-voice').onclick = () => App.assistant();
    root.querySelectorAll('[data-inv]').forEach((r) => r.onclick = () => App.navigate('invoices/' + r.dataset.inv));
  };
})();
