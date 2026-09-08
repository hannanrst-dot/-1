// اجزای رابط: کنترل‌های اعلانی، جدول اندازه‌گیری، محاسبهٔ گام‌به‌گام، جدول ثبت و نمودار
import { fa, num, clamp, parseFa } from '../core/format.js';
import { MACHINE_CONTROLS, resolveParams } from '../content/controls.js';
import { solve } from '../physics/machines.js';

/** سازندهٔ کوتاه عناصر DOM */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, val] of Object.entries(props)) {
    if (val === null || val === undefined || val === false) continue;
    if (k === 'class') node.className = val;
    else if (k === 'text') node.textContent = val;
    else if (k.startsWith('on') && typeof val === 'function') node.addEventListener(k.slice(2).toLowerCase(), val);
    else node.setAttribute(k, val === true ? '' : String(val));
  }
  for (const c of [].concat(children)) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}

/** کارت بخش‌بندی؛ collapsible = قابل باز و بسته شدن */
export function card(title, children, opts = {}) {
  const { open = true, collapsible = false, id = null, onToggle = null } = opts;
  const body = el('div', { class: 'card-body' }, [].concat(children).filter(Boolean));
  if (!collapsible) {
    return el('section', { class: 'card' }, [title ? el('h2', { class: 'card-title' }, [title]) : null, body]);
  }
  const head = el('button', {
    class: 'card-title is-toggle', type: 'button', 'aria-expanded': open ? 'true' : 'false',
    onclick: () => {
      const now = head.getAttribute('aria-expanded') !== 'true';
      head.setAttribute('aria-expanded', now ? 'true' : 'false');
      body.hidden = !now;
      if (onToggle) onToggle(now);
    }
  }, [el('span', {}, [title]), el('span', { class: 'chev', 'aria-hidden': 'true' }, ['▾'])]);
  body.hidden = !open;
  return el('section', { class: 'card', id }, [head, body]);
}

// ─────────── کنترل‌ها ───────────

const decimalsOf = (c) => (c.decimals !== undefined ? c.decimals : (Number.isInteger(c.step) ? 0 : 1));

function sliderField(control, value, max, onChange) {
  const d = decimalsOf(control);
  const out = el('input', {
    class: 'field-number', type: 'text', inputmode: 'decimal',
    value: fa(num(value, d)),
    'aria-label': `${control.label} بر حسب ${control.unit || ''}`,
    title: `بین ${fa(num(control.min, d))} و ${fa(num(max, d))}`
  });
  const range = el('input', {
    type: 'range', min: control.min, max, step: control.step, value,
    tabindex: '-1', 'aria-hidden': 'true'
  });
  const setFill = (v) => {
    const pct = ((v - control.min) / (max - control.min)) * 100;
    range.style.setProperty('--fill', `${clamp(pct, 0, 100)}%`);
  };
  const apply = (v, fromRange) => {
    const clamped = clamp(v, control.min, max);
    setFill(clamped);
    out.value = fa(num(clamped, d));
    range.value = clamped;
    onChange(control.key, clamped);
  };
  range.addEventListener('input', () => apply(Number(range.value), true));
  const commit = () => {
    const v = parseFa(out.value);
    if (Number.isFinite(v)) apply(v, false);
    else out.value = fa(num(Number(range.value), d));
  };
  out.addEventListener('change', commit);
  out.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
  setFill(value);

  return el('div', { class: 'field' }, [
    el('div', { class: 'field-head' }, [
      el('label', {}, [control.label]),
      el('div', { class: 'field-input' }, [out, control.unit ? el('span', { class: 'unit' }, [control.unit]) : null])
    ]),
    range
  ]);
}

function segmentField(control, value, onChange) {
  const wrap = el('div', { class: `segment${control.options.length <= 2 ? ' cols-2' : ''}`, role: 'group', 'aria-label': control.label });
  for (const opt of control.options) {
    const active = String(opt.value) === String(value);
    wrap.append(el('button', {
      class: `seg${active ? ' is-active' : ''}`, type: 'button',
      'aria-pressed': active ? 'true' : 'false',
      onclick: () => onChange(control.key, control.numeric ? Number(opt.value) : opt.value)
    }, [
      opt.icon ? el('span', { class: 'seg-icon', 'aria-hidden': 'true' }, [opt.icon]) : null,
      el('span', {}, [opt.label]),
      opt.sub ? el('span', { class: 'seg-sub' }, [opt.sub]) : null
    ]));
  }
  return el('div', { class: 'field' }, [el('p', { class: 'field-label' }, [control.label]), wrap]);
}

