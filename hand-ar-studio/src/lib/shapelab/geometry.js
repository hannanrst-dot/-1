// ShapeLab — Shape Engine + Math Engine.
// Shapes are parametric so a rectangle stays a rectangle when you drag it (only
// its width/height change). Each shape exposes: default params, the ordered
// vertices (in y-up "units"), the draggable handles, and a drag() that maps a
// handle move to new params while honouring a locked property. Metrics (area,
// perimeter, sides, angles) are derived centrally from the vertices, so adding a
// new polygon shape only needs vertices()+handles()+drag().

const r1 = (v) => Math.round(v * 10) / 10;
const clampMin = (v, m = 0.5) => Math.max(m, v);

// ---- central metrics from a vertex ring (shoelace + edges + interior angles) ----
export function polyMetrics(verts) {
  const n = verts.length;
  let area2 = 0;
  const sides = [];
  for (let i = 0; i < n; i++) {
    const a = verts[i], b = verts[(i + 1) % n];
    area2 += a.x * b.y - b.x * a.y;
    sides.push(Math.hypot(b.x - a.x, b.y - a.y));
  }
  const area = Math.abs(area2) / 2;
  const perimeter = sides.reduce((s, v) => s + v, 0);
  const angles = [];
  for (let i = 0; i < n; i++) {
    const p = verts[(i - 1 + n) % n], c = verts[i], q = verts[(i + 1) % n];
    const v1 = { x: p.x - c.x, y: p.y - c.y }, v2 = { x: q.x - c.x, y: q.y - c.y };
    let ang = Math.acos(Math.max(-1, Math.min(1, (v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y)))));
    angles.push(ang * 180 / Math.PI);
  }
  return { area, perimeter, sides, angles };
}

const RECT = {
  label: 'مستطیل', icon: '▭', params: { w: 8, h: 5 },
  verts: ({ w, h }) => [{ x: -w / 2, y: -h / 2 }, { x: w / 2, y: -h / 2 }, { x: w / 2, y: h / 2 }, { x: -w / 2, y: h / 2 }],
  handles: ({ w, h }) => [
    { id: 'corner', x: w / 2, y: h / 2, kind: 'corner' },
    { id: 'w', x: w / 2, y: 0, kind: 'edge' },
    { id: 'h', x: 0, y: h / 2, kind: 'edge' },
  ],
  drag: (p, id, u, lock) => {
    let { w, h } = p; const A = w * h, P = 2 * (w + h), ratio = w / h;
    const nx = clampMin(Math.abs(u.x) * 2), ny = clampMin(Math.abs(u.y) * 2);
    if (id === 'corner') { w = nx; h = ny; if (lock === 'ratio') h = w / ratio; }
    else if (id === 'w') { if (lock === 'side') return p; w = nx; if (lock === 'area') h = A / w; else if (lock === 'perimeter') h = clampMin(P / 2 - w); else if (lock === 'ratio') h = w / ratio; }
    else if (id === 'h') { h = ny; if (lock === 'area') w = A / h; else if (lock === 'perimeter') w = clampMin(P / 2 - h); else if (lock === 'ratio') w = h * ratio; }
    return { w: r1(w), h: r1(h) };
  },
};

const SQUARE = {
  label: 'مربع', icon: '□', params: { s: 6 },
  verts: ({ s }) => [{ x: -s / 2, y: -s / 2 }, { x: s / 2, y: -s / 2 }, { x: s / 2, y: s / 2 }, { x: -s / 2, y: s / 2 }],
  handles: ({ s }) => [{ id: 'corner', x: s / 2, y: s / 2, kind: 'corner' }],
  drag: (p, id, u) => ({ s: r1(clampMin(Math.max(Math.abs(u.x), Math.abs(u.y)) * 2)) }),
};

