import { useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { analyzeHands, drawHandSkeleton } from './gesture';

const MP_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const MP_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

// Reusable Interaction Engine. Owns the camera + MediaPipe hand tracking and
// turns the pinch point into a smoothed screen-space pointer with pinch
// hysteresis, exposing lifecycle callbacks (down / move / up). Every ShapeLab
// tool shares this so the hand gestures are consistent. It writes the live
// pointer + a moving cursor DOM node; the caller does the hit-testing.
export function useInteraction({ enabled, front, videoRef, canvasRef, cursorRef, handlers }) {
  const cb = useRef(handlers); cb.current = handlers;
  const st = useRef({ x: innerWidth / 2, y: innerHeight / 2, down: false, present: 0 });

  // Camera.
  useEffect(() => {
    if (!enabled) return;
    let stream, cancelled = false;
    (async () => {
      try {
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) return;
        try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: front ? 'user' : 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }); }
        catch { stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); }
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = stream; try { await videoRef.current.play(); } catch { /* autoplay */ }
      } catch { /* pointer input still works */ }
    })();
    return () => { cancelled = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, [enabled, front]);

  // Tracking + pointer engine.
  useEffect(() => {
    if (!enabled) return;
    let active = true, raf, landmarker, lastT = -1;
    const build = async (d) => { const vision = await FilesetResolver.forVisionTasks(MP_WASM); return HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MP_MODEL, delegate: d }, numHands: 2, runningMode: 'VIDEO', minHandDetectionConfidence: .6, minHandPresenceConfidence: .6, minTrackingConfidence: .6 }); };
    const toScreen = (nx, ny, v) => { const vw = innerWidth, vh = innerHeight, VW = v.videoWidth, VH = v.videoHeight, s = Math.max(vw / VW, vh / VH); return { x: (vw - VW * s) / 2 + nx * VW * s, y: (vh - VH * s) / 2 + ny * VH * s }; };
    (async () => {
      try { try { landmarker = await build('GPU'); } catch { landmarker = await build('CPU'); } } catch { return; }
      const loop = () => {
        if (!active) return;
        const v = videoRef.current, canvas = canvasRef.current, cursor = cursorRef.current, s = st.current;
        if (landmarker && v && v.readyState >= 2 && v.videoWidth && v.currentTime !== lastT) {
          lastT = v.currentTime;
          let res; try { res = landmarker.detectForVideo(v, performance.now()); } catch { /* transient */ }
          const shim = { multiHandLandmarks: res?.landmarks || [], multiHandedness: (res?.handednesses || res?.handedness || []).map((h) => ({ label: h?.[0]?.categoryName || 'Hand' })) };
          const hands = analyzeHands(shim, front);
          if (canvas) drawHandSkeleton(canvas, hands, v.videoWidth, v.videoHeight);
          const h0 = hands[0];
          if (h0) {
            s.present = 10;
            const p = toScreen(h0.pinchPoint.x, h0.pinchPoint.y, v);
            // Smoothing so hand jitter doesn't shake the grabbed handle.
            s.x += (p.x - s.x) * 0.5; s.y += (p.y - s.y) * 0.5;
            // Pinch hysteresis: engage below 0.4, release above 0.55.
            const wasDown = s.down;
            if (!wasDown && h0.pinchStrength > 0.62) s.down = true;
            else if (wasDown && h0.pinchStrength < 0.4) s.down = false;
            if (s.down && !wasDown) cb.current?.onDown?.(s.x, s.y, hands);
            else if (s.down) cb.current?.onMove?.(s.x, s.y, hands);
            else if (!s.down && wasDown) cb.current?.onUp?.(s.x, s.y);
          } else { if (s.present > 0) s.present--; if (s.down) { s.down = false; cb.current?.onUp?.(s.x, s.y); } }
          if (cursor) {
            cursor.style.opacity = s.present > 0 ? '1' : '0';
            cursor.style.transform = `translate(${s.x}px,${s.y}px) translate(-50%,-50%) scale(${s.down ? 0.7 : 1})`;
            cursor.classList.toggle('pinch', s.down);
          }
        }
        raf = requestAnimationFrame(loop);
      };
      loop();
    })();
    return () => { active = false; cancelAnimationFrame(raf); landmarker?.close?.(); };
  }, [enabled, front]);

  return st;
}
