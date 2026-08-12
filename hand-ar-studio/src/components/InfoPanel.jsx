// Teaching panel: shows the selected solid's name and its face/edge/vertex
// counts so the shape's geometry can be discussed with the class in real time.
export default function InfoPanel({ info }) {
  if (!info) return null;
  return (
    <section className="info-panel glass" aria-live="polite">
      <div className="info-title"><b>{info.icon}</b> {info.label}</div>
      <div className="info-stats">
        <div className="info-stat"><span className="info-num">{info.curved && info.faces <= 1 ? '—' : info.faces}</span><small>وجه</small></div>
        <div className="info-stat"><span className="info-num">{info.edges}</span><small>یال</small></div>
        <div className="info-stat"><span className="info-num">{info.vertices}</span><small>رأس</small></div>
      </div>
      <p className="info-note">{info.note}</p>
    </section>
  );
}
