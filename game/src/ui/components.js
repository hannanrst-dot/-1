// اجزای رابط کاربری: کنترل‌های اعلانی، تراشه‌های عددی، جدول و نمودار
import { fa, num, round, clamp, escapeHtml } from '../core/format.js';
import { MACHINE_CONTROLS, resolveParams } from '../content/controls.js';
import { solve } from '../physics/machines.js';
import { capstone } from '../physics/capstone.js';

/** سازندهٔ کوتاه عناصر DOM */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of [].concat(children)) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function card(titleText, icon, children, cls = '') {
  return el('section', { class: `card ${cls}` }, [
    titleText ? el('h2', { class: 'card-title' }, [
      icon ? el('span', { class: 'dot', 'aria-hidden': 'true' }, [icon]) : null,
      el('span', {}, [titleText])
    ]) : null,
    ...[].concat(children)
  ]);
}

// ─────────── کنترل‌ها ───────────

function decimalsOf(control) {
  if (control.decimals !== undefined) return control.decimals;
  return Number.isInteger(control.step) ? 0 : 1;
}

function sliderField(control, value, max, onChange) {
  const out = el('span', { class: 'field-value' });
  const d = decimalsOf(control);
  const paint = (v) => {
    out.textContent = `${fa(num(v, d))} ${control.unit || ''}`.trim();
  };
  const input = el('input', {
    type: 'range', min: control.min, max, step: control.step, value,
    'aria-label': control.label
  });
  const setFill = () => {
    const pct = ((Number(input.value) - control.min) / (max - control.min)) * 100;
    input.style.setProperty('--fill', `${clamp(pct, 0, 100)}%`);
  };
  input.addEventListener('input', () => {
    const v = Number(input.value);
    paint(v);
    setFill();
    onChange(control.key, v);
  });
  paint(value);
  setFill();
  return el('div', { class: 'field' }, [
    el('label', {}, [el('span', {}, [control.label]), out]),
    input,
    control.cost ? el('p', { class: 'field-hint' }, [`💰 ${control.cost}`]) : null
  ]);
}

function segmentField(control, value, onChange) {
  const wrap = el('div', { class: `segment${control.options.length === 2 ? ' cols-2' : ''}`, role: 'group', 'aria-label': control.label });
  for (const opt of control.options) {
    const active = String(opt.value) === String(value);
    wrap.append(el('button', {
      class: `seg${active ? ' is-active' : ''}`,
      type: 'button',
      'aria-pressed': active ? 'true' : 'false',
      onclick: () => onChange(control.key, control.numeric ? Number(opt.value) : opt.value)
    }, [
      opt.icon ? el('span', { class: 'seg-icon', 'aria-hidden': 'true' }, [opt.icon]) : null,
      el('span', {}, [opt.label]),
      opt.sub ? el('span', { class: 'seg-sub' }, [opt.sub]) : null
    ]));
  }
  return el('div', { class: 'field' }, [
    el('p', { class: 'field-label' }, [el('span', {}, [control.label])]),
    wrap
  ]);
}

function switchField(control, value, onChange) {
  const input = el('input', {
    type: 'checkbox', checked: !!value,
    onchange: (e) => onChange(control.key, e.target.checked)
  });
  return el('label', { class: 'field switch' }, [
    input,
    el('span', { class: 'track', 'aria-hidden': 'true' }),
    el('span', {}, [
      control.label,
      control.sub ? el('span', { class: 'switch-sub' }, [control.sub]) : null
    ])
  ]);
}

/** ساخت کنترل‌های یک ماشین؛ keys اختیاری برای محدود کردن به زیرمجموعه */
export function buildControls(machineId, params, onChange, keys = null) {
  const defs = MACHINE_CONTROLS[machineId] || [];
  const frag = document.createDocumentFragment();
  for (const c of defs) {
    if (keys && !keys.includes(c.key)) continue;
    const value = params[c.key];
    if (c.kind === 'slider') {
      const max = c.maxKey ? Number(params[c.maxKey]) + (c.maxOffset || 0) : c.max;
      frag.append(sliderField(c, clamp(value, c.min, max), Math.max(c.min + c.step, max), onChange));
    } else if (c.kind === 'segment') {
      frag.append(segmentField(c, value, onChange));
    } else if (c.kind === 'switch') {
      frag.append(switchField(c, value, onChange));
    }
  }
  return frag;
}

// ─────────── تراشه‌های عددی (HUD) ───────────