function switchField(control, value, onChange) {
  return el('label', { class: 'field switch' }, [
    el('input', { type: 'checkbox', checked: !!value, onchange: (e) => onChange(control.key, e.target.checked) }),
    el('span', { class: 'track', 'aria-hidden': 'true' }),
    el('span', {}, [control.label, control.sub ? el('span', { class: 'switch-sub' }, [control.sub]) : null])
  ]);
}

export function buildControls(machineId, params, onChange) {
  const frag = document.createDocumentFragment();
  for (const c of MACHINE_CONTROLS[machineId] || []) {
    const value = params[c.key];
    if (c.kind === 'slider') {
      const max = c.maxKey ? Number(params[c.maxKey]) + (c.maxOffset || 0) : c.max;
      frag.append(sliderField(c, clamp(value, c.min, max), Math.max(c.min + c.step, max), onChange));
    } else if (c.kind === 'segment') frag.append(segmentField(c, value, onChange));
    else if (c.kind === 'switch') frag.append(switchField(c, value, onChange));
  }
  return frag;
}

// ─────────── جدول اندازه‌گیری ───────────

/** فهرست کمیت‌های اندازه‌گیری‌شده برای هر ماشین */
export function quantities(r) {
  if (r.machine === 'GEARS') {
    return [
      { name: 'نسبت دنده', sym: 'i', value: num(r.ratio, 2), unit: '—', tone: 'accent' },
      { name: 'گشتاور ورودی', sym: 'τ₁', value: num(r.inputTorqueNm, 1), unit: 'N·m' },
      { name: 'گشتاور خروجی', sym: 'τ₂', value: num(r.outputTorqueNm, 1), unit: 'N·m', tone: 'ok' },
      { name: 'سرعت ورودی', sym: 'n₁', value: num(r.inputRpm, 0), unit: 'دور/دقیقه' },
      { name: 'سرعت خروجی', sym: 'n₂', value: num(r.outputRpm, 1), unit: 'دور/دقیقه', tone: 'primary' },
      { name: 'بازده', sym: 'η', value: Math.round(r.efficiency * 100), unit: '٪' }
    ];
  }
  const rows = [
    { name: r.machine === 'WEDGE' ? 'نیروی مقاومِ چوب' : 'وزن بار', sym: 'F_w', value: num(r.loadN, 1), unit: 'نیوتون', tone: 'primary' },
    { name: 'نیروی لازم (خوانش نیروسنج)', sym: 'F', value: num(r.effortN, 1), unit: 'نیوتون', tone: 'effort' },
    { name: 'سهم اصطکاک از نیرو', sym: 'f', value: num(r.frictionN, 1), unit: 'نیوتون' }
  ];
  if (r.maIdeal) {
    rows.push({ name: 'مزیت مکانیکی آرمانی', sym: 'MA₀', value: num(r.maIdeal, 2), unit: 'برابر' });
    rows.push({ name: 'مزیت مکانیکی واقعی', sym: 'MA', value: num(r.maActual, 2), unit: 'برابر', tone: 'accent' });
  } else {
    rows.push({ name: 'نسبت نیرو به وزن', sym: 'F/W', value: num((r.effortN / r.loadN) * 100, 0), unit: '٪', tone: 'accent' });
  }
  rows.push(
    { name: 'مسافت جابه‌جایی بار', sym: 'd_w', value: num(r.loadDistanceM, 2), unit: 'متر' },
    { name: 'مسافتی که ما طی می‌کنیم', sym: 'd_F', value: num(r.effortDistanceM, 2), unit: 'متر' },
    { name: 'کار مفید (روی بار)', sym: 'W_out', value: num(r.workOutJ, 1), unit: 'ژول' },
    { name: 'کارِ انجام‌شدهٔ ما', sym: 'W_in', value: num(r.workInJ, 1), unit: 'ژول' }
  );
  if (r.efficiency) rows.push({ name: 'بازده', sym: 'η', value: Math.round(r.efficiency * 100), unit: '٪', tone: 'ok' });
  rows.push({ name: 'انرژی هدررفته', sym: 'ΔE', value: num(r.energyLostJ, 1), unit: 'ژول' });
  return rows;
}

