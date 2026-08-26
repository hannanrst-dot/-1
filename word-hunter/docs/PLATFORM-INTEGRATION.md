<div dir="rtl">

# اتصال بازی به پلتفرم کلاس آنلاین

این سند می‌گوید بازی چطور داخل پلتفرم Node.js شما اجرا می‌شود و نمرهٔ
دانش‌آموزان چطور به دست معلم می‌رسد.

---

## تصمیم معماری: چرا بازی به شبکه وصل نمی‌شود

ساده‌ترین راهِ به‌ذهن‌رسیده این است که Socket.IO را داخل خود بازی بگذاریم و
بازی مستقیم با سرور حرف بزند. **این کار را نمی‌کنیم.** دلیل:

- شما همین حالا سامانهٔ ورود، پنل کاربری، کلاس آنلاین و پایگاه‌داده دارید.
  اگر بازی هم شبکهٔ خودش را داشته باشد، باید احراز هویت، اتاق‌ها، اتصال
  دوباره و ذخیره‌سازی را **دو بار** بنویسیم و دو جا نگه داریم.
- بازی یک بازی اکشن است. اگر هر تیر و هر حرکت از شبکه رد شود، روی اینترنت
  ضعیف بازی کند و بریده‌بریده می‌شود.
- ابزارهای دیگری هم قرار است کنار این بازی بیایند. اگر همه یک قرارداد
  مشترک داشته باشند، پنل معلم برای همه یکسان کار می‌کند.

**پس:** بازی یک کلاینت خالص می‌ماند. حرکت تیرها و فیزیک، محلی و روان است.
فقط دو چیز از مرز بازی رد می‌شود: **پیکربندی به داخل** و **نتیجه به بیرون**.
کار زنده و همگام‌سازی را همان Socket.IO خودتان انجام می‌دهد.

---

## جریان کار

```
معلم در کلاس آنلاین «بازی املا» را می‌زند
        │
        ▼
سرور شما یک جلسه می‌سازد  (درس، تعداد پرسش، زمان، واژه‌ها)
        │
        ├─ Socket.IO ─▶ پنل هر دانش‌آموز: «بازی باز شد»
        │
        ▼
مرورگر دانش‌آموز بازی را در یک <iframe> باز می‌کند
با پیکربندیِ همان جلسه
        │
        ▼
دانش‌آموز بازی می‌کند
        │
        ├─ بعد از هر پاسخ ──▶  wordhunter:progress
        │                       صفحهٔ شما این را با Socket.IO
        │                       به تختهٔ زندهٔ معلم می‌فرستد
        ▼
پایان
        └─ wordhunter:finished ──▶ کارنامهٔ کامل + نمرهٔ ۲۰
                                    صفحهٔ شما آن را POST می‌کند
                                    به سرور و در پایگاه‌داده می‌نشیند
```

---

## ۱. باز کردن بازی

بازی را در یک `iframe` بگذارید. پیکربندی از دو راه می‌رود:

### راه الف — از آدرس صفحه (ساده‌ترین)

