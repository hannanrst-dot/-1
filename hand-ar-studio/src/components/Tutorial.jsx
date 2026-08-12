export default function Tutorial({ onClose }) {
  return <div className="tutorial-backdrop">
    <section className="tutorial glass">
      <span className="tutorial-mark">✋</span>
      <h1>استودیو هندسهٔ سه‌بعدی</h1>
      <p>یک شکل از نوار پایین بسازید و با دست‌هایتان جلوی دوربین آن را از هر زاویه بچرخانید، بزرگ و کوچک کنید و داخلش را ببینید.</p>
      <ul>
        <li><b>نیشگون با یک دست و حرکت</b>: چرخاندن آزاد شکل در همهٔ جهت‌ها</li>
        <li><b>نیشگون با دو دست</b>: دور/نزدیک کردن دست‌ها برای بزرگ و کوچک کردن، و جابه‌جا کردن هر دو دست برای حرکت دادن شکل</li>
        <li><b>کف دست باز</b>: رها کردن</li>
      </ul>
      <p className="tutorial-hint">💡 با انتخاب هر شکل، تعداد وجه/یال/رأس و <b>فرمول و مقدار مساحت و حجم</b> نمایش داده می‌شود. دکمهٔ <b>🔪 برش</b> جسم را می‌بُرد تا مقطع و داخل آن دیده شود.</p>
      <button className="primary" onClick={onClose}>شروع تدریس ✨</button>
    </section>
  </div>;
}
