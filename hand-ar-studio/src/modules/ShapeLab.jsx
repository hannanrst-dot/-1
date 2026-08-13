import { useEffect, useRef, useState } from 'react';
import { SHAPES, SHAPE_ORDER, metricsOf } from '../lib/shapelab/geometry';
import { useInteraction } from '../lib/useInteraction';
import { fa } from '../lib/format';

const LOCKS = [
  { id: 'area', label: 'مساحت' },
  { id: 'perimeter', label: 'محیط' },
  { id: 'ratio', label: 'نسبت اضلاع' },
  { id: 'side', label: 'یک ضلع' },
];

export default function ShapeLab({ onBack }) {
  const videoRef = useRef(null), canvasRef = useRef(null), cursorRef = useRef(null), svgRef = useRef(null);
  const [type, setType] = useState('rectangle');
  const [params, setParams] = useState(SHAPES.rectangle.params);
  const [lock, setLock] = useState('none');
  const [showInfo, setShowInfo] = useState(false);
  const [grid, setGrid] = useState(false);
  const [present, setPresent] = useState(false);
  const [hand, setHand] = useState(true), [front, setFront] = useState(true);
  const [grabbed, setGrabbed] = useState(null);

  const paramsRef = useRef(params), typeRef = useRef(type), lockRef = useRef(lock), grabRef = useRef(null);
  useEffect(() => { paramsRef.current = params; }, [params]);
  useEffect(() => { typeRef.current = type; }, [type]);
  useEffect(() => { lockRef.current = lock; }, [lock]);

  // Layout: work in CSS pixels. Origin is the stage centre; unit → px via UPP.
  const view = useRef({ cx: innerWidth / 2, cy: innerHeight * 0.46, upp: 40 });
  const recomputeView = () => {
    const upp = Math.max(22, Math.min(innerWidth, innerHeight) / (present ? 13 : 17));
    view.current = { cx: innerWidth / 2, cy: innerHeight * (present ? 0.5 : 0.46), upp };
  };
  useEffect(() => { recomputeView(); const on = () => recomputeView(); addEventListener('resize', on); return () => removeEventListener('resize', on); }, [present]);
  recomputeView();

  const toPx = (u) => ({ x: view.current.cx + u.x * view.current.upp, y: view.current.cy - u.y * view.current.upp });
  const toUnit = (cx, cy) => ({ x: (cx - view.current.cx) / view.current.upp, y: (view.current.cy - cy) / view.current.upp });

  const applyDrag = (cx, cy) => {
    const id = grabRef.current; if (!id) return;
    const np = SHAPES[typeRef.current].drag(paramsRef.current, id, toUnit(cx, cy), lockRef.current);
    paramsRef.current = np; setParams(np);
  };
  const startGrab = (id) => { grabRef.current = id; setGrabbed(id); };
  const endGrab = () => { grabRef.current = null; setGrabbed(null); };

  // Pointer (mouse/touch) dragging.
  useEffect(() => {
    const move = (e) => { if (grabRef.current) { e.preventDefault(); applyDrag(e.clientX, e.clientY); } };
    const up = () => endGrab();
    addEventListener('pointermove', move, { passive: false }); addEventListener('pointerup', up);
    return () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
  }, []);

  // Hand dragging (shared Interaction Engine): pinch near a handle to grab it.
  const nearestHandle = (x, y) => {
    const def = SHAPES[typeRef.current]; let best = null, bd = 48;
    def.handles(paramsRef.current).forEach((h) => { const p = toPx(h); const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = h.id; } });
    return best;
  };
  useInteraction({
    enabled: hand, front, videoRef, canvasRef, cursorRef,
    handlers: {
      onDown: (x, y) => { const id = nearestHandle(x, y); if (id) { startGrab(id); applyDrag(x, y); } },
      onMove: (x, y) => { if (grabRef.current) applyDrag(x, y); },
      onUp: () => endGrab(),
    },
  });

  const def = SHAPES[type];
  const verts = def.verts(params);
  const pts = verts.map(toPx);
  const ptStr = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const handles = def.handles(params);
  const m = metricsOf(type, params);
  const reset = () => { setParams(SHAPES[type].params); setLock('none'); };
  const pick = (t) => { setType(t); setParams(SHAPES[t].params); setLock('none'); };

  // Unit-grid line segments (integer lines) clipped to the shape.
  const gridEls = [];
  if (grid) {
    const xs = verts.map((v) => v.x), ys = verts.map((v) => v.y);
    const minx = Math.floor(Math.min(...xs)), maxx = Math.ceil(Math.max(...xs));
    const miny = Math.floor(Math.min(...ys)), maxy = Math.ceil(Math.max(...ys));
    for (let x = minx; x <= maxx; x++) { const a = toPx({ x, y: miny }), b = toPx({ x, y: maxy }); gridEls.push(<line key={`vx${x}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="sl-grid" />); }
    for (let y = miny; y <= maxy; y++) { const a = toPx({ x: minx, y }), b = toPx({ x: maxx, y }); gridEls.push(<line key={`hy${y}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="sl-grid" />); }
  }

  const bigNum = (v) => fa(Math.round(v * 10) / 10);

  return <main className={`ar-app sl-app ${present ? 'present' : ''}`}>
    {hand && <>
      <video ref={videoRef} className={`camera ${front ? 'selfie' : ''}`} playsInline muted />
      <canvas ref={canvasRef} className="hands-layer" />
      <div ref={cursorRef} className="hand-cursor" />
    </>}

    <svg ref={svgRef} className="sl-svg">
      <defs><clipPath id="sl-clip">{def.circle ? <circle cx={view.current.cx} cy={view.current.cy} r={params.r * view.current.upp} /> : <polygon points={ptStr} />}</clipPath></defs>
      {def.circle
        ? <circle cx={view.current.cx} cy={view.current.cy} r={params.r * view.current.upp} className="sl-shape" />
        : <polygon points={ptStr} className="sl-shape" />}
      {grid && <g clipPath="url(#sl-clip)">{gridEls}</g>}

      {showInfo && !def.circle && verts.map((v, i) => {
        const a = toPx(v), b = toPx(verts[(i + 1) % verts.length]);
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        return <text key={`s${i}`} x={mid.x} y={mid.y} className="sl-side" dx={6} dy={-4}>{bigNum(m.sides[i])}</text>;
      })}
      {showInfo && def.circle && <text x={view.current.cx} y={view.current.cy - params.r * view.current.upp - 8} className="sl-side" textAnchor="middle">r = {bigNum(params.r)}</text>}

      {!present && handles.map((h) => { const p = toPx(h); return <circle key={h.id} cx={p.x} cy={p.y} r={grabbed === h.id ? 15 : 12} className={`sl-handle ${grabbed === h.id ? 'grab' : ''}`} onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); startGrab(h.id); }} />; })}
    </svg>

    {/* Live measurement bar */}
    {showInfo && <div className="sl-metrics glass">
      <div className="sl-metric"><span>مساحت</span><b>{bigNum(m.area)}</b><small>واحد²</small></div>
      <div className="sl-metric"><span>محیط</span><b>{bigNum(m.perimeter)}</b><small>واحد</small></div>
      {grid && (type === 'rectangle' || type === 'square') && <div className="sl-metric"><span>مربع واحد</span><b>{type === 'square' ? `${bigNum(params.s)}×${bigNum(params.s)}` : `${bigNum(params.w)}×${bigNum(params.h)}`}</b><small>= {bigNum(m.area)}</small></div>}
    </div>}

    {/* Top-left: home + presentation controls */}
    <button className="glass icon-button home-btn" onClick={onBack} title="منوی درس‌ها">🏠</button>

    {/* Top-right cluster */}
    <header className="top-controls">
      <button className={`glass icon-button ${showInfo ? 'active' : ''}`} onClick={() => setShowInfo((v) => !v)} title="نمایش اطلاعات">ℹ️</button>
      <button className={`glass icon-button ${grid ? 'active' : ''}`} onClick={() => setGrid((v) => !v)} title="شبکهٔ واحد">▦</button>
      <button className={`glass icon-button ${present ? 'active' : ''}`} onClick={() => setPresent((v) => !v)} title="حالت تدریس">🎓</button>
      <button className="glass icon-button" onClick={reset} title="بازنشانی">↻</button>
      {hand && <button className="glass icon-button" onClick={() => setFront((v) => !v)} title="تغییر دوربین">🔄</button>}
      <button className={`glass icon-button ${hand ? 'active' : ''}`} onClick={() => setHand((v) => !v)} title="کنترل با دست">{hand ? '🖐' : '✋'}</button>
    </header>

    {!present && <>
      {/* Lock selector */}
      <div className="sl-locks glass">
        <span className="sl-locks-title">🔒 قفل</span>
        {LOCKS.map((l) => <button key={l.id} className={`sl-lock ${lock === l.id ? 'on' : ''}`} onClick={() => setLock(lock === l.id ? 'none' : l.id)}>{l.label}</button>)}
      </div>

      {/* Shape picker */}
      <nav className="sl-picker glass">
        {SHAPE_ORDER.map((t) => <button key={t} className={`sl-shape-btn ${type === t ? 'on' : ''}`} onClick={() => pick(t)} title={SHAPES[t].label}><b>{SHAPES[t].icon}</b><small>{SHAPES[t].label}</small></button>)}
      </nav>
    </>}

    {present && <div className="sl-present-name">{def.icon} {def.label}{lock !== 'none' ? ` • 🔒 ${LOCKS.find((l) => l.id === lock)?.label}` : ''}</div>}
  </main>;
}
