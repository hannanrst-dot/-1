/* گزارش‌ها با نمودارهای ساده (بخش ۱۷) */
(function () {
  'use strict';
  window.Pages = window.Pages || {};

  window.Pages.reports = async function (root) {
    const [daily, monthly, profit, debts, products] = await Promise.all([
      API.get('/reports/sales-daily'), API.get('/reports/sales-monthly'),
      API.get('/reports/profit'), API.get('/reports/debts'), API.get('/reports/products'),
    ]);

    root.innerHTML = `
      <div class="grid grid-stats mb">
        ${statCard('کل فروش', Fmt.toman(profit.revenue), 'accent')}
        ${statCard('سود ناخالص', Fmt.toman(profit.grossProfit))}
        ${statCard('سود خالص', Fmt.toman(profit.netProfit))}
        ${statCard('کل خرید', Fmt.toman(profit.purchases))}
        ${statCard('هزینه‌ها', Fmt.toman(profit.expenses))}
      </div>

      <div class="card card-pad mb">
        <div class="card-title">📈 فروش ۱۴ روز اخیر</div>
        ${barChart(daily.days.map((d) => ({ label: Fmt.jalaliShort(d.day + 'T00:00:00').slice(-5), value: d.total })))}
      </div>

      <div class="grid grid-2">
        <div class="card card-pad">
          <div class="card-title">🏆 پرفروش‌ترین کالاها</div>
          ${tableList(products.bestSellers, (p) => [p.name, Fmt.num(p.qty), Fmt.toman(p.revenue)], ['کالا', 'تعداد', 'درآمد'], '📦')}
        </div>
        <div class="card card-pad">
          <div class="card-title">⚠️ کالاهای کم‌موجود</div>
          ${tableList(products.lowStock, (p) => [p.name, Fmt.num(p.stock) + ' ' + p.unit, Fmt.num(p.min_stock)], ['کالا', 'موجودی', 'حداقل'], '✅')}
        </div>
        <div class="card card-pad">
          <div class="card-title">💳 بدهی مشتریان</div>
          ${tableList(debts.customers, (c) => [c.name, Fmt.toman(c.due)], ['مشتری', 'بدهی'], '✅')}
        </div>
        <div class="card card-pad">
          <div class="card-title">🧾 بدهی به تأمین‌کنندگان</div>
          ${tableList(debts.suppliers, (s) => [s.name, Fmt.toman(s.due)], ['تأمین‌کننده', 'بدهی'], '✅')}
        </div>
        <div class="card card-pad">
          <div class="card-title">🐌 کالاهای کم‌فروش</div>
          ${tableList(products.slowMovers, (p) => [p.name, Fmt.num(p.stock)], ['کالا', 'موجودی'], '📦')}
        </div>
        <div class="card card-pad">
          <div class="card-title">📅 فروش ماهانه</div>
          ${tableList(monthly.months, (m) => [Fmt.toFa(m.month), Fmt.num(m.count), Fmt.toman(m.total)], ['ماه', 'فاکتور', 'فروش'], '📊')}
        </div>
      </div>`;

    function statCard(label, value, cls = '') { return `<div class="stat ${cls}"><div class="label">${label}</div><div class="value sm">${value}</div></div>`; }
    function tableList(rows, mapper, headers, emptyIco) {
      if (!rows || !rows.length) return UI.emptyState(emptyIco, 'داده‌ای موجود نیست.');
      return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>
        ${rows.map((r) => `<tr>${mapper(r).map((c, i) => `<td class="${i ? 'num' : ''}">${UI.esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    function barChart(data) {
      if (!data.length) return UI.emptyState('📈', 'داده‌ای برای نمایش نیست.');
      const max = Math.max(...data.map((d) => d.value), 1);
      return `<div class="chart-bars">${data.map((d) => `<div class="bar" style="height:${Math.max(4, d.value / max * 100)}%" title="${Fmt.toman(d.value)}"><span>${d.label}</span></div>`).join('')}</div><div style="height:22px"></div>`;
    }
  };
})();
