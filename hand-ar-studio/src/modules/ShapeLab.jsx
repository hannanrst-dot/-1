import { useEffect, useRef, useState } from 'react';
import { SHAPES, SHAPE_ORDER, metricsOf } from '../lib/shapelab/geometry';
import { useInteraction } from '../lib/useInteraction';
import AreaDiscovery from './shapelab/AreaDiscovery';
import { fa } from '../lib/format';

const LOCKS = [
  { id: 'area', label: 'مساحت' },
  { id: 'perimeter', label: 'محیط' },
  { id: 'ratio', label: 'نسبت' },
  { id: 'side', label: 'ضلع' },
];

let uid = 0;
const mk = (type, ox) => ({ key: `s${++uid}`, type, params: { ...SHAPES[type].params }, ox });

export default function ShapeLab({ onBack }) {
  const videoRef = useRef(null), canvasRef = useRef(null), cursorRef = useRef(null);
  const [items, setItems] = useState(() => [mk('rectangle', 0)]);
  const [active, setActive] = useState(null);
  const [lock, setLock] = useState('none');
  const [showInfo, setShowInfo] = useState(false), [grid, setGrid] = useState(false), [present, setPresent] = useState(false);
  const [compare, setCompare] = useState(false), [challenge, setChallenge] = useState(0), [discover, setDiscover] = useState(false);
  const [hand, setHand] = useState(true), [front, setFront] = useState(true);
  const [grabbed, setGrabbed] = useState(null);

  const itemsRef = useRef(items), lockRef = useRef(lock), grabRef = useRef(null);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { lockRef.current = lock; }, [lock]);
  useEffect(() => { if (!active && items[0]) setActive(items[0].key); }, [items, active]);

  const view = useRef({ cx: innerWidth / 2, cy: innerHeight * 0.46, upp: 40, gap: 0 });
  const recomputeView = () => {
    let upp = Math.max(20, Math.min(innerWidth, innerHeight) / (present ? 13 : 17));
    if (compare) upp *= 0.6;
    view.current = { cx: innerWidth / 2, cy: innerHeight * (present ? 0.5 : 0.46), upp, gap: compare ? Math.min(innerWidth * 0.25, 230) : 0 };
  };
  useEffect(() => { recomputeView(); const on = () => recomputeView(); addEventListener('resize', on); return () => removeEventListener('resize', on); }, [present, compare]);
  recomputeView();

  const cxOf = (it) => view.current.cx + it.ox * view.current.gap;
  const toPx = (it, u) => ({ x: cxOf(it) + u.x * view.current.upp, y: view.current.cy - u.y * view.current.upp });
  const toUnit = (it, cx, cy) => ({ x: (cx - cxOf(it)) / view.current.upp, y: (view.current.cy - cy) / view.current.upp });

  const applyDrag = (cx, cy) => {
    const g = grabRef.current; if (!g) return;
    const list = itemsRef.current; const it = list.find((i) => i.key === g.key); if (!it) return;
    const np = SHAPES[it.type].drag(it.params, g.id, toUnit(it, cx, cy), lockRef.current);
    const next = list.map((i) => (i.key === g.key ? { ...i, params: np } : i));
    itemsRef.current = next; setItems(next);
  };
  const startGrab = (key, id) => { grabRef.current = { key, id }; setGrabbed(`${key}:${id}`); setActive(key); };
  const endGrab = () => { grabRef.current = null; setGrabbed(null); };

  useEffect(() => {
    const move = (e) => { if (grabRef.current) { e.preventDefault(); applyDrag(e.clientX, e.clientY); } };
    const up = () => endGrab();
    addEventListener('pointermove', move, { passive: false }); addEventListener('pointerup', up);
    return () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
  }, []);

  const nearestHandle = (x, y) => {
    let best = null, bd = 48;
    itemsRef.current.forEach((it) => SHAPES[it.type].handles(it.params).forEach((h) => { const p = toPx(it, h); const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = { key: it.key, id: h.id }; } }));
    return best;
  };
  useInteraction({
    enabled: hand && !discover, front, videoRef, canvasRef, cursorRef,
    handlers: {
      onDown: (x, y) => { const g = nearestHandle(x, y); if (g) { startGrab(g.key, g.id); applyDrag(x, y); } },
      onMove: (x, y) => { if (grabRef.current) applyDrag(x, y); },
      onUp: () => endGrab(),
    },
  });

  const setType = (key, type) => setItems((l) => l.map((i) => (i.key === key ? { ...i, type, params: { ...SHAPES[type].params } } : i)));
  const reset = () => { setItems((l) => l.map((i) => (i.key === active ? { ...i, params: { ...SHAPES[i.type].params } } : i))); setLock('none'); };
  const toggleCompare = () => {
    if (compare) { setItems((l) => [{ ...l[0], ox: 0 }]); setCompare(false); setChallenge(0); }
    else { setItems((l) => [{ ...l[0], ox: -1 }, mk('square', 1)]); setCompare(true); setActive((a) => a || items[0].key); }
  };

  const metricsFor = (it) => metricsOf(it.type, it.params);
  const bigNum = (v) => fa(Math.round(v * 10) / 10);
  const activeItem = items.find((i) => i.key === active) || items[0];

  // Challenge presets. equal-* presets only make sense in compare mode.
  const CH = compare
    ? [null, { t: 'مساحت‌ها را برابر کن', check: () => Math.abs(metricsFor(items[0]).area - metricsFor(items[1]).area) < 0.6 }, { t: 'محیط‌ها را برابر کن', check: () => Math.abs(metricsFor(items[0]).perimeter - metricsFor(items[1]).perimeter) < 0.6 }, { t: 'مساحت برابر، محیط متفاوت', check: () => Math.abs(metricsFor(items[0]).area - metricsFor(items[1]).area) < 0.6 && Math.abs(metricsFor(items[0]).perimeter - metricsFor(items[1]).perimeter) > 1 }]
    : [null, { t: 'مساحت = ۲۴ بساز', check: () => Math.abs(metricsFor(activeItem).area - 24) < 0.6 }, { t: 'محیط = ۲۰ بساز', check: () => Math.abs(metricsFor(activeItem).perimeter - 20) < 0.6 }, { t: 'مساحت = ۳۶ بساز', check: () => Math.abs(metricsFor(activeItem).area - 36) < 0.6 }];
  const chal = CH[challenge] || null;
  const chalDone = chal ? chal.check() : false;
  const cycleChallenge = () => setChallenge((c) => (c + 1) % CH.length);

  const gridLinesFor = (it) => {
    if (!grid) return null;
    const verts = SHAPES[it.type].verts(it.params);
    const xs = verts.map((v) => v.x), ys = verts.map((v) => v.y);
    const minx = Math.floor(Math.min(...xs)), maxx = Math.ceil(Math.max(...xs)), miny = Math.floor(Math.min(...ys)), maxy = Math.ceil(Math.max(...ys));
    const els = [];
    for (let x = minx; x <= maxx; x++) { const a = toPx(it, { x, y: miny }), b = toPx(it, { x, y: maxy }); els.push(<line key={`vx${x}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="sl-grid" />); }
    for (let y = miny; y <= maxy; y++) { const a = toPx(it, { x: minx, y }), b = toPx(it, { x: maxx, y }); els.push(<line key={`hy${y}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="sl-grid" />); }
    return els;
  };

  const cmpSign = (a, b) => (Math.abs(a - b) < 0.6 ? '=' : a > b ? '>' : '<');

  return <main className={`ar-app sl-app ${present ? 'present' : ''}`}>
    {hand && <>
      <video ref={videoRef} className={`camera ${front ? 'selfie' : ''}`} playsInline muted />
      <canvas ref={canvasRef} className="hands-layer" />
      <div ref={cursorRef} className="hand-cursor" />
    </>}

    <svg className="sl-svg">
      <defs>{items.map((it) => { const def = SHAPES[it.type]; const c = cxOf(it); return <clipPath key={it.key} id={`clip-${it.key}`}>{def.circle ? <circle cx={c} cy={view.current.cy} r={it.params.r * view.current.upp} /> : <polygon points={def.verts(it.params).map((v) => { const p = toPx(it, v); return `${p.x},${p.y}`; }).join(' ')} />}</clipPath>; })}</defs>

      {items.map((it) => {
        const def = SHAPES[it.type]; const c = cxOf(it);
        const ptStr = def.verts(it.params).map((v) => { const p = toPx(it, v); return `${p.x},${p.y}`; }).join(' ');
        const m = metricsFor(it);
        return <g key={it.key}>
          {def.circle
            ? <circle cx={c} cy={view.current.cy} r={it.params.r * view.current.upp} className={`sl-shape ${active === it.key ? 'sel' : ''}`} onPointerDown={() => setActive(it.key)} />
            : <polygon points={ptStr} className={`sl-shape ${active === it.key ? 'sel' : ''}`} onPointerDown={() => setActive(it.key)} />}
          {grid && <g clipPath={`url(#clip-${it.key})`}>{gridLinesFor(it)}</g>}
          {showInfo && !def.circle && def.verts(it.params).map((v, i, arr) => { const a = toPx(it, v), b = toPx(it, arr[(i + 1) % arr.length]); const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; return <text key={`s${i}`} x={mid.x} y={mid.y} className="sl-side" dx={5} dy={-4}>{bigNum(m.sides[i])}</text>; })}
          {!present && SHAPES[it.type].handles(it.params).map((h) => { const p = toPx(it, h); const gk = `${it.key}:${h.id}`; return <circle key={h.id} cx={p.x} cy={p.y} r={grabbed === gk ? 15 : 12} className={`sl-handle ${grabbed === gk ? 'grab' : ''}`} onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); startGrab(it.key, h.id); }} />; })}
        </g>;
      })}
    </svg>

    {/* Measurements */}
    {showInfo && !compare && <div className="sl-metrics glass">
      <div className="sl-metric"><span>مساحت</span><b>{bigNum(metricsFor(activeItem).area)}</b><small>واحد²</small></div>
      <div className="sl-metric"><span>محیط</span><b>{bigNum(metricsFor(activeItem).perimeter)}</b><small>واحد</small></div>
      {grid && (activeItem.type === 'rectangle' || activeItem.type === 'square') && <div className="sl-metric"><span>مربع واحد</span><b>{activeItem.type === 'square' ? `${bigNum(activeItem.params.s)}×${bigNum(activeItem.params.s)}` : `${bigNum(activeItem.params.w)}×${bigNum(activeItem.params.h)}`}</b><small>= {bigNum(metricsFor(activeItem).area)}</small></div>}
    </div>}

    {showInfo && compare && items.length === 2 && <div className="sl-compare glass">
      <div className="sl-cmp-row"><span>مساحت</span><b>{bigNum(metricsFor(items[0]).area)}</b><i className={Math.abs(metricsFor(items[0]).area - metricsFor(items[1]).area) < 0.6 ? 'eq' : ''}>{cmpSign(metricsFor(items[0]).area, metricsFor(items[1]).area)}</i><b>{bigNum(metricsFor(items[1]).area)}</b></div>
      <div className="sl-cmp-row"><span>محیط</span><b>{bigNum(metricsFor(items[0]).perimeter)}</b><i className={Math.abs(metricsFor(items[0]).perimeter - metricsFor(items[1]).perimeter) < 0.6 ? 'eq' : ''}>{cmpSign(metricsFor(items[0]).perimeter, metricsFor(items[1]).perimeter)}</i><b>{bigNum(metricsFor(items[1]).perimeter)}</b></div>
    </div>}

    {chal && <div className={`sl-challenge glass ${chalDone ? 'done' : ''}`}>🎯 {chal.t} {chalDone && '✓'}</div>}

    <button className="glass icon-button home-btn" onClick={onBack} title="منوی درس‌ها">🏠</button>

    <header className="top-controls">
      <button className={`glass icon-button ${showInfo ? 'active' : ''}`} onClick={() => setShowInfo((v) => !v)} title="نمایش اطلاعات">ℹ️</button>
      <button className={`glass icon-button ${grid ? 'active' : ''}`} onClick={() => setGrid((v) => !v)} title="شبکهٔ واحد">▦</button>
      <button className={`glass icon-button ${compare ? 'active' : ''}`} onClick={toggleCompare} title="مقایسه">⚖️</button>
      <button className="glass icon-button" onClick={cycleChallenge} title="چالش">🎯</button>
      <button className="glass icon-button" onClick={() => setDiscover(true)} title="کشف مساحت">🔎</button>
      <button className={`glass icon-button ${present ? 'active' : ''}`} onClick={() => setPresent((v) => !v)} title="حالت تدریس">🎓</button>
      <button className="glass icon-button" onClick={reset} title="بازنشانی">↻</button>
      {hand && <button className="glass icon-button" onClick={() => setFront((v) => !v)} title="تغییر دوربین">🔄</button>}
      <button className={`glass icon-button ${hand ? 'active' : ''}`} onClick={() => setHand((v) => !v)} title="کنترل با دست">{hand ? '🖐' : '✋'}</button>
    </header>

    {!present && <>
      <div className="sl-locks glass">
        <span className="sl-locks-title">🔒 قفل</span>
        {LOCKS.map((l) => <button key={l.id} className={`sl-lock ${lock === l.id ? 'on' : ''}`} onClick={() => setLock(lock === l.id ? 'none' : l.id)}>{l.label}</button>)}
      </div>
      <nav className="sl-picker glass">
        {SHAPE_ORDER.map((t) => <button key={t} className={`sl-shape-btn ${activeItem.type === t ? 'on' : ''}`} onClick={() => setType(active, t)} title={SHAPES[t].label}><b>{SHAPES[t].icon}</b><small>{SHAPES[t].label}</small></button>)}
      </nav>
    </>}

    {present && <div className="sl-present-name">{SHAPES[activeItem.type].icon} {SHAPES[activeItem.type].label}{lock !== 'none' ? ` • 🔒 ${LOCKS.find((l) => l.id === lock)?.label}` : ''}</div>}

    {discover && <AreaDiscovery type={activeItem.type} onClose={() => setDiscover(false)} />}
  </main>;
}
