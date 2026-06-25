import { test, expect } from "bun:test";
import { Glob } from "bun";
import { basename } from "node:path";

// Guard: every component source must have a matching test file, so a new
// component can't land without tests. cwd-independent (derives the package root
// from import.meta.url) so it works whether `bun test` runs from root or here.
const pkgRoot = new URL("../", import.meta.url).pathname;

test("every component source has a matching test file", () => {
  const comps = [...new Glob("src/components/*.tsx").scanSync({ cwd: pkgRoot })].map((f) =>
    basename(f, ".tsx"),
  );
  const tests = new Set(
    [...new Glob("test/*.test.tsx").scanSync({ cwd: pkgRoot })].map((f) =>
      basename(f, ".test.tsx"),
    ),
  );
  const missing = comps.filter((c) => !tests.has(c));
  expect(missing).toEqual([]);
  expect(comps.length).toBeGreaterThanOrEqual(32);
});
