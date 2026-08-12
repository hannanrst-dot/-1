import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import Controls from './components/Controls';
import Tutorial from './components/Tutorial';
import InfoPanel from './components/InfoPanel';
import { analyzeHands, drawHandSkeleton } from './lib/gesture';
import { createShape, disposeShape, setShapeColor, setClip, shapeInfo } from './lib/shapes';

const COLORS = ['#45b7ff', '#f472b6', '#fbbf24', '#36d399', '#a78bfa', '#fb7185'];
// MediaPipe Tasks-Vision assets. Modern, bundler- and mobile-friendly API.
const MP_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const MP_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export default function App() {
  const videoRef = useRef(null), threeHostRef = useRef(null), handsCanvasRef = useRef(null);
  const sceneRef = useRef(), cameraRef = useRef(), rendererRef = useRef(), objectsRef = useRef([]);
  const handDataRef = useRef([]), selectedRef = useRef(null), gripRef = useRef(null), frameRef = useRef();
  const autoRotateRef = useRef(false), sectionRef = useRef(false), sectionPosRef = useRef(0.5), clipPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, -1, 0), 0));
  const [frontCamera, setFrontCamera] = useState(true);
  const [showHands, setShowHands] = useState(true), [wireframe, setWireframe] = useState(false), [opacity, setOpacity] = useState(.55);
  const [autoRotate, setAutoRotate] = useState(false), [section, setSection] = useState(false), [sectionPos, setSectionPos] = useState(0.5);
  const [selectedId, setSelectedId] = useState(null), [selectedType, setSelectedType] = useState(null), [selScale, setSelScale] = useState(1);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState('در حال آماده‌سازی دوربین…'), [error, setError] = useState(''), [errorDetail, setErrorDetail] = useState('');
  const forceRender = useState(0)[1];

  const setSelected = useCallback((mesh) => {
    if (selectedRef.current && selectedRef.current !== mesh) { selectedRef.current.material.emissive.set('#000000'); setClip(selectedRef.current, null); }
    selectedRef.current = mesh || null;
    if (mesh) mesh.material.emissive.set('#1b3a37');
    setSelectedId(mesh?.userData.id || null);
    setSelectedType(mesh?.userData.type || null);
    setSelScale(mesh ? +mesh.scale.x.toFixed(2) : 1);
  }, []);

  useEffect(() => { sectionRef.current = section; }, [section]);
  useEffect(() => { sectionPosRef.current = sectionPos; }, [sectionPos]);
  useEffect(() => { autoRotateRef.current = autoRotate; }, [autoRotate]);

  // Three.js overlay is transparent so the real camera stays visible beneath it.
  useEffect(() => {
    const host = threeHostRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, .1, 100);
    camera.position.set(0, 0, 8);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    host.appendChild(renderer.domElement); sceneRef.current = scene; cameraRef.current = camera; rendererRef.current = renderer;

    // A soft studio environment gives the glassy solids real highlights and depth.
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    scene.add(new THREE.HemisphereLight('#eaf4ff', '#1a2440', 1.6));
    const key = new THREE.DirectionalLight('#ffffff', 2.4); key.position.set(4, 7, 8); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.camera.near = 1; key.shadow.camera.far = 40; scene.add(key);
    const rim = new THREE.DirectionalLight('#8fd2ff', 1.1); rim.position.set(-6, 2, -4); scene.add(rim);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: .22 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -2.8; ground.receiveShadow = true; scene.add(ground);

    const resize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
    addEventListener('resize', resize);
    const box = new THREE.Box3();
    const animate = () => {
      const sel = selectedRef.current;
      if (autoRotateRef.current && sel) sel.rotation.y += 0.012;
      // Section plane: cut the selected solid horizontally at the slider height.
      if (sectionRef.current && sel) {
        box.setFromObject(sel);
        const cutY = box.min.y + (box.max.y - box.min.y) * sectionPosRef.current;
        clipPlaneRef.current.constant = cutY;
      }
      renderer.render(scene, camera); frameRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(frameRef.current); removeEventListener('resize', resize); objectsRef.current.forEach(disposeShape); pmrem.dispose(); renderer.dispose(); host.removeChild(renderer.domElement); };
  }, []);

  // Keep the info panel's live volume/area in sync with the current scale.
  useEffect(() => {
    const id = setInterval(() => {
      const s = selectedRef.current ? +selectedRef.current.scale.x.toFixed(2) : 1;
      setSelScale((prev) => (Math.abs(prev - s) > 0.02 ? s : prev));
    }, 180);
    return () => clearInterval(id);
  }, []);

  // Toggle the clipping plane on the selected mesh when section mode changes.
  useEffect(() => {
    const mesh = selectedRef.current; if (!mesh) return;
    setClip(mesh, section ? [clipPlaneRef.current] : null);
  }, [section, selectedId]);

  // Camera stream. Switching facingMode closes old tracks first.
  useEffect(() => {
    let stream, cancelled = false;
    async function startCamera() {
      setError(''); setErrorDetail(''); setStatus('در حال اتصال به دوربین…');
      if (!window.isSecureContext) {
        setError('برای دسترسی به دوربین باید صفحه با HTTPS باز شود (یا از localhost).');
        setErrorDetail(`آدرس فعلی: ${location.protocol}//${location.host}`);
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('این مرورگر از دسترسی به دوربین پشتیبانی نمی‌کند. اگر داخل مرورگرِ یک برنامهٔ دیگر (مثل اینستاگرام یا تلگرام) هستید، لینک را در Chrome یا Safari باز کنید.');
        return;
      }
      const facing = frontCamera ? 'user' : 'environment';
      try {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        } catch (inner) {
          if (['OverconstrainedError', 'NotFoundError', 'TypeError'].includes(inner.name)) {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          } else throw inner;
        }
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        const video = videoRef.current;
        video.srcObject = stream;
        // A rejected play() (autoplay policy) must NOT be treated as a camera failure.
        try { await video.play(); } catch { /* metadata still loads; playback resumes on its own */ }
        setStatus('یک شکل بسازید و با دستتان بچرخانید');
      } catch (e) {
        const name = e?.name || 'Error';
        const map = {
          NotAllowedError: 'اجازهٔ استفاده از دوربین داده نشد. روی آیکن قفل/دوربین کنار نوار آدرس بزنید و دسترسی را Allow کنید، سپس صفحه را تازه کنید.',
          SecurityError: 'اجازهٔ استفاده از دوربین داده نشد. روی آیکن قفل/دوربین کنار نوار آدرس بزنید و دسترسی را Allow کنید، سپس صفحه را تازه کنید.',
          NotReadableError: 'دوربین توسط برنامهٔ دیگری (مثل زوم یا تبی دیگر) در حال استفاده است. آن را ببندید و دوباره تلاش کنید.',
          TrackStartError: 'دوربین توسط برنامهٔ دیگری در حال استفاده است. آن را ببندید و دوباره تلاش کنید.',
          NotFoundError: 'دوربینی روی این دستگاه پیدا نشد.',
          OverconstrainedError: 'دوربین درخواست‌شده در دسترس نیست.',
        };
        setError(map[name] || 'دوربین باز نشد. لطفاً اتصال دوربین دستگاه و دسترسی مرورگر را بررسی کنید.');
        setErrorDetail(`کد خطا: ${name}${e?.message ? ' — ' + e.message : ''}`);
      }
    }
    startCamera(); return () => { cancelled = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, [frontCamera]);

  // MediaPipe Tasks-Vision runs on each new video frame; results are shaped to
  // match analyzeHands, then painted and passed into the interaction loop.
  useEffect(() => {
    let active = true, raf, landmarker, lastVideoTime = -1;
    const build = async (delegate) => {
      const vision = await FilesetResolver.forVisionTasks(MP_WASM);
      return HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MP_MODEL, delegate },
        numHands: 2, runningMode: 'VIDEO',
        minHandDetectionConfidence: 0.6, minHandPresenceConfidence: 0.6, minTrackingConfidence: 0.6,
      });
    };
    (async () => {
      try {
        try { landmarker = await build('GPU'); } catch { landmarker = await build('CPU'); }
      } catch (e) {
        if (!active) return;
        setError('ردیاب دست بارگذاری نشد. اتصال اینترنت را بررسی کنید و از Chrome یا Safari جدید استفاده کنید.');
        setErrorDetail(`Landmarker: ${e?.name || 'Error'}${e?.message ? ' — ' + e.message : ''}`);
        return;
      }
      const loop = () => {
        if (!active) return;
        const video = videoRef.current, canvas = handsCanvasRef.current;
        if (landmarker && video && video.readyState >= 2 && video.videoWidth && video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          let result;
          try { result = landmarker.detectForVideo(video, performance.now()); } catch { /* transient */ }
          if (result) {
            const shim = {
              multiHandLandmarks: result.landmarks || [],
              multiHandedness: (result.handednesses || result.handedness || []).map((h) => ({ label: h?.[0]?.categoryName || 'Hand' })),
            };
            const detected = analyzeHands(shim, frontCamera);
            handDataRef.current = detected;
            if (canvas) {
              if (showHands) drawHandSkeleton(canvas, detected, video.videoWidth, video.videoHeight);
              else canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            }
          }
        }
        raf = requestAnimationFrame(loop);
      };
      loop();
    })();
    return () => { active = false; cancelAnimationFrame(raf); landmarker?.close?.(); };
  }, [frontCamera, showHands]);

  /** Maps a normalized camera point to the world plane at depth z. */
  const worldAt = (point, z = 0) => {
    const camera = cameraRef.current; const rayPoint = new THREE.Vector3(point.x * 2 - 1, -(point.y * 2 - 1), .5).unproject(camera);
    const direction = rayPoint.sub(camera.position).normalize(); const distance = (z - camera.position.z) / direction.z;
    return camera.position.clone().add(direction.multiplyScalar(distance));
  };
  const nearestObject = (point) => {
    const camera = cameraRef.current; let best = null, score = .28;
    objectsRef.current.forEach((mesh) => { const p = mesh.position.clone().project(camera); const d = Math.hypot(p.x - (point.x * 2 - 1), p.y - (-(point.y * 2 - 1))); if (d < score) { score = d; best = mesh; } });
    return best;
  };

  // Gesture interaction. One hand = free trackball rotation; two hands = pinch to
  // scale plus move (like a phone's pinch-zoom). Runs every animation frame.
  useEffect(() => {
    let raf;
    const ROT = 3.4;
    const interact = () => {
      const hands = handDataRef.current;
      const pinching = hands.filter((hand) => hand.pinch);
      if (hands.some((hand) => hand.openPalm)) gripRef.current = null;

      if (pinching.length >= 2) {
        const [a, b] = pinching;
        const mid = { x: (a.pinchPoint.x + b.pinchPoint.x) / 2, y: (a.pinchPoint.y + b.pinchPoint.y) / 2 };
        const distance = Math.hypot(a.pinchPoint.x - b.pinchPoint.x, a.pinchPoint.y - b.pinchPoint.y);
        let grip = gripRef.current;
        if (!grip || grip.kind !== 'twohand') {
          const target = selectedRef.current || nearestObject(mid);
          if (target) { setSelected(target); grip = gripRef.current = { kind: 'twohand', id: target.userData.id, distance, scale: target.scale.x, pos: target.position.clone(), midWorld: worldAt(mid, target.position.z) }; }
        }
        const mesh = selectedRef.current;
        if (grip?.kind === 'twohand' && mesh?.userData.id === grip.id) {
          const s = THREE.MathUtils.clamp(grip.scale * distance / Math.max(grip.distance, .03), .3, 5.5);
          mesh.scale.lerp(new THREE.Vector3(s, s, s), .25);
          const now = worldAt(mid, mesh.position.z);
          mesh.position.x = grip.pos.x + (now.x - grip.midWorld.x);
          mesh.position.y = grip.pos.y + (now.y - grip.midWorld.y);
        }
      } else if (pinching.length === 1) {
        const hand = pinching[0]; let grip = gripRef.current;
        if (!grip || grip.kind !== 'rotate') {
          const target = nearestObject(hand.pinchPoint) || selectedRef.current;
          if (target) { setSelected(target); grip = gripRef.current = { kind: 'rotate', id: target.userData.id, px: hand.pinchPoint.x, py: hand.pinchPoint.y }; }
        }
        const mesh = selectedRef.current;
        if (grip?.kind === 'rotate' && mesh?.userData.id === grip.id) {
          const dx = hand.pinchPoint.x - grip.px, dy = hand.pinchPoint.y - grip.py;
          // World-axis (trackball) rotation so the solid turns freely in every direction.
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(dy * ROT, dx * ROT, 0, 'XYZ'));
          mesh.quaternion.premultiply(q);
          grip.px = hand.pinchPoint.x; grip.py = hand.pinchPoint.y;
        }
      } else gripRef.current = null;
      raf = requestAnimationFrame(interact);
    };
    interact(); return () => cancelAnimationFrame(raf);
  }, [setSelected]);

  const spawn = (type) => {
    const mesh = createShape(type, crypto.randomUUID(), opacity);
    mesh.position.copy(worldAt({ x: .5, y: .5 }, 0));
    mesh.position.x += (objectsRef.current.length % 3 - 1) * 1.4;
    mesh.position.y += (Math.floor(objectsRef.current.length / 3) % 2 ? 1 : -1) * 0.4;
    mesh.userData.edges.visible = wireframe;
    sceneRef.current.add(mesh); objectsRef.current.push(mesh); setSelected(mesh); forceRender((x) => x + 1);
  };
  const removeSelected = () => { const mesh = selectedRef.current; if (!mesh) return; sceneRef.current.remove(mesh); disposeShape(mesh); objectsRef.current = objectsRef.current.filter((item) => item !== mesh); setSelected(null); setSection(false); forceRender((x) => x + 1); };
  const clearAll = () => { objectsRef.current.forEach((mesh) => { sceneRef.current.remove(mesh); disposeShape(mesh); }); objectsRef.current = []; setSelected(null); setSection(false); gripRef.current = null; setStatus('همهٔ شکل‌ها پاک شد'); forceRender((x) => x + 1); };
  const resetTransform = () => { const mesh = selectedRef.current; if (!mesh) return; mesh.rotation.set(0, 0, 0); mesh.quaternion.set(0, 0, 0, 1); mesh.scale.set(1, 1, 1); setSelScale(1); };
  useEffect(() => { objectsRef.current.forEach((mesh) => { mesh.material.opacity = opacity; mesh.userData.opacity = opacity; }); }, [opacity]);
  useEffect(() => { objectsRef.current.forEach((mesh) => { mesh.userData.edges.visible = wireframe; }); }, [wireframe]);
  const cycleColor = () => { const mesh = selectedRef.current; if (!mesh) return; const i = (COLORS.indexOf(`#${mesh.material.color.getHexString()}`) + 1) % COLORS.length; setShapeColor(mesh, COLORS[i]); };
  const save = () => { localStorage.setItem('hand-ar-scene', JSON.stringify(objectsRef.current.map((m) => ({ type: m.userData.type, position: m.position.toArray(), quaternion: m.quaternion.toArray(), scale: m.scale.toArray(), color: `#${m.material.color.getHexString()}`, opacity: m.material.opacity })))); setStatus('صحنه ذخیره شد ✓'); };
  const load = () => { const saved = JSON.parse(localStorage.getItem('hand-ar-scene') || '[]'); objectsRef.current.forEach((m) => { sceneRef.current.remove(m); disposeShape(m); }); objectsRef.current = saved.map((d) => { const m = createShape(d.type, crypto.randomUUID(), d.opacity); m.position.fromArray(d.position); if (d.quaternion) m.quaternion.fromArray(d.quaternion); else if (d.rotation) m.rotation.fromArray(d.rotation); m.scale.fromArray(d.scale); setShapeColor(m, d.color); m.userData.edges.visible = wireframe; sceneRef.current.add(m); return m; }); setSelected(null); setSection(false); setStatus(saved.length ? 'صحنه بازیابی شد ✓' : 'صحنهٔ ذخیره‌شده‌ای وجود ندارد'); forceRender((x) => x + 1); };
  const screenshot = () => { const canvas = document.createElement('canvas'); canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio; const c = canvas.getContext('2d'); if (frontCamera) { c.translate(canvas.width, 0); c.scale(-1, 1); } c.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height); if (frontCamera) c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(rendererRef.current.domElement, 0, 0, canvas.width, canvas.height); if (showHands) c.drawImage(handsCanvasRef.current, 0, 0, canvas.width, canvas.height); const a = document.createElement('a'); a.download = `geometry-${Date.now()}.png`; a.href = canvas.toDataURL('image/png'); a.click(); };

  return <main className="ar-app">
    <video ref={videoRef} className={`camera ${frontCamera ? 'selfie' : ''}`} playsInline muted />
    <div ref={threeHostRef} className="three-layer" /><canvas ref={handsCanvasRef} className="hands-layer" />
    <div className="status">{status}</div>
    <InfoPanel info={selectedType ? shapeInfo(selectedType) : null} scale={selScale} />
    <Controls
      onSpawn={spawn} onCamera={() => setFrontCamera((v) => !v)}
      {...{ showHands, setShowHands, wireframe, setWireframe, opacity, setOpacity, autoRotate, setAutoRotate, section, setSection, sectionPos, setSectionPos }}
      hasSelection={!!selectedId} hasObjects={objectsRef.current.length > 0}
      onDelete={removeSelected} onClearAll={clearAll} onColor={cycleColor} onReset={resetTransform}
      onScreenshot={screenshot} onSave={save} onLoad={load} />
    {!started && <Tutorial onClose={() => setStarted(true)} />}
    {error && <div className="message-backdrop"><section className="message glass"><h2>دوربین آماده نشد</h2><p>{error}</p>{errorDetail && <p className="error-detail">{errorDetail}</p>}<button className="primary" onClick={() => location.reload()}>تلاش دوباره</button></section></div>}
  </main>;
}
