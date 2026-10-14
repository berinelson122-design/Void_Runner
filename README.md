# Void Runner: 3D Dimension Shift

An endless 3D runner built for the browser. Features procedural level generation and a dynamic ninja character model.

### [Live Demo](https://void-runner-ten.vercel.app/)

![Runner Gameplay](link-to-your-gif)

### Tech Stack
* **Rendering:** Three.js
* **Framework:** React / TypeScript
* **Physics:** Procedural Z-index object pooling

### Key Features
* **Procedural World:** Obstacles and collectibles are spawned based on distance traveled, increasing in frequency to scale difficulty.
* **Camera Lerping:** Uses `THREE.MathUtils.lerp` for smooth camera tracking of the player character.
* **Procedural Animation:** Character limbs are animated mathematically using `Math.sin` to simulate running without heavy 3D skeletal rigging.

### Setup
```bash
git clone https://github.com/berinelson122-design/void-runner-3d
npm install
npm run dev
