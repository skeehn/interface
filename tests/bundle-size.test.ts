import { test, expect } from "bun:test";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { Glob } from "bun";

/**
 * Bundle-size budgets — catch accidental bloat. Generous headroom over the
 * current sizes so they flag regressions, not normal growth. Skips when dist
 * isn't built (CI builds before testing).
 */
const ROOT = new URL("../", import.meta.url).pathname;
const kb = (bytes: number) => Math.round(bytes / 1024);

const FILE_BUDGETS: [string, number][] = [
  ["packages/core/dist/styles.css", 300], // batteries-included sheet (~240 KB)
  ["packages/core/dist/skeehn.css", 80], //  engine CSS (~58 KB)
];

for (const [rel, budget] of FILE_BUDGETS) {
  test(`${rel} ≤ ${budget} KB`, () => {
    const p = join(ROOT, rel);
    if (!existsSync(p)) return;
    const size = kb(statSync(p).size);
    expect(size).toBeLessThanOrEqual(budget);
  });
}

test("@skeehn/react dist JS (excl. sourcemaps) ≤ 180 KB", () => {
  const dir = join(ROOT, "packages/react/dist");
  if (!existsSync(dir)) return;
  let bytes = 0;
  for (const f of new Glob("**/*.js").scanSync({ cwd: dir })) {
    bytes += statSync(join(dir, f)).size;
  }
  expect(kb(bytes)).toBeLessThanOrEqual(180);
});
