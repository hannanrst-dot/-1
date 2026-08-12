import { useState } from 'react';
import { fa } from '../lib/format';

// Number line for addition/subtraction (including negatives): pick a start,
// an operation and an amount, then see the jump arc land on the result.
export default function NumberLine() {
  const [min, setMin] = useState(-10), [max, setMax] = useState(10);
  const [start, setStart] = useState(2);
  const [op, setOp] = useState('+');
  const [amount, setAmount] = useState(5);

  const result = op === '+' ? start + amount : start - amount;
  const clamped = Math.max(min, Math.min(max, result));
  const W = 680, H = 220, padX = 30, y = 140;
  const span = max - min;
  const X = (n) => padX + ((n - min) / span) * (W - 2 * padX);

  const ticks = [];
  for (let n = min; n <= max; n++) {
    ticks.push(
      <g key={n}>
        <line x1={X(n)} y1={y - 6} x2={X(n)} y2={y + 6} stroke="#5c6a8a" strokeWidth={n === 0 ? 2.4 : 1.2} />
        <text x={X(n)} y={y + 24} textAnchor="middle" className="nl-tick">{fa(n)}</text>
      </g>,
    );
  }

  // Jump arc from start to result.
  const x0 = X(start), x1 = X(clamped);
  const mx = (x0 + x1) / 2, arcH = Math.min(70, 24 + Math.abs(amount) * 6);
  const arc = `M${x0},${y - 8} Q${mx},${y - 8 - arcH} ${x1},${y - 8}`;
  const dir = op === '+' ? 1 : -1;

  return (
    <div className="pane">
      <div className="nl-stage">
        <svg viewBox={`0 0 ${W} ${H}`} className="nl-svg">
          <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="#8394ba" strokeWidth="2.5" />
          <polygon points={`${W - padX + 2},${y} ${W - padX - 10},${y - 6} ${W - padX - 10},${y + 6}`} fill="#8394ba" />
          <polygon points={`${padX - 2},${y} ${padX + 10},${y - 6} ${padX + 10},${y + 6}`} fill="#8394ba" />
          {ticks}
          <path d={arc} fill="none" stroke={dir > 0 ? '#36d399' : '#fb7185'} strokeWidth="3.2" strokeDasharray="2 6" strokeLinecap="round" />
          <text x={mx} y={y - 12 - arcH} textAnchor="middle" className="nl-op">{op}{fa(amount)}</text>
          <circle cx={x0} cy={y} r="7" fill="#45b7ff" stroke="#0b1020" strokeWidth="1.5" />
          <circle cx={x1} cy={y} r="8" fill={dir > 0 ? '#36d399' : '#fb7185'} stroke="#0b1020" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="nl-equation">
        {fa(start)} <b>{op}</b> {fa(amount)} <b>=</b> <span className="nl-result">{fa(result)}</span>
        {(result < min || result > max) && <em className="nl-warn"> (خارج از محدوده)</em>}
      </div>
      <div className="pane-controls glass">
        <div className="stepper"><span className="stepper-label">شروع</span><button onClick={() => setStart(Math.max(min, start - 1))}>−</button><b>{fa(start)}</b><button onClick={() => setStart(Math.min(max, start + 1))}>+</button></div>
        <div className="op-toggle">
          <button className={op === '+' ? 'on' : ''} onClick={() => setOp('+')}>+ جمع</button>
          <button className={op === '-' ? 'on' : ''} onClick={() => setOp('-')}>− تفریق</button>
        </div>
        <div className="stepper"><span className="stepper-label">مقدار</span><button onClick={() => setAmount(Math.max(0, amount - 1))}>−</button><b>{fa(amount)}</b><button onClick={() => setAmount(Math.min(20, amount + 1))}>+</button></div>
        <div className="op-toggle">
          <button onClick={() => { setMin(-10); setMax(10); }} className={min === -10 ? 'on' : ''}>۱۰− تا ۱۰</button>
          <button onClick={() => { setMin(0); setMax(20); }} className={min === 0 ? 'on' : ''}>۰ تا ۲۰</button>
        </div>
      </div>
    </div>
  );
}
