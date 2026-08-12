import * as THREE from 'three';

// Each shape carries its geometric teaching facts: number of faces (وجه),
// edges (یال) and vertices (رأس). `curved` marks solids whose surface is not
// made of flat polygons, so the info panel can explain them correctly.
export const SHAPES = [
  { type: 'cube', label: 'مکعب', icon: '🧊', color: '#45b7ff', faces: 6, edges: 12, vertices: 8, curved: false, note: 'شش وجه مربعی برابر' },
  { type: 'cuboid', label: 'مکعب مستطیل', icon: '🧱', color: '#a78bfa', faces: 6, edges: 12, vertices: 8, curved: false, note: 'وجه‌ها مستطیل هستند' },
  { type: 'pyramid', label: 'هرم', icon: '🔺', color: '#ff8a65', faces: 5, edges: 8, vertices: 5, curved: false, note: 'هرم با قاعدهٔ مربع' },
  { type: 'sphere', label: 'کره', icon: '🔵', color: '#36d399', faces: 1, edges: 0, vertices: 0, curved: true, note: 'یک سطح کاملاً منحنی' },
  { type: 'cylinder', label: 'استوانه', icon: '🥫', color: '#fbbf24', faces: 3, edges: 2, vertices: 0, curved: true, note: 'دو قاعدهٔ دایره و یک سطح منحنی' },
  { type: 'cone', label: 'مخروط', icon: '🔻', color: '#fb7185', faces: 2, edges: 1, vertices: 1, curved: true, note: 'یک قاعدهٔ دایره و یک نوک' },
];

export const shapeInfo = (type) => SHAPES.find((item) => item.type === type) || SHAPES[0];

const makeGeometry = (type) => {
  switch (type) {
    case 'cube': return new THREE.BoxGeometry(1.65, 1.65, 1.65);
    case 'cuboid': return new THREE.BoxGeometry(2.25, 1.2, 1.45);
    case 'pyramid': return new THREE.ConeGeometry(1.25, 2, 4);
    case 'sphere': return new THREE.SphereGeometry(1.05, 40, 26);
    case 'cylinder': return new THREE.CylinderGeometry(.9, .9, 1.85, 40);
    case 'cone': return new THREE.ConeGeometry(1, 2, 40);
    default: return new THREE.BoxGeometry(1.65, 1.65, 1.65);
  }
};

// Pyramids/cones from ConeGeometry sit visually low; nudge geometry so the
// object rotates around its own centre and reads correctly when inspected.
const centerGeometry = (geometry) => {
  geometry.computeBoundingBox();
  geometry.center();
  return geometry;
};

/** Build one selectable shape with a solid transparent surface and edge lines. */
export function createShape(type, id, opacity = 0.62) {
  const config = shapeInfo(type);
  const geometry = centerGeometry(makeGeometry(type));
  const material = new THREE.MeshPhongMaterial({
    color: config.color, transparent: true, opacity, side: THREE.DoubleSide,
    shininess: 80, depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { id, type, baseColor: config.color, opacity };

  // Edge overlay. For curved solids EdgesGeometry with a threshold shows the
  // silhouette/boundary circles rather than a noisy triangle mesh.
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry, config.curved ? 24 : 1),
    new THREE.LineBasicMaterial({ color: '#eaf8ff', transparent: true, opacity: .92 }),
  );
  edges.visible = false;
  edges.raycast = () => {};
  mesh.add(edges);
  mesh.userData.edges = edges;
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
