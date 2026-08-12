import { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { analyzeHands, drawHandSkeleton } from '../lib/gesture';

const MP_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const MP_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

// Shared AR layer for the 2D lessons: shows the camera as a background, draws the
// hand skeleton, and turns the pinch point into a cursor. Pinching over a button
// clicks it; pinching over a [data-hand-draw] surface drives its mouse handlers.
// Touch input is never disabled, so everything still works without hands.
export default function HandPointer({ front }) {
  const videoRef = useRef(null), canvasRef = useRef(null), cursorRef = useRef(null);
  const st = useRef({ x: innerWidth / 2, y: innerHeight / 2, pinch: false, prev: false, pressBtn: null, hover: null, draw: null, seen: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    let stream, cancelled = false;
    (async () => {
      try {
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { setError('دوربین در دسترس نیست — با لمس ادامه دهید'); return; }
        try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: front ? 'user' : 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }); }
        catch { stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); }
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        const v = videoRef.current; v.srcObject = stream; try { await v.play(); } catch { /* autoplay */ }
      } catch { setError('دوربین باز نشد — با لمس ادامه دهید'); }
    })();
    return () => { cancelled = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, [front]);

  useEffect(() => {
    let active = true, raf, landmarker, lastT = -1;
    const build = async (d) => {
      const vision = await FilesetResolver.forVisionTasks(MP_WASM);
      return HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MP_MODEL, delegate: d }, numHands: 1, runningMode: 'VIDEO', minHandDetectionConfidence: .6, minHandPresenceConfidence: .6, minTrackingConfidence: .6 });
    };
    const toScreen = (nx, ny, v) => {
      const vw = innerWidth, vh = innerHeight, VW = v.videoWidth, VH = v.videoHeight;
      const scale = Math.max(vw / VW, vh / VH);
      return { x: (vw - VW * scale) / 2 + nx * VW * scale, y: (vh - VH * scale) / 2 + ny * VH * scale };
    };
    const dispatch = (el, type, x, y) => el.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true }));
    const setHover = (btn) => { const s = st.current; if (s.hover === btn) return; s.hover?.classList.remove('hand-hover'); btn?.classList.add('hand-hover'); s.hover = btn; };

    (async () => {
      try { try { landmarker = await build('GPU'); } catch { landmarker = await build('CPU'); } }
      catch { setError('ردیاب دست بارگذاری نشد — با لمس ادامه دهید'); return; }
      const loop = () => {
        if (!active) return;
        const v = videoRef.current, canvas = canvasRef.current, cursor = cursorRef.current;
        if (landmarker && v && v.readyState >= 2 && v.videoWidth && v.currentTime !== lastT) {
          lastT = v.currentTime;
          let res; try { res = landmarker.detectForVideo(v, performance.now()); } catch { /* transient */ }
          const shim = { multiHandLandmarks: res?.landmarks || [], multiHandedness: (res?.handednesses || res?.handedness || []).map((h) => ({ label: h?.[0]?.categoryName || 'Hand' })) };
          const hands = analyzeHands(shim, front);
          if (canvas) drawHandSkeleton(canvas, hands, v.videoWidth, v.videoHeight);
          const s = st.current, hand = hands[0];
          if (hand) {
            s.seen = 12;
            const p = toScreen(hand.pinchPoint.x, hand.pinchPoint.y, v);
            s.x += (p.x - s.x) * 0.45; s.y += (p.y - s.y) * 0.45;
            s.pinch = hand.pinch;
          } else { if (s.seen > 0) s.seen--; s.pinch = false; }

          if (cursor) {
            const on = s.seen > 0;
            cursor.style.opacity = on ? '1' : '0';
            cursor.style.transform = `translate(${s.x}px, ${s.y}px) translate(-50%, -50%) scale(${s.pinch ? 0.7 : 1})`;
            cursor.classList.toggle('pinch', s.pinch);
          }

          if (s.seen > 0) {
            const el = document.elementFromPoint(s.x, s.y);
            const btn = el?.closest?.('button:not(:disabled)') || null;
            const drawEl = el?.closest?.('[data-hand-draw]') || null;
            setHover(btn);
            const rising = s.pinch && !s.prev, falling = !s.pinch && s.prev;
            if (rising) {
              if (btn) { btn.classList.add('hand-press'); s.pressBtn = btn; }
              else if (drawEl) { s.draw = drawEl; dispatch(drawEl, 'mousedown', s.x, s.y); }
            }
            if (s.pinch && s.draw) dispatch(s.draw, 'mousemove', s.x, s.y);
            if (falling) {
              if (s.pressBtn) { s.pressBtn.classList.remove('hand-press'); if (s.pressBtn === btn) s.pressBtn.click(); s.pressBtn = null; }
              if (s.draw) { dispatch(s.draw, 'mouseup', s.x, s.y); s.draw = null; }
            }
            s.prev = s.pinch;
          } else { setHover(null); s.prev = false; }
        }
        raf = requestAnimationFrame(loop);
      };
      loop();
    })();
    return () => { active = false; cancelAnimationFrame(raf); landmarker?.close?.(); st.current.hover?.classList.remove('hand-hover'); };
  }, [front]);

  return <>
    <video ref={videoRef} className={`ar-bg-video ${front ? 'selfie' : ''}`} playsInline muted />
    <canvas ref={canvasRef} className="ar-bg-hands" />
    <div ref={cursorRef} className="hand-cursor" />
    {error && <div className="ar-hint">{error}</div>}
  </>;
}
