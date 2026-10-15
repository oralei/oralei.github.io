import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.getElementById('model-viewer');

// no anti-aliasing, transparent background
const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.localClippingEnabled = true;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);

const pivot = new THREE.Group();
scene.add(pivot);

// a horizontal sweep plane: textured above it, wireframe below it
const texturedClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const wireClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);

let minY = 0;
let maxY = 0;
let sweep = 0;       // 0 = all wireframe, 1 = all textured
let target = 0;
let frame = { minX: -1, maxX: 1, minY: -1, maxY: 1 };

new GLTFLoader().load('media/models/markFigure.glb', gltf => {
  const model = gltf.scene;

  model.traverse(obj => {
    if (!obj.isMesh) return;

    // flat, unlit texture with hard pixels
    const map = obj.material.map;
    if (map) {
      map.magFilter = THREE.NearestFilter;
      map.minFilter = THREE.NearestFilter;
      map.generateMipmaps = false;
      map.needsUpdate = true;
    }
    obj.material = new THREE.MeshBasicMaterial({
      map,
      side: THREE.DoubleSide,
      clippingPlanes: [texturedClip]
    });

    // colored wireframe, taking over above the sweep plane
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(obj.geometry),
      new THREE.LineBasicMaterial({ color: 0x2784f5, clippingPlanes: [wireClip] })
    );
    wire.position.copy(obj.position);
    wire.quaternion.copy(obj.quaternion);
    wire.scale.copy(obj.scale);
    obj.parent.add(wire);
  });

  // center the model on the pivot so it spins in place
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  pivot.add(model);

  minY = box.min.y - center.y;
  maxY = box.max.y - center.y;

  // fixed angled 3rd-person view
  const size = box.getSize(new THREE.Vector3());
  const dist = size.length() * 2;
  camera.position.set(1, 0.6, 1).normalize().multiplyScalar(dist);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();

  // tight framing from the real vertices, over a full spin
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
  model.updateMatrixWorld(true);
  const pts = [];
  model.traverse(obj => {
    if (!obj.isMesh) return;
    const pos = obj.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pts.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(obj.matrixWorld));
    }
  });
  const axis = new THREE.Vector3(0, 1, 0);
  const p = new THREE.Vector3();
  frame = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 24) {
    for (const v of pts) {
      p.copy(v).applyAxisAngle(axis, a).applyMatrix4(camera.matrixWorldInverse);
      frame.minX = Math.min(frame.minX, p.x);
      frame.maxX = Math.max(frame.maxX, p.x);
      frame.minY = Math.min(frame.minY, p.y);
      frame.maxY = Math.max(frame.maxY, p.y);
    }
  }

  // size the container to the model so it fills the space
  container.style.aspectRatio = `${(frame.maxX - frame.minX) * 1.03} / ${(frame.maxY - frame.minY) * 1.03}`;

  sweep = 0;
  applySweep();
  resize();
});

function applySweep() {
  // ease so the line accelerates in and settles out
  const e = sweep * sweep * (3 - 2 * sweep);
  const y = maxY - (maxY - minY) * e;  // sweeps from the top down
  texturedClip.constant = -y;  // keep y' > y
  wireClip.constant = y;       // keep y' < y
}

const IDLE = 0.004;
const DRAG = 0.01;
let dragging = false;
let hovering = false;
let lastX = 0;
let velocity = IDLE;

container.addEventListener('pointerenter', () => {
  hovering = true;
  target = 1;
});
container.addEventListener('pointerleave', () => {
  hovering = false;
  if (!dragging) target = 0;
});

// drag to spin (yaw only); releasing eases back to the idle spin
container.addEventListener('pointerdown', e => {
  dragging = true;
  lastX = e.clientX;
  velocity = 0;
  container.setPointerCapture(e.pointerId);
});
container.addEventListener('pointermove', e => {
  if (!dragging) return;
  const dx = e.clientX - lastX;
  lastX = e.clientX;
  pivot.rotation.y += dx * DRAG;
  velocity = dx * DRAG;
});
const endDrag = () => {
  if (!dragging) return;
  dragging = false;
  if (!hovering) target = 0;
};
container.addEventListener('pointerup', endDrag);
container.addEventListener('pointercancel', endDrag);

function resize() {
  const { clientWidth: w, clientHeight: h } = container;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  const aspect = w / h;
  const cx = (frame.minX + frame.maxX) / 2;
  const cy = (frame.minY + frame.maxY) / 2;
  const half = Math.max((frame.maxY - frame.minY) / 2, (frame.maxX - frame.minX) / 2 / aspect) * 1.03;
  camera.left = cx - half * aspect;
  camera.right = cx + half * aspect;
  camera.top = cy + half;
  camera.bottom = cy - half;
  camera.updateProjectionMatrix();
}

new ResizeObserver(resize).observe(container);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (!dragging) {
    pivot.rotation.y += velocity;
    const idle = reduceMotion.matches ? 0 : IDLE;
    velocity += (idle - velocity) * 0.05;
  }

  if (sweep !== target) {
    const dir = Math.sign(target - sweep);
    sweep = THREE.MathUtils.clamp(sweep + dir * dt / 0.9, 0, 1); // ~0.9s sweep
    applySweep();
  }

  renderer.render(scene, camera);
});