/** فهرست خوانش‌های عددی متناسب با هر ماشین */
export function readouts(result) {
  if (result.machine === 'GEARS') {
    return [
      { label: 'گشتاور خروجی', value: fa(result.outputTorqueNm), unit: 'نیوتون‌متر', tone: 'ok' },
      { label: 'سرعت خروجی', value: fa(result.outputRpm), unit: 'دور/دقیقه', tone: 'primary' },
      { label: 'نسبت دنده', value: `${fa(result.ratio)} : ۱`, unit: '', tone: 'accent' },
      { label: 'بازده', value: `${fa(Math.round(result.efficiency * 100))}٪`, unit: '', tone: '' }
    ];
  }
  if (result.machine === 'CAPSTONE') {
    return [
      { label: 'بیشترین نیرو', value: fa(result.maxForceN), unit: 'نیوتون', tone: result.feasible ? 'ok' : 'bad' },
      { label: 'توان کشش', value: fa(result.humanLimitN), unit: 'نیوتون', tone: 'primary' },
      { label: 'مصالح', value: `${fa(result.materialsUsed)} از ${fa(result.budget)}`, unit: '', tone: result.withinBudget ? 'accent' : 'bad' },
      { label: 'کارِ کل', value: fa(result.totalWorkJ), unit: 'ژول', tone: '' }
    ];
  }

  const list = [
    { label: 'نیروی لازم', value: fa(num(result.effortN, 0)), unit: 'نیوتون', tone: result.feasible ? 'ok' : 'bad' },
    { label: result.machine === 'WEDGE' ? 'مقاومت چوب' : 'وزن بار', value: fa(num(result.loadN, 0)), unit: 'نیوتون', tone: 'primary' }
  ];
  if (result.maIdeal) {
    list.push({ label: 'مزیت مکانیکی', value: `${fa(num(result.maActual, 1))} برابر`, unit: '', tone: 'accent' });
  } else {
    list.push({ label: 'نسبت نیرو به وزن', value: `${fa(result.forceRatioPercent)}٪`, unit: '', tone: 'accent' });
  }
  list.push({ label: 'مسافت کشیدن', value: fa(num(result.effortDistanceM, 1)), unit: 'متر', tone: '' });
  list.push({ label: 'کارِ تو', value: fa(num(result.workInJ, 0)), unit: 'ژول', tone: '' });
  return list;
}

export function renderHud(container, result) {
  container.replaceChildren(...readouts(result).map((r) => el('div', {
    class: `hud-chip${r.tone ? ` t-${r.tone}` : ''}`
  }, [
    el('span', {}, [r.label]),
    el('b', {}, [r.value]),
    r.unit ? el('span', {}, [r.unit]) : null
  ])));
}

// ─────────── جدول اندازه‌گیری ───────────

export function measurementTable(rows, onClear) {
  if (!rows.length) {
    return el('div', {}, [el('p', { class: 't-empty' }, ['هنوز اندازه‌گیری‌ای ثبت نشده است. تنظیمات را عوض کن و «ثبت در جدول» را بزن.'])]);
  }
  const head = el('tr', {}, ['#', 'ماشین', 'پیکربندی', 'نیرو (N)', 'مسافت (m)', 'کار (J)'].map((h) => el('th', {}, [h])));
  const body = rows.map((r, i) => el('tr', {}, [
    el('td', {}, [fa(i + 1)]),
    el('td', {}, [r.machineName]),
    el('td', { style: 'white-space:normal;text-align:start;min-width:150px' }, [r.setup]),
    el('td', {}, [el('b', {}, [fa(num(r.effortN, 0))])]),
    el('td', {}, [fa(num(r.effortDistanceM, 1))]),
    el('td', {}, [fa(num(r.workInJ, 0))])
  ]));
  return el('div', {}, [
    el('div', { class: 'table-wrap' }, [el('table', {}, [el('thead', {}, [head]), el('tbody', {}, body)])]),
    el('div', { style: 'display:flex;justify-content:flex-end;margin-top:8px' }, [
      el('button', { class: 'btn btn-ghost', style: 'padding:7px 14px;font-size:.82rem', onclick: onClear }, ['🗑 پاک کردن جدول'])
    ])
  ]);
}

// ─────────── نمودار ───────────

