import * as THREE from 'three';

/**
 * Initialise the drag-and-drop system.
 *
 * Controls:
 *   Left-click drag  — pick up and move an unplaced piece
 *   Scroll (on piece) — rotate the held piece around Y
 *   Snap threshold   — piece snaps to target when within SNAP_DIST units
 *
 * @param {{ camera, renderer, pieceMeshes, controls, onSnap }} opts
 */
export function initDragDrop({ camera, renderer, pieceMeshes, controls, onSnap }) {
  const SNAP_DIST = 0.95;

  const raycaster     = new THREE.Raycaster();
  const pointer       = new THREE.Vector2();
  // Drag plane: faces the camera (normal +Z), at z = piece's z at pick-up time
  const dragPlane     = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const planeHit      = new THREE.Vector3();
  const dragOffset    = new THREE.Vector3();

  let activePiece = null;

  // ── helpers ──────────────────────────────────────────────────────────────────

  function setPointerNDC(e) {
    const r = renderer.domElement.getBoundingClientRect();
    pointer.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
    pointer.y = -((e.clientY - r.top)  / r.height)  * 2 + 1;
  }

  // ── pointer down ─────────────────────────────────────────────────────────────

  renderer.domElement.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return; // left-click only

    setPointerNDC(e);
    raycaster.setFromCamera(pointer, camera);

    const pickable = pieceMeshes.filter(p => !p.userData.placed);
    const hits = raycaster.intersectObjects(pickable);
    if (hits.length === 0) return;

    activePiece = hits[0].object;
    activePiece.userData.dragging  = true;
    activePiece.userData.targetAnim = null; // cancel any running lerp

    // Disable orbit so right-click pan/rotate doesn't fire during drag
    controls.enabled = false;

    // Lock drag plane to piece's current z depth
    dragPlane.constant = -activePiece.position.z;

    if (raycaster.ray.intersectPlane(dragPlane, planeHit)) {
      dragOffset.subVectors(activePiece.position, planeHit);
    } else {
      dragOffset.set(0, 0, 0);
    }
  });

  // ── pointer move ─────────────────────────────────────────────────────────────

  renderer.domElement.addEventListener('pointermove', (e) => {
    if (!activePiece) return;

    setPointerNDC(e);
    raycaster.setFromCamera(pointer, camera);

    if (raycaster.ray.intersectPlane(dragPlane, planeHit)) {
      activePiece.position.copy(planeHit).add(dragOffset);
    }
  });

  // ── pointer up ───────────────────────────────────────────────────────────────

  renderer.domElement.addEventListener('pointerup', () => {
    if (!activePiece) return;

    controls.enabled = true;
    activePiece.userData.dragging = false;

    const dist = activePiece.position.distanceTo(activePiece.userData.targetPosition);

    if (dist < SNAP_DIST) {
      // Snap: animate to exact target, mark as placed
      activePiece.userData.placed     = true;
      activePiece.userData.targetAnim = activePiece.userData.targetPosition.clone();
      onSnap(activePiece);
    } else {
      // Return to tray
      activePiece.userData.targetAnim = activePiece.userData.trayPosition.clone();
    }

    activePiece = null;
  });

  // ── scroll to rotate held piece ───────────────────────────────────────────────

  renderer.domElement.addEventListener('wheel', (e) => {
    if (!activePiece) return;
    e.preventDefault();
    activePiece.rotation.y -= e.deltaY * 0.005;
  }, { passive: false });
}
