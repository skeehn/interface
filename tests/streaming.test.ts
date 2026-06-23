import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { closeOpenFences, hasOpenFence } from "../packages/react/src/lib/streaming-markdown";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("streaming-markdown (Phase C)", () => {
  test("closeOpenFences leaves balanced markdown untouched", () => {
    const md = "intro\n```ts\nconst x = 1;\n```\noutro";
    expect(closeOpenFences(md)).toBe(md);
  });

  test("closeOpenFences virtually closes an unclosed fence", () => {
    const out = closeOpenFences("here is code\n```ts\nconst x = 1");
    expect(out.endsWith("```")).toBe(true);
    expect((out.match(/```/g) ?? []).length).toBe(2);
  });

  test("closeOpenFences matches the opening fence char + length (tilde)", () => {
    const out = closeOpenFences("~~~\ncode");
    expect(out.endsWith("~~~")).toBe(true);
  });

  test("closeOpenFences leaves plain prose untouched", () => {
    expect(closeOpenFences("just some text, no fences")).toBe("just some text, no fences");
  });

  test("hasOpenFence detects open vs closed", () => {
    expect(hasOpenFence("```\ncode")).toBe(true);
    expect(hasOpenFence("```\ncode\n```")).toBe(false);
    expect(hasOpenFence("no code here")).toBe(false);
  });
});

describe("streaming hooks + exports (Phase C)", () => {
  test("usePacedText + useStickyScroll are exported", async () => {
    const mod = await import("../packages/react/src/hooks/index.ts");
    expect(typeof mod.usePacedText).toBe("function");
    expect(typeof mod.useStickyScroll).toBe("function");
  });

  test("main entry re-exports streaming-markdown helpers", async () => {
    const mod = await import("../packages/react/src/index.tsx");
    expect(typeof mod.closeOpenFences).toBe("function");
    expect(typeof mod.hasOpenFence).toBe("function");
  });

  test("StreamingText supports a block/line caret", () => {
    const src = readFileSync(join(ROOT, "packages/react/src/components/StreamingText.tsx"), "utf-8");
    expect(src).toContain("caret");
    expect(src).toContain("data-caret");
    const css = readFileSync(join(ROOT, "components/streaming-text/streaming-text.css"), "utf-8");
    expect(css).toContain('[data-caret="block"]');
    expect(css).toContain('[data-caret="line"]');
  });

  test("ThinkingBlock dims live reasoning while thinking", () => {
    const css = readFileSync(join(ROOT, "components/thinking-block/thinking-block.css"), "utf-8");
    expect(css).toMatch(/\[data-state="thinking"\][^}]*opacity/);
  });
});
