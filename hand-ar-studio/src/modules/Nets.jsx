import { useState } from 'react';
import { fa } from '../lib/format';

// Nets (گسترده): the flat, unfolded form of each solid — a core topic. Each net
// is drawn schematically with its faces labelled so students see how many faces
// there are and which shapes they are.
const FILL = 'rgba(69,183,255,.22)', STROKE = '#8fd2ff';
const face = (props) => ({ fill: FILL, stroke: STROKE, strokeWidth: 2, strokeLinejoin: 'round', ...props });

function CubeNet() {
  const u = 62, rects = [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]];
  return (
    <svg viewBox="0 0 260 200" className="net-svg">
      {rects.map(([c, r], i) => <rect key={i} x={c * u + 4} y={r * u + 4} width={u - 4} height={u - 4} {...face()} />)}
    </svg>
  );
}

function CuboidNet() {
  const h = 54, w = 44, l = 76, x0 = 18, y0 = 20;
  // middle band of four side faces (w,l,w,l), plus top & bottom l×w faces.
  const bands = [['w', w], ['l', l], ['w', w], ['l', l]];
  let x = x0; const els = [];
  bands.forEach(([, bw], i) => { els.push(<rect key={i} x={x} y={y0 + w} width={bw} height={h} {...face()} />); x += bw; });
  els.push(<rect key="t" x={x0 + w} y={y0} width={l} height={w} {...face({ fill: 'rgba(54,211,153,.22)', stroke: '#7ff0c0' })} />);
  els.push(<rect key="b" x={x0 + w} y={y0 + w + h} width={l} height={w} {...face({ fill: 'rgba(54,211,153,.22)', stroke: '#7ff0c0' })} />);
  return <svg viewBox="0 0 260 200" className="net-svg">{els}</svg>;
}

function PyramidNet() {
  const cx = 130, cy = 108, s = 52; const x = cx - s / 2, y = cy - s / 2;
  const t = 62; // triangle height
  return (
    <svg viewBox="0 0 260 216" className="net-svg">
      <rect x={x} y={y} width={s} height={s} {...face({ fill: 'rgba(54,211,153,.22)', stroke: '#7ff0c0' })} />
      <polygon points={`${x},${y} ${x + s},${y} ${cx},${y - t}`} {...face()} />
      <polygon points={`${x},${y + s} ${x + s},${y + s} ${cx},${y + s + t}`} {...face()} />
      <polygon points={`${x},${y} ${x},${y + s} ${x - t},${cy}`} {...face()} />
      <polygon points={`${x + s},${y} ${x + s},${y + s} ${x + s + t},${cy}`} {...face()} />
    </svg>
  );
}

function CylinderNet() {
  return (
    <svg viewBox="0 0 260 230" className="net-svg">
      <circle cx={130} cy={38} r={30} {...face({ fill: 'rgba(54,211,153,.22)', stroke: '#7ff0c0' })} />
      <rect x={42} y={70} width={176} height={82} {...face()} />
      <circle cx={130} cy={192} r={30} {...face({ fill: 'rgba(54,211,153,.22)', stroke: '#7ff0c0' })} />
      <text x={130} y={116} textAnchor="middle" className="net-label">۲πr</text>
    </svg>
  );
}

function ConeNet() {
  const cx = 130, cy = 40, R = 96;
  const a0 = Math.PI * 0.15, a1 = Math.PI * 0.85; // a wide sector
  const p0 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)];
  const p1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)];
  return (
    <svg viewBox="0 0 260 230" className="net-svg">
      <path d={`M${cx},${cy} L${p0[0]},${p0[1]} A${R},${R} 0 0 0 ${p1[0]},${p1[1]} Z`} {...face()} />
      <circle cx={130} cy={186} r={34} {...face({ fill: 'rgba(54,211,153,.22)', stroke: '#7ff0c0' })} />
    </svg>
  );
}

const NETS = [
  { type: 'cube', icon: '🧊', label: 'مکعب', net: CubeNet, note: '۶ مربع برابر' },
  { type: 'cuboid', icon: '🧱', label: 'مکعب مستطیل', net: CuboidNet, note: '۶ مستطیل (۳ جفت برابر)' },
  { type: 'pyramid', icon: '🔺', label: 'هرم', net: PyramidNet, note: '۱ مربع (قاعده) + ۴ مثلث' },
  { type: 'cylinder', icon: '🥫', label: 'استوانه', net: CylinderNet, note: '۱ مستطیل + ۲ دایره' },
  { type: 'cone', icon: '🔻', label: 'مخروط', net: ConeNet, note: '۱ قطاع دایره + ۱ دایره' },
];

export default function Nets() {
  const [type, setType] = useState('cube');
  const cur = NETS.find((n) => n.type === type);
  const Net = cur.net;
  return (
    <div className="pane">
      <div className="net-stage">
        <Net />
        <div className="net-note glass">وقتی <b>{cur.label}</b> را باز کنیم، به این شکل تخت می‌رسیم: <b>{cur.note}</b></div>
      </div>
      <div className="pane-controls glass">
        <div className="net-picker">
          {NETS.map((n) => (
            <button key={n.type} className={`net-tab ${type === n.type ? 'on' : ''}`} onClick={() => setType(n.type)}>
              <b>{n.icon}</b><small>{fa(n.label)}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
