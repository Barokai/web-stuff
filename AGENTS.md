# AGENTS.md

Instructions for AI coding agents (and humans) working in this repo. **This file is the source of truth**;
`CLAUDE.md` only imports it. Update this file when conventions or layout change.

## What this repo is

Small standalone browser tools (audio visualizer, CIDR calculator, camera filters) built as one Vite
multi-page app and deployed to GitHub Pages from `main`. No framework: plain TypeScript and DOM APIs.

## Conventions

- **Bun** for everything: `bun install`, `bun run dev | build | test | typecheck`. Don't add npm/yarn lockfiles.
- One root `package.json` and `tsconfig.json`. Tools don't get their own packages.
- Every page must be listed in `build.rollupOptions.input` in `vite.config.ts`, or it won't be deployed.
- Pages load their script as `<script type="module" src="./src/script.ts">`; Vite bundles it. Never commit `dist/`.
- Tool docs live in `<tool>/README.md` and are rendered with `renderDocs` from `shared/docs.ts` (imported with `?raw`).
  Keep them accurate when behavior changes.
- Put pure logic in `src/lib/` with a `*.test.ts` next to it (Vitest). The UI code stays thin.
- Keep the root `README.md` (tool table, commands, layout) in sync with what's actually in the repo.

## Before you finish

Run `bun run test` and `bun run build`; CI runs the same and blocks the deploy if either fails.
