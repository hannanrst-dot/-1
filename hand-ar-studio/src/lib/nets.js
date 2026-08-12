import * as THREE from 'three';

// Builders that create a solid's *net* (unfolded, flat) and fold it up into the
// 3D solid as a single `fold` value goes 0 → 1. Polyhedra fold along real hinges;
// the cylinder and cone morph between their flat sheet and the curved surface.

const faceMat = (color) => new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.74, side: THREE.DoubleSide, metalness: 0.12, roughness: 0.38, depthWrite: false });
const edgeMat = () => new THREE.LineBasicMaterial({ color: '#f2fbff', transparent: true, opacity: 0.9 });

function planeFace(w, h, color) {
  const geo = new THREE.PlaneGeometry(w, h);
  const mesh = new THREE.Mesh(geo, faceMat(color));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat());
  mesh.add(edges);
  return mesh;
}

function triFace(a, b, apex, color) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([a.x, a.y, a.z, b.x, b.y, b.z, apex.x, apex.y, apex.z], 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, faceMat(color));
  const line = new THREE.LineLoop(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([a.x, a.y, a.z, b.x, b.y, b.z, apex.x, apex.y, apex.z], 3)), edgeMat());
  mesh.add(line);
  return mesh;
}

function boxNet(l, h, d, color, baseColor) {
  const group = new THREE.Group();
  const pivots = [];
  group.add(planeFace(l, h, baseColor)); // front (base)
  const hinge = (parent, w, hh, pos, off, axis, angle, col) => {
    const pivot = new THREE.Group(); pivot.position.set(pos[0], pos[1], pos[2]);
    const face = planeFace(w, hh, col); face.position.set(off[0], off[1], off[2]);
    pivot.add(face); parent.add(pivot); pivots.push({ pivot, axis, angle });
    return pivot;
  };
  const rightPivot = hinge(group, d, h, [l / 2, 0, 0], [d / 2, 0, 0], 'y', Math.PI / 2, color);   // right
  hinge(group, d, h, [-l / 2, 0, 0], [-d / 2, 0, 0], 'y', -Math.PI / 2, color);                   // left
  hinge(group, l, d, [0, h / 2, 0], [0, d / 2, 0], 'x', -Math.PI / 2, color);                     // top
  hinge(group, l, d, [0, -h / 2, 0], [0, -d / 2, 0], 'x', Math.PI / 2, color);                    // bottom
  hinge(rightPivot, l, h, [d, 0, 0], [l / 2, 0, 0], 'y', Math.PI / 2, baseColor);                 // back (child of right)
  return {
    group,
    setFold: (t) => pivots.forEach((p) => { p.pivot.rotation[p.axis] = p.angle * t; }),
    dispose: () => disposeGroup(group),
  };
}

function pyramidNet(b, H, color, baseColor) {
  const group = new THREE.Group();
  const pivots = [];
  group.add(planeFace(b, b, baseColor)); // base square
  const slant = Math.sqrt(H * H + (b / 2) ** 2);
  const alpha = Math.atan2(H, b / 2);
  const add = (pos, verts, axis, angle) => {
    const pivot = new THREE.Group(); pivot.position.set(pos[0], pos[1], pos[2]);
    pivot.add(triFace(verts[0], verts[1], verts[2], color));
    group.add(pivot); pivots.push({ pivot, axis, angle });
  };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  add([0, b / 2, 0], [V(-b / 2, 0, 0), V(b / 2, 0, 0), V(0, slant, 0)], 'x', alpha);       // top
  add([0, -b / 2, 0], [V(-b / 2, 0, 0), V(b / 2, 0, 0), V(0, -slant, 0)], 'x', -alpha);    // bottom
  add([b / 2, 0, 0], [V(0, -b / 2, 0), V(0, b / 2, 0), V(slant, 0, 0)], 'y', -alpha);      // right
  add([-b / 2, 0, 0], [V(0, -b / 2, 0), V(0, b / 2, 0), V(-slant, 0, 0)], 'y', alpha);     // left
  return {
    group,
    setFold: (t) => pivots.forEach((p) => { p.pivot.rotation[p.axis] = p.angle * t; }),
    dispose: () => disposeGroup(group),
  };
}

// Parametric morph surface for curved solids: lerp each vertex from its flat
// (unrolled) position to its curved position as fold goes 0 → 1.
function morphNet(kind, r, h, color, baseColor) {
  const NU = 60, NV = 2;
  const flat = [], curved = [];
  const L = Math.sqrt(r * r + h * h);
  const sector = (2 * Math.PI * r) / L;
  for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) {
    const u = i / NU, v = j / NV;
    if (kind === 'cylinder') {
      flat.push((u - 0.5) * 2 * Math.PI * r, (v - 0.5) * h, 0);
      const a = u * 2 * Math.PI - Math.PI;
      curved.push(r * Math.sin(a), (v - 0.5) * h, r * Math.cos(a));
    } else { // cone
      const angF = (u - 0.5) * sector, radF = v * L;
      flat.push(radF * Math.sin(angF), h / 2 - radF, 0);
      const a = u * 2 * Math.PI, radC = v * r;
      curved.push(radC * Math.cos(a), h / 2 - v * h, radC * Math.sin(a));
    }
  }
  const idx = [];
  for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
    const p = j * (NU + 1) + i;
    idx.push(p, p + 1, p + NU + 1, p + 1, p + NU + 2, p + NU + 1);
  }
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(flat.length);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(idx);
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(geo, faceMat(color));
  group.add(mesh);

  // End caps (circles) that scale in as the surface rolls up.
  const caps = [];
  const capMat = faceMat(baseColor);
  const makeCap = (y) => { const c = new THREE.Mesh(new THREE.CircleGeometry(r, 40), capMat); c.rotation.x = -Math.PI / 2; c.position.y = y; c.scale.setScalar(0.001); group.add(c); caps.push(c); return c; };
  if (kind === 'cylinder') { makeCap(h / 2); makeCap(-h / 2); } else { makeCap(-h / 2); }

  const setFold = (t) => {
    const a = geo.attributes.position.array;
    for (let k = 0; k < a.length; k++) a[k] = flat[k] + (curved[k] - flat[k]) * t;
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
    caps.forEach((c) => c.scale.setScalar(Math.max(0.001, t)));
  };
  return { group, setFold, dispose: () => disposeGroup(group) };
}

function disposeGroup(group) {
  group.traverse((n) => { if (n.geometry) n.geometry.dispose(); if (n.material) (Array.isArray(n.material) ? n.material : [n.material]).forEach((m) => m.dispose()); });
}

export const NET_SHAPES = [
  { type: 'cube', icon: '🧊', label: 'مکعب', build: () => boxNet(1.9, 1.9, 1.9, '#45b7ff', '#2f8fe0') },
  { type: 'cuboid', icon: '🧱', label: 'مکعب مستطیل', build: () => boxNet(2.4, 1.5, 1.7, '#a78bfa', '#8b6ff0') },
  { type: 'pyramid', icon: '🔺', label: 'هرم', build: () => pyramidNet(2.0, 1.9, '#ff8a65', '#f06a45') },
  { type: 'cylinder', icon: '🥫', label: 'استوانه', build: () => morphNet('cylinder', 1.0, 2.0, '#fbbf24', '#e0a010') },
  { type: 'cone', icon: '🔻', label: 'مخروط', build: () => morphNet('cone', 1.15, 2.0, '#fb7185', '#e05068') },
];
