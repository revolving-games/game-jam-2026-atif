import * as THREE from 'three';
import { PIECE_DEFS, buildPieceGeometry } from '../models/pot.js';

const TRAY_Y = -3.5;
const TRAY_X = [-2.25, -0.75, 0.75, 2.25];

/**
 * Build all four puzzle pieces, add them to the scene, and return the array.
 *
 * Each piece geometry is normalised so its bottom sits at local y = 0.
 * The piece's world-space target position restores the original y-offset so
 * that all four pieces assemble correctly inside the wireframe guide.
 */
export function createPieces(scene) {
  const pieceMeshes = [];

  PIECE_DEFS.forEach((def, i) => {
    const geo = buildPieceGeometry(def);

    // Find the raw y-minimum so we can:
    //   1. Shift geometry down (bottom at local y = 0)  → clean tray display
    //   2. Store the offset as the world-space target y  → correct assembly
    geo.computeBoundingBox();
    const yMin = geo.boundingBox.min.y;
    geo.translate(0, -yMin, 0);

    const mat = new THREE.MeshStandardMaterial({
      color: def.color,
      flatShading: true,    // key to the origami / faceted look
      roughness: 0.85,
      metalness: 0.0,
    });

    const mesh = new THREE.Mesh(geo, mat);

    const trayPos   = new THREE.Vector3(TRAY_X[i], TRAY_Y, 0);
    const targetPos = new THREE.Vector3(0, yMin, 0); // reassembly offset

    mesh.position.copy(trayPos);

    mesh.userData = {
      pieceId:        def.id,
      placed:         false,
      dragging:       false,
      trayPosition:   trayPos.clone(),
      targetPosition: targetPos.clone(),
      targetAnim:     null,   // set by game.js / dragDrop.js to trigger lerp
    };

    scene.add(mesh);
    pieceMeshes.push(mesh);
  });

  return { pieceMeshes };
}
