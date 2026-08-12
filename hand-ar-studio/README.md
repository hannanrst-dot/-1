# Hand AR Studio — واقعیت افزوده با دست

A mobile-first, browser-only **3D geometry teaching assistant**. The phone camera is the background; Three.js solids float on top; MediaPipe detects up to two hands and turns pinches into direct manipulation — built for a teacher to explain solids to a class hands-free.

## Included features

- Front/rear camera switching through `getUserMedia`
- MediaPipe **Tasks-Vision HandLandmarker**: 21 landmarks per hand, two-hand tracking, GPU with CPU fallback (bundler- and mobile-friendly)
- **Free trackball rotation** with one hand — turn the solid in every direction, not just one axis
- **Two-hand pinch** to scale, and move both hands together to reposition (phone-style pinch-zoom)
- Glassy **MeshStandardMaterial** solids lit by a studio environment map, with **latitude/longitude guide grids on curved solids** (sphere / cylinder / cone) so their 3D form reads clearly
- **Cross-section (برش) mode**: a movable clipping plane cuts the selected solid so students see the interior and the shape of the section (circle, square, triangle…)
- **Teaching info panel**: face / edge / vertex counts, live dimensions, and the **surface-area and volume formulas with values** that recompute as the shape is scaled
- Auto-rotate toggle, edge overlay, color cycling, transform reset, delete, clear-all
- RTL Persian interface, gesture tutorial, clear camera-permission / unsupported-browser messages with error codes
- Screenshot, plus local browser save/load of a scene

## Project layout

```text
hand-ar-studio/
├── index.html
├── package.json
├── vite.config.js               # Registers the React/JSX plugin (required to build)
├── README.md
└── src/
    ├── main.jsx                 # React entry point
    ├── App.jsx                  # Camera, MediaPipe, Three.js, interaction lifecycle
    ├── styles.css               # Responsive Persian / RTL immersive UI
    ├── components/
    │   ├── Controls.jsx         # Lightweight AR controls and shape toolbar
    │   └── Tutorial.jsx         # First-launch gesture guide
    └── lib/
        ├── gesture.js           # Pure gesture analysis + landmark skeleton drawing
        └── shapes.js            # Shape factories, materials, edges, disposal
```

## Setup

1. Install **Node.js 18+**.
2. In this folder, install packages:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open the displayed address on the phone. Camera access only works on **HTTPS** (or `localhost`).

### Testing on a physical phone with HTTPS

For the least friction, deploy the generated static site to Netlify, Vercel, Cloudflare Pages, or GitHub Pages:

```bash
npm run build
```

Upload/deploy the resulting `dist/` folder; these hosts provide HTTPS automatically.

For a local-LAN test, use a trusted development certificate. One option is [mkcert](https://github.com/FiloSottile/mkcert):

```bash
mkcert -install
mkcert localhost 192.168.1.20
npm run dev -- --https --host 0.0.0.0
```

Then open `https://192.168.1.20:<port>` on the phone and accept the locally trusted certificate. On Android, Chrome DevTools remote debugging is another convenient option for testing `localhost` over USB.

> iOS Safari requires a secure context and may request motion/orientation permission when entering inspection mode. Use a recent Chrome Android or Safari iOS release.

## Gesture guide

| Gesture / control | Result |
| --- | --- |
| Pinch with one hand and move | Select the solid and **rotate it freely in every direction** (trackball) |
| Pinch with **both** hands | Spread/close to scale; move both hands together to reposition |
| Open palm | Release current manipulation |
| **💫 چرخش** button | Auto-rotate the selected solid hands-free |
| **🔪 برش** button + slider | Cross-section: cut the solid to reveal its interior and the section shape |
| **📐 یال‌ها** button | Toggle the boundary edge overlay |
| **♻️ بازنشانی** button | Reset the selected solid's rotation and scale |
| **🗑️ پاک‌کردن** button | Remove all shapes from the scene |

The info panel (top-left) reflects the selected solid: its Persian name, its
face/edge/vertex counts (a sphere is one curved surface with 0 edges and 0
vertices; a cylinder has 2 edges and 0 vertices; a cone has 1 edge and 1
vertex), its live dimensions, and the surface-area and volume **formulas with
values** that update as you scale it.

The tracker intentionally makes selection forgiving for mobile use. For the best result, hold one object near screen center, keep the hand well lit, and avoid a busy background.

## Notes for production deployment

- MediaPipe Tasks-Vision loads its WASM runtime from jsDelivr and the hand model from Google's model host (see `MP_WASM` / `MP_MODEL` in `App.jsx`). To deploy in a locked-down environment, host those two assets yourself and update the constants.
- The app has no backend. Saved scenes use `localStorage` on the current device/browser.
- Recording video was left out intentionally: mobile `MediaRecorder` support and camera/overlay compositing behavior vary heavily across Safari versions. Screenshot support is included and reliable.
- Three.js meshes, geometry, edge geometry, and materials are disposed when the user deletes an object or reloads a saved scene.

## Build check

```bash
npm run build
npm run preview
```
