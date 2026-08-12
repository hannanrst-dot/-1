# Hand AR Studio — واقعیت افزوده با دست

A mobile-first, browser-only augmented reality playground. The phone camera is the background; Three.js shapes float on top; MediaPipe Hands detects up to two hands and turns pinches into direct manipulation.

## Included features

- Front/rear camera switching through `getUserMedia`
- MediaPipe **Tasks-Vision HandLandmarker**: 21 landmarks per hand, two-hand tracking, GPU with CPU fallback (bundler- and mobile-friendly)
- Pinch-to-select, pinch-and-drag movement with interpolation, palm-size depth movement, hand-twist rotation, two-hand pinch scaling, open-palm release
- Cube, cuboid, pyramid, sphere, cylinder, and cone with transparent illuminated materials, optional edge overlays, shadows, color cycling, deletion, and multiple instances
- RTL Persian interface, gesture tutorial, camera-permission and unsupported-browser messages
- **Teaching info panel**: the selected solid's face / edge / vertex counts (وجه / یال / رأس) shown live, with a short Persian note — built for the geometry classroom
- **Auto-rotate** toggle to slowly spin the selected shape so every face can be shown to the class
- “Go inside” inspection mode with Device Orientation look-around where available
- Screenshot, clear-all, plus local browser save/load of a scene

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

| Gesture | Result |
| --- | --- |
| Pinch thumb + index over a visible shape | Select / grab it (pinch over a different shape to switch) |
| Move while pinching | Move it on X/Y; moving the hand nearer/farther adjusts depth |
| Twist your wrist while pinching | Rotate the shape around its vertical axis to see every face |
| Both hands pinching | Increase/decrease distance between hands to scale the selected object |
| Open palm | Release current manipulation |
| **چرخش** button | Auto-rotate the selected shape hands-free |
| **ورود** button | View from within the selected transparent shape |
| **پاک‌کردن** button | Remove all shapes from the scene |

The info panel (top-left) always reflects the selected solid: its Persian name and
its number of faces, edges and vertices — matching how these solids are taught
(a sphere is one curved surface with 0 edges and 0 vertices; a cylinder has 2
edges and 0 vertices; a cone has 1 edge and 1 vertex).

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