```js
const config = { /* پایین‌تر */ };
const b64 = Buffer.from(JSON.stringify(config), 'utf8')
  .toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

const url = `/games/word-hunter/index.html#mission=${b64}`;
```

```html
<iframe src="<url>" allow="autoplay" style="width:100%;height:100%;border:0"></iframe>
```

### راه ب — با postMessage

اگر پیکربندی بزرگ است (فهرست بلند واژه)، بازی را خالی باز کنید و پس از
رسیدن `wordhunter:ready` بفرستید:

```js
frame.contentWindow.postMessage({ type: 'wordhunter:mission', config }, '*');
```

---

## ۲. پیکربندی مأموریت

```jsonc
{
  "sessionId": "sess_9f2a",              // شناسهٔ جلسه در سامانهٔ شما
  "student": { "id": "u_42", "name": "سارا محمدی" },

  "kind": "exam",                        // exam = نمره‌دار | practice = تمرین
  "title": "املای درس ۴ — پایهٔ ششم",

  "questionCount": 15,                   // ۳ تا ۶۰
  "durationSec": 480,                    // ۰ یعنی بدون محدودیت
  "lives": 5,                            // ۱ تا ۲۰

  "categories": ["s_s_th", "z_z_z_z"],   // خالی = همهٔ دسته‌ها
  "grade": "grade_5_6",
  "difficulty": 2,                       // ۱ تا ۳

  "gameModes": ["word_hunt", "letter_snipe", "sentence_hunt"],
  "showEconomy": false,                  // در آزمون، سکه و فروشگاه خاموش

  "words": [                             // اختیاری — واژه‌های همین درس
    {
      "word": "مدرسه",
      "incorrectVariants": ["مدرثه", "مدرصه"],
      "ruleExplanation": "هم‌خانوادهٔ «درس» است، پس با «س» نوشته می‌شود.",
      "meaning": "جای درس خواندن",
      "sentence": "هر روز به مدرسه می‌روم."
    }
  ]
}
```

اگر `words` بفرستید، بازی **فقط** از همان‌ها استفاده می‌کند و
`categories`/`grade`/`difficulty` نادیده گرفته می‌شوند.
اگر نفرستید، از بانک ۱۴۱ واژه‌ای خود بازی استفاده می‌شود.

**نکته:** بازی هر ورودی را نامعتبر فرض می‌کند تا خلافش ثابت شود؛
عددهای بیرون از بازه بریده می‌شوند و مقدارهای ناشناخته کنار گذاشته می‌شوند.
پس اگر معلم چیز عجیبی وارد کرد، بازی نمی‌شکند.

### دسته‌های املایی

`s_s_th` (س ص ث) · `z_z_z_z` (ز ض ظ ذ) · `t_t` (ت ط) · `gh_gh` (غ ق) ·
`h_h` (ه ح) · `khva` (خوا/خا) · `tanvin` (تنوین اً) · `gozar` (گزار/گذار) ·
`peyvaste` (نیم‌فاصله)

### حالت‌های بازی در مأموریت

`word_hunt` · `letter_snipe` · `sentence_hunt` · `word_rescue` · `monster_combat`

«شکار در جمله» جمله را با یک جای خالی نشان می‌دهد؛ برای همین بهتر است
واژه‌هایی که می‌فرستید ستون «جمله» را هم داشته باشند (اگر نداشته باشند،
معنی به‌تنهایی سرنخ می‌شود).

«نبرد با غول» و «حملهٔ زمان‌دار» در مأموریت نمی‌آیند: اولی یک صحنهٔ پایانی
مرحله‌محور است و دومی تایمر مستقل خودش را دارد که با زمان کل آزمون تداخل
پیدا می‌کند. این دو در بازی آزاد هستند.

---

## ۳. رویدادهایی که بازی می‌فرستد

همه با `window.parent.postMessage(event, '*')`.

```js
window.addEventListener('message', (e) => {
  const d = e.data;
  if (!d?.type?.startsWith('wordhunter:')) return;

  switch (d.type) {
    case 'wordhunter:ready':     /* بازی بارگذاری شد */ break;
    case 'wordhunter:started':   /* دانش‌آموز «شروع» را زد */ break;
    case 'wordhunter:progress':  socket.emit('spelling:progress', d); break;
    case 'wordhunter:finished':  saveResult(d.result); break;
    case 'wordhunter:exit':      closeGame(); break;
  }
});
```

### `wordhunter:progress` — بعد از هر پاسخ

```jsonc
{
  "type": "wordhunter:progress",
  "sessionId": "sess_9f2a",
  "studentId": "u_42",
  "answered": 4, "questionCount": 15,
  "correct": 3, "wrong": 1, "accuracy": 0.75,
  "score": 620, "bestStreak": 3,
  "livesLeft": 4, "secondsLeft": 402,
  "last": {
    "index": 3, "wordId": "core_s_s_th_1",
    "word": "صابون", "chosen": "سابون",
    "correct": false, "ms": 4210,
    "mode": "word_hunt", "category": "s_s_th"
  }
}
```

همین را به تختهٔ معلم بفرستید تا زنده ببیند چه کسی کجاست.

### `wordhunter:finished` — کارنامه

```jsonc
{
  "type": "wordhunter:finished",
  "result": {
    "sessionId": "sess_9f2a",
    "student": { "id": "u_42", "name": "سارا محمدی" },
    "kind": "exam",
    "startedAt": 1736412000000, "finishedAt": 1736412410000,
    "durationSec": 410,
    "questionCount": 15, "answered": 15,
    "correct": 12, "wrong": 3, "accuracy": 0.8,
    "grade20": 16,                     // ← نمرهٔ آماده برای کارنامه
    "score": 2340, "coins": 168,
    "bestStreak": 6, "livesLeft": 2,
    "completed": true,                 // false یعنی زمان یا جان تمام شد
    "answers": [ /* همهٔ پاسخ‌ها با زمان هر کدام */ ],
    "missed": [
      { "wordId": "...", "word": "صابون",
        "correctSpelling": "صابون",
        "rule": "واژه‌ای عربی است و با «ص» آغاز می‌شود." }
    ]
  }
}
```

`missed` دقیقاً همان چیزی است که برای «تمرین جبرانی» لازم دارید: می‌توانید
جلسهٔ بعد یک مأموریت بسازید که فقط از واژه‌های اشتباهِ همان دانش‌آموز باشد.

---

## ۴. نمونهٔ سمت Node

```js
// ── ساخت جلسه توسط معلم ──
app.post('/api/spelling/sessions', auth, async (req, res) => {
  const { classId, lessonId, questionCount, durationSec } = req.body;
  const words = await Word.find({ lessonId });

  const session = await SpellingSession.create({
    classId, teacherId: req.user.id, lessonId,
    questionCount, durationSec, status: 'open', startedAt: new Date(),
  });

  const config = {
    sessionId: session.id,
    kind: 'exam',
    title: `املای ${lessonId}`,
    questionCount, durationSec, lives: 5,
    categories: [], grade: 'all', difficulty: 2,
    gameModes: ['word_hunt', 'letter_snipe', 'sentence_hunt'],
    showEconomy: false,
    words: words.map(w => ({
      word: w.correct,
      incorrectVariants: w.wrong,
      ruleExplanation: w.rule,
      meaning: w.meaning,
      sentence: w.sentence,
    })),
  };

  // به همهٔ دانش‌آموزان کلاس خبر بده
  io.to(`class:${classId}`).emit('game:open', {
    game: 'word-hunter',
    // پیکربندی هر دانش‌آموز فقط در بخش student فرق می‌کند
    config,
  });

  res.json({ sessionId: session.id });
});

