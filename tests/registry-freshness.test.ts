/**
 * Registry freshness guards: the shadcn-spec registry that wraps the canonical
 * `registry.json` must cover every component, and `public/r/*.json` (the
 * shadcn-built artifact docs + CLI fetch) must include one file per spec item.
 */
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const canonical = JSON.parse(readFileSync(join(ROOT, "registry.json"), "utf-8")) as {
  components: Array<{ name: string }>;
};
const specPath = join(ROOT, "apps/docs/registry.json");
const spec = existsSync(specPath)
  ? (JSON.parse(readFileSync(specPath, "utf-8")) as { items: Array<{ name: string; files?: Array<{ path: string; content?: string; target: string }> }> })
  : { items: [] };

describe("registry freshness", () => {
  test("spec covers engine + every canonical component", () => {
    const specNames = new Set(spec.items.map((i) => i.name));
    expect(specNames.has("skeehn-engine")).toBe(true);
    const missing = canonical.components.filter((c) => !specNames.has(c.name));
    expect(missing.map((c) => c.name)).toEqual([]);
  });

  test("spec item names are unique", () => {
    const names = spec.items.map((i) => i.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test("every spec item has at least one file", () => {
    for (const item of spec.items) {
      expect(item.files?.length ?? 0).toBeGreaterThan(0);
    }
  });

  test("public/r/ contains one built JSON per spec item", () => {
    const built = new Set(
      readdirSync(join(ROOT, "apps/docs/public/r")).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")),
    );
    for (const item of spec.items) {
      expect(built.has(item.name)).toBe(true);
    }
  });

  test("built r/*.json carry inlined content for every file entry", () => {
    const rPath = join(ROOT, "apps/docs/public/r/button.json");
    const item = JSON.parse(readFileSync(rPath, "utf-8")) as {
      files: Array<{ path: string; content: string; target: string; type: string }>;
    };
    expect(item.files.length).toBeGreaterThan(0);
    for (const f of item.files) {
      expect(typeof f.content).toBe("string");
      expect(f.content.length).toBeGreaterThan(0);
      expect(f.target.startsWith("components/ui/") || f.target.startsWith("styles/skeehn/")).toBe(true);
    }
    // the React wrapper entry always first + typed as registry:ui
    expect(item.files[0].target.startsWith("components/ui/")).toBe(true);
    expect(item.files[0].type).toBe("registry:ui");
  });
});
