# reconf-solver-gui

[Japanese (日本語)](README_ja.md)

A GUI tool for solving combinatorial reconfiguration problems on graphs. Supports both an Electron desktop app and a browser-based web app.

**[Try the Web Demo](https://junkawahara.github.io/coreviewer-web-test/)**

## Features

- Interactive graph editing with Cytoscape.js (add/remove nodes and edges, drag-and-drop layout)
- Four problem types: **vertex**, **edge**, **vertex coloring**, **edge coloring**
- Built-in IDA\* solver for the vertex independent set reconfiguration problem (Token Jumping)
- Step-by-step visualization of reconfiguration sequences
- File I/O in DIMACS-like format (`.col` / `.dat`)
- Multiple graph layout algorithms (random, grid, circle, cose, breadthfirst, etc.)
- Data and image export

## Quick Start

### Prerequisites

- Node.js (v16+)
- npm

### Install

```bash
npm install
```

### Electron (Desktop)

```bash
npm run build:main
npm run build:render
npm start
```

### Web (Browser)

```bash
npm run build:web
npx serve dist-web
```

Then open `http://localhost:3000` in your browser.

## Usage

1. **Load a graph**: Click "Open" to load a `.col` file, or drag and drop it onto the window. Load start/target data from a `.dat` file.
2. **Edit the graph**: Toggle "Edit" mode to add nodes (click canvas), add edges (drag between nodes), or remove elements.
3. **Run the solver**: Click "Run" to compute the shortest reconfiguration sequence.
4. **View results**: Step through the solution with "Previous" / "Next" buttons.

### Input Format

Graph file (`.col`):
```
p 7 7
e 1 2
e 1 3
e 2 7
...
```

Start/target file (`.dat`):
```
s 3 6 7
t 4 5 7
```

## Tech Stack

- **Frontend**: React 17, TypeScript, Cytoscape.js, MUI, Emotion
- **Desktop**: Electron
- **Web**: Webpack 5, Web Workers
- **Testing**: Jest

## License

MIT
