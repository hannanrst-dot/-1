const TIP_IDS = [4, 8, 12, 16, 20];
const CONNECTIONS = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
const d2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Converts MediaPipe's raw landmarks into stable, gesture-ready hand data.
 * Coordinates are normalized screen coordinates; x is mirrored for selfie
 * cameras so the data lines up with the horizontally-flipped video preview.
 */
export function analyzeHands(results, mirrored) {
  const frames = results.multiHandLandmarks || [];
  return frames.map((raw, index) => {
    if (!raw || raw.length < 21) return null;
    const points = raw.map((p) => ({ x: mirrored ? 1 - p.x : p.x, y: p.y, z: p.z }));
    const palm = Math.max(d2(points[0], points[9]), .04);
    const pinchDistance = d2(points[4], points[8]) / palm;
    // A finger counts as extended when its tip is clearly farther from the
    // wrist than its middle joint — robust to hand size and distance.
    const fingersExtended = TIP_IDS.slice(1).filter((tip) => d2(points[tip], points[0]) > d2(points[tip - 2], points[0]) * 1.14).length;
    return {
      landmarks: points,
      handedness: results.multiHandedness?.[index]?.label || 'Hand',
      pinch: pinchDistance < .45,
      pinchStrength: Math.max(0, Math.min(1, (0.7 - pinchDistance) / 0.55)),
      openPalm: fingersExtended >= 4 && pinchDistance > .7,
      pinchPoint: { x: (points[4].x + points[8].x) / 2, y: (points[4].y + points[8].y) / 2 },
      center: { x: points[9].x, y: points[9].y },
      palmSize: palm,
      angle: Math.atan2(points[5].y - points[17].y, points[5].x - points[17].x),
    };
  }).filter(Boolean);
}

/** Paint landmark skeleton without creating additional DOM nodes every frame. */
export function drawHandSkeleton(canvas, hands, videoWidth, videoHeight) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth * devicePixelRatio;
  const h = canvas.height = canvas.clientHeight * devicePixelRatio;
  ctx.clearRect(0, 0, w, h);
  if (!videoWidth || !videoHeight) return;
  // Match the CSS `object-fit: cover` mapping the video element uses.
  const scale = Math.max(w / videoWidth, h / videoHeight);
  const ox = (w - videoWidth * scale) / 2;
  const oy = (h - videoHeight * scale) / 2;
  const point = (p) => [ox + p.x * videoWidth * scale, oy + p.y * videoHeight * scale];
  hands.forEach((hand) => {
    ctx.strokeStyle = hand.pinch ? '#facc15' : '#4df6b0'; ctx.lineWidth = 3 * devicePixelRatio;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    CONNECTIONS.forEach(([a, b]) => { const p = point(hand.landmarks[a]), q = point(hand.landmarks[b]); ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.stroke(); });
    hand.landmarks.forEach((landmark, i) => { const [x, y] = point(landmark); ctx.beginPath(); ctx.arc(x, y, (i === 4 || i === 8 ? 6 : 3.5) * devicePixelRatio, 0, Math.PI * 2); ctx.fillStyle = i === 4 || i === 8 ? '#facc15' : '#ffffff'; ctx.fill(); });
  });
}

export { CONNECTIONS };