/** پارامتری که نمودارِ هر ماشین بر حسب آن رسم می‌شود */
export const CHART_SPEC = {
  FRICTION: { type: 'bars', key: 'surfaceId', values: ['ROUGH_STONE', 'WOOD_PLANKS', 'SMOOTH_TRACK', 'ICE'], labels: ['سنگ', 'چوب', 'صیقلی', 'یخ'], title: 'نیروی لازم روی سطح‌های گوناگون' },
  PULLEY: { type: 'bars', key: 'systemId', values: ['NONE', 'FIXED', 'MOVABLE', 'COMPOUND_2', 'COMPOUND_3', 'COMPOUND_4'], labels: ['بدون', 'ثابت', 'متحرک', 'مرکب۲', 'مرکب۳', 'مرکب۴'], title: 'نیروی لازم با سامانه‌های قرقره' },
  INCLINED_PLANE: { type: 'line', key: 'lengthM', title: 'نیرو بر حسب طول رمپ', xUnit: 'متر' },
  LEVER: { type: 'line', key: 'fulcrumM', title: 'نیرو بر حسب جای تکیه‌گاه', xUnit: 'متر' },
  WHEEL_AXLE: { type: 'line', key: 'wheelRadiusM', title: 'نیرو بر حسب شعاع چرخ', xUnit: 'متر' },
  WEDGE: { type: 'line', key: 'thicknessM', title: 'نیرو بر حسب ضخامت گوه', xUnit: 'متر' },
  SCREW: { type: 'line', key: 'pitchM', title: 'نیرو بر حسب گام پیچ', xUnit: 'متر' },
  GEARS: { type: 'line', key: 'drivenTeeth', title: 'گشتاور خروجی بر حسب دندانه‌ها', xUnit: 'دندانه', yKey: 'outputTorqueNm', yLabel: 'گشتاور (N·m)' }
};

function evaluate(machineId, params) {
  const p = resolveParams(machineId, params);
  return machineId === 'CAPSTONE' ? capstone(p) : solve(machineId, p);
}

/** نمودار نیرو (یا گشتاور) بر حسب یک پارامتر — روی بوم کوچک کنار کنترل‌ها */
export function drawChart(canvas, machineId, params, theme = 'light') {
  const spec = CHART_SPEC[machineId];
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || 300, h = rect.height || 150;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  if (!spec) return;

  const dark = theme === 'dark';
  const ink = dark ? '#a8becf' : '#4a627a';
  const line = dark ? '#24394c' : '#d9e3ec';
  const accent = '#0b7fc4';
  const yKey = spec.yKey || 'effortN';

  const pad = { t: 12, r: 12, b: 26, l: 40 };
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;

  const points = [];
  if (spec.type === 'bars') {
    spec.values.forEach((v, i) => {
      const r = evaluate(machineId, { ...params, [spec.key]: v, useRollers: false });
      points.push({ x: i, y: r[yKey], label: spec.labels[i], current: String(params[spec.key]) === String(v) });
    });
  } else {
    const def = (MACHINE_CONTROLS[machineId] || []).find((c) => c.key === spec.key);
    if (!def) return;
    const steps = 26;
    for (let i = 0; i <= steps; i++) {
      const x = def.min + ((def.max - def.min) * i) / steps;
      const r = evaluate(machineId, { ...params, [spec.key]: x });
      points.push({ x, y: r[yKey] });
    }
  }

  const ys = points.map((p) => p.y);
  const yMax = Math.max(...ys) * 1.12 || 1;
  const xs = points.map((p) => p.x);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const X = (x) => pad.l + (spec.type === 'bars' ? ((x + 0.5) / points.length) * pw : ((x - xMin) / (xMax - xMin || 1)) * pw);
  const Y = (y) => pad.t + ph - (y / yMax) * ph;

  // شبکه
  ctx.strokeStyle = line; ctx.lineWidth = 1;
  ctx.font = '600 10px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = ink;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 3; i++) {
    const y = pad.t + (ph / 3) * i;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
    ctx.fillText(fa(num((yMax * (3 - i)) / 3, 0)), pad.l - 6, y);
  }

  if (spec.type === 'bars') {
    const bw = (pw / points.length) * 0.62;
    points.forEach((p) => {
      const x = X(p.x);
      ctx.fillStyle = p.current ? '#f0900c' : accent;
      ctx.globalAlpha = p.current ? 1 : 0.55;
      const y = Y(p.y);
      ctx.fillRect(x - bw / 2, y, bw, pad.t + ph - y);
      ctx.globalAlpha = 1;
      ctx.fillStyle = ink;
      ctx.textAlign = 'center';
      ctx.fillText(p.label, x, h - 12);
    });
  } else {
    ctx.strokeStyle = accent; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(X(p.x), Y(p.y)) : ctx.moveTo(X(p.x), Y(p.y))));
    ctx.stroke();
    // نقطهٔ جاری
    const cur = Number(params[spec.key]);
    const curY = evaluate(machineId, params)[yKey];
    ctx.fillStyle = '#f0900c';
    ctx.beginPath(); ctx.arc(X(cur), Y(curY), 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.fillText(`${fa(num(xMin, 1))} ${spec.xUnit}`, pad.l + 16, h - 10);
    ctx.fillText(`${fa(num(xMax, 1))} ${spec.xUnit}`, w - pad.r - 16, h - 10);
  }
}

export { fa, num, round, clamp, escapeHtml };
