#!/usr/bin/env bun
/**
 * @skeehn/react build
 * -------------------
 * 1. Bundles the TS entrypoint via Bun.
 * 2. Inlines styles.css — every @import is resolved from the source and
 *    concatenated, so consumers get a self-contained dist/styles.css that
 *    works regardless of their CSS pipeline.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';

const HERE = import.meta.dir;
const DIST = resolvePath(HERE, 'dist');
const SRC = resolvePath(HERE, 'src');

mkdirSync(DIST, { recursive: true });

// ── 1. Bundle TS entrypoint ─────────────────────────────────────────
const result = await Bun.build({
  entrypoints: [resolvePath(SRC, 'index.tsx')],
  outdir: DIST,
  target: 'browser',
  external: ['react', 'react-dom'],
});

if (!result.success) {
  console.error('Build failed:');
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

// ── 2. Inline styles.css ────────────────────────────────────────────
const IMPORT_RE = /@import\s+url\(\s*["']([^"']+)["']\s*\)\s*;?/g;

function inline(filePath: string, seen: Set<string> = new Set()): string {
  const abs = resolvePath(filePath);
  if (seen.has(abs)) return '';
  seen.add(abs);
  if (!existsSync(abs)) {
    console.warn(`  ! styles.css: missing import ${abs}`);
    return '';
  }
  const dir = dirname(abs);
  const text = readFileSync(abs, 'utf-8');
  return text.replace(IMPORT_RE, (_match, spec: string) => {
    const next = resolvePath(dir, spec);
    return `/* ↳ inlined from ${spec} */\n` + inline(next, seen);
  });
}

const styles = inline(resolvePath(SRC, 'styles.css'));
writeFileSync(resolvePath(DIST, 'styles.css'), styles);

console.log(`  ✓ dist/styles.css (${(styles.length / 1024).toFixed(1)} KB)`);
console.log('✓ @skeehn/react build complete');
