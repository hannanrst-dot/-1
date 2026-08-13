/* صفحه ورود */
(function () {
  'use strict';
  window.Pages = window.Pages || {};
  window.Pages.login = function (root) {
    root.innerHTML = `
      <div class="login-wrap">
        <form class="login-card" id="login-form">
          <div class="brand"><span class="logo">ث</span><span>ثبت‌یار</span></div>
          <p class="muted" style="text-align:center;margin-bottom:22px">مدیریت فروشگاه و فروش</p>
          <div class="field mb"><label>نام کاربری</label>
            <input class="input" id="username" autocomplete="username" autofocus></div>
          <div class="field mb"><label>رمز عبور</label>
            <input class="input" id="password" type="password" autocomplete="current-password"></div>
          <button class="btn primary big block" type="submit" id="submit">ورود</button>
          <p class="muted mt" style="text-align:center;font-size:12px">پیش‌فرض: admin / admin</p>
        </form>
      </div>`;
    const form = root.querySelector('#login-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = root.querySelector('#submit');
      btn.disabled = true; btn.textContent = 'در حال ورود…';
      try {
        const { user } = await API.post('/auth/login', {
          username: root.querySelector('#username').value.trim(),
          password: root.querySelector('#password').value,
        });
        UI.success('خوش آمدید ' + user.fullName);
        App.onLoggedIn(user);
      } catch (err) {
        UI.error(err.message);
        btn.disabled = false; btn.textContent = 'ورود';
      }
    };
  };
})();
