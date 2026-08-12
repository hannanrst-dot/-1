import * as THREE from 'three';

// Geometry base sizes used by three.js (in scene units).
const R = { cube: 1.65, cuboidX: 2.25, cuboidY: 1.2, cuboidZ: 1.45, pyR: 1.25, pyH: 2, sphR: 1.15, cylR: 0.95, cylH: 1.95, coneR: 1.05, coneH: 2 };

// Each shape carries its teaching facts. `nominal` holds classroom-friendly
// dimensions (round numbers) used only for the labels/formulas, decoupled from
// the render geometry. `metrics(scale)` returns live volume/area for the panel.
export const SHAPES = [
  {
    type: 'cube', label: 'مکعب', icon: '🧊', color: '#45b7ff', curved: false,
    faces: 6, edges: 12, vertices: 8, note: 'شش وجه مربعی برابر',
    nominal: { a: 4 }, unit: 'واحد',
    dims: (s) => `ضلع = ${r(4 * s)}`,
    metrics: (s) => { const a = 4 * s; return [
      { key: 'مساحت', formula: '۶ × a²', value: r(6 * a * a), u: '۲' },
      { key: 'حجم', formula: 'a³', value: r(a ** 3), u: '۳' },
    ]; },
  },
  {
    type: 'cuboid', label: 'مکعب مستطیل', icon: '🧱', color: '#a78bfa', curved: false,
    faces: 6, edges: 12, vertices: 8, note: 'وجه‌ها مستطیل هستند',
    nominal: { l: 6, w: 3, h: 4 }, unit: 'واحد',
    dims: (s) => `${r(6 * s)} × ${r(3 * s)} × ${r(4 * s)}`,
    metrics: (s) => { const l = 6 * s, w = 3 * s, h = 4 * s; return [
      { key: 'مساحت', formula: '۲(lw+lh+wh)', value: r(2 * (l * w + l * h + w * h)), u: '۲' },
      { key: 'حجم', formula: 'l × w × h', value: r(l * w * h), u: '۳' },
    ]; },
  },
  {
    type: 'pyramid', label: 'هرم', icon: '🔺', color: '#ff8a65', curved: false,
    faces: 5, edges: 8, vertices: 5, note: 'هرم با قاعدهٔ مربع',
    nominal: { base: 4, height: 6 }, unit: 'واحد',
    dims: (s) => `قاعده ${r(4 * s)} • ارتفاع ${r(6 * s)}`,
    metrics: (s) => { const b = 4 * s, h = 6 * s, slant = Math.sqrt(h * h + (b / 2) ** 2); return [
      { key: 'مساحت', formula: 'قاعده + ۴ مثلث', value: r(b * b + 2 * b * slant), u: '۲' },
      { key: 'حجم', formula: '⅓ × قاعده × ارتفاع', value: r((b * b * h) / 3), u: '۳' },
    ]; },
  },
  {
    type: 'sphere', label: 'کره', icon: '🔵', color: '#36d399', curved: true,
    faces: 1, edges: 0, vertices: 0, note: 'یک سطح کاملاً منحنی',
    nominal: { r: 3 }, unit: 'واحد',
    dims: (s) => `شعاع = ${r(3 * s)}`,
    metrics: (s) => { const rad = 3 * s; return [
      { key: 'مساحت', formula: '۴ × π × r²', value: r(4 * Math.PI * rad * rad), u: '۲' },
      { key: 'حجم', formula: '⁴⁄₃ × π × r³', value: r((4 / 3) * Math.PI * rad ** 3), u: '۳' },
    ]; },
  },
  {
    type: 'cylinder', label: 'استوانه', icon: '🥫', color: '#fbbf24', curved: true,
    faces: 3, edges: 2, vertices: 0, note: 'دو قاعدهٔ دایره و یک سطح منحنی',
    nominal: { r: 2, h: 5 }, unit: 'واحد',
    dims: (s) => `شعاع ${r(2 * s)} • ارتفاع ${r(5 * s)}`,
    metrics: (s) => { const rad = 2 * s, h = 5 * s; return [
      { key: 'مساحت', formula: '۲πr² + ۲πrh', value: r(2 * Math.PI * rad * rad + 2 * Math.PI * rad * h), u: '۲' },
      { key: 'حجم', formula: 'π × r² × h', value: r(Math.PI * rad * rad * h), u: '۳' },
    ]; },
  },
  {
    type: 'cone', label: 'مخروط', icon: '🔻', color: '#fb7185', curved: true,
    faces: 2, edges: 1, vertices: 1, note: 'یک قاعدهٔ دایره و یک نوک',
    nominal: { r: 3, h: 4 }, unit: 'واحد',
    dims: (s) => `شعاع ${r(3 * s)} • ارتفاع ${r(4 * s)}`,
    metrics: (s) => { const rad = 3 * s, h = 4 * s, slant = Math.sqrt(rad * rad + h * h); return [
      { key: 'مساحت', formula: 'πr² + πr·ℓ', value: r(Math.PI * rad * rad + Math.PI * rad * slant), u: '۲' },
      { key: 'حجم', formula: '⅓ × π × r² × h', value: r((Math.PI * rad * rad * h) / 3), u: '۳' },
    ]; },
  },
];

