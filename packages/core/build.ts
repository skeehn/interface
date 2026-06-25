#!/usr/bin/env bun
/**
 * @skeehn/core asset pipeline.
 *
 * Runs AFTER `tsdown` has emitted dist/index.{js,cjs} + dist/index.d.{ts,cts}.
 * This step handles everything tsdown can't:
 *   1. concatenate engine CSS            → dist/skeehn.css (+ dist/css/*.css)
 *   2. build a batteries-included sheet  → dist/styles.css (engine + every
 *      component + the default theme, so `import '@skeehn/core/styles.css'`
 *      yields fully-styled components with zero Tailwind / build config)
 *   3. copy components/ themes/ registry.json into dist/
 */

import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dir, '../..');
const DIST = resolve(import.meta.dir, 'dist');

mkdirSync(join(DIST, 'css'), { recursive: true });
console.log('▦ @skeehn/core assets...');

// ─── 1. Engine CSS → skeehn.css (+ individual files) ─────────────
const ENGINE_CSS = ['reset.css', 'tokens.css', 'dither.css', 'animation.css'];
const engineBundle: string[] = [
  '/* @skeehn/core — engine CSS */',
  '/* order: reset → tokens → dither → animation */',
  '',
];
for (const file of ENGINE_CSS) {
  const path = join(ROOT, 'engine', file);
  if (!existsSync(path)) continue;
  const content = readFileSync(path, 'utf-8');
  engineBundle.push(`/* ═══ ${file} ═══ */`, content, '');
  writeFileSync(join(DIST, 'css', file), content);
}
writeFileSync(join(DIST, 'skeehn.css'), engineBundle.join('\n'));
console.log('  ✓ dist/skeehn.css + dist/css/*.css');

// ─── 2. Copy components / themes / registry ──────────────────────
const componentsDir = join(ROOT, 'components');
if (existsSync(componentsDir)) cpSync(componentsDir, join(DIST, 'components'), { recursive: true });
const themesDir = join(ROOT, 'themes');
if (existsSync(themesDir)) cpSync(themesDir, join(DIST, 'themes'), { recursive: true });
const registryPath = join(ROOT, 'registry.json');
if (existsSync(registryPath)) cpSync(registryPath, join(DIST, 'registry.json'));
console.log('  ✓ dist/components/ dist/themes/ dist/registry.json');

// ─── 3. Batteries-included styles.css ────────────────────────────
const all: string[] = [
  '/* @skeehn/core — batteries-included stylesheet */',
  '/* engine → every component → default theme. No Tailwind required. */',
  '',
  readFileSync(join(DIST, 'skeehn.css'), 'utf-8'),
];
let componentCount = 0;
if (existsSync(componentsDir)) {
  for (const entry of readdirSync(componentsDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    const dir = join(componentsDir, entry.name);
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.css')).sort()) {
      all.push(`/* ═══ component: ${entry.name}/${file} ═══ */`, readFileSync(join(dir, file), 'utf-8'), '');
      componentCount++;
    }
  }
}
// Ship the neutral Light + Dark default (the Editorial/dither look is an opt-in
// flagship; import themes/default.css for it).
for (const t of ['light', 'dark']) {
  const themeFile = join(ROOT, 'themes', `${t}.css`);
  if (existsSync(themeFile)) {
    all.push(`/* ═══ theme: ${t} (neutral default) ═══ */`, readFileSync(themeFile, 'utf-8'), '');
  }
}
writeFileSync(join(DIST, 'styles.css'), all.join('\n'));
console.log(`  ✓ dist/styles.css (engine + ${componentCount} component sheets + neutral Light/Dark default)`);

console.log('▦ @skeehn/core assets complete.\n');
