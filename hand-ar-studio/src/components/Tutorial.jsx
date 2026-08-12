export default function Tutorial({ onClose }) {
  return <div className="tutorial-backdrop">
    <section className="tutorial glass">
      <span className="tutorial-mark">✋</span>
      <h1>استودیو شکل‌های سه‌بعدی</h1>
      <p>شکلی از نوار پایین بسازید و با دست‌هایتان جلوی دوربین آن را جابه‌جا کنید، بچرخانید و بزرگ و کوچک کنید.</p>
      <ul>
        <li><b>نیشگون</b> با شست و اشاره روی یک شکل: انتخاب و گرفتن</li>
        <li><b>حرکت دست</b> هنگام نیشگون: جابه‌جایی شکل (نزدیک/دور کردن دست، عمق را تغییر می‌دهد)</li>
        <li><b>چرخاندن مچ</b> هنگام نیشگون: چرخاندن شکل برای دیدن همهٔ وجه‌ها</li>
        <li><b>دو دست نیشگون</b>: دور کردن برای بزرگ‌نمایی، نزدیک کردن برای کوچک‌نمایی</li>
        <li><b>کف دست باز</b>: رها کردن شکل</li>
      </ul>
      <p className="tutorial-hint">💡 با انتخاب هر شکل، تعداد وجه‌ها، یال‌ها و رأس‌های آن نمایش داده می‌شود.</p>
      <button className="primary" onClick={onClose}>شروع تجربه ✨</button>
    </section>
  </div>;
}
