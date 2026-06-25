import { defineConfig } from 'tsdown';

export default defineConfig({
  // Public entry points → ".", "./hooks", "./gl", "./ai", "./blocks"
  entry: ['src/index.tsx', 'src/hooks/index.ts', 'src/gl/index.ts', 'src/ai/index.ts', 'src/blocks/index.ts'],
  format: ['esm', 'cjs'],
  // Emit .d.ts / .d.cts type declarations.
  dts: true,
  // One output file per source module (Rolldown's preserveModules). This is
  // what keeps every per-file `"use client"` directive intact for Next.js
  // App Router consumers — a single bundle would strip/merge them.
  unbundle: true,
  // React component library: no Node/browser platform assumptions; the
  // consumer's bundler decides. React stays a peer dependency.
  platform: 'neutral',
  external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  sourcemap: true,
  clean: true,
});
