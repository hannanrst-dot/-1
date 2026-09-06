/*!
title: از تخم تا قورباغه — هر کدام جای خود ۲ (بازی)
bg: #12242c
*/

/* ═══════════════════════════════════════════════════════════════════════
   از تخم تا قورباغه — علومِ سوم، درس ۱۳ «هر کدام جای خود (۲)»  (بازی)

   کتاب چرخهٔ زندگیِ قورباغه را این‌طور می‌گوید:
     ۱ــ قورباغه‌ها داخلِ آب تخم می‌گذارند.
     ۲ــ بچّه‌قورباغه‌ها در آغاز مثلِ ماهی‌ها درونِ آب زندگی می‌کنند و
         با آبشش نفس می‌کشند؛ برای شنا از دُمِ بلندشان استفاده می‌کنند.
     ۳ــ با بزرگ شدن، دست‌ها و پاهایش ظاهر می‌شوند؛ آبشش‌ها از بین
         می‌روند و به جای آن‌ها شش‌ها ساخته می‌شوند.
     ۴ــ پس از این تغییرات می‌تواند در خشکی و نزدیکِ آب زندگی کند.

   اینجا بچّه خودش همان قورباغه است و هر مرحله را زندگی می‌کند — نه
   اینکه دربارهٔ آن بخواند. مهم‌ترین جایش همان‌جاست که آبشش‌ها می‌روند
   و شش می‌آید: از آن لحظه به بعد باید برای نفس کشیدن بیاید سرِ آب.
   بازی این را نمی‌گوید؛ نوارِ هوا خودش پیدا می‌شود و بچّه می‌فهمد.

   ── درستیِ زیستی ───────────────────────────────────────────────
   ترتیبِ دگردیسی همان ترتیبِ واقعی است: تخم ← بچّه‌قورباغهٔ بی‌پا با
   آبشش و دُمِ بلند ← درآمدنِ پاهای عقب ← درآمدنِ دست‌ها و ساخته شدنِ
   شش ← کوتاه شدنِ دُم و بیرون آمدن از آب. شنا با دُم است تا وقتی
   دُم هست، و بعد با پاهای عقبِ پرده‌دار. ماهی هم بچّه‌قورباغه را
   شکار می‌کند، همان‌طور که در برکهٔ واقعی.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  sky: '#7fb0cc', skyLo: '#5b86a8',
  water: '#2e7f9f', waterLo: '#12414f', waterLt: '#63b4cc', foam: '#cfeef6',
  bank: '#7a5a3a', bankLo: '#4d3722', grass: '#4f9f4a', grassDk: '#2f6b2e',
  weed: '#3f8f5a', algae: '#8fd44a', egg: '#e8eef0', eggDot: '#2a3a44',
  tad: '#4a5c3a', tadLt: '#6f8a52', frog: '#5fa83f', frogLt: '#8fd45a',
  belly: '#e8e0b8', eye: '#f4d84a',
  fish: '#c9683f', fishLt: '#e8a06a',
  fly: '#3a3a4a', flyWing: 'rgba(220,236,246,.7)',
  paper: '#fbf7ec', card: '#ffffff',
  ink: '#152730', inkSoft: '#6f8b93',
  good: '#5fb07f', bad: '#d3624a', gold: '#e5b344', accent: '#5fc0d8',
};

/* ───────── برکه ───────── */

const SURF = 250;              /* سطحِ آب */
const BED = 690;               /* کفِ برکه */
const BANK_X = 850;            /* لبهٔ خشکی */
const AIR_TIME = 14;           /* هر چند ثانیه باید نفس بگیرد */
const TONGUE_R = 300;          /* تا کجا زبانش می‌رسد */

