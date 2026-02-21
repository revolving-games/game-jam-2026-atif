import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { buildFullGeometry } from './models/pot.js';
import { createPieces }      from './systems/pieces.js';
import { initDragDrop }      from './systems/dragDrop.js';

// ── Scene ─────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d1a);

// ── Camera ────────────────────────────────────────────────────────────────────
// FOV 55, positioned along +Z so we can see both pot (y ≈ 0–2.3) and tray (y ≈ -3.5)
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, -0.5, 9);
camera.lookAt(0, -0.5, 0);

// ── Renderer ──────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping    = THREE.NoToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ── Lighting ──────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(3, 5, 3);
scene.add(dirLight);

// Subtle fill light from the opposite side
const fillLight = new THREE.DirectionalLight(0x8090cc, 0.35);
fillLight.position.set(-3, 2, -2);
scene.add(fillLight);

// ── OrbitControls ─────────────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
// Right-click = orbit, so left-click stays free for drag-and-drop
controls.mouseButtons = {
  LEFT:   null,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT:  THREE.MOUSE.ROTATE,
};
controls.minDistance = 4;
controls.maxDistance = 20;
controls.update();

// ── Wireframe Guide ───────────────────────────────────────────────────────────
const fullGeo    = buildFullGeometry();
const edgesGeo   = new THREE.EdgesGeometry(fullGeo, 15); // 15° threshold = clean low-poly edges
const wireframeMat = new THREE.LineBasicMaterial({
  color:       0x88AAFF,
  transparent: true,
  opacity:     0.5,
});
const wireframe = new THREE.LineSegments(edgesGeo, wireframeMat);
wireframe.scale.setScalar(1.02); // slight scale to prevent z-fighting with placed pieces
scene.add(wireframe);

// ── Puzzle Pieces ─────────────────────────────────────────────────────────────
const { pieceMeshes } = createPieces(scene);

// ── Game State ────────────────────────────────────────────────────────────────
const state = {
  piecesPlaced: 0,
  complete:     false,
  spinAngle:    0,
};

const progressEl    = document.getElementById('progress-bar');
const completeBanner = document.getElementById('complete-banner');

function onSnap() {
  state.piecesPlaced++;
  progressEl.textContent = `${state.piecesPlaced} / 4 pieces placed`;
  if (state.piecesPlaced === 4) triggerComplete();
}

function triggerComplete() {
  state.complete  = true;
  state.spinAngle = 0;
  // Show banner after wireframe has had time to fade
  setTimeout(() => { completeBanner.style.display = 'block'; }, 1600);
}

// ── Drag & Drop ───────────────────────────────────────────────────────────────
initDragDrop({ camera, renderer, pieceMeshes, controls, onSnap });

// ── Reset ─────────────────────────────────────────────────────────────────────
document.getElementById('reset-btn').addEventListener('click', () => {
  state.piecesPlaced = 0;
  state.complete     = false;
  state.spinAngle    = 0;

  wireframeMat.opacity          = 0.5;
  progressEl.textContent        = '0 / 4 pieces placed';
  completeBanner.style.display  = 'none';

  for (const piece of pieceMeshes) {
    piece.userData.placed     = false;
    piece.userData.targetAnim = piece.userData.trayPosition.clone();
    piece.rotation.set(0, 0, 0);
  }
});

// ── Render Loop ───────────────────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // ── Lerp pieces toward their animation targets ────────────────────────────
  for (const piece of pieceMeshes) {
    const anim = piece.userData.targetAnim;
    if (!anim || piece.userData.dragging) continue;

    piece.position.lerp(anim, 0.13);

    if (piece.position.distanceTo(anim) < 0.004) {
      piece.position.copy(anim);
      piece.userData.targetAnim = null;
    }
  }

  // ── Completion effects ────────────────────────────────────────────────────
  if (state.complete) {
    // Fade wireframe to transparent
    if (wireframeMat.opacity > 0) {
      wireframeMat.opacity = Math.max(0, wireframeMat.opacity - delta * 0.45);
    }

    // 360° victory spin (pieces rotate around world Y through origin)
    if (state.spinAngle < Math.PI * 2) {
      const step = delta * 1.1;
      state.spinAngle += step;
      for (const piece of pieceMeshes) {
        if (piece.userData.placed) {
          piece.rotation.y += step;
        }
      }
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
