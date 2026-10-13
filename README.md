# Void RPG Builder

A browser-based visual level editor and event orchestrator for 2D RPG games. Designed to allow for narrative scripting and map building without hard-coding level data.

### [Live Demo](https://void-builder-iota.vercel.app/)

![Editor Screenshot](link-to-your-screenshot)

### Tech Stack
* **Frontend:** React, TypeScript
* **State:** Zustand (Undo/Redo history stack, Layer management)
* **Logic:** BFS Pathfinding (for touch-to-move input)
* **Exporting:** JSON data serialization

### Key Features
* **Multi-Layer Rendering:** Separates background, decoration, and entity layers for clean map composition.
* **Event Orchestrator:** A visual timeline for scripting dialogue steps, background music swaps, and combat encounters.
* **State History:** Implements a custom undo/redo stack that tracks map snapshots, allowing non-destructive editing.
* **Local Persistence:** Uses `localStorage` to save project drafts, enabling users to refresh the page without losing their map data.

### Setup
```bash
git clone https://github.com/berinelson122-design/void-rpg-builder
npm install
npm run dev
