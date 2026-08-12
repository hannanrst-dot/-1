import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import Controls from './components/Controls';
import Tutorial from './components/Tutorial';
import InfoPanel from './components/InfoPanel';
import { analyzeHands, drawHandSkeleton } from './lib/gesture';
import { createShape, disposeShape, setShapeColor, shapeInfo } from './lib/shapes';

const COLORS = ['#45b7ff', '#f472b6', '#fbbf24', '#36d399', '#a78bfa', '#fb7185'];
// MediaPipe Tasks-Vision assets. The WASM runtime is loaded from a CDN pinned to
// the installed package version; the hand model comes from Google's model host.
// This modern API is bundler- and mobile-friendly, unlike the deprecated
// @mediapipe/hands package, which broke when bundled by Vite.
const MP_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const MP_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export default function App() {
  const videoRef = useRef(null), threeHostRef = useRef(null), handsCanvasRef = useRef(null);
  const sceneRef = useRef(), cameraRef = useRef(), rendererRef = useRef(), objectsRef = useRef([]);
  const handDataRef = useRef([]), selectedRef = useRef(null), gripRef = useRef(null), frameRef = useRef(), insideRef = useRef(false);
  const autoRotateRef = useRef(false);
  const [frontCamera, setFrontCamera] = useState(true);
  const [showHands, setShowHands] = useState(true), [wireframe, setWireframe] = useState(false), [opacity, setOpacity] = useState(.62);
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedId, setSelectedId] = useState(null), [selectedType, setSelectedType] = useState(null);
  const [inside, setInside] = useState(false), [started, setStarted] = useState(false);
  const [status, setStatus] = useState('در حال آماده‌سازی دوربین…'), [error, setError] = useState(''), [errorDetail, setErrorDetail] = useState('');
  const forceRender = useState(0)[1];

  const setSelected = useCallback((mesh) => {
    if (selectedRef.current && selectedRef.current !== mesh) selectedRef.current.material.emissive.set('#000000');
    selectedRef.current = mesh || null;
    if (mesh) mesh.material.emissive.set('#204c48');
    setSelectedId(mesh?.userData.id || null);
    setSelectedType(mesh?.userData.type || null);
  }, []);

  // Three.js overlay is deliberately transparent so the real camera remains visible beneath it.
  useEffect(() => {
    const host = threeHostRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, .1, 100);
    camera.position.set(0, 0, 8);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement); sceneRef.current = scene; cameraRef.current = camera; rendererRef.current = renderer;
    scene.add(new THREE.HemisphereLight('#d9efff', '#17203a', 2.1));
    const light = new THREE.DirectionalLight('#ffffff', 2.5); light.position.set(4, 7, 8); light.castShadow = true; scene.add(light);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: .23 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -2.5; ground.receiveShadow = true; scene.add(ground);
    const resize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
    addEventListener('resize', resize);
    const animate = () => {
      // While inspecting, the viewer moves into the selected mesh; normal mode returns to the AR camera position.
      const desired = insideRef.current && selectedRef.current ? selectedRef.current.position : new THREE.Vector3(0, 0, 8);
      camera.position.lerp(desired, .075);
      // Slow, deliberate spin of the selected shape so every face can be shown to the class.
      if (autoRotateRef.current && selectedRef.current) selectedRef.current.rotation.y += 0.012;
      renderer.render(scene, camera); frameRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(frameRef.current); removeEventListener('resize', resize); objectsRef.current.forEach(disposeShape); renderer.dispose(); host.removeChild(renderer.domElement); };
  }, []);

  useEffect(() => { insideRef.current = inside; }, [inside]);
  useEffect(() => { autoRotateRef.current = autoRotate; }, [autoRotate]);

  // Device orientation changes the look direction only in inspection mode. Permission may be requested on iOS.
  useEffect(() => {
    const orient = (event) => {
      if (!inside || event.alpha == null || !cameraRef.current) return;
      const camera = cameraRef.current;
      const euler = new THREE.Euler(THREE.MathUtils.degToRad(event.beta || 0), THREE.MathUtils.degToRad(event.gamma || 0), THREE.MathUtils.degToRad(-(event.alpha || 0)), 'YXZ');
      camera.quaternion.setFromEuler(euler);
    };
    addEventListener('deviceorientation', orient); return () => removeEventListener('deviceorientation', orient);
  }, [inside]);

  // Creates and owns the camera stream. Switching facingMode closes old tracks first.
  useEffect(() => {
    let stream, cancelled = false;
    async function startCamera() {
      setError(''); setErrorDetail(''); setStatus('در حال اتصال به دوربین…');
      // Camera access needs a secure context. localhost is treated as secure.
      if (!window.isSecureContext) {
        setError('برای دسترسی به دوربین باید صفحه با HTTPS باز شود (یا از localhost).');
        setErrorDetail(`آدرس فعلی: ${location.protocol}//${location.host}`);
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('این مرورگر از دسترسی به دوربین پشتیبانی نمی‌کند. اگر داخل مرورگرِ یک برنامهٔ دیگر (مثل اینستاگرام یا تلگرام) هستید، لینک را در مرورگر Chrome یا Safari باز کنید.');
        return;
      }
      const facing = frontCamera ? 'user' : 'environment';
      try {
        // Preferred resolution first; fall back to the simplest possible request
        // if the device can't satisfy the constraints (OverconstrainedError etc.).
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
        // The stream is already open here. play() can reject purely from autoplay
        // policy — that must NOT be reported as a camera failure, so it is swallowed.
        try { await video.play(); } catch { /* metadata still loads; playback resumes on its own */ }
        setStatus('دست خود را مقابل دوربین نگه دارید');
      } catch (e) {
        const name = e?.name || 'Error';
        const map = {
          NotAllowedError: 'اجازهٔ استفاده از دوربین داده نشد. روی آیکن قفل/دوربین کنار نوار آدرس بزنید و دسترسی را Allow کنید، سپس صفحه را تازه کنید.',
          SecurityError: 'اجازهٔ استفاده از دوربین داده نشد. روی آیکن قفل/دوربین کنار نوار آدرس بزنید و دسترسی را Allow کنید، سپس صفحه را تازه کنید.',
          NotReadableError: 'دوربین توسط برنامهٔ دیگری (مثل زوم، اسکایپ یا تبی دیگر) در حال استفاده است. آن برنامه‌ها را ببندید و دوباره تلاش کنید.',
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
        numHands: 2,
        runningMode: 'VIDEO',
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });
    };

    (async () => {
      try {
        // Prefer the GPU delegate; fall back to CPU on devices/browsers that
        // can't create a WebGL-backed landmarker.
        try { landmarker = await build('GPU'); }
        catch { landmarker = await build('CPU'); }
      } catch (e) {
        if (!active) return;
        setError('ردیاب دست بارگذاری نشد. اتصال اینترنت را بررسی کنید و از Chrome یا Safari جدید استفاده کنید.');
        setErrorDetail(`Landmarker: ${e?.name || 'Error'}${e?.message ? ' — ' + e.message : ''}`);
        return;
      }

      const loop = () => {
        if (!active) return;
        const video = videoRef.current;
        const canvas = handsCanvasRef.current;
        if (landmarker && video && video.readyState >= 2 && video.videoWidth) {
          // detectForVideo needs a strictly increasing timestamp and one call per frame.
          if (video.currentTime !== lastVideoTime) {
            lastVideoTime = video.currentTime;
            let result;
            try { result = landmarker.detectForVideo(video, performance.now()); } catch { /* transient frame errors */ }
            if (result) {
              // Adapt the Tasks-Vision shape to the legacy structure analyzeHands expects.
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
        }
        raf = requestAnimationFrame(loop);
      };
      loop();
    })();

    return () => { active = false; cancelAnimationFrame(raf); landmarker?.close?.(); };
  }, [frontCamera, showHands]);

  /** Maps a normalized camera point to the world plane at depth z (unproject a ray). */
  const worldAt = (point, z = 0) => {
    const camera = cameraRef.current; const rayPoint = new THREE.Vector3(point.x * 2 - 1, -(point.y * 2 - 1), .5).unproject(camera);
    const direction = rayPoint.sub(camera.position).normalize(); const distance = (z - camera.position.z) / direction.z;
    return camera.position.clone().add(direction.multiplyScalar(distance));
  };
  const nearestObject = (point) => {
    const camera = cameraRef.current; let best = null, score = .22;
    objectsRef.current.forEach((mesh) => { const p = mesh.position.clone().project(camera); const d = Math.hypot(p.x - (point.x * 2 - 1), p.y - (-(point.y * 2 - 1))); if (d < score) { score = d; best = mesh; } });
    return best;
  };

  // Gesture interaction is independent of MediaPipe and updates selected mesh targets smoothly every render frame.
  useEffect(() => {
    let raf;
    const interact = () => {
      const hands = handDataRef.current; const pinching = hands.filter((hand) => hand.pinch);
      const release = hands.some((hand) => hand.openPalm);
      if (release) gripRef.current = null;
      if (pinching.length >= 2 && selectedRef.current) {
        const [a, b] = pinching; const distance = Math.hypot(a.pinchPoint.x - b.pinchPoint.x, a.pinchPoint.y - b.pinchPoint.y);
        if (!gripRef.current || gripRef.current.kind !== 'scale') gripRef.current = { kind: 'scale', distance, scale: selectedRef.current.scale.x };
        const target = THREE.MathUtils.clamp(gripRef.current.scale * distance / Math.max(gripRef.current.distance, .03), .28, 4.3);
        selectedRef.current.scale.lerp(new THREE.Vector3(target, target, target), .2);
      } else if (pinching.length === 1 && !inside) {
        const hand = pinching[0]; let grip = gripRef.current;
        if (!grip || grip.kind !== 'move') {
          // Prefer whatever object sits under the pinch so a new pinch can grab a
          // different shape; fall back to the current selection for empty pinches.
          const target = nearestObject(hand.pinchPoint) || selectedRef.current;
          if (target) { setSelected(target); grip = gripRef.current = { kind: 'move', id: target.userData.id, z: target.position.z, palm: hand.palmSize, angle: hand.angle, rotation: target.rotation.clone() }; }
        }
        if (grip?.kind === 'move' && selectedRef.current?.userData.id === grip.id) {
          const mesh = selectedRef.current;
          // X/Y follow the pinch; depth follows how big the palm looks (closer hand → nearer shape).
          const target = worldAt(hand.pinchPoint, grip.z - (hand.palmSize - grip.palm) * 6);
          mesh.position.lerp(target, .18);
          // Wrist twist spins the shape around its vertical axis for inspection.
          const twist = hand.angle - grip.angle;
          mesh.rotation.y = grip.rotation.y + twist * 2.2;
        }
      } else if (!pinching.length) gripRef.current = null;
      raf = requestAnimationFrame(interact);
    }; interact(); return () => cancelAnimationFrame(raf);
  }, [inside, setSelected]);

  const spawn = (type) => {
    const mesh = createShape(type, crypto.randomUUID(), opacity); mesh.position.copy(worldAt({ x: .5, y: .5 }, 0));
    mesh.position.x += (objectsRef.current.length % 3 - 1) * 1.1;
    mesh.position.y += (Math.floor(objectsRef.current.length / 3) % 2) * 0.9;
    mesh.userData.edges.visible = wireframe;
    sceneRef.current.add(mesh); objectsRef.current.push(mesh); setSelected(mesh); forceRender((x) => x + 1);
  };
  const removeSelected = () => { const mesh = selectedRef.current; if (!mesh) return; sceneRef.current.remove(mesh); disposeShape(mesh); objectsRef.current = objectsRef.current.filter((item) => item !== mesh); setSelected(null); setInside(false); forceRender((x) => x + 1); };
  const clearAll = () => { objectsRef.current.forEach((mesh) => { sceneRef.current.remove(mesh); disposeShape(mesh); }); objectsRef.current = []; setSelected(null); setInside(false); gripRef.current = null; setStatus('همهٔ شکل‌ها پاک شد'); forceRender((x) => x + 1); };
  useEffect(() => { objectsRef.current.forEach((mesh) => { mesh.material.opacity = opacity; mesh.userData.opacity = opacity; }); }, [opacity]);
  useEffect(() => { objectsRef.current.forEach((mesh) => { mesh.userData.edges.visible = wireframe; }); }, [wireframe]);
  const cycleColor = () => { const mesh = selectedRef.current; if (!mesh) return; const i = (COLORS.indexOf(`#${mesh.material.color.getHexString()}`) + 1) % COLORS.length; setShapeColor(mesh, COLORS[i]); };
  const enterExit = async () => { if (!selectedRef.current && !inside) return; if (!inside && window.DeviceOrientationEvent?.requestPermission) { try { await window.DeviceOrientationEvent.requestPermission(); } catch { /* phone movement remains optional */ } } setInside((v) => !v); };
  const save = () => { localStorage.setItem('hand-ar-scene', JSON.stringify(objectsRef.current.map((m) => ({ type: m.userData.type, position: m.position.toArray(), rotation: m.rotation.toArray(), scale: m.scale.toArray(), color: `#${m.material.color.getHexString()}`, opacity: m.material.opacity })))); setStatus('صحنه ذخیره شد ✓'); };
  const load = () => { const saved = JSON.parse(localStorage.getItem('hand-ar-scene') || '[]'); objectsRef.current.forEach((m) => { sceneRef.current.remove(m); disposeShape(m); }); objectsRef.current = saved.map((d) => { const m = createShape(d.type, crypto.randomUUID(), d.opacity); m.position.fromArray(d.position); m.rotation.fromArray(d.rotation); m.scale.fromArray(d.scale); setShapeColor(m, d.color); m.userData.edges.visible = wireframe; sceneRef.current.add(m); return m; }); setSelected(null); setInside(false); setStatus(saved.length ? 'صحنه بازیابی شد ✓' : 'صحنهٔ ذخیره‌شده‌ای وجود ندارد'); forceRender((x) => x + 1); };
  const screenshot = () => { const canvas = document.createElement('canvas'); canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio; const c = canvas.getContext('2d'); if (frontCamera) { c.translate(canvas.width, 0); c.scale(-1, 1); } c.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height); if (frontCamera) c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(rendererRef.current.domElement, 0, 0, canvas.width, canvas.height); if (showHands) c.drawImage(handsCanvasRef.current, 0, 0, canvas.width, canvas.height); const a = document.createElement('a'); a.download = `hand-ar-${Date.now()}.png`; a.href = canvas.toDataURL('image/png'); a.click(); };

  return <main className="ar-app">
    <video ref={videoRef} className={`camera ${frontCamera ? 'selfie' : ''}`} playsInline muted />
    <div ref={threeHostRef} className="three-layer" /><canvas ref={handsCanvasRef} className="hands-layer" />
    <div className="status">{status}</div>
    <InfoPanel info={selectedType ? shapeInfo(selectedType) : null} />
    <Controls onSpawn={spawn} onCamera={() => setFrontCamera((v) => !v)} {...{ showHands, setShowHands, wireframe, setWireframe, opacity, setOpacity, inside, autoRotate, setAutoRotate }} canEnter={!!selectedId} hasSelection={!!selectedId} hasObjects={objectsRef.current.length > 0} onEnterExit={enterExit} onDelete={removeSelected} onClearAll={clearAll} onColor={cycleColor} onScreenshot={screenshot} onSave={save} onLoad={load} />
    {!started && <Tutorial onClose={() => setStarted(true)} />}
    {error && <div className="message-backdrop"><section className="message glass"><h2>دوربین آماده نشد</h2><p>{error}</p>{errorDetail && <p className="error-detail">{errorDetail}</p>}<button className="primary" onClick={() => location.reload()}>تلاش دوباره</button></section></div>}
  </main>;
}
