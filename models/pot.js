import * as THREE from 'three';

// ─── Pot silhouette profile [radius, height] ──────────────────────────────────
export const profilePoints = [
  new THREE.Vector2(0.05, 0.00),  // 0 — bottom center
  new THREE.Vector2(0.80, 0.05),  // 1 — bottom edge
  new THREE.Vector2(1.20, 0.50),  // 2 — lower body
  new THREE.Vector2(1.35, 1.00),  // 3 — belly (widest)
  new THREE.Vector2(1.10, 1.80),  // 4 — shoulder
  new THREE.Vector2(0.85, 2.00),  // 5 — neck
  new THREE.Vector2(1.10, 2.20),  // 6 — rim flare
  new THREE.Vector2(1.15, 2.30),  // 7 — rim top
];

// 8 radial segments → octagonal cross-section = origami / low-poly look
export const SEGMENTS = 8;

/** Full pot geometry (used for the wireframe guide). */
export function buildFullGeometry() {
  return new THREE.LatheGeometry(profilePoints, SEGMENTS);
}

/**
 * Piece definitions. Each piece is a vertical slice of the pot profile.
 * Points are shared at seams so pieces fit seamlessly when assembled.
 *
 *  Piece      Profile indices   World y range
 *  ─────────  ───────────────   ─────────────
 *  Base       [0 … 2]           0.00 – 0.50
 *  Belly      [2 … 4]           0.50 – 1.80
 *  Shoulder   [4 … 6]           1.80 – 2.20
 *  Rim        [6 … 7]           2.20 – 2.30
 */
export const PIECE_DEFS = [
  { id: 0, name: 'Base',     points: profilePoints.slice(0, 3), color: 0xE8C49A },
  { id: 1, name: 'Belly',    points: profilePoints.slice(2, 5), color: 0xD4875A },
  { id: 2, name: 'Shoulder', points: profilePoints.slice(4, 7), color: 0x7BAF9E },
  { id: 3, name: 'Rim',      points: profilePoints.slice(6, 8), color: 0xC9A96E },
];

/** Create raw LatheGeometry for a piece definition. */
export function buildPieceGeometry(def) {
  return new THREE.LatheGeometry(def.points, SEGMENTS);
}