/* مرحله‌های زندگی — همان ترتیبِ کتاب */
const STAGES = [
  { n: 'تخم',            need: 5,  what: 'tap' },
  { n: 'بچّه‌قورباغه',    need: 6,  what: 'eat' },
  { n: 'پاهای عقب',      need: 6,  what: 'eat' },
  { n: 'دست‌ها و شش',     need: 6,  what: 'eat' },
  { n: 'قورباغه',        need: 5,  what: 'fly' },
];

const S = {
  phase: 'intro', phaseT: 0,
  stage: 0, got: 0, score: 0, best: 0,
  x: 420, y: 430, vx: 0, vy: 0, ang: 0, wig: 0,
  onLand: false, landT: 0,
  air: 1,
  aim: null,
  algae: [], flies: [], fish: null,
  tongue: 0, tongueTo: null,
  hop: null,                 /* پرشِ قورباغه روی خشکی */
  hurt: 0,
  won: false, winT: 0,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
  tut: { on: false, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

const ST = () => STAGES[Math.min(S.stage, STAGES.length - 1)];
function tip(msg) { S.tip = msg; S.tipT = 3.2; }
const hasLungs = () => S.stage >= 3;
const tailLen = () => (S.stage === 0 ? 0 : S.stage === 1 ? 34 : S.stage === 2 ? 32 : S.stage === 3 ? 22 : 4);
const bodyR = () => 13 + S.stage * 3;

function spawnAlgae(n) {
  for (let i = 0; i < n; i++) {
    S.algae.push({
      x: 120 + Math.random() * (BANK_X - 200),
      y: SURF + 60 + Math.random() * (BED - SURF - 120),
      ph: Math.random() * TAU,
    });
  }
}
function spawnFlies(n) {
  for (let i = 0; i < n; i++) {
    S.flies.push({
      x: 580 + Math.random() * 540,
      y: 110 + Math.random() * 110,
      ph: Math.random() * TAU, sp: .6 + Math.random() * .8,
    });
  }
}

function resetGame() {
  S.stage = 0; S.got = 0;
  S.x = 420; S.y = 400; S.vx = 0; S.vy = 0; S.ang = 0;
  S.onLand = false; S.air = 1; S.aim = null;
  S.algae.length = 0; S.flies.length = 0;
  S.fish = null; S.tongue = 0; S.tongueTo = null; S.hop = null;
  S.won = false; S.winT = 0;
}

function startGame(keep) {
  S.phase = 'play'; S.phaseT = 0;
  if (!keep) S.score = 0;
  S.tut.on = !keep; S.tut.step = 0; S.tut.t = 0;
  resetGame();
}

/* ───────── پیشرفتِ مرحله ───────── */

function grow() {
  S.got = 0;
  S.stage++;
  S.score += 100;
  if (S.score > S.best) S.best = S.score;
  sfx.win();
  bits.confetti(S.x, S.y, 20, [P.frogLt, P.algae, P.foam, '#fff']);
  if (S.stage === 1) { spawnAlgae(8); S.fish = { x: 200, y: 500, vx: 60, vy: 0 }; }
  if (S.stage === 3) { S.air = 1; toast.say('حالا شش داری', 'good'); }
  if (S.stage === 4) {
    S.fish = null;
    S.algae.length = 0;
    spawnFlies(6);
    S.onLand = true;
    S.x = BANK_X + 110; S.y = SURF - 40; S.vx = 0; S.vy = 0;
    toast.say('حالا می‌توانی بیرون بیایی', 'good');
  } else if (S.stage < STAGES.length) toast.say(ST().n, 'good');
}

function collect() {
  S.got++;
  S.score += 20;
  if (S.score > S.best) S.best = S.score;
  sfx.pop();
  if (S.got >= ST().need) {
    if (S.stage >= STAGES.length - 1) {
      S.won = true; S.winT = .001;
      S.score += 200;
      if (S.score > S.best) S.best = S.score;
      sfx.win();
      bits.confetti(S.x, S.y, 34, [P.frogLt, P.gold, P.foam, '#fff']);
    } else grow();
  }
}

/* ───────── ورودی ───────── */

const BTN_GO = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 492, w: 300, h: 68 };
const TUT_TAP = [0, 1, 2], TUT_LAST = 2;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.aim) { S.aim.x = p.x; S.aim.y = p.y; return; }
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { startGame(); sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) { S.phase = 'intro'; S.phaseT = 0; S.score = 0; resetGame(); sfx.tap(); }
    return;
  }
  if (S.tut.on && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  if (S.winT) return;
  if (S.stage === 0) {
    /* تکان دادنِ تخم تا باز شود */
    S.got++;
    S.wig = 1;
    sfx.tick();
    bits.spark(S.x, S.y, 4, [P.egg, P.foam]);
    if (S.got >= ST().need) grow();
    return;
  }
  if (S.stage === 4) {
    /* اگر روی مگسِ نزدیک زدی، زبان؛ وگرنه به آن سمت بپر */
    let best = -1, bd = 1e9;
    S.flies.forEach((f, i) => {
      const d = Math.hypot(f.x - S.x, f.y - S.y);
      const dTap = Math.hypot(f.x - p.x, f.y - p.y);
      if (d < TONGUE_R && dTap < 150 && dTap < bd) { bd = dTap; best = i; }
    });
    if (best >= 0 && !S.tongue) {
      S.tongueTo = { x: S.flies[best].x, y: S.flies[best].y, i: best };
      S.tongue = .001;
      sfx.slide();
      return;
    }
    if (!S.hop) {
      S.hop = { x0: S.x, x1: clamp(p.x, BANK_X + 30, SCENE_W - 60), t: 0 };
      sfx.tap();
    }
    return;
  }
  S.aim = { x: p.x, y: p.y };
  try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ }
});

