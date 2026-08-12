import { useState } from 'react';
import { fa, gcd } from '../lib/format';

// Visual fraction teacher: a pie and a bar for a/b, plus decimal, percent, the
// simplified form, and an optional side-by-side comparison of two fractions.
function Pie({ num, den, color }) {
  const R = 46, C = 50;
  const slices = [];
  for (let i = 0; i < den; i++) {
    const a0 = (i / den) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / den) * Math.PI * 2 - Math.PI / 2;
    const x0 = C + R * Math.cos(a0), y0 = C + R * Math.sin(a0);
    const x1 = C + R * Math.cos(a1), y1 = C + R * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    slices.push(
      <path key={i} d={`M${C},${C} L${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1} Z`}
        fill={i < num ? color : 'rgba(255,255,255,.07)'} stroke="#0b1020" strokeWidth="1.2" />,
    );
  }
  return <svg viewBox="0 0 100 100" className="frac-svg">{slices}</svg>;
}

function Bar({ num, den, color }) {
  const cells = [];
  for (let i = 0; i < den; i++) {
    cells.push(<div key={i} className="frac-cell" style={{ background: i < num ? color : 'rgba(255,255,255,.07)' }} />);
  }
  return <div className="frac-bar">{cells}</div>;
}

function Fraction({ num, den, color }) {
  const g = gcd(num, den);
  const dec = den ? (num / den) : 0;
  return (
    <div className="frac-block">
      <Pie num={num} den={den} color={color} />
      <Bar num={num} den={den} color={color} />
      <div className="frac-readout">
        <div className="frac-value"><span className="frac-n">{fa(num)}</span><span className="frac-line" /><span className="frac-d">{fa(den)}</span></div>
        <div className="frac-extra">
          <span>= {fa((Math.round(dec * 100) / 100))}</span>
          <span>= {fa(Math.round(dec * 100))}٪</span>
          {g > 1 && <span>= {fa(num / g)}/{fa(den / g)}</span>}
        </div>
      </div>
    </div>
  );
}

function Stepper({ label, value, set, min, max }) {
  return (
    <div className="stepper">
      <span className="stepper-label">{label}</span>
      <button onClick={() => set(Math.max(min, value - 1))} aria-label="کم">−</button>
      <b>{fa(value)}</b>
      <button onClick={() => set(Math.min(max, value + 1))} aria-label="زیاد">+</button>
    </div>
  );
}

export default function Fractions() {
  const [num, setNum] = useState(1), [den, setDen] = useState(2);
  const [num2, setNum2] = useState(2), [den2, setDen2] = useState(3);
  const [compare, setCompare] = useState(false);
  const n1 = Math.min(num, den), n2 = Math.min(num2, den2);
  const cmp = n1 / den === n2 / den2 ? '=' : n1 / den > n2 / den2 ? '>' : '<';

  return (
    <div className="pane">
      <div className="frac-stage">
        <Fraction num={n1} den={den} color="#45b7ff" />
        {compare && <>
          <div className="frac-cmp">{cmp}</div>
          <Fraction num={n2} den={den2} color="#f472b6" />
        </>}
      </div>
      <div className="pane-controls glass">
        <div className="ctrl-group">
          <Stepper label="صورت" value={num} set={(v) => setNum(Math.min(v, den))} min={0} max={den} />
          <Stepper label="مخرج" value={den} set={(v) => { setDen(v); if (num > v) setNum(v); }} min={1} max={12} />
        </div>
        {compare && <div className="ctrl-group ctrl-pink">
          <Stepper label="صورت" value={num2} set={(v) => setNum2(Math.min(v, den2))} min={0} max={den2} />
          <Stepper label="مخرج" value={den2} set={(v) => { setDen2(v); if (num2 > v) setNum2(v); }} min={1} max={12} />
        </div>}
        <button className={`toggle-btn ${compare ? 'on' : ''}`} onClick={() => setCompare(!compare)}>{compare ? 'حالت مقایسه: روشن' : '⚖️ مقایسهٔ دو کسر'}</button>
      </div>
    </div>
  );
}
