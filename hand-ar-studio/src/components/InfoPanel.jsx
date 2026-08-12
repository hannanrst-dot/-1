// Teaching panel: name, face/edge/vertex counts, live dimensions, and the
// surface-area and volume formulas with values that update as the shape scales.
export default function InfoPanel({ info, scale = 1 }) {
  if (!info) return null;
  const metrics = info.metrics(scale);
  return (
    <section className="info-panel glass" aria-live="polite">
      <div className="info-title"><b>{info.icon}</b> {info.label}</div>
      <div className="info-stats">
        <div className="info-stat"><span className="info-num">{info.curved && info.faces <= 1 ? '—' : fa(info.faces)}</span><small>وجه</small></div>
        <div className="info-stat"><span className="info-num">{fa(info.edges)}</span><small>یال</small></div>
        <div className="info-stat"><span className="info-num">{fa(info.vertices)}</span><small>رأس</small></div>
      </div>
      <div className="info-dims">📏 {info.dims(scale)} <span className="info-unit">{info.unit}</span></div>
      <div className="info-metrics">
        {metrics.map((m) => (
          <div className="info-metric" key={m.key}>
            <div className="info-metric-head"><span>{m.key}</span><span className="info-formula">{m.formula}</span></div>
            <div className="info-metric-val">{m.value} <span className="info-unit">{info.unit}<sup>{m.u}</sup></span></div>
          </div>
        ))}
      </div>
      <p className="info-note">{info.note}</p>
    </section>
  );
}

const fa = (n) => String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