function release() { S.aim = null; }
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
addEventListener('blur', release);

/* ───────── حرکت ───────── */

function swim(dt) {
  const speed = S.stage === 1 ? 260 : S.stage === 2 ? 320 : 360;
  if (S.aim) {
    const dx = S.aim.x - S.x, dy = S.aim.y - S.y;
    const d = Math.max(1, Math.hypot(dx, dy));
    S.vx += dx / d * speed * 2.6 * dt;
    S.vy += dy / d * speed * 2.6 * dt;
    S.wig = Math.min(1, S.wig + dt * 3);
  } else S.wig = Math.max(0, S.wig - dt * 2);
  const k = Math.exp(-2.2 * dt);
  S.vx *= k; S.vy *= k;
  const sp = Math.hypot(S.vx, S.vy);
  if (sp > speed) { S.vx = S.vx / sp * speed; S.vy = S.vy / sp * speed; }
  S.x += S.vx * dt; S.y += S.vy * dt;
  if (sp > 12) S.ang = Math.atan2(S.vy, S.vx);
  /* مرزهای برکه */
  S.x = clamp(S.x, 40, BANK_X - 20);
  const top = SURF + (hasLungs() ? -6 : 14);
  if (S.y < top) { S.y = top; S.vy = Math.abs(S.vy) * .3; }
  if (S.y > BED - 20) { S.y = BED - 20; S.vy = -Math.abs(S.vy) * .3; }
  /* هوا */
  if (hasLungs()) {
    if (S.y < SURF + 16) {
      S.air = Math.min(1, S.air + dt * 1.6);
      if (Math.random() < dt * 10) bits.add(S.x, SURF, 1, 'dot', [P.foam], { speed: 20, lift: 30, size: 3, life: .5, grav: -20 });
    } else S.air = Math.max(0, S.air - dt / AIR_TIME);
  }
}