// ── دریافت نتیجه ──
app.post('/api/spelling/results', auth, async (req, res) => {
  const r = req.body;

  // نمره را دوباره از روی پاسخ‌ها حساب کن، به عدد فرستاده‌شده اعتماد نکن
  const correct = r.answers.filter(a => a.correct).length;
  const grade20 = Math.round((correct / r.questionCount) * 20 * 100) / 100;

  await SpellingResult.create({
    sessionId: r.sessionId,
    studentId: req.user.id,          // ← از توکن، نه از بدنهٔ درخواست
    correct, grade20,
    accuracy: correct / Math.max(1, r.answered),
    durationSec: r.durationSec,
    answers: r.answers,
    missed: r.missed,
  });

  io.to(`teacher:${r.sessionId}`).emit('spelling:finished', {
    studentId: req.user.id, grade20, correct,
  });

  res.json({ ok: true });
});
```

---

## ۵. صداقت آزمون — چه چیزی تضمین می‌شود و چه چیزی نه

**باید بدانید:** بازی در مرورگر دانش‌آموز اجرا می‌شود، پس پاسخ درست در
حافظهٔ مرورگر او هست. یک دانش‌آموز که با ابزار توسعهٔ مرورگر آشنا باشد
می‌تواند جواب‌ها را ببیند. برای آزمون کلاسی ابتدایی این ریسک عملاً صفر
است، اما اگر روزی این نمره وزن جدی پیدا کرد، دو کار لازم است:

1. **نمره را همیشه سمت سرور دوباره حساب کنید** (در نمونهٔ بالا انجام شده).
   به `grade20`ای که از مرورگر می‌آید اعتماد نکنید.
2. **گزینه‌ها را سرور بسازد.** یعنی سرور به‌جای واژه، چند «گزینهٔ بی‌نام»
   بفرستد و فقط شناسهٔ گزینه‌ها را بداند؛ بازی نداند کدام درست است و
   انتخاب دانش‌آموز را برای داوری به سرور بفرستد. ساختار پیام‌های فعلی
   طوری طراحی شده که این تغییر بعداً بدون به‌هم‌ریختن بقیه ممکن باشد.

کارهای سادهٔ دیگری که همین حالا شدنی است: زمان‌بندی سرور (نه مرورگر)،
ثبت زمان پاسخ هر پرسش (که هست — پاسخ‌های مشکوکِ زیر یک ثانیه پیدا می‌شوند)،
و بستن جلسه از سمت سرور.

---

## ۶. چیزهایی که هنگام پیاده‌سازی یادتان نرود

- **`allow="autoplay"`** روی iframe، وگرنه صدا در بعضی مرورگرها بسته می‌ماند.
- **بررسی `e.origin`** در `message` اگر بازی روی دامنهٔ دیگری میزبانی می‌شود.
- **اتصال قطع شد؟** رویداد `progress` بعد از هر پاسخ می‌آید؛ اگر آن را
  ذخیره کنید، حتی اگر دانش‌آموز وسط کار قطع شد، کارنامهٔ ناقصش را دارید.
- **گوشی:** میدان بازی افقی است. بازی خودش پیام «گوشی را افقی بگیر»
  نشان می‌دهد، ولی بهتر است قاب را تمام‌صفحه باز کنید.
- **یک دستگاه، چند دانش‌آموز:** بازی پیشرفت را در `localStorage` نگه
  می‌دارد. اگر چند دانش‌آموز از یک رایانه استفاده می‌کنند، اقتصاد بازی
  (سکه/کمان) را سمت سرور نگه دارید و در پیکربندی بفرستید.

</div>
