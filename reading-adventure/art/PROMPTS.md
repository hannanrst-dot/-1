# پرامپت‌های تصویر — برای نانو بنانا

بازی بدونِ این تصویرها هم کار می‌کند (صحنه‌ها با کد نقاشی می‌شوند).
هر فایلی که اینجا بگذاری، **خودکار** جای نقاشیِ کد را می‌گیرد. هیچ کدی لازم نیست عوض کنی.

## نام‌گذاری

فایل‌ها را دقیقاً با این نام‌ها در همین پوشه (`reading-adventure/art/`) بگذار:

| فایل | صحنه |
|---|---|
| `gate.webp` | بیرونِ کاروانسرا، شب |
| `tower.webp` | اتاقکِ بالای برج |
| `yard.webp` | حیاطِ کاروانسرا زیرِ ماه |
| `store.webp` | انبارِ ته ده |
| `dawn.webp` | سحر |
| `who-negar.webp` | چهرهٔ نگار |
| `who-rajab.webp` | چهرهٔ مشد رجب |
| `who-gohar.webp` | چهرهٔ بی‌بی گوهر |
| `who-amoo.webp` | چهرهٔ عمویِ نگار |
| `village.webp` | دِه کوهستانی زیرِ باران، غروب |
| `river.webp` | گدارِ رود، از نزدیک |
| `path.webp` | راهِ گِلیِ باغ‌ها |
| `house.webp` | داخلِ آغل |
| `dusk.webp` | شبِ بارانی |
| `who-heydar.webp` | چهرهٔ مشدی حیدر |
| `who-sakineh.webp` | چهرهٔ ننه‌سکینه |

`.png` و `.jpg` هم کار می‌کنند (به همین ترتیب امتحان می‌شوند)، ولی `.webp` سبک‌تر است.

## اندازه

- **صحنه‌ها:** افقی و عریض، حداقل ۱۹۲۰×۱۰۸۰. تصویر به‌صورت `cover` کشیده می‌شود،
  پس کناره‌ها ممکن است بریده شوند — چیزی مهم را لبِ کادر نگذار.
- **چهره‌ها:** عمودی، حدود ۶۰۰×۸۰۰، نیم‌تنه.

## دو قانونی که حتماً باید رعایت شود

1. **سوژه را در نیمهٔ بالاییِ کادر بگذار.** نیمهٔ پایینِ صفحه را پنلِ گفت‌وگو می‌پوشاند.
   یک‌سومِ پایینیِ تصویر باید ساده و تیره باشد تا متن رویش خوانا بماند.
2. **هیچ نوشته، حرف، عدد یا لوگویی در تصویر نباشد.** متنِ بازی روی تصویر می‌آید.

---

## سرآغازِ مشترک (این را ابتدای هر پرامپت بچسبان)

> Wide cinematic 16:9 illustrated background for a children's storybook game.
> Hand-painted flat illustration with soft gradients and gentle grain, NOT 3D, NOT photorealistic.
> Persian / Iranian desert setting. Palette: deep indigo-violet night, dusty clay, and warm amber lamplight.
> Calm, mysterious, warm. No people unless asked. No text, no letters, no numbers, no logos, no watermark, no frame or border.
> Keep the subject in the upper half; leave the bottom third simple and dark for text overlay.

---

## ۱ · `gate.webp`

> An old Persian caravanserai seen from outside at night. Tall mud-brick adobe walls with crenellated
> battlements, a large pointed archway gate in the middle, and a tall square watchtower on the right.
> **The lamp at the top of the tower is DARK and unlit** — that is the whole point of the picture.
> A few small windows in the wall glow faint warm amber. Pale moon in the upper left, deep starry
> indigo sky, rolling sand dunes in the foreground.

## ۲ · `tower.webp`

> Interior of a small stone room at the top of a watchtower, at night. A large empty copper oil lamp
> stands in the middle of the room, unlit, its oil tank lid left open. Bare mud-brick walls.
> A small arched window on the left showing stars. The only light is a warm handheld lantern glow
> coming from the lower part of the frame, so the room is dim with dust floating in the light.

## ۳ · `yard.webp`

> The moonlit inner courtyard of a Persian caravanserai at night. High mud-brick walls with
> battlements on the left, right, and across the back. One single small window on the right wall glows
> warm amber; everything else is cool blue moonlight. Bare packed sand ground in the lower third with
> faint cart-wheel tracks curving across it, and **a few tiny glinting drops of spilled oil on the
> sand at about 40% from the left edge and 74% down the frame**. Moon high on the right.

> ⚠️ در این صحنه بازیکن باید قطره‌های روغن را پیدا کند. اگر تصویرت آن‌ها را جای دیگری گذاشت،
> در `index.html` دنبال `at:[.40, .745, .085]` بگرد و دو عدد اول را با موقعیتِ واقعی عوض کن
> (کسری از عرض و ارتفاعِ تصویر).

## ۴ · `store.webp`

> Inside a dark village storeroom at night. Big burlap grain sacks on the floor on the left.
> **A rectangular metal oil tin standing behind the sacks, slightly right of centre — at about 56% from
> the left edge and 60% down the frame — catching a small highlight.** A tiny oil lamp burning on the
> left casts a warm pool of light; the rest is very dark. A thin blade of light comes through the
> half-open wooden door on the right. Dust in the air.

> ⚠️ اینجا هم بازیکن باید حلبِ روغن را پیدا کند. عددهای مربوطه در `index.html`: `at:[.565, .60, .085]`.