const TRIANGLE = {
  label: 'مثلث', icon: '△', params: { b: 8, h: 6, ax: 0 },
  verts: ({ b, h, ax }) => [{ x: -b / 2, y: -h / 2 }, { x: b / 2, y: -h / 2 }, { x: ax, y: h / 2 }],
  handles: ({ b, h, ax }) => [
    { id: 'b', x: b / 2, y: -h / 2, kind: 'corner' },
    { id: 'apex', x: ax, y: h / 2, kind: 'corner' },
  ],
  drag: (p, id, u, lock) => {
    let { b, h, ax } = p; const A = 0.5 * b * h;
    if (id === 'b') { b = clampMin(Math.abs(u.x) * 2); if (lock === 'area') h = (2 * A) / b; }
    else if (id === 'apex') { ax = u.x; h = clampMin(u.y * 2); } // apex sits at +h/2
    return { b: r1(b), h: r1(h), ax: r1(ax) };
  },
};

const PARALLELOGRAM = {
  label: 'متوازی‌الاضلاع', icon: '▱', params: { b: 8, h: 5, skew: 2 },
  verts: ({ b, h, skew }) => [{ x: -b / 2, y: -h / 2 }, { x: b / 2, y: -h / 2 }, { x: b / 2 + skew, y: h / 2 }, { x: -b / 2 + skew, y: h / 2 }],
  handles: ({ b, h, skew }) => [
    { id: 'b', x: b / 2, y: -h / 2, kind: 'corner' },
    { id: 'top', x: b / 2 + skew, y: h / 2, kind: 'corner' },
  ],
  drag: (p, id, u, lock) => {
    let { b, h, skew } = p; const A = b * h;
    if (id === 'b') { b = clampMin(Math.abs(u.x) * 2); if (lock === 'area') h = A / b; }
    else if (id === 'top') { skew = u.x - b / 2; h = clampMin(u.y * 2); }
    return { b: r1(b), h: r1(h), skew: r1(skew) };
  },
};

const TRAPEZOID = {
  label: 'ذوزنقه', icon: '⏢', params: { a: 4, b: 9, h: 5 },
  verts: ({ a, b, h }) => [{ x: -b / 2, y: -h / 2 }, { x: b / 2, y: -h / 2 }, { x: a / 2, y: h / 2 }, { x: -a / 2, y: h / 2 }],
  handles: ({ a, b, h }) => [
    { id: 'b', x: b / 2, y: -h / 2, kind: 'corner' },
    { id: 'top', x: a / 2, y: h / 2, kind: 'corner' },
  ],
  drag: (p, id, u, lock) => {
    let { a, b, h } = p; const A = 0.5 * (a + b) * h;
    if (id === 'b') { b = clampMin(Math.abs(u.x) * 2); if (lock === 'area') h = (2 * A) / (a + b); }
    else if (id === 'top') { a = clampMin(Math.abs(u.x) * 2); h = clampMin(u.y * 2); }
    return { a: r1(a), b: r1(b), h: r1(h) };
  },
};

const RHOMBUS = {
  label: 'لوزی', icon: '◇', params: { d1: 8, d2: 5 },
  verts: ({ d1, d2 }) => [{ x: d1 / 2, y: 0 }, { x: 0, y: d2 / 2 }, { x: -d1 / 2, y: 0 }, { x: 0, y: -d2 / 2 }],
  handles: ({ d1, d2 }) => [
    { id: 'd1', x: d1 / 2, y: 0, kind: 'edge' },
    { id: 'd2', x: 0, y: d2 / 2, kind: 'edge' },
  ],
  drag: (p, id, u, lock) => {
    let { d1, d2 } = p; const A = 0.5 * d1 * d2;
    if (id === 'd1') { d1 = clampMin(Math.abs(u.x) * 2); if (lock === 'area') d2 = (2 * A) / d1; }
    else if (id === 'd2') { d2 = clampMin(Math.abs(u.y) * 2); if (lock === 'area') d1 = (2 * A) / d2; }
    return { d1: r1(d1), d2: r1(d2) };
  },
};

