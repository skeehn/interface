/**
 * Version consistency: all published @skeehn/* packages ship in lockstep.
 * Drift here means `npm i @skeehn/react` resolves a different engine than its
 * CSS bundle was built from — the exact class of bug the v2 contract exists to
 * prevent.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("package version lockstep", () => {
  const packages = ["core", "react", "wc", "mcp-server"];

  test("all @skeehn/* share one version", () => {
    const versions = packages.map((p) =>
      JSON.parse(readFileSync(join(ROOT, `packages/${p}/package.json`), "utf-8")).version as string,
    );
    expect(new Set(versions).size).toBe(1);
    // v2 line — no stray pre-2.0 published copies in the repo
    expect(versions[0].startsWith("2.")).toBe(true);
  });

  test("CLI version matches package version", () => {
    const cli = readFileSync(join(ROOT, "cli/index.ts"), "utf-8");
    const version = JSON.parse(readFileSync(join(ROOT, "packages/react/package.json"), "utf-8")).version as string;
    expect(cli).toContain(`VERSION = "${version}"`);
  });
});

test("docs hero status pill matches the package version", () => {
  const page = readFileSync(join(ROOT, "apps/docs/src/app/page.tsx"), "utf-8");
  const version = JSON.parse(readFileSync(join(ROOT, "packages/react/package.json"), "utf-8")).version as string;
  expect(page).toContain(`v${version}`);
});
