import { useEffect, useRef, useState } from 'react';

// Symmetry playground: draw with a finger/mouse and the stroke is mirrored live
// across the chosen axis (vertical / horizontal / both), showing line symmetry.
export default function Symmetry() {
  const canvasRef = useRef(null), drawing = useRef(false), last = useRef(null);
  const [axis, setAxis] = useState('vertical');
  const [color, setColor] = useState('#45b7ff');
  const axisRef = useRef(axis), colorRef = useRef(color);
  useEffect(() => { axisRef.current = axis; }, [axis]);
  useEffect(() => { colorRef.current = color; }, [color]);

  const sizeCanvas = () => {
    const c = canvasRef.current; if (!c) return;
    const rect = c.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio, 2);
    c.width = rect.width * dpr; c.height = rect.height * dpr;
    const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawGuides();
  };
  const drawGuides = () => {
    const c = canvasRef.current, ctx = c.getContext('2d');
    const w = c.clientWidth, h = c.clientHeight;
    ctx.save(); ctx.strokeStyle = 'rgba(150,200,255,.5)'; ctx.setLineDash([8, 8]); ctx.lineWidth = 1.5;
    if (axisRef.current !== 'horizontal') { ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke(); }
    if (axisRef.current !== 'vertical') { ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke(); }
    ctx.restore();
  };

  useEffect(() => { sizeCanvas(); addEventListener('resize', sizeCanvas); return () => removeEventListener('resize', sizeCanvas); }, []);
  useEffect(() => { clear(); }, [axis]); // redraw guides when axis changes

  const pos = (e) => {
    const c = canvasRef.current, rect = c.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - rect.left, y: p.clientY - rect.top };
  };
  const segment = (a, b) => {
    const c = canvasRef.current, ctx = c.getContext('2d');
    const w = c.clientWidth, h = c.clientHeight, ax = axisRef.current;
    const strokes = [[a, b]];
    if (ax !== 'horizontal') strokes.push([{ x: w - a.x, y: a.y }, { x: w - b.x, y: b.y }]);
    if (ax !== 'vertical') strokes.push([{ x: a.x, y: h - a.y }, { x: b.x, y: h - b.y }]);
    if (ax === 'both') strokes.push([{ x: w - a.x, y: h - a.y }, { x: w - b.x, y: h - b.y }]);
    ctx.strokeStyle = colorRef.current; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    strokes.forEach(([p, q]) => { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); });
  };
  const down = (e) => { e.preventDefault(); drawing.current = true; last.current = pos(e); };
  const move = (e) => { if (!drawing.current) return; e.preventDefault(); const p = pos(e); segment(last.current, p); last.current = p; };
  const up = () => { drawing.current = false; last.current = null; };
  const clear = () => { const c = canvasRef.current; if (!c) return; c.getContext('2d').clearRect(0, 0, c.width, c.height); drawGuides(); };

  return (
    <div className="pane">
      <div className="sym-stage">
        <canvas ref={canvasRef} className="sym-canvas" data-hand-draw
          onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
          onTouchStart={down} onTouchMove={move} onTouchEnd={up} />
      </div>
      <div className="pane-controls glass">
        <div className="op-toggle">
          <button className={axis === 'vertical' ? 'on' : ''} onClick={() => setAxis('vertical')}>▏ عمودی</button>
          <button className={axis === 'horizontal' ? 'on' : ''} onClick={() => setAxis('horizontal')}>▁ افقی</button>
          <button className={axis === 'both' ? 'on' : ''} onClick={() => setAxis('both')}>✛ هر دو</button>
        </div>
        <div className="color-row">
          {['#45b7ff', '#f472b6', '#fbbf24', '#36d399', '#a78bfa'].map((c) => (
            <button key={c} className={`swatch ${color === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label="رنگ" />
          ))}
        </div>
        <button className="toggle-btn" onClick={clear}>🧹 پاک کردن</button>
      </div>
    </div>
  );
}
