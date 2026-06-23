import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("project", () => {
  test("package.json", () => expect(existsSync(join(ROOT, "package.json"))).toBe(true));
  test("registry.json", () => expect(existsSync(join(ROOT, "registry.json"))).toBe(true));
  test("cli/index.ts", () => expect(existsSync(join(ROOT, "cli/index.ts"))).toBe(true));
});

describe("dither engine", () => {
  test("dither.css has all patterns", () => {
    const c = readFileSync(join(ROOT, "engine/dither.css"), "utf-8");
    for (const p of ["bayer","floyd","crosshatch","diagonal","dots","noise","scanlines","checker","blocks-25","blocks-50","blocks-75","blocks-100"])
      expect(c).toContain(`--sk-dither-${p}`);
  });
  test("ASCII block chars", () => {
    const c = readFileSync(join(ROOT, "engine/dither.css"), "utf-8");
    for (const ch of ["░","▒","▓","█"]) expect(c).toContain(ch);
  });
  test("box-drawing chars", () => {
    const c = readFileSync(join(ROOT, "engine/dither.css"), "utf-8");
    for (const ch of ["┌","┐","└","┘","─","│"]) expect(c).toContain(ch);
  });
  test("animations", () => {
    const c = readFileSync(join(ROOT, "engine/dither.css"), "utf-8");
    for (const a of ["sk-pulse-dither","sk-morph-dither","sk-scan-down","sk-blink-block"])
      expect(c).toContain(`@keyframes ${a}`);
  });
});

describe("characters engine", () => {
  test("characters.ts exists", () => expect(existsSync(join(ROOT, "engine/characters.ts"))).toBe(true));
  test("70+ char palette defined", () => {
    const c = readFileSync(join(ROOT, "engine/characters.ts"), "utf-8");
    expect(c).toContain("CHAR_PALETTE");
    expect(c.split("brightness:").length - 1).toBeGreaterThan(50);
  });
  test("ramp presets", () => {
    const c = readFileSync(join(ROOT, "engine/characters.ts"), "utf-8");
    for (const r of ["blocks","extended","letters","minimal","artistic","technical","ultra","halftone"])
      expect(c).toContain(r);
  });
  test("dither.ts has all algorithms", () => {
    const c = readFileSync(join(ROOT, "engine/dither.ts"), "utf-8");
    for (const a of ["floydSteinberg","bayerOrdered","atkinson","sierra","thresholdOnly"])
      expect(c).toContain(a);
  });
  test("canvas.ts has image-to-ASCII", () => {
    const c = readFileSync(join(ROOT, "engine/canvas.ts"), "utf-8");
    expect(c).toContain("fromImage");
    expect(c).toContain("fromUrl");
    expect(c).toContain("ditherImageData");
  });
});

describe("tokens", () => {
  test("tokens.css has core tokens", () => {
    const c = readFileSync(join(ROOT, "engine/tokens.css"), "utf-8");
    expect(c).toContain("--sk-background");
    expect(c).toContain("--sk-font-mono");
    expect(c).toContain("--sk-radius");
    expect(c).toContain("--sk-space-");
    expect(c).toContain("--sk-border-color");
    expect(c).toContain("--sk-border-width");
  });
  test("default radius is square", () => {
    expect(readFileSync(join(ROOT, "engine/tokens.css"), "utf-8")).toMatch(/--sk-radius:\s+0px;/);
  });
});

describe("themes", () => {
  for (const t of ["default","brutal","terminal","print","grain"]) {
    test(`${t}.css`, () => {
      const p = join(ROOT, "themes", `${t}.css`);
      expect(existsSync(p)).toBe(true);
      const c = readFileSync(p, "utf-8");
      expect(c).toContain("--sk-background");
      expect(c).toContain("--sk-dither-pattern");
      expect(c).toContain("--sk-border-color");
    });
  }
});

