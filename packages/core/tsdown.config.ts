import { defineConfig } from 'tsdown';

export default defineConfig({
  // Engine entry — re-exports the dither/character/canvas/shader/video/animate
  // classes from the root `engine/` directory.
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  // Proper bundled .d.ts / .d.cts (replaces the old "copy source as .d.ts" hack).
  dts: true,
  // Zero-dependency engine; bundle everything. No "use client" here, so a single
  // bundle per format is fine (unbundle is only needed for the React package).
  platform: 'neutral',
  sourcemap: true,
  clean: true,
});
