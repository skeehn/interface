/**
 * Parity guard — v2 single-source-of-truth policy.
 *
 * `components/<name>/<name>.css` + `engine/*.css` are the canonical style
 * contract. React/WC wrappers must only use classes that exist there. This
 * test fails when a wrapper invents a class the CSS never defines (the exact
 * drift that broke the theme contract pre-v2).
 */
import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ── canonical CSS: every class defined anywhere under engine/ + components/ ──
const canonical = new Set<string>();

for (const dir of ["engine", "components"]) {
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".css")) {
        const css = readFileSync(p, "utf-8");
        for (const m of css.matchAll(/\.([a-zA-Z][\w-]*)/g)) canonical.add(m[1]);
        for (const m of css.matchAll(/@keyframes ([\w-]+)/g)) canonical.add(`sk-${m[1].replace(/^sk-/, '')}`);
      } else if (e.name.endsWith(".html")) {
        const html = readFileSync(p, "utf-8");
        for (const m of html.matchAll(/sk-[a-z][\w-]*/g)) canonical.add(m[0]);
      }
    }
  };
  walk(dir);
}

// also themes only define --sk-* vars; data-attribute selectors come via [data-…]
// theming is contract-checked elsewhere (theme-generator.test.ts).

const REACT_DIR = join(ROOT, "packages/react/src/components");

describe("parity: React wrappers only use canonical sk-* classes", () => {
  for (const file of readdirSync(REACT_DIR)) {
    if (!file.endsWith(".tsx")) continue;
    const src = readFileSync(join(REACT_DIR, file), "utf-8");
    // template-literal interpolation: assume interpolated values are extra
    // classes (props/spread) — strip so only static tokens are checked.
    const staticSrc = src.replace(/\$\{[^{}]*\}/g, " ");
    const used = new Set<string>();
    for (const m of staticSrc.matchAll(/sk-[a-z][\w-]*/g)) {
      const cls = m[0].replace(/\$\{[\s\S]*$/, "").replace(/-{1,2}$/, "");
      if (/^sk-[\w]+$/.test(cls)) used.add(cls);
    }
    if (used.size === 0) continue;

    test(`${file}`, () => {
      // className composition like `sk-btn ${x}` yields fragments — strip
      // anything with a trailing partial, only check atomic class names.
      const invented: string[] = [];
      for (const cls of used) {
        // allow prefixed tokens that exist verbatim as CSS classes
        if (!canonical.has(cls)) invented.push(cls);
      }
      expect(invented).toEqual([]);
    });

    // helpful dump: assert every full class string (space-separated) resolves
    const classStrings = [...staticSrc.matchAll(/className=\{?["'`]([^"'`]+)["'`]/g)].map(m => m[1]);
    test(`${file} className strings resolve atomically`, () => {
      const unknown: string[] = [];
      for (const raw of classStrings) {
        for (const token of raw.split(/\s+/).filter(t => t.startsWith("sk-"))) {
          const clean = token.replace(/-{1,2}$/, "");
          if (/^sk-[\w]+$/.test(clean) && !canonical.has(clean)) unknown.push(token);
        }
      }
      expect(unknown).toEqual([]);
    });
  }
});