describe("components", () => {
  const reg = JSON.parse(readFileSync(join(ROOT, "registry.json"), "utf-8"));
  test("32 components (14 core + 15 AI + 3 layout/dataviz/motion)", () => {
    expect(reg.components.length).toBe(32);
    expect(reg.components.filter((c: any) => c.category === "core").length).toBe(14);
    expect(reg.components.filter((c: any) => c.category === "ai").length).toBe(15);
    expect(reg.components.filter((c: any) => c.category === "layout").length).toBe(1);
    expect(reg.components.filter((c: any) => c.category === "dataviz").length).toBe(1);
    expect(reg.components.filter((c: any) => c.category === "motion").length).toBe(1);
  });
  for (const c of reg.components) {
    describe(c.name, () => {
      for (const f of c.files) test(`${f}`, () => expect(existsSync(join(ROOT, "components", c.name, f))).toBe(true));
      test("uses --sk-* tokens", () => {
        const css = join(ROOT, "components", c.name, `${c.name}.css`);
        if (existsSync(css)) expect(readFileSync(css, "utf-8")).toMatch(/var\(--sk-/);
      });
    });
  }
});

describe("CLI", () => {
  test("init command exists", () => {
    const c = readFileSync(join(ROOT, "cli/index.ts"), "utf-8");
    expect(c).toContain("async function init");
  });
  test("add command exists", () => {
    const c = readFileSync(join(ROOT, "cli/index.ts"), "utf-8");
    expect(c).toContain("async function add");
  });
  test("theme command exists", () => {
    const c = readFileSync(join(ROOT, "cli/index.ts"), "utf-8");
    expect(c).toContain("async function theme");
  });
  test("doctor command exists", () => {
    const c = readFileSync(join(ROOT, "cli/index.ts"), "utf-8");
    expect(c).toContain("async function doctor");
  });
  test("help text lists components", () => {
    const c = readFileSync(join(ROOT, "cli/index.ts"), "utf-8");
    expect(c).toContain("Add all");
  });
});

describe("MCP Server", () => {
  test("index.ts exists", () => expect(existsSync(join(ROOT, "packages", "mcp-server", "src", "index.ts"))).toBe(true));
  test("schema/index.ts exists", () => expect(existsSync(join(ROOT, "packages", "mcp-server", "src", "schema", "index.ts"))).toBe(true));
  test("schema has componentSchema", () => {
    const c = readFileSync(join(ROOT, "packages", "mcp-server", "src", "schema", "index.ts"), "utf-8");
    expect(c).toContain("export const componentSchema");
  });
  test("schema has themeRegistry", () => {
    const c = readFileSync(join(ROOT, "packages", "mcp-server", "src", "schema", "index.ts"), "utf-8");
    expect(c).toContain("export const themeRegistry");
  });
  test("schema has propContracts", () => {
    const c = readFileSync(join(ROOT, "packages", "mcp-server", "src", "schema", "index.ts"), "utf-8");
    expect(c).toContain("export const propContracts");
  });
  test("schema has patterns", () => {
    const c = readFileSync(join(ROOT, "packages", "mcp-server", "src", "schema", "index.ts"), "utf-8");
    expect(c).toContain("export const patterns");
  });
});

describe("No unused files", () => {
  test("no .godot directory (cleaned up)", () => {
    expect(existsSync(join(ROOT, ".godot"))).toBe(false);
  });
  test("no GoldenSpiral directory (cleaned up)", () => {
    expect(existsSync(join(ROOT, "GoldenSpiral"))).toBe(false);
  });
  // De-clutter guards (Milestone 1A): these were removed and must not return.
  test("loom framework removed (packages/api)", () => {
    expect(existsSync(join(ROOT, "packages", "api"))).toBe(false);
  });
  test("registry-api removed (folded into apps/docs)", () => {
    expect(existsSync(join(ROOT, "apps", "registry-api"))).toBe(false);
  });
  test("static templates removed", () => {
    expect(existsSync(join(ROOT, "templates"))).toBe(false);
  });
  test("demo removed (folded into apps/docs)", () => {
    expect(existsSync(join(ROOT, "demo"))).toBe(false);
  });
});
