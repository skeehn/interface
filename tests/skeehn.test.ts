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
    for (const a of ["sk-dither-pulse","sk-dither-morph","sk-dither-scan","sk-ascii-blink"])
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
    expect(readFileSync(join(ROOT, "engine/tokens.css"), "utf-8")).toContain("--sk-radius: 0;");
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

describe("demo", () => {
  test("index.html exists", () => expect(existsSync(join(ROOT, "demo/index.html"))).toBe(true));
  test("loads all CSS", () => {
    const h = readFileSync(join(ROOT, "demo/index.html"), "utf-8");
    for (const c of ["button","card","input","badge","alert","dialog","tabs","toggle","progress","avatar","tooltip","dropdown","table","accordion"])
      expect(h).toContain(`${c}.css`);
  });
  test("live controls", () => {
    const h = readFileSync(join(ROOT, "demo/index.html"), "utf-8");
    expect(h).toContain('id="theme-sel"');
    expect(h).toContain('id="search-input"');
    expect(h).toContain('id="img-upload"');
  });
  test("ASCII art demo", () => {
    const h = readFileSync(join(ROOT, "demo/index.html"), "utf-8");
    expect(h).toContain("img-upload");
    expect(h).toContain("text-input");
    expect(h).toContain("ascii-out");
  });
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
  test("density command exists", () => {
    const c = readFileSync(join(ROOT, "cli/index.ts"), "utf-8");
    expect(c).toContain("async function density");
  });
  test("mcp command exists", () => {
    const c = readFileSync(join(ROOT, "cli/index.ts"), "utf-8");
    expect(c).toContain("async function mcp");
  });
  test("generate command exists", () => {
    const c = readFileSync(join(ROOT, "cli/index.ts"), "utf-8");
    expect(c).toContain("async function generate");
  });
  test("schema command exists", () => {
    const c = readFileSync(join(ROOT, "cli/index.ts"), "utf-8");
    expect(c).toContain("async function schema");
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

describe("loom API", () => {
  test("index.ts exists", () => expect(existsSync(join(ROOT, "packages", "api", "src", "index.ts"))).toBe(true));
  test("has Loom class", () => {
    const c = readFileSync(join(ROOT, "packages", "api", "src", "index.ts"), "utf-8");
    expect(c).toContain("export class Loom");
  });
  test("has MCP tool generation", () => {
    const c = readFileSync(join(ROOT, "packages", "api", "src", "index.ts"), "utf-8");
    expect(c).toContain("mcpTools");
    expect(c).toContain("mcpTool");
  });
  test("has OpenAPI generation", () => {
    const c = readFileSync(join(ROOT, "packages", "api", "src", "index.ts"), "utf-8");
    expect(c).toContain("openapi");
    expect(c).toContain("OpenAPI");
  });
  test("has streaming support", () => {
    const c = readFileSync(join(ROOT, "packages", "api", "src", "index.ts"), "utf-8");
    expect(c).toContain("handleStream");
    expect(c).toContain("LoomStream");
  });
});

describe("Registry API", () => {
  test("index.ts exists", () => expect(existsSync(join(ROOT, "apps", "registry-api", "index.ts"))).toBe(true));
  test("uses loom", () => {
    const c = readFileSync(join(ROOT, "apps", "registry-api", "index.ts"), "utf-8");
    expect(c).toContain("from \"../../packages/api/src/index.js\"");
  });
  test("has component endpoints", () => {
    const c = readFileSync(join(ROOT, "apps", "registry-api", "index.ts"), "utf-8");
    expect(c).toContain("/api/components");
  });
  test("has theme endpoints", () => {
    const c = readFileSync(join(ROOT, "apps", "registry-api", "index.ts"), "utf-8");
    expect(c).toContain("/api/themes");
  });
  test("has search endpoint", () => {
    const c = readFileSync(join(ROOT, "apps", "registry-api", "index.ts"), "utf-8");
    expect(c).toContain("/api/search");
  });
  test("has MCP tools endpoint", () => {
    const c = readFileSync(join(ROOT, "apps", "registry-api", "index.ts"), "utf-8");
    expect(c).toContain("/api/mcp/tools");
  });
});

describe("No unused files", () => {
  test("no .godot directory (cleaned up)", () => {
    expect(existsSync(join(ROOT, ".godot"))).toBe(false);
  });
  test("no GoldenSpiral directory (cleaned up)", () => {
    expect(existsSync(join(ROOT, "GoldenSpiral"))).toBe(false);
  });
});
