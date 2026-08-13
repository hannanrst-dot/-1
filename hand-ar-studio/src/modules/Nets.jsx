import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { analyzeHands, drawHandSkeleton } from '../lib/gesture';
import { NET_SHAPES } from '../lib/nets';

const MP_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const MP_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

// The Nets lesson: each solid is shown as its flat net and folds up into the 3D
// solid. Pinch and drag up/down to fold/unfold; swipe your hand left/right to
// switch solids; pinch-drag sideways to spin. Touch controls mirror all of it.
export default function Nets({ onBack }) {
  const videoRef = useRef(null), hostRef = useRef(null), handsCanvasRef = useRef(null);
  const sceneRef = useRef(), cameraRef = useRef(), rendererRef = useRef(), groupRef = useRef();
  const builderRef = useRef(), foldRef = useRef(0), foldTargetRef = useRef(0), rotRef = useRef(0), scaleRef = useRef(0.85);
  const handDataRef = useRef([]), gripRef = useRef(null), swipeRef = useRef({ lastX: null, t: 0 });
  const [front, setFront] = useState(true);
  const [index, setIndex] = useState(0);
  const [foldUI, setFoldUI] = useState(0);
  const indexRef = useRef(0);

  const shape = NET_SHAPES[index];

  // Build/replace the current net whenever the shape changes.
  const loadShape = (i) => {
    const scene = sceneRef.current; if (!scene) return;
    if (builderRef.current) { scene.remove(groupRef.current); builderRef.current.dispose(); }
    const b = NET_SHAPES[i].build();
    builderRef.current = b; groupRef.current = b.group; scene.add(b.group);
    b.setFold(foldRef.current);
  };

  // Three.js scene.
  useEffect(() => {
    const host = hostRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, .1, 100);
    camera.position.set(0, 0, 6.4);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); renderer.setSize(innerWidth, innerHeight);
    host.appendChild(renderer.domElement); sceneRef.current = scene; cameraRef.current = camera; rendererRef.current = renderer;
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.add(new THREE.HemisphereLight('#eaf4ff', '#1a2440', 1.7));
    const key = new THREE.DirectionalLight('#ffffff', 2.2); key.position.set(4, 6, 8); scene.add(key);
    loadShape(indexRef.current);
    const resize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
    addEventListener('resize', resize);
    let raf;
    const animate = () => {
      const g = groupRef.current;
      foldRef.current += (foldTargetRef.current - foldRef.current) * 0.16;
      builderRef.current?.setFold(foldRef.current);
      if (g) {
        if (gripRef.current?.kind === 'one') g.rotation.y = rotRef.current; else { rotRef.current += 0.004; g.rotation.y = rotRef.current; }
        g.rotation.x = -0.35;
        const s = g.scale.x + (scaleRef.current - g.scale.x) * 0.2;
        g.scale.setScalar(s);
      }
      renderer.render(scene, camera); raf = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); builderRef.current?.dispose(); pmrem.dispose(); renderer.dispose(); host.removeChild(renderer.domElement); };
  }, []);

  useEffect(() => { indexRef.current = index; loadShape(index); }, [index]);

  // Camera.
  useEffect(() => {
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
  }, [front]);

  // Hand tracking.
  useEffect(() => {
    let active = true, raf, landmarker, lastT = -1;
    const build = async (d) => { const vision = await FilesetResolver.forVisionTasks(MP_WASM); return HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MP_MODEL, delegate: d }, numHands: 2, runningMode: 'VIDEO', minHandDetectionConfidence: .6, minHandPresenceConfidence: .6, minTrackingConfidence: .6 }); };
    (async () => {
      try { try { landmarker = await build('GPU'); } catch { landmarker = await build('CPU'); } } catch { return; }
      const loop = () => {
        if (!active) return;
        const v = videoRef.current, canvas = handsCanvasRef.current;
        if (landmarker && v && v.readyState >= 2 && v.videoWidth && v.currentTime !== lastT) {
          lastT = v.currentTime;
          let res; try { res = landmarker.detectForVideo(v, performance.now()); } catch { /* transient */ }
          const shim = { multiHandLandmarks: res?.landmarks || [], multiHandedness: (res?.handednesses || res?.handedness || []).map((h) => ({ label: h?.[0]?.categoryName || 'Hand' })) };
          const hands = analyzeHands(shim, front); handDataRef.current = hands;
          if (canvas) drawHandSkeleton(canvas, hands, v.videoWidth, v.videoHeight);
        }
        raf = requestAnimationFrame(loop);
      };
      loop();
    })();
    return () => { active = false; cancelAnimationFrame(raf); landmarker?.close?.(); };
  }, [front]);

  // Gesture loop: pinch-drag folds/rotates; an open-hand horizontal flick switches solids.
  useEffect(() => {
    let raf;
    const setFoldBoth = (t) => { foldTargetRef.current = t; setFoldUI(Math.round(t * 100)); };
    const tick = () => {
      const hands = handDataRef.current;
      const pinching = hands.filter((h) => h.pinch);
      const now = performance.now();
      if (pinching.length >= 2) {
        // Two-hand pinch: zoom the model by the distance between the hands.
        const [a, b] = pinching;
        const dist = Math.hypot(a.pinchPoint.x - b.pinchPoint.x, a.pinchPoint.y - b.pinchPoint.y);
        const g = gripRef.current;
        if (!g || g.kind !== 'scale') gripRef.current = { kind: 'scale', dist, scale: scaleRef.current };
        else scaleRef.current = Math.max(0.35, Math.min(2.6, g.scale * dist / Math.max(g.dist, 0.03)));
        swipeRef.current.lastX = null;
      } else if (pinching.length === 1) {
        const hand = pinching[0];
        const g = gripRef.current;
        if (!g || g.kind !== 'one') gripRef.current = { kind: 'one', y: hand.center.y, x: hand.center.x, fold: foldTargetRef.current, rot: rotRef.current };
        else {
          setFoldBoth(Math.max(0, Math.min(1, g.fold + (g.y - hand.center.y) * 2.6)));
          rotRef.current = g.rot + (hand.center.x - g.x) * 3.2;
        }
        swipeRef.current.lastX = null;
      } else {
        gripRef.current = null;
        const hand = hands[0];
        if (hand) {
          const s = swipeRef.current;
          if (s.lastX != null && now - s.t > 750) {
            const vx = hand.center.x - s.lastX;
            if (Math.abs(vx) > 0.06) { s.t = now; setIndex((i) => (i + (vx > 0 ? 1 : NET_SHAPES.length - 1)) % NET_SHAPES.length); }
          }
          s.lastX = hand.center.x;
        } else swipeRef.current.lastX = null;
      }
      raf = requestAnimationFrame(tick);
    };
    tick(); return () => cancelAnimationFrame(raf);
  }, [front]);

  const changeShape = (dir) => setIndex((i) => (i + (dir > 0 ? 1 : NET_SHAPES.length - 1)) % NET_SHAPES.length);
  const setFoldSlider = (t) => { foldTargetRef.current = t; setFoldUI(Math.round(t * 100)); };

  return <main className="ar-app">
    <video ref={videoRef} className={`camera ${front ? 'selfie' : ''}`} playsInline muted />
    <div ref={hostRef} className="three-layer" /><canvas ref={handsCanvasRef} className="hands-layer" />
    <button className="glass icon-button home-btn" onClick={onBack} title="منوی درس‌ها">🏠</button>
    <header className="top-controls">
      <button className="glass icon-button" onClick={() => setFront((v) => !v)} title="تغییر دوربین">🔄</button>
    </header>

    <div className="net-hud glass">
      <div className="net-hud-title">{shape.icon} گسترده‌ی {shape.label}</div>
      <div className="net-hud-sub">{foldUI === 0 ? 'گسترده (باز)' : foldUI === 100 ? 'جسم کامل' : `در حال تا شدن… ${foldUI}٪`}</div>
    </div>

    <div className="net-bottom">
      <div className="net-shape-nav glass">
        <button onClick={() => changeShape(-1)}>‹</button>
        <div className="net-shape-dots">{NET_SHAPES.map((s, i) => <span key={s.type} className={i === index ? 'on' : ''}>{s.icon}</span>)}</div>
        <button onClick={() => changeShape(1)}>›</button>
      </div>
      <div className="net-fold glass">
        <span>باز</span>
        <input type="range" min="0" max="1" step="0.01" value={foldUI / 100} onChange={(e) => setFoldSlider(Number(e.target.value))} />
        <span>جسم</span>
      </div>
    </div>

    <div className="net-help glass">✋ نیشگون + بالا/پایین: تا شدن • دو دست نیشگون: بزرگ/کوچک • تکان دست چپ/راست: تعویض شکل</div>
  </main>;
}
