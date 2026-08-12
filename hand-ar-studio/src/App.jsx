import { useState } from 'react';
import Solids3D from './modules/Solids3D';
import Nets from './modules/Nets';
import Fractions from './modules/Fractions';
import NumberLine from './modules/NumberLine';
import Multiplication from './modules/Multiplication';
import Symmetry from './modules/Symmetry';
import HandPointer from './components/HandPointer';

const MODULES = [
  { id: 'solids', icon: '🧊', title: 'اجسام سه‌بعدی', desc: 'چرخش با دست، برش، حجم و مساحت', tag: 'دوربین + دست' },
  { id: 'nets', icon: '📦', title: 'گسترده‌ی اجسام', desc: 'باز کردن اجسام به شکل تخت (نِت)', tag: 'هندسه' },
  { id: 'fractions', icon: '🍕', title: 'کسرها', desc: 'نمایش، مقایسه، معادل، اعشار و درصد', tag: 'کسر' },
  { id: 'numberline', icon: '🔢', title: 'خط اعداد', desc: 'جمع و تفریق با پرش، اعداد منفی', tag: 'عدد' },
  { id: 'multiply', icon: '✖️', title: 'ضرب و مساحت', desc: 'مدل آرایه‌ای و مدل مساحت', tag: 'ضرب' },
  { id: 'symmetry', icon: '🦋', title: 'تقارن', desc: 'نقاشی آینه‌ای و محور تقارن', tag: 'هندسه' },
];

function Home({ onPick }) {
  return (
    <div className="home">
      <header className="home-head">
        <h1>استودیوی ریاضی</h1>
        <p>یک درس را انتخاب کنید و با دست، جلوی دوربین، زنده تدریس کنید</p>
      </header>
      <div className="home-grid">
        {MODULES.map((m) => (
          <button key={m.id} className="home-card glass" onClick={() => onPick(m.id)}>
            <span className="home-card-icon">{m.icon}</span>
            <span className="home-card-title">{m.title}</span>
            <span className="home-card-desc">{m.desc}</span>
            <span className="home-card-tag">{m.tag}</span>
          </button>
        ))}
      </div>
      <footer className="home-foot">🖐 با نیشگون دست جلوی دوربین، دکمه‌ها را بزنید • لمس هم کار می‌کند</footer>
    </div>
  );
}

// Chrome for the 2D lessons: a header, plus the shared AR hand layer behind the
// lesson so the teacher can drive the buttons with a pinch in front of the camera.
function ModuleShell({ meta, onBack, handOn, setHandOn, front, setFront, children }) {
  return (
    <div className={`module ${handOn ? 'ar' : ''}`}>
      {handOn && <HandPointer front={front} />}
      <header className="module-head glass">
        <button className="module-back" onClick={onBack} title="بازگشت">‹ منو</button>
        <h2>{meta.icon} {meta.title}</h2>
        <div className="module-tools">
          <button className={`mini-btn ${handOn ? 'on' : ''}`} onClick={() => setHandOn((v) => !v)} title="کنترل با دست">{handOn ? '🖐' : '✋'}</button>
          {handOn && <button className="mini-btn" onClick={() => setFront((v) => !v)} title="تغییر دوربین">🔄</button>}
        </div>
      </header>
      <div className="module-body">{children}</div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState(null);
  const [handOn, setHandOn] = useState(true);
  const [front, setFront] = useState(true);
  const back = () => setMode(null);

  if (!mode) return <Home onPick={setMode} />;
  if (mode === 'solids') return <Solids3D onBack={back} />;
  const meta = MODULES.find((m) => m.id === mode);
  const Body = { nets: Nets, fractions: Fractions, numberline: NumberLine, multiply: Multiplication, symmetry: Symmetry }[mode];
  return (
    <ModuleShell meta={meta} onBack={back} handOn={handOn} setHandOn={setHandOn} front={front} setFront={setFront}>
      <Body />
    </ModuleShell>
  );
}
