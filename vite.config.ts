import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const page = (path: string) => resolve(import.meta.dirname, path);

export default defineConfig({
  // Relative base so the build works under any path, e.g. https://<user>.github.io/web-stuff/
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: page('index.html'),
        audio: page('audio-visualizer-from-microphone/index.html'),
        network: page('network-tools/index.html'),
        camera: page('camera-utils/index.html'),
      },
    },
  },
  server: {
    open: true,
  },
  test: {
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**'],
  },
});
