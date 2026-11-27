# Web Experiments Collection

A collection of small browser tools and experiments, built as one [Vite](https://vite.dev) multi-page app and deployed to GitHub Pages.

## Projects

| Tool | What it does |
|---|---|
| [Audio Visualizer](./audio-visualizer-from-microphone/) | Real-time visualization of microphone input (bars, waves, circles, audio-reactive fractal), with microphone selection and fullscreen |
| [Network Tools](./network-tools/) | CIDR calculator (network/broadcast address, usable host range, mask) and an "is this IP in the range?" check |
| [Camera Utils](./camera-utils/) | Camera preview and capture with filters (invert, grayscale, sepia, ASCII art, pixelate, edge detection) and image download |

Each tool has its own `README.md`, which is also shown in the tool's "Documentation" panel.

## Getting started

Requires [Bun](https://bun.sh/docs/installation).

```bash
bun install
bun run dev
```

`bun run dev` starts the Vite dev server with hot reload and opens the landing page.

| Command | What it does |
|---|---|
| `bun run dev` | Dev server with hot reload |
| `bun run build` | Typecheck (`tsc`) and build all pages into `dist/` |
| `bun run preview` | Serve the built `dist/` locally |
| `bun run test` | Run the unit tests (Vitest) |
| `bun run typecheck` | Typecheck only |

The microphone and camera need a secure context: `localhost` works, a hosted copy needs HTTPS (GitHub Pages provides it).

## Layout

```text
index.html, src/                  landing page
audio-visualizer-from-microphone/ index.html, README.md, src/
network-tools/                    index.html, README.md, src/  (tests next to the code: *.test.ts)
camera-utils/                     index.html, README.md, src/
shared/docs.ts                    renders a tool's README (marked + DOMPurify)
vite.config.ts                    lists every page as a build input
```

### Adding a tool

1. Create `<tool>/index.html`, `<tool>/README.md` and `<tool>/src/script.ts`, and reference the script with `<script type="module" src="./src/script.ts">`.
2. Render the docs from the script: `import readme from '../README.md?raw'` and `renderDocs(readme)` from `shared/docs`.
3. Add the page to `build.rollupOptions.input` in `vite.config.ts`.
4. Add a card to the landing page (`index.html`) and a row to the table above.

## Deployment

`.github/workflows/static.yml` runs on every push and pull request: install, test, typecheck and build with Bun. On `main`, the `dist/` folder is deployed to GitHub Pages. The build uses a relative base (`./`), so it works under the repository's Pages path.

## Browser support

Current Chromium, Firefox and Safari. The tools use ES modules, the Web Audio API, `getUserMedia` and Canvas.

## Disclaimer

Built with help from AI coding assistants (GitHub Copilot and Claude). Please verify results independently before relying on them, especially the network calculations.