const CIRCLE = {
  label: 'دایره', icon: '◯', params: { r: 4 }, circle: true,
  verts: ({ r }) => { const out = []; for (let i = 0; i < 48; i++) { const a = (i / 48) * 2 * Math.PI; out.push({ x: r * Math.cos(a), y: r * Math.sin(a) }); } return out; },
  handles: ({ r }) => [{ id: 'r', x: r, y: 0, kind: 'edge' }],
  drag: (p, id, u) => ({ r: r1(clampMin(Math.hypot(u.x, u.y))) }),
  metrics: ({ r }) => ({ area: Math.PI * r * r, perimeter: 2 * Math.PI * r, sides: [], angles: [], radius: r }),
};

export const SHAPES = { rectangle: RECT, square: SQUARE, triangle: TRIANGLE, parallelogram: PARALLELOGRAM, trapezoid: TRAPEZOID, rhombus: RHOMBUS, circle: CIRCLE };
export const SHAPE_ORDER = ['rectangle', 'square', 'triangle', 'parallelogram', 'trapezoid', 'rhombus', 'circle'];

export function metricsOf(type, params) {
  const def = SHAPES[type];
  if (def.metrics) return def.metrics(params);
  return polyMetrics(def.verts(params));
}

// Decompose a shape into simple polygon pieces (for the cut / re-assemble mode).
// Each piece is a list of absolute vertices (in the shape's centred units).
export function splitShape(type, params) {
  const V = (x, y) => ({ x, y });
  if (type === 'rectangle') {
    const { w, h } = params, a = V(-w / 2, -h / 2), b = V(w / 2, -h / 2), c = V(w / 2, h / 2), d = V(-w / 2, h / 2);
    return [[a, b, c], [a, c, d]];
  }
  if (type === 'square') {
    const { s } = params, a = V(-s / 2, -s / 2), b = V(s / 2, -s / 2), c = V(s / 2, s / 2), d = V(-s / 2, s / 2), o = V(0, 0);
    return [[a, b, o], [b, c, o], [c, d, o], [d, a, o]];
  }
  if (type === 'triangle') {
    const { b, h, ax } = params, A = V(-b / 2, -h / 2), B = V(b / 2, -h / 2), C = V(ax, h / 2), M = V(0, -h / 2);
    return [[A, M, C], [M, B, C]];
  }
  if (type === 'parallelogram') {
    const { b, h, skew } = params, p0 = V(-b / 2, -h / 2), p1 = V(b / 2, -h / 2), p2 = V(b / 2 + skew, h / 2), p3 = V(-b / 2 + skew, h / 2);
    return [[p0, p1, p2], [p0, p2, p3]];
  }
  if (type === 'trapezoid') {
    const { a, b, h } = params, B0 = V(-b / 2, -h / 2), B1 = V(b / 2, -h / 2), T1 = V(a / 2, h / 2), T0 = V(-a / 2, h / 2), L = V(-a / 2, -h / 2), R = V(a / 2, -h / 2);
    return [[B0, L, T0], [L, R, T1, T0], [R, B1, T1]]; // triangle + rectangle + triangle
  }
  if (type === 'rhombus') {
    const { d1, d2 } = params, r = V(d1 / 2, 0), t = V(0, d2 / 2), l = V(-d1 / 2, 0), bt = V(0, -d2 / 2), o = V(0, 0);
    return [[r, t, o], [t, l, o], [l, bt, o], [bt, r, o]];
  }
  return null; // circle: no simple decomposition
}

export const centroid = (verts) => { let x = 0, y = 0; verts.forEach((v) => { x += v.x; y += v.y; }); return { x: x / verts.length, y: y / verts.length }; };

export function pointInPoly(px, py, verts) {
  let inside = false;
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const xi = verts[i].x, yi = verts[i].y, xj = verts[j].x, yj = verts[j].y;
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
