#!/usr/bin/env bun
/**
 * Generate a shadcn-compatible registry from the canonical root registry.json.
 *
 * The root `registry.json` (components[] + category) stays the source of truth —
 * it is consumed by cli/index.ts, the test suite, and @skeehn/core. This script
 * derives a shadcn-spec registry (root schema + items[]) at apps/docs/registry.json,
 * which `shadcn build` then expands into apps/docs/public/r/<name>.json files that
 * `npx shadcn add https://ui.skeehn.com/r/<name>.json` (and the shadcn MCP) consume.
 *
 * Run from anywhere:  bun run apps/docs/scripts/build-registry.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)); // apps/docs/scripts
const DOCS = resolve(HERE, '..'); // apps/docs
const ROOT = resolve(DOCS, '../..'); // repo root
const HOMEPAGE = 'https://ui.skeehn.com';

interface SrcComponent {
  name: string;
  description: string;
  files: string[];
  category: string;
}
const src = JSON.parse(readFileSync(resolve(ROOT, 'registry.json'), 'utf-8')) as {
  components: SrcComponent[];
};

const pascal = (name: string) => name.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('');
const title = (name: string) => name.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join(' ');
// shadcn build resolves file paths relative to this registry.json (apps/docs).
const rel = (p: string) => `../../${p}`;

const ENGINE = ['reset', 'tokens', 'dither', 'animation'];

const engineItem = {
  name: 'skeehn-engine',
  type: 'registry:style',
  title: 'skeehn engine',
  description:
    'skeehn engine — CSS reset, design tokens, dither patterns, animations, and the neutral Light/Dark default theme. Required by every skeehn component. (The Editorial/dither look is the opt-in default.css flagship.)',
  files: [
    ...ENGINE.map((f) => ({ path: rel(`engine/${f}.css`), type: 'registry:file', target: `styles/skeehn/${f}.css` })),
    { path: rel('themes/light.css'), type: 'registry:file', target: 'styles/skeehn/theme.css' },
    { path: rel('themes/dark.css'), type: 'registry:file', target: 'styles/skeehn/theme.dark.css' },
  ],
};

const componentItems = src.components.map((c) => {
  const Pascal = pascal(c.name);
  const files: Array<Record<string, string>> = [
    { path: rel(`packages/react/src/components/${Pascal}.tsx`), type: 'registry:ui', target: `components/ui/${Pascal}.tsx` },
  ];
  for (const f of c.files.filter((f) => f.endsWith('.css'))) {
    files.push({ path: rel(`components/${c.name}/${f}`), type: 'registry:file', target: `styles/skeehn/components/${f}` });
  }
  return {
    name: c.name,
    type: 'registry:ui',
    title: title(c.name),
    description: c.description,
    categories: [c.category],
    registryDependencies: [`${HOMEPAGE}/r/skeehn-engine.json`],
    files,
  };
});

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'skeehn',
  homepage: HOMEPAGE,
  items: [engineItem, ...componentItems],
};

writeFileSync(resolve(DOCS, 'registry.json'), JSON.stringify(registry, null, 2) + '\n');
console.log(`✓ apps/docs/registry.json — ${registry.items.length} items (1 engine + ${componentItems.length} components)`);
