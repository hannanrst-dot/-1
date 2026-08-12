import { useState } from 'react';
import { fa } from '../lib/format';

// Multiplication as an array/area model: a rows × b columns of unit squares make
// the product visible as a rectangle's area. An area-model toggle splits a
// two-digit factor into tens + ones to show partial products.
export default function Multiplication() {
  const [a, setA] = useState(3), [b, setB] = useState(4);
  const [areaModel, setAreaModel] = useState(false);
  const product = a * b;

  const cell = Math.min(30, Math.floor(300 / Math.max(a, b, 6)));
  const dots = [];
  for (let r = 0; r < a; r++) for (let c = 0; c < b; c++) {
    dots.push(<rect key={`${r}-${c}`} x={c * cell + 2} y={r * cell + 2} width={cell - 4} height={cell - 4} rx="4"
      fill={r % 2 === c % 2 ? '#45b7ff' : '#5ec8ff'} opacity="0.92" />);
  }
  const W = b * cell, H = a * cell;

  // Area-model split of b into tens/ones (only meaningful for 2-digit b).
  const bTens = Math.floor(b / 10) * 10, bOnes = b % 10;

  return (
    <div className="pane">
      <div className="mul-stage">
        {!areaModel ? (
          <svg viewBox={`0 0 ${Math.max(W, 1)} ${Math.max(H, 1)}`} className="mul-svg" style={{ maxWidth: `${Math.min(W * 1.4, 320)}px` }}>{dots}</svg>
        ) : (
          <div className="area-model">
            <div className="area-corner" />
            <div className="area-col-head" style={{ gridColumn: 2 }}>{fa(bTens || 0)}</div>
            <div className="area-col-head" style={{ gridColumn: 3 }}>{fa(bOnes)}</div>
            <div className="area-row-head">{fa(a)}</div>
            <div className="area-box blue">{fa(a * bTens)}</div>
            <div className="area-box green">{fa(a * bOnes)}</div>
          </div>
        )}
      </div>
      <div className="mul-equation">
        {fa(a)} <b>×</b> {fa(b)} <b>=</b> <span className="mul-result">{fa(product)}</span>
        {areaModel && bTens > 0 && <div className="mul-partial">{fa(a * bTens)} + {fa(a * bOnes)} = {fa(product)}</div>}
      </div>
      <div className="pane-controls glass">
        <div className="stepper"><span className="stepper-label">ردیف (a)</span><button onClick={() => setA(Math.max(1, a - 1))}>−</button><b>{fa(a)}</b><button onClick={() => setA(Math.min(12, a + 1))}>+</button></div>
        <div className="stepper"><span className="stepper-label">ستون (b)</span><button onClick={() => setB(Math.max(1, b - 1))}>−</button><b>{fa(b)}</b><button onClick={() => setB(Math.min(areaModel ? 20 : 12, b + 1))}>+</button></div>
        <button className={`toggle-btn ${areaModel ? 'on' : ''}`} onClick={() => setAreaModel(!areaModel)}>{areaModel ? 'مدل مساحت: روشن' : '▭ مدل مساحت'}</button>
      </div>
    </div>
  );
}
