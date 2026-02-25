# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Project

No build step — this is vanilla JS with Three.js loaded from CDN. Serve files via HTTP (not `file://`) to avoid CORS issues with ES module imports:

```bash
python -m http.server 8080
# or
npx serve .
```

Then open `http://localhost:8080` in a browser.

No package.json, no npm dependencies, no tests, no linter.

## Entry Points

- `index.html` — Main puzzle game (menu + 6 puzzles + full game loop)
- `restoration.html` — Kintsugami restoration vignettes prototype
- `world.html` — Open-world exploration mode with procedural river

## Architecture

### Two-Scene Renderer Layout

The main game (`index.html`) runs two independent Three.js scenes rendered simultaneously:

1. **Main scene** — PerspectiveCamera, OrbitControls, assembled puzzle display
2. **Tray scene** — OrthographicCamera, shows loose puzzle pieces at the bottom of screen

Each has its own `WebGLRenderer`. The tray is a 160px-tall strip fixed to the bottom; the main scene fills the rest.

### Puzzle Configuration

Puzzles are plain config objects. Two geometry strategies:

- **LatheGeometry** (ceramic pots): `profile` array of `[radius, height]` pairs defines the silhouette; the pot is sliced horizontally into N pieces. Used by KINTSUGI, AMPHORA, LANTERN.
- **GLB-based** (bridge, birds): GLB files are embedded as base64 strings in `models/*.js` to avoid CORS. Two slicing modes:
  - `sliceGLBIntoPieces()` — cuts a single mesh along X-axis into N equal pieces (triangles-based for ORIGAMI_CRANE)
  - `sliceGLBByParts()` — uses each Mesh in the GLB scene graph as a separate piece (ORIGAMI_BIRD)

### Piece State

Each piece mesh carries state in `mesh.userData`:

```js
{
  pieceId, placed, dragging,
  trayPosition,   // home in tray
  targetPosition, // assembly snap target
  targetAnim,     // current lerp destination (null when idle)
}
```

### Drag & Drop

`systems/dragDrop.js` handles all interaction via raycasting:
- Left-click picks unplaced pieces; drag plane normal faces the camera
- Scroll wheel rotates the held piece around Y
- On release: snaps if within 0.95 units of target, otherwise returns to tray
- Orbit controls are disabled during drag to avoid conflict

### Animation Loop

Uses `THREE.Clock` + `requestAnimationFrame`. Per-frame:
- Position lerp: `piece.position.lerp(targetAnim, 0.13)`, stops at < 0.004 units
- Completion spin: placed pieces orbit world Y at 1.1 rad/sec
- Wireframe guide fades out on completion

### Visual Style

- `flatShading: true` on all ceramic materials (origami/faceted aesthetic)
- EdgesGeometry wireframe (15° threshold, 0x88AAFF, scaled 1.02× to prevent z-fighting)
- Warm three-point lighting: sun (0xffeec0), fill (0xaa6600), ambient (0xfff5e0)
- 120 floating dust particles for atmosphere
- Dark radial gradient backgrounds (#1f0e04 → #04020a)

### UI

All UI overlays are absolutely-positioned HTML over the canvas. Menu/win screens toggle `display:none/block`. Mini puzzle previews on menu cards each run their own small Three.js renderer.
