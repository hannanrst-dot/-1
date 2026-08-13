import { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { analyzeHands, drawHandSkeleton } from '../lib/gesture';
import { fa, gcd } from '../lib/format';

const MP_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const MP_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

function Pie({ num, den, color, innerRef }) {
  const R = 46, C = 50, slices = [];
  for (let i = 0; i < den; i++) {
    const a0 = (i / den) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / den) * 2 * Math.PI - Math.PI / 2;
    const x0 = C + R * Math.cos(a0), y0 = C + R * Math.sin(a0), x1 = C + R * Math.cos(a1), y1 = C + R * Math.sin(a1);
    slices.push(<path key={i} d={`M${C},${C} L${x0},${y0} A${R},${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1} Z`}
      fill={i < num ? color : 'rgba(255,255,255,.10)'} stroke="#0b1020" strokeWidth="1" />);
  }
  return <svg ref={innerRef} viewBox="0 0 100 100" className="fr-pie">{slices}</svg>;
}

export default function Fractions({ onBack }) {
  const videoRef = useRef(null), handsCanvasRef = useRef(null), cursorRef = useRef(null), pieRef = useRef(null);
  const handDataRef = useRef([]), swipeRef = useRef({ lastX: null, t: 0 });
  const [front, setFront] = useState(true), [hand, setHand] = useState(true);
  const [num, setNum] = useState(1), [den, setDen] = useState(2);
  const numRef = useRef(1), denRef = useRef(2);
  useEffect(() => { numRef.current = num; }, [num]);
  useEffect(() => { denRef.current = den; }, [den]);

  const g = gcd(num, den), dec = den ? num / den : 0;

  // Camera + hand tracking (only when hand control is on).
  useEffect(() => {
    if (!hand) return;
    let stream, cancelled = false;
    (async () => {
      try {
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) return;
        try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: front ? 'user' : 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }); }
        catch { stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); }
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = stream; try { await videoRef.current.play(); } catch { /* autoplay */ }
      } catch { /* touch still works */ }
    })();
    return () => { cancelled = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, [front, hand]);

  useEffect(() => {
    if (!hand) return;
    let active = true, raf, landmarker, lastT = -1;
    const build = async (d) => { const vision = await FilesetResolver.forVisionTasks(MP_WASM); return HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MP_MODEL, delegate: d }, numHands: 1, runningMode: 'VIDEO', minHandDetectionConfidence: .6, minHandPresenceConfidence: .6, minTrackingConfidence: .6 }); };
    const toScreen = (nx, ny, v) => { const vw = innerWidth, vh = innerHeight, VW = v.videoWidth, VH = v.videoHeight, s = Math.max(vw / VW, vh / VH); return { x: (vw - VW * s) / 2 + nx * VW * s, y: (vh - VH * s) / 2 + ny * VH * s }; };
    (async () => {
      try { try { landmarker = await build('GPU'); } catch { landmarker = await build('CPU'); } } catch { return; }
      const loop = () => {
        if (!active) return;
        const v = videoRef.current, canvas = handsCanvasRef.current, cursor = cursorRef.current;
        if (landmarker && v && v.readyState >= 2 && v.videoWidth && v.currentTime !== lastT) {
          lastT = v.currentTime;
          let res; try { res = landmarker.detectForVideo(v, performance.now()); } catch { /* transient */ }
          const shim = { multiHandLandmarks: res?.landmarks || [], multiHandedness: (res?.handednesses || res?.handedness || []).map((h) => ({ label: h?.[0]?.categoryName || 'Hand' })) };
          const hands = analyzeHands(shim, front); handDataRef.current = hands;
          if (canvas) drawHandSkeleton(canvas, hands, v.videoWidth, v.videoHeight);
          const h0 = hands[0], now = performance.now();
          if (h0 && cursor) {
            const p = toScreen(h0.pinchPoint.x, h0.pinchPoint.y, v);
            cursor.style.opacity = '1';
            cursor.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%,-50%) scale(${h0.pinch ? 0.7 : 1})`;
            cursor.classList.toggle('pinch', h0.pinch);
            if (h0.pinch && pieRef.current) {
              // Pinch-sweep: fill slices up to the finger's angle around the pie.
              const r = pieRef.current.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
              const dx = p.x - cx, dy = p.y - cy;
              if (Math.hypot(dx, dy) < r.width * 0.8) {
                let ang = Math.atan2(dx, -dy); if (ang < 0) ang += 2 * Math.PI;
                const n = Math.round((ang / (2 * Math.PI)) * denRef.current);
                setNum(Math.max(0, Math.min(denRef.current, n)));
              }
              swipeRef.current.lastX = null;
            } else {
              // Open hand flick left/right changes the denominator.
              const s = swipeRef.current;
              if (s.lastX != null && now - s.t > 650) {
                const vx = h0.center.x - s.lastX;
                if (Math.abs(vx) > 0.06) { s.t = now; setDen((d) => { const nd = Math.max(2, Math.min(12, d + (vx > 0 ? 1 : -1))); setNum((n) => Math.min(n, nd)); return nd; }); }
              }
              s.lastX = h0.center.x;
            }
          } else if (cursor) { cursor.style.opacity = '0'; swipeRef.current.lastX = null; }
        }
        raf = requestAnimationFrame(loop);
      };
      loop();
    })();
    return () => { active = false; cancelAnimationFrame(raf); landmarker?.close?.(); };
  }, [front, hand]);

  return <main className="ar-app fr-app">
    {hand && <>
      <video ref={videoRef} className={`camera ${front ? 'selfie' : ''}`} playsInline muted />
      <canvas ref={handsCanvasRef} className="hands-layer" />
      <div ref={cursorRef} className="hand-cursor" />
    </>}
    <button className="glass icon-button home-btn" onClick={onBack} title="منوی درس‌ها">🏠</button>
    <header className="top-controls">
      <button className={`glass icon-button ${hand ? 'active' : ''}`} onClick={() => setHand((v) => !v)} title="کنترل با دست">{hand ? '🖐' : '✋'}</button>
      {hand && <button className="glass icon-button" onClick={() => setFront((v) => !v)} title="تغییر دوربین">🔄</button>}
    </header>

    <div className="fr-stage">
      <div className="fr-pie-wrap"><Pie num={num} den={den} color="#45b7ff" innerRef={pieRef} /></div>
      <div className="fr-readout glass">
        <div className="fr-frac"><span>{fa(num)}</span><i /><span>{fa(den)}</span></div>
        <div className="fr-extra">
          <span>{fa(Math.round(dec * 100) / 100)}</span>
          <span>{fa(Math.round(dec * 100))}٪</span>
          {g > 1 && <span>= {fa(num / g)}/{fa(den / g)}</span>}
        </div>
      </div>
      <div className="fr-bar">{Array.from({ length: den }, (_, i) => <div key={i} className="fr-cell" style={{ background: i < num ? '#45b7ff' : 'rgba(255,255,255,.10)' }} />)}</div>
    </div>

    <div className="fr-controls glass">
      <div className="stepper"><span className="stepper-label">صورت</span><button onClick={() => setNum(Math.max(0, num - 1))}>−</button><b>{fa(num)}</b><button onClick={() => setNum(Math.min(den, num + 1))}>+</button></div>
      <div className="stepper"><span className="stepper-label">مخرج</span><button onClick={() => setDen(Math.max(2, den - 1))}>−</button><b>{fa(den)}</b><button onClick={() => { setDen(Math.min(12, den + 1)); }}>+</button></div>
    </div>

    {hand && <div className="net-help glass fr-help">✋ نیشگون بگیرید و دور دایره بچرخانید تا پر شود • تکان دست چپ/راست: تغییر مخرج</div>}
  </main>;
}
