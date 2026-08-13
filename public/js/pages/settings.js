/* تنظیمات: اطلاعات فروشگاه، کاربران، پشتیبان‌گیری، موتور صوتی (بخش‌های ۲۰، ۲۴، ۲۵) */
(function () {
  'use strict';
  window.Pages = window.Pages || {};
  const isAdmin = () => App.state.user && App.state.user.role === 'admin';

  window.Pages.settings = async function (root) {
    const { settings } = await API.get('/settings');
    let voiceInfo = {};
    try { voiceInfo = (await API.get('/voice/info')).info; } catch (_) {}

    root.innerHTML = `
      <div class="card card-pad mb">
        <div class="card-title">🏪 اطلاعات فروشگاه</div>
        <div class="form-grid">
          <div class="field"><label>نام فروشگاه</label><input class="input" id="shop_name" value="${UI.esc(settings.shop_name || '')}"></div>
          <div class="field"><label>تلفن</label><input class="input" id="shop_phone" value="${UI.esc(settings.shop_phone || '')}"></div>
          <div class="field full"><label>آدرس</label><input class="input" id="shop_address" value="${UI.esc(settings.shop_address || '')}"></div>
          <div class="field"><label>مالیات پیش‌فرض (٪)</label><input class="input" id="default_tax" value="${UI.esc(settings.default_tax || '0')}"></div>
        </div>
        <button class="btn success mt" id="save-settings" ${isAdmin() ? '' : 'disabled'}>ذخیره</button>
        ${isAdmin() ? '' : '<span class="muted mt"> فقط مدیر می‌تواند تنظیمات را تغییر دهد.</span>'}
      </div>

      <div class="card card-pad mb">
        <div class="card-title">🎙️ موتور صوتی</div>
        <p class="muted">موتور فعال تشخیص گفتار: <span class="badge blue">${UI.esc((voiceInfo.recognizer && voiceInfo.recognizer.engine) || '—')}</span>
          — حالت: ${UI.esc((voiceInfo.recognizer && voiceInfo.recognizer.mode) || '—')} — زبان: ${UI.esc((voiceInfo.recognizer && voiceInfo.recognizer.lang) || '—')}</p>
        <p class="muted mt">${Voice.supported() ? '✅ مرورگر شما از تشخیص گفتار پشتیبانی می‌کند.' : '⚠️ این مرورگر از تشخیص گفتار پشتیبانی نمی‌کند؛ از گوگل‌کروم استفاده کنید.'}</p>
      </div>

      ${isAdmin() ? `
      <div class="card card-pad mb" id="users-card"><div class="card-title">👤 کاربران و سطوح دسترسی</div><div id="users">${UI.spinner()}</div>
        <button class="btn primary mt" id="add-user">➕ کاربر جدید</button></div>

      <div class="card card-pad"><div class="card-title">💾 پشتیبان‌گیری و بازیابی</div>
        <p class="muted mb">دیتابیس این نرم‌افزار یک فایل مستقل است و به‌راحتی بین هاست‌ها منتقل می‌شود.</p>
        <button class="btn primary" id="do-backup">ساخت پشتیبان جدید</button>
        <div id="backups" class="mt">${UI.spinner()}</div></div>` : ''}`;

    root.querySelector('#save-settings') && (root.querySelector('#save-settings').onclick = async () => {
      try {
        await API.put('/settings', {
          shop_name: root.querySelector('#shop_name').value, shop_phone: root.querySelector('#shop_phone').value,
          shop_address: root.querySelector('#shop_address').value, default_tax: Fmt.toEn(root.querySelector('#default_tax').value),
        });
        UI.success('تنظیمات ذخیره شد.');
      } catch (e) { UI.error(e.message); }
    });

    if (isAdmin()) {
      loadUsers(); loadBackups();
      root.querySelector('#add-user').onclick = addUser;
      root.querySelector('#do-backup').onclick = async () => {
        try { const r = await API.post('/backup'); UI.success('پشتیبان ساخته شد: ' + r.file); loadBackups(); }
        catch (e) { UI.error(e.message); }
      };
    }

    async function loadUsers() {
      const { users } = await API.get('/auth/users');
      const roleLabel = { admin: 'مدیر', seller: 'فروشنده', stockkeeper: 'انباردار' };
      root.querySelector('#users').innerHTML = `<div class="table-wrap"><table><thead><tr><th>نام</th><th>نام کاربری</th><th>نقش</th><th>وضعیت</th></tr></thead><tbody>
        ${users.map((u) => `<tr><td>${UI.esc(u.full_name)}</td><td>${UI.esc(u.username)}</td><td><span class="badge blue">${roleLabel[u.role] || u.role}</span></td><td>${u.is_active ? '<span class="badge green">فعال</span>' : '<span class="badge red">غیرفعال</span>'}</td></tr>`).join('')}
      </tbody></table></div>`;
    }

    function addUser() {
      const body = UI.el(`<div class="form-grid">
        <div class="field"><label>نام کامل *</label><input class="input" id="u-name"></div>
        <div class="field"><label>نام کاربری *</label><input class="input" id="u-username"></div>
        <div class="field"><label>رمز عبور *</label><input class="input" id="u-pass" type="password"></div>
        <div class="field"><label>نقش</label><select class="select" id="u-role"><option value="seller">فروشنده</option><option value="stockkeeper">انباردار</option><option value="admin">مدیر</option></select></div>
      </div>`);
      const foot = UI.el(`<button class="btn success">ایجاد کاربر</button>`);
      const close = UI.modal({ title: 'کاربر جدید', body, footer: foot });
      foot.onclick = async () => {
        try {
          await API.post('/auth/users', { fullName: body.querySelector('#u-name').value.trim(), username: body.querySelector('#u-username').value.trim(), password: body.querySelector('#u-pass').value, role: body.querySelector('#u-role').value });
          UI.success('کاربر ساخته شد.'); close(); loadUsers();
        } catch (e) { UI.error(e.message); }
      };
    }

    async function loadBackups() {
      const { backups } = await API.get('/backup');
      root.querySelector('#backups').innerHTML = backups.length ? `<div class="table-wrap"><table><thead><tr><th>فایل</th><th>حجم</th><th>تاریخ</th><th></th></tr></thead><tbody>
        ${backups.map((b) => `<tr><td>${UI.esc(b.name)}</td><td class="num">${Fmt.num(Math.round(b.size / 1024))} KB</td><td>${Fmt.jalali(b.created_at, true)}</td>
          <td><a class="btn icon" href="/api/backup/download/${encodeURIComponent(b.name)}" title="دانلود">⬇️</a></td></tr>`).join('')}
      </tbody></table></div>` : UI.emptyState('💾', 'هنوز پشتیبانی ساخته نشده است.');
    }
  };
})();