## ۵ · `dawn.webp`

> The same Persian caravanserai and its watchtower seen from the desert at sunrise. Low warm sun just
> above the horizon, sky graded from lilac at the top to amber near the ground, long soft dunes,
> the building as a calm dark silhouette. Quiet and a little melancholy.

---

## چهره‌ها

سرآغازِ چهره‌ها (به‌جای سرآغازِ بالا):

> Vertical 3:4 character portrait for a children's storybook game, waist-up, hand-painted flat
> illustration with soft gradients, warm amber lamplight from one side against a dark indigo
> background. Iranian faces and clothing, warm and kind, not caricatured.
> No text, no logo, no border.

- **`who-negar.webp`** — An Iranian village girl about eleven years old, dark hair in a simple headscarf, a plain village dress. She looks a little worried and is hiding something behind her back.
- **`who-rajab.webp`** — An elderly Iranian village watchman, white beard, weathered kind face, a felt hat and a simple long coat. He looks tired and anxious, holding a lantern.
- **`who-gohar.webp`** — An elderly Iranian grandmother in a floral headscarf, calm and warm, deep laugh lines, looking gently off to one side.
- **`who-amoo.webp`** — An Iranian village man in his forties, thin, unshaven, a worn patched coat. Ashamed and exhausted, eyes lowered.

---

---

# داستانِ دوم · پلِ چوبی

هوای این داستان کاملاً فرقِ داستانِ اول است: **روز است نه شب، بارانی است، سرد و سبز-خاکستری.**
سرآغازِ این پنج صحنه با سرآغازِ بالا فرق دارد:

> Wide cinematic 16:9 illustrated background for a children storybook game.
> Hand-painted flat illustration with soft gradients and gentle grain, NOT 3D, NOT photorealistic.
> A rainy late afternoon in an Iranian mountain village in the north. Heavy rain, low cloud,
> everything wet. Palette: cold slate blue, wet grey-green, dark wet earth, one small warm amber light.
> Tense and cold. No text, no letters, no numbers, no logos, no watermark, no frame or border.
> Keep the subject in the upper half; leave the bottom third simple and dark for text overlay.

## ۶ · `village.webp`

> A mountain village on a rainy late afternoon, seen from the near bank of a swollen river.
> Layered misty mountain ridges at the back. Across the water, a row of dark flat-roofed mud-brick
> village houses — **and exactly one of them has a lit warm-amber window, at about 74% from the left
> edge and 34% down the frame; every other house is dark.** A narrow old wooden footbridge crosses
> the brown swollen river in the middle of the frame. Rain streaks everywhere.

> ⚠️ بازیکن باید همان خانهٔ روشن را پیدا کند. عدد در `index.html`: `at:[.735, .335, .075]`.

## ۷ · `river.webp`

> Close view of a swollen brown mountain river in heavy rain, seen from its bank. On the left, a
> patch of water that is **smooth, dark and glassy** — deep water. On the right, at about 63% from
> the left edge and 65% down the frame, the water breaks over hidden rocks into **bright white foam**
> — the shallow crossing. A few wet dark boulders. Grey cliff and pine trees on the far bank.

> ⚠️ بازیکن باید همان کفِ سفید را پیدا کند. عدد: `at:[.63, .655, .085]`.

## ۸ · `path.webp`

> A narrow muddy lane between old walnut trees and low mud-brick orchard walls, in heavy rain, late
> afternoon. Deep puddles and cart ruts in the churned mud. **A single old wooden walking stick with
> a curved handle lying abandoned in the mud at about 37% from the left edge and 70% down the frame**,
> catching a faint highlight. Wet bare branches overhead.

> ⚠️ بازیکن باید همان عصا را پیدا کند. عدد: `at:[.37, .705, .085]`.

## ۹ · `house.webp`

> Inside a small dark village animal shed at dusk during a flood. Ankle-deep water covering the earth
> floor and reflecting a tiny oil lamp on the left. A frightened goat standing on the right.
> **A thick wooden roof post slightly right of centre with a rope wound and knotted tightly around it
> at about 58% from the left edge and 46% down the frame.** A half-open plank door on the left with
> grey rain visible through the gap.

> ⚠️ بازیکن باید همان گره را پیدا کند. عدد: `at:[.585, .455, .08]`.

## ۱۰ · `dusk.webp`

> The same mountain valley after dark, in pouring rain. Almost no light: black ridges against a
> slightly less black sky, one thin cold band of last light on the horizon, and the pale line of the
> flooded river far below. Empty, cold and lonely.

## چهره‌های داستانِ دوم

- **`who-heydar.webp`** — An elderly Iranian village miller, broad shoulders, grey stubble, a soaked wool hat and a heavy wet coat. Weathered and calm, certain of what he is saying. Grey rainy daylight, not lamplight.
- **`who-sakineh.webp`** — An elderly Iranian village woman in a soaked floral headscarf, small and stubborn, water running down her face, refusing to leave. Grey rainy daylight.

---

## اگر خواستی همه‌شان یک‌دست باشند

بهترین روش با نانو بنانا: اول `gate` را بساز، از نتیجه راضی شدی، بعد برای بقیه بنویس
«same illustration style, same palette and lighting as the previous image» و پرامپتِ صحنهٔ بعد را بده.
برای چهره‌ها هم اول نگار را بساز و بقیه را با «same character art style as the previous portrait» ادامه بده.
