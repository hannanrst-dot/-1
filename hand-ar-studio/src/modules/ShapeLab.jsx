import { useEffect, useRef, useState } from 'react';
import { SHAPES, SHAPE_ORDER, metricsOf, splitShape, centroid, pointInPoly } from '../lib/shapelab/geometry';
import { useInteraction } from '../lib/useInteraction';
import AreaDiscovery from './shapelab/AreaDiscovery';
import { fa } from '../lib/format';

const LOCKS = [{ id: 'area', label: 'مساحت' }, { id: 'perimeter', label: 'محیط' }, { id: 'ratio', label: 'نسبت' }, { id: 'side', label: 'ضلع' }];
const PIECE_COLORS = ['rgba(69,183,255,.4)', 'rgba(54,211,153,.4)', 'rgba(251,191,36,.4)', 'rgba(244,114,182,.4)'];
const normAng = (a) => { a %= 2 * Math.PI; if (a > Math.PI) a -= 2 * Math.PI; if (a < -Math.PI) a += 2 * Math.PI; return a; };

let uid = 0;
const mk = (type, ox) => ({ key: `s${++uid}`, type, params: { ...SHAPES[type].params }, ox });

export default function ShapeLab({ onBack }) {
  const videoRef = useRef(null), canvasRef = useRef(null), cursorRef = useRef(null);
  const [items, setItems] = useState(() => [mk('rectangle', 0)]);
  const [active, setActive] = useState(null);
  const [lock, setLock] = useState('none');
  const [showInfo, setShowInfo] = useState(false), [grid, setGrid] = useState(false), [present, setPresent] = useState(false);
  const [compare, setCompare] = useState(false), [challenge, setChallenge] = useState(0), [discover, setDiscover] = useState(false);
  const [split, setSplit] = useState(false), [pieces, setPieces] = useState([]);
  const [hand, setHand] = useState(true), [front, setFront] = useState(true);
  const [grabbed, setGrabbed] = useState(null);

  const itemsRef = useRef(items), lockRef = useRef(lock), grabRef = useRef(null);
  const splitRef = useRef(false), piecesRef = useRef([]), pGrabRef = useRef(null);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { lockRef.current = lock; }, [lock]);
  useEffect(() => { splitRef.current = split; }, [split]);
  useEffect(() => { piecesRef.current = pieces; }, [pieces]);
  useEffect(() => { if (!active && items[0]) setActive(items[0].key); }, [items, active]);

  const view = useRef({ cx: innerWidth / 2, cy: innerHeight * 0.46, upp: 40, gap: 0 });
  const recomputeView = () => {
    let upp = Math.max(20, Math.min(innerWidth, innerHeight) / (present ? 13 : 17));
    if (compare && !split) upp *= 0.6;
    view.current = { cx: innerWidth / 2, cy: innerHeight * (present ? 0.5 : 0.46), upp, gap: compare && !split ? Math.min(innerWidth * 0.25, 230) : 0 };
  };
  useEffect(() => { recomputeView(); const on = () => recomputeView(); addEventListener('resize', on); return () => removeEventListener('resize', on); }, [present, compare, split]);
  recomputeView();

  const cxOf = (it) => view.current.cx + it.ox * view.current.gap;
  const toPx = (it, u) => ({ x: cxOf(it) + u.x * view.current.upp, y: view.current.cy - u.y * view.current.upp });
  const toUnit = (it, cx, cy) => ({ x: (cx - cxOf(it)) / view.current.upp, y: (view.current.cy - cy) / view.current.upp });
  const toP = (u) => ({ x: view.current.cx + u.x * view.current.upp, y: view.current.cy - u.y * view.current.upp });
  const toU = (cx, cy) => ({ x: (cx - view.current.cx) / view.current.upp, y: (view.current.cy - cy) / view.current.upp });

  // ---- parametric-shape dragging ----
  const applyDrag = (cx, cy) => {
    const g = grabRef.current; if (!g) return;
    const list = itemsRef.current, it = list.find((i) => i.key === g.key); if (!it) return;
    const np = SHAPES[it.type].drag(it.params, g.id, toUnit(it, cx, cy), lockRef.current);
    const next = list.map((i) => (i.key === g.key ? { ...i, params: np } : i));
    itemsRef.current = next; setItems(next);
  };
  const startGrab = (key, id) => { grabRef.current = { key, id }; setGrabbed(`${key}:${id}`); setActive(key); };
  const endGrab = () => { grabRef.current = null; setGrabbed(null); };
  const nearestHandle = (x, y) => {
    let best = null, bd = 48;
    itemsRef.current.forEach((it) => SHAPES[it.type].handles(it.params).forEach((h) => { const p = toPx(it, h); const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = { key: it.key, id: h.id }; } }));
    return best;
  };

  // ---- cut-piece transform helpers ----
  const pieceVerts = (pc) => pc.base.map((v) => { const dx = v.x - pc.c.x, dy = v.y - pc.c.y; const cs = Math.cos(pc.rot), sn = Math.sin(pc.rot); return { x: pc.c.x + pc.tx + dx * cs - dy * sn, y: pc.c.y + pc.ty + dx * sn + dy * cs }; });
  const rotHandle = (pc) => { const off = pc.r + 0.9; return { x: pc.c.x + pc.tx + (-Math.sin(pc.rot)) * off, y: pc.c.y + pc.ty + Math.cos(pc.rot) * off }; };
  const startPiece = (id, mode, cx, cy) => { const u = toU(cx, cy), pc = piecesRef.current.find((p) => p.id === id); const cen = { x: pc.c.x + pc.tx, y: pc.c.y + pc.ty }; pGrabRef.current = { id, mode, ux: u.x, uy: u.y, tx: pc.tx, ty: pc.ty, rot: pc.rot, ang: Math.atan2(u.y - cen.y, u.x - cen.x) }; setGrabbed(`p${id}`); };
  const applyPiece = (cx, cy) => {
    const g = pGrabRef.current; if (!g) return; const u = toU(cx, cy);
    const next = piecesRef.current.map((pc) => {
      if (pc.id !== g.id) return pc;
      if (g.mode === 'move') return { ...pc, tx: g.tx + (u.x - g.ux), ty: g.ty + (u.y - g.uy) };
      const cen = { x: pc.c.x + g.tx, y: pc.c.y + g.ty }; return { ...pc, rot: g.rot + (Math.atan2(u.y - cen.y, u.x - cen.x) - g.ang) };
    });
    piecesRef.current = next; setPieces(next);
  };
  const endPiece = () => {
    const g = pGrabRef.current; pGrabRef.current = null; setGrabbed(null); if (!g) return;
    const next = piecesRef.current.map((pc) => (pc.id === g.id && Math.hypot(pc.tx, pc.ty) < 0.7 && Math.abs(normAng(pc.rot)) < 0.25 ? { ...pc, tx: 0, ty: 0, rot: 0 } : pc));
    piecesRef.current = next; setPieces(next);
  };
  const pieceAt = (cx, cy) => {
    // rotate handles first, then bodies.
    for (const pc of piecesRef.current) { const p = toP(rotHandle(pc)); if (Math.hypot(p.x - cx, p.y - cy) < 24) return { id: pc.id, mode: 'rotate' }; }
    const u = toU(cx, cy);
    for (let i = piecesRef.current.length - 1; i >= 0; i--) { const pc = piecesRef.current[i]; if (pointInPoly(u.x, u.y, pieceVerts(pc))) return { id: pc.id, mode: 'move' }; }
    return null;
  };

  // Pointer (mouse/touch).
  useEffect(() => {
    const move = (e) => { if (pGrabRef.current) { e.preventDefault(); applyPiece(e.clientX, e.clientY); } else if (grabRef.current) { e.preventDefault(); applyDrag(e.clientX, e.clientY); } };
    const up = () => { if (pGrabRef.current) endPiece(); else endGrab(); };
    addEventListener('pointermove', move, { passive: false }); addEventListener('pointerup', up);
    return () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
  }, []);

  // Hand (Interaction Engine): routed to pieces in split mode, to handles otherwise.
  useInteraction({
    enabled: hand && !discover, front, videoRef, canvasRef, cursorRef,
    handlers: {
      onDown: (x, y) => { if (splitRef.current) { const t = pieceAt(x, y); if (t) startPiece(t.id, t.mode, x, y); } else { const g = nearestHandle(x, y); if (g) { startGrab(g.key, g.id); applyDrag(x, y); } } },
      onMove: (x, y) => { if (pGrabRef.current) applyPiece(x, y); else if (grabRef.current) applyDrag(x, y); },
      onUp: () => { if (pGrabRef.current) endPiece(); else endGrab(); },
    },
  });

  // ---- actions ----
  const setType = (key, type) => setItems((l) => l.map((i) => (i.key === key ? { ...i, type, params: { ...SHAPES[type].params } } : i)));
  const reset = () => { setItems((l) => l.map((i) => (i.key === active ? { ...i, params: { ...SHAPES[i.type].params } } : i))); setLock('none'); };
  const toggleCompare = () => { if (compare) { setItems((l) => [{ ...l[0], ox: 0 }]); setCompare(false); setChallenge(0); } else { setItems((l) => [{ ...l[0], ox: -1 }, mk('square', 1)]); setCompare(true); } };
  const activeItem = items.find((i) => i.key === active) || items[0];

  const enterSplit = () => {
    const raw = splitShape(activeItem.type, activeItem.params); if (!raw) return;
    const pcs = raw.map((verts, i) => { const c = centroid(verts); const r = Math.max(...verts.map((v) => Math.hypot(v.x - c.x, v.y - c.y))); const len = Math.hypot(c.x, c.y) || 1; const dir = { x: c.x / len, y: c.y / len }; return { id: i, base: verts, c, r, tx: dir.x * (r * 0.5 + 0.8), ty: dir.y * (r * 0.5 + 0.8), rot: 0 }; });
    setCompare(false); setPieces(pcs); piecesRef.current = pcs; setSplit(true);
  };
  const exitSplit = () => { setSplit(false); setPieces([]); pGrabRef.current = null; };
  const gatherPieces = () => { const next = piecesRef.current.map((pc) => ({ ...pc, tx: 0, ty: 0, rot: 0 })); piecesRef.current = next; setPieces(next); };

  const metricsFor = (it) => metricsOf(it.type, it.params);
  const bigNum = (v) => fa(Math.round(v * 10) / 10);

  const CH = compare
    ? [null, { t: 'مساحت‌ها را برابر کن', check: () => Math.abs(metricsFor(items[0]).area - metricsFor(items[1]).area) < 0.6 }, { t: 'محیط‌ها را برابر کن', check: () => Math.abs(metricsFor(items[0]).perimeter - metricsFor(items[1]).perimeter) < 0.6 }, { t: 'مساحت برابر، محیط متفاوت', check: () => Math.abs(metricsFor(items[0]).area - metricsFor(items[1]).area) < 0.6 && Math.abs(metricsFor(items[0]).perimeter - metricsFor(items[1]).perimeter) > 1 }]
    : [null, { t: 'مساحت = ۲۴ بساز', check: () => Math.abs(metricsFor(activeItem).area - 24) < 0.6 }, { t: 'محیط = ۲۰ بساز', check: () => Math.abs(metricsFor(activeItem).perimeter - 20) < 0.6 }, { t: 'مساحت = ۳۶ بساز', check: () => Math.abs(metricsFor(activeItem).area - 36) < 0.6 }];
  const chal = split ? null : CH[challenge] || null;
  const chalDone = chal ? chal.check() : false;

  const gridLinesFor = (it) => {
    const verts = SHAPES[it.type].verts(it.params), xs = verts.map((v) => v.x), ys = verts.map((v) => v.y);
    const minx = Math.floor(Math.min(...xs)), maxx = Math.ceil(Math.max(...xs)), miny = Math.floor(Math.min(...ys)), maxy = Math.ceil(Math.max(...ys));
    const els = [];
    for (let x = minx; x <= maxx; x++) { const a = toPx(it, { x, y: miny }), b = toPx(it, { x, y: maxy }); els.push(<line key={`vx${x}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="sl-grid" />); }
    for (let y = miny; y <= maxy; y++) { const a = toPx(it, { x: minx, y }), b = toPx(it, { x: maxx, y }); els.push(<line key={`hy${y}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="sl-grid" />); }
    return els;
  };
  const cmpSign = (a, b) => (Math.abs(a - b) < 0.6 ? '=' : a > b ? '>' : '<');
  const ghostPts = split ? SHAPES[activeItem.type].verts(activeItem.params).map((v) => { const p = toP(v); return `${p.x},${p.y}`; }).join(' ') : '';

  return <main className={`ar-app sl-app ${present ? 'present' : ''}`}>
    {hand && <>
      <video ref={videoRef} className={`camera ${front ? 'selfie' : ''}`} playsInline muted />
      <canvas ref={canvasRef} className="hands-layer" />
      <div ref={cursorRef} className="hand-cursor" />
    </>}

    <svg className="sl-svg">
      {!split && <defs>{items.map((it) => { const def = SHAPES[it.type]; const c = cxOf(it); return <clipPath key={it.key} id={`clip-${it.key}`}>{def.circle ? <circle cx={c} cy={view.current.cy} r={it.params.r * view.current.upp} /> : <polygon points={def.verts(it.params).map((v) => { const p = toPx(it, v); return `${p.x},${p.y}`; }).join(' ')} />}</clipPath>; })}</defs>}

      {!split && items.map((it) => {
        const def = SHAPES[it.type], c = cxOf(it);
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

      {split && <>
        <polygon points={ghostPts} className="sl-ghost" />
        {pieces.map((pc) => {
          const pts = pieceVerts(pc).map((v) => { const p = toP(v); return `${p.x},${p.y}`; }).join(' ');
          const rh = toP(rotHandle(pc));
          return <g key={pc.id}>
            <polygon points={pts} className="sl-piece" style={{ fill: PIECE_COLORS[pc.id % PIECE_COLORS.length] }} onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); startPiece(pc.id, 'move', e.clientX, e.clientY); }} />
            <circle cx={rh.x} cy={rh.y} r={11} className="sl-rot" onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); startPiece(pc.id, 'rotate', e.clientX, e.clientY); }} />
          </g>;
        })}
      </>}
    </svg>

    {showInfo && !compare && !split && <div className="sl-metrics glass">
      <div className="sl-metric"><span>مساحت</span><b>{bigNum(metricsFor(activeItem).area)}</b><small>واحد²</small></div>
      <div className="sl-metric"><span>محیط</span><b>{bigNum(metricsFor(activeItem).perimeter)}</b><small>واحد</small></div>
      {grid && (activeItem.type === 'rectangle' || activeItem.type === 'square') && <div className="sl-metric"><span>مربع واحد</span><b>{activeItem.type === 'square' ? `${bigNum(activeItem.params.s)}×${bigNum(activeItem.params.s)}` : `${bigNum(activeItem.params.w)}×${bigNum(activeItem.params.h)}`}</b><small>= {bigNum(metricsFor(activeItem).area)}</small></div>}
    </div>}

    {showInfo && compare && !split && items.length === 2 && <div className="sl-compare glass">
      <div className="sl-cmp-row"><span>مساحت</span><b>{bigNum(metricsFor(items[0]).area)}</b><i className={Math.abs(metricsFor(items[0]).area - metricsFor(items[1]).area) < 0.6 ? 'eq' : ''}>{cmpSign(metricsFor(items[0]).area, metricsFor(items[1]).area)}</i><b>{bigNum(metricsFor(items[1]).area)}</b></div>
      <div className="sl-cmp-row"><span>محیط</span><b>{bigNum(metricsFor(items[0]).perimeter)}</b><i className={Math.abs(metricsFor(items[0]).perimeter - metricsFor(items[1]).perimeter) < 0.6 ? 'eq' : ''}>{cmpSign(metricsFor(items[0]).perimeter, metricsFor(items[1]).perimeter)}</i><b>{bigNum(metricsFor(items[1]).perimeter)}</b></div>
    </div>}

    {chal && <div className={`sl-challenge glass ${chalDone ? 'done' : ''}`}>🎯 {chal.t} {chalDone && '✓'}</div>}

    <button className="glass icon-button home-btn" onClick={onBack} title="منوی درس‌ها">🏠</button>

    {!split && <header className="top-controls">
      <button className={`glass icon-button ${showInfo ? 'active' : ''}`} onClick={() => setShowInfo((v) => !v)} title="نمایش اطلاعات">ℹ️</button>
      <button className={`glass icon-button ${grid ? 'active' : ''}`} onClick={() => setGrid((v) => !v)} title="شبکهٔ واحد">▦</button>
      <button className={`glass icon-button ${compare ? 'active' : ''}`} onClick={toggleCompare} title="مقایسه">⚖️</button>
      <button className="glass icon-button" onClick={() => setChallenge((c) => (c + 1) % CH.length)} title="چالش">🎯</button>
      <button className="glass icon-button" onClick={() => setDiscover(true)} title="کشف مساحت">🔎</button>
      <button className="glass icon-button" onClick={enterSplit} disabled={SHAPES[activeItem.type].circle} title="برش">✂️</button>
      <button className={`glass icon-button ${present ? 'active' : ''}`} onClick={() => setPresent((v) => !v)} title="حالت تدریس">🎓</button>
      <button className="glass icon-button" onClick={reset} title="بازنشانی">↻</button>
      {hand && <button className="glass icon-button" onClick={() => setFront((v) => !v)} title="تغییر دوربین">🔄</button>}
      <button className={`glass icon-button ${hand ? 'active' : ''}`} onClick={() => setHand((v) => !v)} title="کنترل با دست">{hand ? '🖐' : '✋'}</button>
    </header>}

    {split && <header className="top-controls">
      <button className="glass icon-button" onClick={gatherPieces} title="ترکیب دوباره">🧩</button>
      {hand && <button className="glass icon-button" onClick={() => setFront((v) => !v)} title="تغییر دوربین">🔄</button>}
      <button className="glass icon-button" onClick={exitSplit} title="بازگشت">↩️</button>
    </header>}

    {!split && !present && <>
      <div className="sl-locks glass">
        <span className="sl-locks-title">🔒 قفل</span>
        {LOCKS.map((l) => <button key={l.id} className={`sl-lock ${lock === l.id ? 'on' : ''}`} onClick={() => setLock(lock === l.id ? 'none' : l.id)}>{l.label}</button>)}
      </div>
      <nav className="sl-picker glass">
        {SHAPE_ORDER.map((t) => <button key={t} className={`sl-shape-btn ${activeItem.type === t ? 'on' : ''}`} onClick={() => setType(active, t)} title={SHAPES[t].label}><b>{SHAPES[t].icon}</b><small>{SHAPES[t].label}</small></button>)}
      </nav>
    </>}

    {split && <div className="sl-hint glass">✂️ قطعه‌ها را با نیشگون/ماوس جابه‌جا و با دستهٔ بالای هر قطعه بچرخانید • نزدیک جای اصلی رها کنید تا بچسبد</div>}

    {present && !split && <div className="sl-present-name">{SHAPES[activeItem.type].icon} {SHAPES[activeItem.type].label}{lock !== 'none' ? ` • 🔒 ${LOCKS.find((l) => l.id === lock)?.label}` : ''}</div>}

    {discover && <AreaDiscovery type={activeItem.type} onClose={() => setDiscover(false)} />}
  </main>;
}
