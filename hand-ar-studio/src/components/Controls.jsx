import { SHAPES } from '../lib/shapes';

export default function Controls({ onSpawn, onCamera, showHands, setShowHands, wireframe, setWireframe, opacity, setOpacity, autoRotate, setAutoRotate, section, setSection, sectionPos, setSectionPos, showInfo, setShowInfo, hasSelection, hasObjects, onDelete, onClearAll, onColor, onReset, onScreenshot, onSave, onLoad }) {
  return <>
    <header className="top-controls">
      <button className="glass icon-button" onClick={onCamera} title="تغییر دوربین">🔄</button>
      <button className={`glass icon-button ${showHands ? 'active' : ''}`} onClick={() => setShowHands(!showHands)} title="نمایش دست‌ها">🖐</button>
      <button className={`glass icon-button ${showInfo ? 'active' : ''}`} onClick={() => setShowInfo(!showInfo)} disabled={!hasSelection} title="مشخصات شکل">ℹ️</button>
      <button className="glass icon-button" onClick={onScreenshot} title="عکس">📸</button>
    </header>
    <aside className="side-controls">
      <button className={`glass icon-button ${wireframe ? 'active' : ''}`} onClick={() => setWireframe(!wireframe)} title="نمایش یال‌ها">📐</button>
      <button className={`glass icon-button ${autoRotate ? 'active' : ''}`} onClick={() => setAutoRotate(!autoRotate)} disabled={!hasSelection} title="چرخش خودکار">💫</button>
      <button className={`glass icon-button enter ${section ? 'active' : ''}`} onClick={() => setSection(!section)} disabled={!hasSelection} title="برش مقطعی">🔪</button>
      <button className="glass icon-button" onClick={onColor} disabled={!hasSelection} title="تغییر رنگ">🎨</button>
      <button className="glass icon-button" onClick={onReset} disabled={!hasSelection} title="بازنشانی">♻️</button>
      <button className="glass icon-button" onClick={onDelete} disabled={!hasSelection} title="حذف شکل">❌</button>
    </aside>
    <section className="opacity-control glass">
      {section && <div className="section-row">
        <input aria-label="محل برش" type="range" min="0" max="1" step="0.02" value={sectionPos} onChange={(e) => setSectionPos(Number(e.target.value))} />
      </div>}
      <input aria-label="شفافیت" type="range" min="0.15" max="0.95" step="0.05" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
    </section>
    <nav className="shape-toolbar glass" aria-label="انتخاب شکل">
      {SHAPES.map((shape) => <button key={shape.type} className="shape-button" onClick={() => onSpawn(shape.type)} title={shape.label}><b>{shape.icon}</b><small>{shape.label}</small></button>)}
      <span className="toolbar-divider" />
      <button className="shape-button" onClick={onSave} title="ذخیرهٔ صحنه"><b>💾</b></button>
      <button className="shape-button" onClick={onLoad} title="بازیابی صحنه"><b>↩️</b></button>
      <button className="shape-button" onClick={onClearAll} disabled={!hasObjects} title="پاک کردن همه"><b>🗑️</b></button>
    </nav>
  </>;
}