// Round to one decimal and render with Persian digits for the classroom UI.
function r(n) {
  const rounded = Math.round(n * 10) / 10;
  return String(rounded).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

export const shapeInfo = (type) => SHAPES.find((item) => item.type === type) || SHAPES[0];

const makeGeometry = (type) => {
  switch (type) {
    case 'cube': return new THREE.BoxGeometry(R.cube, R.cube, R.cube);
    case 'cuboid': return new THREE.BoxGeometry(R.cuboidX, R.cuboidY, R.cuboidZ);
    case 'pyramid': return new THREE.ConeGeometry(R.pyR, R.pyH, 4);
    case 'sphere': return new THREE.SphereGeometry(R.sphR, 48, 32);
    case 'cylinder': return new THREE.CylinderGeometry(R.cylR, R.cylR, R.cylH, 48);
    case 'cone': return new THREE.ConeGeometry(R.coneR, R.coneH, 48);
    default: return new THREE.BoxGeometry(R.cube, R.cube, R.cube);
  }
};

// Latitude/longitude style guides so curved solids clearly read as 3D. Without
// these a transparent sphere looks like a flat disc.
function buildGuides(type) {
  const pts = [];
  const push = (a, b) => { pts.push(a.x, a.y, a.z, b.x, b.y, b.z); };
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  const TAU = Math.PI * 2;

  if (type === 'sphere') {
    const R0 = R.sphR, LON = 8, LAT = 6, SEG = 48;
    for (let i = 0; i < LON; i++) { // meridians
      const phi = (i / LON) * Math.PI;
      let prev = null;
      for (let j = 0; j <= SEG; j++) { const t = (j / SEG) * Math.PI; const p = v(R0 * Math.sin(t) * Math.cos(phi), R0 * Math.cos(t), R0 * Math.sin(t) * Math.sin(phi)); if (prev) push(prev, p); prev = p; }
    }
    for (let i = 1; i < LAT; i++) { // parallels
      const t = (i / LAT) * Math.PI, rr = R0 * Math.sin(t), y = R0 * Math.cos(t);
      let prev = null;
      for (let j = 0; j <= SEG; j++) { const a = (j / SEG) * TAU; const p = v(rr * Math.cos(a), y, rr * Math.sin(a)); if (prev) push(prev, p); prev = p; }
    }
  } else if (type === 'cylinder') {
    const R0 = R.cylR, H = R.cylH / 2, SEG = 48, LINES = 12;
    for (const y of [H, -H]) { let prev = null; for (let j = 0; j <= SEG; j++) { const a = (j / SEG) * TAU; const p = v(R0 * Math.cos(a), y, R0 * Math.sin(a)); if (prev) push(prev, p); prev = p; } }
    for (let i = 0; i < LINES; i++) { const a = (i / LINES) * TAU; push(v(R0 * Math.cos(a), H, R0 * Math.sin(a)), v(R0 * Math.cos(a), -H, R0 * Math.sin(a))); }
  } else if (type === 'cone') {
    const R0 = R.coneR, H = R.coneH / 2, SEG = 48, LINES = 12;
    let prev = null; for (let j = 0; j <= SEG; j++) { const a = (j / SEG) * TAU; const p = v(R0 * Math.cos(a), -H, R0 * Math.sin(a)); if (prev) push(prev, p); prev = p; }
    const apex = v(0, H, 0);
    for (let i = 0; i < LINES; i++) { const a = (i / LINES) * TAU; push(v(R0 * Math.cos(a), -H, R0 * Math.sin(a)), apex); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return geo;
}

/** Build one selectable shape: glassy 3D surface, edge lines, and curved guides. */
export function createShape(type, id, opacity = 0.62) {
  const config = shapeInfo(type);
  const geometry = makeGeometry(type);
  geometry.center();
  const material = new THREE.MeshStandardMaterial({
    color: config.color, transparent: true, opacity, side: THREE.DoubleSide,
    metalness: 0.15, roughness: 0.25, envMapIntensity: 1.15, depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { id, type, baseColor: config.color, opacity };

  // Boundary edges. For curved solids EdgesGeometry with a threshold shows the
  // silhouette rims (cylinder circles, cone base) rather than a noisy mesh.
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry, config.curved ? 24 : 1),
    new THREE.LineBasicMaterial({ color: '#f2fbff', transparent: true, opacity: .95 }),
  );
  edges.visible = false;
  edges.raycast = () => {};
  mesh.add(edges);
  mesh.userData.edges = edges;

  // Curvature guides for round solids: always on so the 3D form is obvious.
  if (config.curved) {
    const guides = new THREE.LineSegments(buildGuides(type), new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: .28 }));
    guides.raycast = () => {};
    mesh.add(guides);
    mesh.userData.guides = guides;
  }
  return mesh;
}

export function disposeShape(mesh) {
  mesh.traverse((node) => {
    if (node.geometry) node.geometry.dispose();
    if (node.material) (Array.isArray(node.material) ? node.material : [node.material]).forEach((m) => m.dispose());
  });
}

export function setShapeColor(mesh, color) {
  mesh.material.color.set(color);
  mesh.userData.baseColor = color;
}

// Apply (or clear) a section clipping plane to a shape and its child lines.
export function setClip(mesh, planes) {
  mesh.traverse((node) => { if (node.material) node.material.clippingPlanes = planes; });
}