function landStep(dt) {
  /* روی خشکی می‌نشیند و با ضربه به این‌سو و آن‌سو می‌پرد */
  const gy = SURF - 40;
  if (S.hop) {
    S.hop.t += dt * 1.7;
    const u = clamp(S.hop.t, 0, 1);
    S.x = lerp(S.hop.x0, S.hop.x1, u);
    S.y = gy - Math.sin(Math.PI * u) * 66;
    if (u >= 1) { S.hop = null; S.y = gy; }
  } else {
    S.y += (gy - S.y) * clamp(dt * 6, 0, 1);
    S.x = clamp(S.x, BANK_X + 30, SCENE_W - 60);
  }
  if (S.tongue) {
    S.tongue += dt * 3.4;
    if (S.tongue >= 1) {
      S.tongue = 0;
      if (S.tongueTo && S.flies[S.tongueTo.i]) {
        S.flies.splice(S.tongueTo.i, 1);
        spawnFlies(1);
        collect();
      }
      S.tongueTo = null;
    }
  }
}

function stepFish(dt) {
  const f = S.fish;
  if (!f) return;
  const dx = S.x - f.x, dy = S.y - f.y;
  const d = Math.max(1, Math.hypot(dx, dy));
  const sp = 96 + S.stage * 16;
  f.vx += dx / d * sp * 1.2 * dt;
  f.vy += dy / d * sp * 1.2 * dt;
  const k = Math.exp(-1.4 * dt);
  f.vx *= k; f.vy *= k;
  const s2 = Math.hypot(f.vx, f.vy);
  if (s2 > sp) { f.vx = f.vx / s2 * sp; f.vy = f.vy / s2 * sp; }
  f.x += f.vx * dt; f.y += f.vy * dt;
  f.x = clamp(f.x, 60, BANK_X - 40);
  f.y = clamp(f.y, SURF + 40, BED - 30);
  if (S.hurt <= 0 && d < bodyR() + 26) {
    S.hurt = 1.4;
    S.shake = .18;
    sfx.nope();
    S.vx = -dx / d * 320; S.vy = -dy / d * 320;
    if (S.got > 0) { S.got--; S.score = Math.max(0, S.score - 20); }
    toast.say('ماهی!', 'bad');
  }
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.hurt > 0) S.hurt -= dt;
  if (S.tut.on) S.tut.t += dt;
  if (S.wig > 0 && S.stage === 0) S.wig = Math.max(0, S.wig - dt * 2);

  if (S.phase === 'play' && !S.winT) {
    if (S.stage === 0) { /* تخم فقط تکان می‌خورد */ }
    else if (S.stage === 4) landStep(dt);
    else { swim(dt); stepFish(dt); }
    /* خوردنِ جلبک */
    if (S.stage >= 1 && S.stage <= 3) {
      /* هر قاب فقط یک جلبک — چون collect() ممکن است مرحله را عوض کند
         و فهرستِ جلبک‌ها را از نو بچیند، حلقه باید همان‌جا تمام شود. */
      for (let i = 0; i < S.algae.length; i++) {
        const a = S.algae[i];
        if (Math.hypot(a.x - S.x, a.y - S.y) >= bodyR() + 16) continue;
        S.algae.splice(i, 1);
        bits.spark(a.x, a.y, 6, [P.algae, P.foam]);
        const before = S.stage;
        collect();
        if (S.stage === before && S.stage <= 3) spawnAlgae(1);
        break;
      }
    }
    /* پروازِ مگس‌ها */
    for (const f of S.flies) {
      f.x += Math.sin(S.t * f.sp + f.ph) * 60 * dt;
      f.y += Math.cos(S.t * f.sp * 1.3 + f.ph) * 40 * dt;
      f.x = clamp(f.x, 540, 1148);
      f.y = clamp(f.y, 96, 236);
    }
  }
  if (S.winT) {
    S.winT += dt;
    if (S.winT > 2.6) { S.winT = 0; S.phase = 'won'; S.phaseT = 0; }
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

whenFontsReady(() => { resetGame(); runLoop(step); });

/* ───────── ابزارِ نقاشی ───────── */

function rrPath(x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function numText(str, x, y, o = {}) {
  ctx.save();
  ctx.direction = 'ltr';
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = o.color || P.ink;
  ctx.font = `${o.weight || 700} ${o.size || 18}px "${o.family || 'Vazirmatn'}", Tahoma, sans-serif`;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function spot(shapes, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const s of shapes) { ctx.moveTo(s.x + s.r, s.y); ctx.arc(s.x, s.y, s.r, 0, TAU, true); }
  ctx.fillStyle = `rgba(6, 20, 26, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 253, 246, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '4, 16, 22');
  ctx.fillStyle = P.frog;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#5f7b84' }); yy += 30; }
  return h + 20;
}

/* ───────── قهرمان ───────── */

function drawHero() {
  const r = bodyR(), tl = tailLen();
  ctx.save();
  ctx.translate(S.x, S.y);
  if (S.hurt > 0) ctx.globalAlpha = .45 + .55 * Math.abs(Math.sin(S.t * 22));
  if (S.stage === 0) {
    /* تخم با نقطهٔ سیاه */
    const w = 1 + S.wig * .12;
    ctx.fillStyle = 'rgba(232,238,240,.85)';
    wobbleCircle(0, 0, 26 * w, 3, 2); ctx.fill();
    ctx.fillStyle = P.eggDot;
    wobbleCircle(0, 0, 9 + S.got * .8, 7, 1.2); ctx.fill();
    ctx.restore();
    return;
  }
  if (S.stage === 4) {
    /* قورباغهٔ کامل، نشسته */
    ctx.fillStyle = P.frog;
    wobbleEllipse(0, 0, 34, 24, 0, 3, 1.6); ctx.fill();
    ctx.fillStyle = P.belly;
    wobbleEllipse(0, 10, 22, 11, 0, 5, 1.2); ctx.fill();
    /* پاهای عقب */
    ctx.strokeStyle = P.frog; ctx.lineWidth = 10; ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * 18, 6); ctx.lineTo(s * 34, 18); ctx.lineTo(s * 20, 26);
      ctx.stroke();
    }
    /* دست‌ها */
    ctx.lineWidth = 7;
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(s * 14, -4); ctx.lineTo(s * 22, 18); ctx.stroke();
    }
    /* سر و چشم‌ها */
    ctx.fillStyle = P.frogLt;
    wobbleEllipse(0, -14, 26, 16, 0, 9, 1.4); ctx.fill();
    for (const s of [-1, 1]) {
      ctx.fillStyle = P.frogLt;
      ctx.beginPath(); ctx.arc(s * 13, -26, 10, 0, TAU); ctx.fill();
      ctx.fillStyle = P.eye;
      ctx.beginPath(); ctx.arc(s * 13, -27, 7, 0, TAU); ctx.fill();
      ctx.fillStyle = '#1a2a18';
      ctx.beginPath(); ctx.ellipse(s * 13, -27, 3, 5, 0, 0, TAU); ctx.fill();
    }
    /* زبان */
    if (S.tongue && S.tongueTo) {
      const u = S.tongue < .5 ? S.tongue * 2 : (1 - S.tongue) * 2;
      const tx = (S.tongueTo.x - S.x) * u, ty = (S.tongueTo.y - S.y) * u;
      ctx.strokeStyle = '#e0607f'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.fillStyle = '#e0607f';
      ctx.beginPath(); ctx.arc(tx, ty, 7, 0, TAU); ctx.fill();
    }
    ctx.restore();
    return;
  }
  /* بچّه‌قورباغه */
  ctx.rotate(S.ang);
  const wag = Math.sin(S.t * (9 + S.wig * 8)) * (.3 + S.wig * .5);
  /* دُم */
  if (tl > 6) {
    ctx.save();
    ctx.strokeStyle = P.tadLt; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r + 2, 0);
    ctx.quadraticCurveTo(-r - tl * .5, wag * 16, -r - tl, wag * 26);
    ctx.stroke();
    ctx.fillStyle = 'rgba(111,138,82,.55)';
    ctx.beginPath();
    ctx.moveTo(-r, -9);
    ctx.quadraticCurveTo(-r - tl * .6, wag * 18 - 14, -r - tl, wag * 26);
    ctx.quadraticCurveTo(-r - tl * .6, wag * 18 + 14, -r, 9);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  /* پاهای عقب از مرحلهٔ ۲ */
  if (S.stage >= 2) {
    ctx.strokeStyle = P.tad; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(-r + 4, s * 6);
      ctx.lineTo(-r - 8, s * (14 + Math.sin(S.t * 8) * 4));
      ctx.lineTo(-r - 18, s * (10 + Math.sin(S.t * 8) * 4));
      ctx.stroke();
    }
  }
  /* دست‌ها از مرحلهٔ ۳ */
  if (S.stage >= 3) {
    ctx.strokeStyle = P.tad; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(2, s * 8); ctx.lineTo(-4, s * 17);
      ctx.stroke();
    }
  }
  /* بدن */
  ctx.fillStyle = S.stage >= 3 ? P.frog : P.tad;
  wobbleEllipse(0, 0, r + 4, r, 0, 3, 1.4); ctx.fill();
  ctx.fillStyle = S.stage >= 3 ? P.frogLt : P.tadLt;
  wobbleEllipse(2, -3, r - 1, r * .62, 0, 5, 1.2); ctx.fill();
  /* آبشش تا وقتی شش نیامده */
  if (!hasLungs()) {
    ctx.strokeStyle = 'rgba(224,120,120,.85)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-2, (i - 1) * 5);
      ctx.quadraticCurveTo(-10, (i - 1) * 9, -14, (i - 1) * 12 + Math.sin(S.t * 6 + i) * 2);
      ctx.stroke();
    }
  }
  /* چشم */
  ctx.fillStyle = '#f4f8f0';
  ctx.beginPath(); ctx.arc(r * .5, -r * .3, 4.4, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1a2a18';
  ctx.beginPath(); ctx.arc(r * .5 + 1, -r * .3, 2.4, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawFish() {
  const f = S.fish;
  if (!f) return;
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(Math.atan2(f.vy, f.vx));
  ctx.fillStyle = P.fish;
  wobbleEllipse(0, 0, 34, 19, 0, 3, 1.4); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(28, 0); ctx.lineTo(52, -16); ctx.lineTo(52, 16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.fishLt;
  wobbleEllipse(-4, -13, 13, 6, -.3, 5, 1); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-20, -4, 5.4, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1a2a18';
  ctx.beginPath(); ctx.arc(-21, -4, 2.6, 0, TAU); ctx.fill();
  ctx.restore();
}

/* ───────── برکه ───────── */

function paintPondStatic() {
  const g = ctx.createLinearGradient(0, HUD_H, 0, SURF);
  g.addColorStop(0, P.sky); g.addColorStop(1, P.skyLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, HUD_H, SCENE_W, SURF - HUD_H);
  const w = ctx.createLinearGradient(0, SURF, 0, BED + 60);
  w.addColorStop(0, P.water); w.addColorStop(1, P.waterLo);
  ctx.fillStyle = w;
  ctx.fillRect(0, SURF, SCENE_W, SCENE_H - SURF);
  /* خشکی سمتِ راست */
  ctx.fillStyle = P.bankLo;
  ctx.beginPath();
  ctx.moveTo(BANK_X - 30, SCENE_H);
  ctx.lineTo(BANK_X + 10, SURF + 10);
  ctx.lineTo(SCENE_W, SURF - 6);
  ctx.lineTo(SCENE_W, SCENE_H);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.bank;
  ctx.beginPath();
  ctx.moveTo(BANK_X - 14, SCENE_H);
  ctx.lineTo(BANK_X + 24, SURF + 4);
  ctx.lineTo(SCENE_W, SURF - 12);
  ctx.lineTo(SCENE_W, SCENE_H);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.grassDk;
  ctx.beginPath();
  ctx.moveTo(BANK_X + 24, SURF + 4);
  ctx.lineTo(SCENE_W, SURF - 12);
  ctx.lineTo(SCENE_W, SURF + 6);
  ctx.lineTo(BANK_X + 26, SURF + 22);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.grass;
  for (let x = BANK_X + 26; x < SCENE_W; x += 9) {
    const t = (x - BANK_X) / (SCENE_W - BANK_X);
    const y = SURF + 6 - t * 16;
    const h = 8 + ((x * 31) % 10);
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + 3, y - h); ctx.lineTo(x + 6, y);
    ctx.closePath(); ctx.fill();
  }
  /* گیاهانِ کفِ برکه */
  ctx.strokeStyle = P.weed; ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const x = 40 + ((i * 137) % (BANK_X - 90));
    const h = 60 + ((i * 53) % 110);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, BED + 40);
    ctx.quadraticCurveTo(x + 14, BED - h * .5, x + 6, BED - h);
    ctx.stroke();
  }
  ctx.fillStyle = P.waterLo;
  ctx.fillRect(0, BED, SCENE_W, SCENE_H - BED);
}

function drawSurface() {
  ctx.save();
  ctx.strokeStyle = 'rgba(207,238,246,.5)'; ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x <= BANK_X + 20; x += 14) {
    ctx.lineTo(x, SURF + Math.sin(x * .03 + S.t * 1.6) * 4);
  }
  ctx.stroke();
  ctx.globalAlpha = .12;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, SURF, BANK_X + 20, 10);
  ctx.restore();
}

function drawAlgae() {
  for (const a of S.algae) {
    const y = a.y + Math.sin(S.t * 1.6 + a.ph) * 5;
    ctx.fillStyle = P.algae;
    wobbleCircle(a.x, y, 9, a.ph * 10, 1.4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    ctx.beginPath(); ctx.arc(a.x - 3, y - 3, 3, 0, TAU); ctx.fill();
  }
}

function drawFlies() {
  for (const f of S.flies) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.fillStyle = P.flyWing;
    const w = Math.abs(Math.sin(S.t * 22 + f.ph)) * 6 + 4;
    wobbleEllipse(-4, -5, 8, w * .5, -.5, 3, .6); ctx.fill();
    wobbleEllipse(4, -5, 8, w * .5, .5, 5, .6); ctx.fill();
    ctx.fillStyle = P.fly;
    wobbleEllipse(0, 0, 7, 5, 0, 7, .8); ctx.fill();
    ctx.restore();
  }
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = '#0b1a20';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(229,179,68,.22)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(ST().n, SCENE_W - 150, HUD_H / 2, { size: 24, family: 'Lalezar', color: P.paper });
  numText(fa(S.stage + 1) + ' / ' + fa(STAGES.length), 640, HUD_H / 2, { size: 21, color: P.gold });
  numText(fa(S.score), 300, HUD_H / 2, { size: 20, color: P.paper });
  text('بیشترین ' + fa(S.best), 150, HUD_H / 2, { size: 15, color: 'rgba(251,247,236,.6)' });
  /* پیشرفتِ این مرحله */
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * clamp(S.got / ST().need, 0, 1), 5, 3); ctx.fill();
  /* نوارِ هوا، فقط وقتی شش دارد */
  if (S.stage === 3 && S.phase === 'play') {
    const bx = SCENE_W / 2 - 110, by = HUD_H + 16;
    ctx.fillStyle = 'rgba(10,26,32,.7)';
    ctx.beginPath(); rrPath(bx - 10, by - 8, 240, 40, 12); ctx.fill();
    text('هوا', bx + 218, by + 12, { size: 15, color: P.paper, align: 'right' });
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.beginPath(); rrPath(bx, by + 4, 180, 16, 8); ctx.fill();
    ctx.fillStyle = S.air < .3 ? P.bad : P.accent;
    ctx.beginPath(); rrPath(bx, by + 4, 180 * S.air, 16, 8); ctx.fill();
    if (S.air < .3) {
      ctx.save();
      ctx.globalAlpha = .5 + .5 * Math.sin(S.t * 8);
      text('بیا سرِ آب', SCENE_W / 2, by + 58, { size: 19, family: 'Lalezar', color: P.bad });
      ctx.restore();
    }
  }
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: S.x, y: S.y, r: 90 }], .7);
    const h = tutCard(340, 470, 520, ['اینجا یک تخمِ قورباغه است.'], 'از تخم تا قورباغه');
    tutMore(600, 470 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: S.x, y: S.y, r: 90 }], .68);
    const h = tutCard(340, 470, 520, ['چند بار روی صفحه بزن', 'تا تخم باز شود.']);
    tutMore(600, 470 + h + 8, S.t, P.ink);
  } else {
    spot([{ x: 300, y: 480, r: 120 }], .66);
    const h = tutCard(340, 130, 520,
      ['بعد هرجای آب را نگه داری، شنا می‌کنی.', 'جلبک‌ها را بخور تا بزرگ شوی.']);
    tutMore(600, 130 + h + 8, S.t, P.ink);
  }
}

function frogIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.frog;
  wobbleEllipse(0, 6, 30, 20, 0, 3, 1.4); ctx.fill();
  ctx.fillStyle = P.frogLt;
  wobbleEllipse(0, -6, 24, 14, 0, 5, 1.2); ctx.fill();
  for (const s of [-1, 1]) {
    ctx.fillStyle = P.frogLt;
    ctx.beginPath(); ctx.arc(s * 12, -18, 9, 0, TAU); ctx.fill();
    ctx.fillStyle = P.eye;
    ctx.beginPath(); ctx.arc(s * 12, -19, 6, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1a2a18';
    ctx.beginPath(); ctx.ellipse(s * 12, -19, 2.6, 4.4, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 880, h: 306, y: 128,
    paper: P.paper, band: P.frog, ink: P.ink, inkSoft: '#5f7b84',
    icon: frogIcon,
    title: 'از تخم تا قورباغه',
    body: 'تو یک تخمِ قورباغه‌ای در برکه.\nبزرگ می‌شوی، دُم و آبشش پیدا می‌کنی، بعد پا و شش،\nو آخرش از آب بیرون می‌آیی. مواظبِ ماهی باش!',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#3f8f4a', btnHotFill: '#55a860',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 860, h: 300, y: 140,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#5f7b84',
    icon: frogIcon,
    title: 'قورباغه شدی',
    body: 'اوّل با آبشش نفس می‌کشیدی و با دُم شنا می‌کردی،\nبعد پاها آمدند و آبشش‌ها رفتند و شش ساخته شد —\nو حالا هم در آب و هم در خشکی زنده‌ای. امتیازت: ' + fa(S.score),
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#3f8f4a', btnHotFill: '#55a860',
  });
}

function draw() {
  beginScene(P.waterLo);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  const layer = staticLayer('pond', SCENE_W, SCENE_H, paintPondStatic);
  ctx.drawImage(layer, 0, 0, SCENE_W, SCENE_H);
  drawAlgae();
  drawFish();
  drawFlies();
  drawSurface();
  drawHero();
  bits.draw();
  /* نشانهٔ جایی که انگشت است */
  if (S.aim) {
    ctx.save();
    ctx.globalAlpha = .5;
    ctx.strokeStyle = P.foam; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(S.aim.x, S.aim.y, 16 + Math.sin(S.t * 6) * 3, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 66, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 470;
    paper(SCENE_W / 2 - w / 2, SCENE_H - 56, w, 42, P.paper, 51, 12, .3);
    text(S.tip, SCENE_W / 2, SCENE_H - 35, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.07, 'rgba(4, 24, 32, .4)', 0, .1);
}
