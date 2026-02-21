// Kintsugi Puzzles — puzzle configuration objects
// profilePoints: [x, y] arrays — converted to THREE.Vector2 in the engine

export const KINTSUGI = {
  id: 'kintsugi',
  totalPieces: 4,
  segments: 8,
  profilePoints: [
    [0.05, 0.00],
    [0.80, 0.05],
    [1.20, 0.50],
    [1.35, 1.00],
    [1.10, 1.80],
    [0.85, 2.00],
    [1.10, 2.20],
    [1.15, 2.30],
  ],
  pieceDefs: [
    { id: 0, name: 'Base',     sliceStart: 0, sliceEnd: 3, color: 0xC87941 },
    { id: 1, name: 'Belly',    sliceStart: 2, sliceEnd: 5, color: 0xB85C2A },
    { id: 2, name: 'Shoulder', sliceStart: 4, sliceEnd: 7, color: 0x7AAFA0 },
    { id: 3, name: 'Rim',      sliceStart: 6, sliceEnd: 8, color: 0xD4A24E },
  ],
  seams: [
    { y: 0.50, r: 1.20 },
    { y: 1.80, r: 1.10 },
    { y: 2.20, r: 1.10 },
  ],
  seamsByPiece: { 0: [0], 1: [0, 1], 2: [1, 2], 3: [2] },
};

export const AMPHORA = {
  id: 'amphora',
  totalPieces: 7,
  segments: 8,
  profilePoints: [
    [0.04, 0.00],
    [0.50, 0.06],
    [0.70, 0.40],
    [1.00, 0.85],
    [1.22, 1.40],
    [1.15, 1.80],
    [0.85, 2.15],
    [0.55, 2.40],
    [0.42, 2.60],
    [0.40, 2.75],
    [0.52, 2.88],
    [0.58, 3.00],
  ],
  pieceDefs: [
    { id: 0, name: 'Base',       sliceStart: 0,  sliceEnd: 3,  color: 0xC47B3E },
    { id: 1, name: 'Lower Body', sliceStart: 2,  sliceEnd: 5,  color: 0xB85030 },
    { id: 2, name: 'Belly',      sliceStart: 4,  sliceEnd: 6,  color: 0xCC6640 },
    { id: 3, name: 'Upper Body', sliceStart: 5,  sliceEnd: 8,  color: 0xA04525 },
    { id: 4, name: 'Neck Base',  sliceStart: 7,  sliceEnd: 9,  color: 0xC07040 },
    { id: 5, name: 'Neck',       sliceStart: 8,  sliceEnd: 11, color: 0x8A5030 },
    { id: 6, name: 'Rim',        sliceStart: 10, sliceEnd: 12, color: 0xD4A050 },
  ],
  seams: [
    { y: 0.40, r: 0.70 },
    { y: 1.40, r: 1.22 },
    { y: 1.80, r: 1.15 },
    { y: 2.40, r: 0.55 },
    { y: 2.60, r: 0.42 },
    { y: 2.88, r: 0.52 },
  ],
  seamsByPiece: { 0: [0], 1: [0, 1], 2: [1, 2], 3: [2, 3], 4: [3, 4], 5: [4, 5], 6: [5] },
};