export function quantityTable(result) {
  return el('div', { class: 'table-wrap' }, [
    el('table', { class: 'q-table' }, [
      el('thead', {}, [el('tr', {}, ['کمیت', 'نماد', 'مقدار', 'یکا'].map((t) => el('th', {}, [t])))]),
      el('tbody', {}, quantities(result).map((q) => el('tr', { class: q.tone ? `t-${q.tone}` : null }, [
        el('td', { class: 'q-name' }, [q.name]),
        el('td', { class: 'q-sym' }, [q.sym]),
        el('td', { class: 'q-val' }, [fa(q.value)]),
        el('td', { class: 'q-unit' }, [q.unit])
      ])))
    ])
  ]);
}

// ─────────── محاسبهٔ گام‌به‌گام ───────────

export function stepsList(steps) {
  return el('ol', { class: 'steps' }, steps.map((s) => el('li', {}, [
    el('p', { class: 'st-name' }, [s.name]),
    el('p', { class: 'st-formula' }, [s.formula]),
    el('p', { class: 'st-work' }, [
      s.work && s.work !== '—' ? el('span', { class: 'st-sub' }, [`= ${s.work}`]) : null,
      el('b', {}, [` = ${s.value}`]),
      s.unit ? el('span', { class: 'st-unit' }, [` ${s.unit}`]) : null
    ]),
    s.note ? el('p', { class: 'st-note' }, [s.note]) : null
  ])));
}

// ─────────── جدول ثبت اندازه‌گیری ───────────

export function logTable(rows, onClear) {
  if (!rows.length) {
    return el('p', { class: 't-empty' }, ['هنوز چیزی ثبت نشده. تنظیمات را عوض کن و «ثبت اندازه‌گیری» را بزن تا بتوانی نتیجه‌ها را کنار هم مقایسه کنی.']);
  }
  return el('div', {}, [
    el('div', { class: 'table-wrap' }, [
      el('table', {}, [
        el('thead', {}, [el('tr', {}, ['#', 'ماشین', 'تنظیم', 'F (N)', 'MA', 'd_F (m)', 'η (٪)'].map((t) => el('th', {}, [t])))]),
        el('tbody', {}, rows.map((r, i) => {
          const cell = (v, d) => (v === null || v === undefined ? '—' : fa(num(v, d)));
          return el('tr', {}, [
            el('td', {}, [fa(i + 1)]),
            el('td', {}, [r.machineName]),
            el('td', { class: 'wrap' }, [r.setup]),
            el('td', {}, [el('b', {}, [cell(r.effortN, 1)])]),
            el('td', {}, [cell(r.maActual, 2)]),
            el('td', {}, [cell(r.effortDistanceM, 2)]),
            el('td', {}, [cell(r.efficiencyPercent, 0)])
          ]);
        }))
      ])
    ]),
    el('div', { class: 'row-end' }, [
      el('button', { class: 'btn btn-quiet', onclick: onClear }, ['پاک کردن جدول'])
    ])
  ]);
}

// ─────────── نمودار ───────────

