import { useState } from 'react';
import { SHAPES } from '../../lib/shapelab/geometry';

// Area Discovery: instead of stating a formula, walk through a short visual
// derivation so the formula emerges from what students see. Each shape has a few
// steps drawn in a fixed 360×220 SVG space (y-up via the U helper).
const S = 24, OX = 92, OY = 176;
const U = (x, y) => [OX + x * S, OY - y * S];
const poly = (pts, cls) => <polygon points={pts.map(([x, y]) => U(x, y).join(',')).join(' ')} className={cls} />;
const line = (x1, y1, x2, y2, cls = 'ad-cut') => { const [ax, ay] = U(x1, y1), [bx, by] = U(x2, y2); return <line x1={ax} y1={ay} x2={bx} y2={by} className={cls} />; };
const lbl = (x, y, t) => { const [px, py] = U(x, y); return <text x={px} y={py} className="ad-lbl">{t}</text>; };

const gridUnits = (w, h) => { const els = []; for (let i = 0; i <= w; i++) els.push(line(i, 0, i, h, 'ad-grid')); for (let j = 0; j <= h; j++) els.push(line(0, j, w, j, 'ad-grid')); return els; };

const STEPS = {
  rectangle: [
    { cap: 'مستطیل با طول ۶ و عرض ۴', els: () => [poly([[0, 0], [6, 0], [6, 4], [0, 4]], 'ad-shape'), lbl(3, -0.6, '۶'), lbl(-0.7, 2, '۴')] },
    { cap: 'به مربع‌های واحد تقسیمش می‌کنیم', els: () => [poly([[0, 0], [6, 0], [6, 4], [0, 4]], 'ad-shape'), ...gridUnits(6, 4)] },
    { cap: '۶ ستون × ۴ ردیف = ۲۴ مربع واحد', els: () => [poly([[0, 0], [6, 0], [6, 4], [0, 4]], 'ad-fill'), ...gridUnits(6, 4)] },
    { cap: 'مساحت = طول × عرض = ۶ × ۴ = ۲۴', formula: true, els: () => [poly([[0, 0], [6, 0], [6, 4], [0, 4]], 'ad-fill'), ...gridUnits(6, 4)] },
  ],
  square: [
    { cap: 'مربع با ضلع ۵', els: () => [poly([[0, 0], [5, 0], [5, 5], [0, 5]], 'ad-shape'), lbl(2.5, -0.6, '۵')] },
    { cap: '۵ × ۵ = ۲۵ مربع واحد', els: () => [poly([[0, 0], [5, 0], [5, 5], [0, 5]], 'ad-fill'), ...gridUnits(5, 5)] },
    { cap: 'مساحت = ضلع × ضلع = ۵ × ۵ = ۲۵', formula: true, els: () => [poly([[0, 0], [5, 0], [5, 5], [0, 5]], 'ad-fill'), ...gridUnits(5, 5)] },
  ],
  triangle: [
    { cap: 'مثلث با قاعده ۶ و ارتفاع ۴', els: () => [poly([[0, 0], [6, 0], [1.5, 4]], 'ad-shape'), lbl(3, -0.6, '۶')] },
    { cap: 'با یک مثلثِ برابر، یک مستطیل می‌سازیم', els: () => [poly([[0, 0], [6, 0], [1.5, 4]], 'ad-fill'), poly([[0, 0], [1.5, 4], [0, 4]], 'ad-ghost'), poly([[6, 0], [6, 4], [1.5, 4]], 'ad-ghost'), poly([[0, 0], [6, 0], [6, 4], [0, 4]], 'ad-outline')] },
    { cap: 'مثلث نصف مستطیل (۶×۴=۲۴) است', els: () => [poly([[0, 0], [6, 0], [1.5, 4]], 'ad-fill'), poly([[0, 0], [6, 0], [6, 4], [0, 4]], 'ad-outline')] },
    { cap: 'مساحت = ½ × قاعده × ارتفاع = ½ × ۶ × ۴ = ۱۲', formula: true, els: () => [poly([[0, 0], [6, 0], [1.5, 4]], 'ad-fill')] },
  ],
  parallelogram: [
    { cap: 'متوازی‌الاضلاع با قاعده ۶ و ارتفاع ۴', els: () => [poly([[0, 0], [6, 0], [7.5, 4], [1.5, 4]], 'ad-shape'), lbl(3, -0.6, '۶')] },
    { cap: 'مثلث گوشه را می‌بریم…', els: () => [poly([[1.5, 0], [6, 0], [7.5, 4], [1.5, 4]], 'ad-fill'), poly([[0, 0], [1.5, 0], [1.5, 4]], 'ad-ghost'), line(1.5, 0, 1.5, 4)] },
    { cap: '…و به سمت دیگر می‌بریم تا مستطیل شود', els: () => [poly([[1.5, 0], [6, 0], [6, 4], [1.5, 4]], 'ad-fill'), poly([[6, 0], [7.5, 0], [7.5, 4]].map(([x, y]) => [x - 6 + 1.5, y]), 'ad-ghost'), poly([[1.5, 0], [7.5, 0], [7.5, 4], [1.5, 4]], 'ad-outline')] },
    { cap: 'مساحت = قاعده × ارتفاع = ۶ × ۴ = ۲۴', formula: true, els: () => [poly([[1.5, 0], [7.5, 0], [7.5, 4], [1.5, 4]], 'ad-fill'), ...gridUnits(6, 4).map((e) => e)] },
  ],
  trapezoid: [
    { cap: 'ذوزنقه با قاعده‌های ۴ و ۸ و ارتفاع ۴', els: () => [poly([[0, 0], [8, 0], [6, 4], [2, 4]], 'ad-shape'), lbl(4, -0.6, '۸'), lbl(4, 4.5, '۴')] },
    { cap: 'یک نسخهٔ چرخیده کنارش می‌گذاریم → متوازی‌الاضلاع', els: () => [poly([[0, 0], [8, 0], [6, 4], [2, 4]], 'ad-fill'), poly([[8, 0], [8 + 4, 0], [8 + 2, 4], [6, 4]], 'ad-ghost')] },
    { cap: 'قاعدهٔ آن (۴+۸)=۱۲ و ارتفاع ۴؛ مساحتش دو ذوزنقه', els: () => [poly([[0, 0], [12, 0], [10, 4], [2, 4]], 'ad-outline'), poly([[0, 0], [8, 0], [6, 4], [2, 4]], 'ad-fill')] },
    { cap: 'مساحت = ½ × (۴+۸) × ۴ = ۲۴', formula: true, els: () => [poly([[0, 0], [8, 0], [6, 4], [2, 4]], 'ad-fill')] },
  ],
  rhombus: [
    { cap: 'لوزی با قطرهای ۸ و ۶', els: () => [poly([[0, 3], [4, 0], [8, 3], [4, 6]], 'ad-shape'), line(0, 3, 8, 3), line(4, 0, 4, 6), lbl(6.2, 3, '۸'), lbl(4, 6.6, '۶')] },
    { cap: 'داخل مستطیلِ قطرها (۸×۶) جا می‌گیرد؛ لوزی نصف آن است', els: () => [poly([[0, 0], [8, 0], [8, 6], [0, 6]], 'ad-outline'), poly([[0, 3], [4, 0], [8, 3], [4, 6]], 'ad-fill')] },
    { cap: 'مساحت = ½ × قطر۱ × قطر۲ = ½ × ۸ × ۶ = ۲۴', formula: true, els: () => [poly([[0, 3], [4, 0], [8, 3], [4, 6]], 'ad-fill')] },
  ],
  circle: [
    { cap: 'دایره با شعاع ۴', els: () => { const [cx, cy] = U(4, 3); return [<circle cx={cx} cy={cy} r={3 * S} className="ad-shape" />, line(4, 3, 8, 3), lbl(6, 3.4, 'r=۴')]; } },
    { cap: 'به قاچ‌های نازک تقسیم و کنار هم می‌چینیم', els: () => { const [cx, cy] = U(4, 3); const rays = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * 2 * Math.PI; rays.push(<line key={i} x1={cx} y1={cy} x2={cx + 3 * S * Math.cos(a)} y2={cy + 3 * S * Math.sin(a)} className="ad-cut" />); } return [<circle cx={cx} cy={cy} r={3 * S} className="ad-fill" />, ...rays]; } },
    { cap: 'مساحت = π × r² ≈ ۳٫۱۴ × ۱۶ ≈ ۵۰٫۲', formula: true, els: () => { const [cx, cy] = U(4, 3); return [<circle cx={cx} cy={cy} r={3 * S} className="ad-fill" />]; } },
  ],
};

export default function AreaDiscovery({ type, onClose }) {
  const steps = STEPS[type] || STEPS.rectangle;
  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const label = SHAPES[type].label;
  return (
    <div className="ad-backdrop">
      <section className="ad-panel glass">
        <header className="ad-head"><b>🔎 کشف مساحت — {label}</b><button className="ad-x" onClick={onClose}>✕</button></header>
        <svg viewBox="0 0 360 220" className="ad-svg">{step.els()}</svg>
        <div className={`ad-cap ${step.formula ? 'formula' : ''}`}>{step.cap}</div>
        <footer className="ad-foot">
          <button onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>‹ قبل</button>
          <div className="ad-dots">{steps.map((_, k) => <span key={k} className={k === i ? 'on' : ''} />)}</div>
          {i < steps.length - 1
            ? <button className="ad-next" onClick={() => setI((v) => Math.min(steps.length - 1, v + 1))}>بعد ›</button>
            : <button className="ad-next" onClick={onClose}>پایان ✓</button>}
        </footer>
      </section>
    </div>
  );
}
