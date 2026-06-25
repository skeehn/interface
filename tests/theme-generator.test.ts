import { describe, test, expect } from "bun:test";
import { hexToHsl, deriveTheme, toCss, toStyleVars } from "../apps/docs/src/lib/theme-generator";

describe("hexToHsl", () => {
  test("black / white extremes", () => {
    expect(hexToHsl("#000000")[2]).toBe(0);
    const white = hexToHsl("#ffffff");
    expect(white[1]).toBe(0);
    expect(white[2]).toBe(100);
  });
  test("violet hue is in range", () => {
    const [h] = hexToHsl("#7c3aed");
    expect(h).toBeGreaterThan(245);
    expect(h).toBeLessThan(275);
  });
  test("tolerates a missing #", () => {
    expect(hexToHsl("7c3aed")[0]).toBeGreaterThan(245);
  });
});

describe("deriveTheme", () => {
  test("produces light + dark token maps with the full contract", () => {
    const t = deriveTheme({ color: "#0ea5e9", radius: 10 });
    expect(t.radius).toBe(10);
    for (const key of ["background", "foreground", "accent", "accent-foreground", "border-color", "ring"]) {
      expect(t.light[key]).toBeDefined();
      expect(t.dark[key]).toBeDefined();
    }
    // accent carries the brand hue (~199 for sky)
    expect(t.light.accent.startsWith(String(t.hue))).toBe(true);
  });

  test("light accent stays readable (not too light) and dark accent brightens", () => {
    const t = deriveTheme({ color: "#7c3aed" });
    const lL = Number(t.light.accent.split(" ")[2].replace("%", ""));
    const dL = Number(t.dark.accent.split(" ")[2].replace("%", ""));
    expect(lL).toBeLessThanOrEqual(50);
    expect(dL).toBeGreaterThan(lL);
  });
});

describe("toCss", () => {
  test("emits light + dark selectors with tokens + radius", () => {
    const css = toCss("brand", deriveTheme({ color: "#10b981", radius: 6 }));
    expect(css).toContain('[data-theme="brand"]');
    expect(css).toContain('[data-theme="brand-dark"]');
    expect(css).toContain("--sk-accent:");
    expect(css).toContain("--sk-radius: 6px");
    expect(css).toContain("color-scheme: light");
    expect(css).toContain("color-scheme: dark");
  });
});

describe("toStyleVars", () => {
  test("maps tokens to --sk-* custom properties", () => {
    const t = deriveTheme({ color: "#f97316", radius: 8 });
    const vars = toStyleVars(t.light, 8);
    expect(vars["--sk-accent"]).toBe(t.light.accent);
    expect(vars["--sk-radius"]).toBe("8px");
    expect(vars["--sk-dither-opacity"]).toBe("0");
  });
});