export const CHART_SPEC = {
  FRICTION: { type: 'bars', key: 'surfaceId', values: ['ROUGH_STONE', 'WOOD_PLANKS', 'SMOOTH_TRACK', 'ICE'], labels: ['سنگ', 'چوب', 'صیقلی', 'یخ'], title: 'نیروی لازم روی سطح‌های گوناگون' },
  PULLEY: { type: 'bars', key: 'systemId', values: ['NONE', 'FIXED', 'MOVABLE', 'COMPOUND_2', 'COMPOUND_3', 'COMPOUND_4'], labels: ['بدون', 'ثابت', 'متحرک', 'مرکب۲', 'مرکب۳', 'مرکب۴'], title: 'نیروی لازم با سامانه‌های قرقره' },
  INCLINED_PLANE: { type: 'line', key: 'lengthM', title: 'نیرو بر حسب طول رمپ', xUnit: 'متر' },
  LEVER: { type: 'line', key: 'fulcrumM', title: 'نیرو بر حسب جای تکیه‌گاه', xUnit: 'متر' },
  WHEEL_AXLE: { type: 'line', key: 'wheelRadiusM', title: 'نیرو بر حسب شعاع چرخ', xUnit: 'متر' },
  WEDGE: { type: 'line', key: 'thicknessM', title: 'نیرو بر حسب ضخامت گوه', xUnit: 'متر' },
  SCREW: { type: 'line', key: 'pitchM', title: 'نیرو بر حسب گام پیچ', xUnit: 'متر' },
  GEARS: { type: 'line', key: 'drivenTeeth', title: 'گشتاور خروجی بر حسب دندانه‌ها', xUnit: 'دندانه', yKey: 'outputTorqueNm', yLabel: 'گشتاور' }
};

export function drawChart(canvas, machineId, params, dark) {
  const spec = CHART_SPEC[machineId];
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || 300, h = rect.height || 150;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  if (!spec) return;

  const ink = dark ? '#a8becf' : '#4a627a';
  const line = dark ? '#24394c' : '#dde5ec';
  const accent = '#0b7fc4';
  const yKey = spec.yKey || 'effortN';
  const pad = { t: 12, r: 12, b: 26, l: 44 };
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
  const evaluate = (p) => solve(machineId, resolveParams(machineId, p));

  const points = [];
  if (spec.type === 'bars') {
    spec.values.forEach((val, i) => {
      points.push({ x: i, y: evaluate({ ...params, [spec.key]: val, useRollers: false })[yKey], label: spec.labels[i], current: String(params[spec.key]) === String(val) });
    });
  } else {
    const def = (MACHINE_CONTROLS[machineId] || []).find((c) => c.key === spec.key);
    if (!def) return;
    for (let i = 0; i <= 30; i++) {
      const x = def.min + ((def.max - def.min) * i) / 30;
      points.push({ x, y: evaluate({ ...params, [spec.key]: x })[yKey] });
    }
  }

  const yMax = Math.max(...points.map((p) => p.y)) * 1.12 || 1;
  const xs = points.map((p) => p.x);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const X = (x) => pad.l + (spec.type === 'bars' ? ((x + 0.5) / points.length) * pw : ((x - xMin) / (xMax - xMin || 1)) * pw);
  const Y = (y) => pad.t + ph - (y / yMax) * ph;

  ctx.strokeStyle = line; ctx.lineWidth = 1;
  ctx.font = '600 10px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = ink; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let i = 0; i <= 3; i++) {
    const y = pad.t + (ph / 3) * i;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
    ctx.fillText(fa(num((yMax * (3 - i)) / 3, 0)), pad.l - 6, y);
  }

  if (spec.type === 'bars') {
    const bw = (pw / points.length) * 0.6;
    ctx.textAlign = 'center';
    for (const p of points) {
      const x = X(p.x), y = Y(p.y);
      ctx.fillStyle = p.current ? '#e08a1e' : accent;
      ctx.globalAlpha = p.current ? 1 : 0.5;
      ctx.fillRect(x - bw / 2, y, bw, pad.t + ph - y);
      ctx.globalAlpha = 1;
      ctx.fillStyle = ink;
      ctx.fillText(p.label, x, h - 12);
    }
  } else {
    ctx.strokeStyle = accent; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(X(p.x), Y(p.y)) : ctx.moveTo(X(p.x), Y(p.y))));
    ctx.stroke();
    const cur = Number(params[spec.key]);
    ctx.fillStyle = '#e08a1e';
    ctx.beginPath(); ctx.arc(X(cur), Y(evaluate(params)[yKey]), 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = ink; ctx.textAlign = 'center';
    ctx.fillText(`${fa(num(xMin, 2))} ${spec.xUnit}`, pad.l + 20, h - 10);
    ctx.fillText(`${fa(num(xMax, 2))} ${spec.xUnit}`, w - pad.r - 20, h - 10);
  }
}

export { fa, num };
