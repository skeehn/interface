#!/usr/bin/env bun
/**
 * @skeehn/core build script
 *
 * Bundles engine TypeScript into dist/index.js,
 * concatenates CSS into dist/skeehn.css,
 * and copies component/theme/registry files.
 */

import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dir, '../..');
const DIST = resolve(import.meta.dir, 'dist');

// Clean dist
if (existsSync(DIST)) {
  cpSync(DIST, DIST, { recursive: true }); // no-op, but we'll overwrite
}
mkdirSync(DIST, { recursive: true });
mkdirSync(join(DIST, 'css'), { recursive: true });

console.log('▦ @skeehn/core build starting...\n');

// ─── 1. Bundle engine TypeScript ──────────────────────────────────
console.log('  → Bundling engine TypeScript...');
const result = await Bun.build({
  entrypoints: [resolve(import.meta.dir, 'src/index.ts')],
  outdir: DIST,
  target: 'browser',
  format: 'esm',
  minify: false,
  splitting: false,
  sourcemap: 'external',
  external: [],
});

if (!result.success) {
  console.error('  ✗ Build failed:');
  for (const log of result.logs) {
    console.error('   ', log.message);
  }
  process.exit(1);
}
console.log('  ✓ dist/index.js');

// ─── 2. Generate type declarations ───────────────────────────────
// For now, copy the source as a .d.ts hint file
// In production, use dts-bundle-generator or tsc --declaration
console.log('  → Generating type declarations...');
try {
  const proc = Bun.spawnSync(['bunx', 'tsc', '--declaration', '--emitDeclarationOnly', '--outDir', DIST, '--project', resolve(ROOT, 'tsconfig.json')], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (proc.exitCode === 0) {
    console.log('  ✓ dist/*.d.ts');
  } else {
    // Fallback: copy source index.ts as index.d.ts placeholder
    console.log('  ⚠ tsc declarations skipped (non-zero exit), using source as .d.ts');
    const src = readFileSync(resolve(import.meta.dir, 'src/index.ts'), 'utf-8');
    writeFileSync(join(DIST, 'index.d.ts'), src);
  }
} catch {
  console.log('  ⚠ tsc not available, copying source as .d.ts placeholder');
  const src = readFileSync(resolve(import.meta.dir, 'src/index.ts'), 'utf-8');
  writeFileSync(join(DIST, 'index.d.ts'), src);
}

// ─── 3. Concatenate engine CSS → skeehn.css ──────────────────────
console.log('  → Concatenating engine CSS...');
const CSS_FILES = ['reset.css', 'tokens.css', 'dither.css', 'animation.css'];
const cssBundle: string[] = [
  '/* @skeehn/core — concatenated engine CSS */',
  '/* Order: reset → tokens → dither → animation */',
  '',
];
for (const file of CSS_FILES) {
  const path = join(ROOT, 'engine', file);
  if (existsSync(path)) {
    const content = readFileSync(path, 'utf-8');
    cssBundle.push(`/* ═══ ${file} ═══ */`);
    cssBundle.push(content);
    cssBundle.push('');
    // Also copy individual file
    writeFileSync(join(DIST, 'css', file), content);
    console.log(`  ✓ dist/css/${file}`);
  }
}
writeFileSync(join(DIST, 'skeehn.css'), cssBundle.join('\n'));
console.log('  ✓ dist/skeehn.css');

// ─── 4. Copy components ──────────────────────────────────────────
console.log('  → Copying components...');
const componentsDir = join(ROOT, 'components');
if (existsSync(componentsDir)) {
  cpSync(componentsDir, join(DIST, 'components'), { recursive: true });
  const count = readdirSync(componentsDir).filter(d => {
    try { return Bun.file(join(componentsDir, d)).name !== undefined; } catch { return true; }
  }).length;
  console.log(`  ✓ dist/components/ (${count} components)`);
}

// ─── 5. Copy themes ─────────────────────────────────────────────
console.log('  → Copying themes...');
const themesDir = join(ROOT, 'themes');
if (existsSync(themesDir)) {
  cpSync(themesDir, join(DIST, 'themes'), { recursive: true });
  const themeCount = readdirSync(themesDir).filter(f => f.endsWith('.css')).length;
  console.log(`  ✓ dist/themes/ (${themeCount} themes)`);
}

// ─── 6. Copy registry.json ──────────────────────────────────────
console.log('  → Copying registry.json...');
const registryPath = join(ROOT, 'registry.json');
if (existsSync(registryPath)) {
  cpSync(registryPath, join(DIST, 'registry.json'));
  console.log('  ✓ dist/registry.json');
}

// ─── Done ────────────────────────────────────────────────────────
console.log('\n▦ @skeehn/core build complete!\n');
