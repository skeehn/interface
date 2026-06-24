import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("HTML examples exist for all components", () => {
  const reg = JSON.parse(readFileSync(join(ROOT, "registry.json"), "utf-8"));

  for (const comp of reg.components) {
    test(`${comp.name} has HTML example`, () => {
      const htmlPath = join(ROOT, "components", comp.name, `${comp.name}.html`);
      expect(existsSync(htmlPath)).toBe(true);
    });
  }
});

describe("interactive components have JS", () => {
  const jsComponents = ["dialog", "tabs", "toggle", "dropdown", "accordion", "chat-bubble", "streaming-text", "code-block"];

  for (const name of jsComponents) {
    test(`${name} has JS file`, () => {
      const jsPath = join(ROOT, "components", name, `${name}.js`);
      expect(existsSync(jsPath)).toBe(true);
    });
  }
});

describe("ARIA attributes in HTML examples", () => {
  const ariaComponents = [
    { name: "alert", attrs: ['role="alert"'] },
    { name: "progress", attrs: ['role="progressbar"', 'aria-valuenow'] },
    { name: "tabs", attrs: ['role="tablist"', 'role="tab"', 'aria-selected'] },
    { name: "toggle", attrs: ['role="switch"'] },
    { name: "dropdown", attrs: ['aria-haspopup', 'role="menu"'] },
    { name: "accordion", attrs: ['aria-expanded'] },
    { name: "tooltip", attrs: ['role="tooltip"'] },
    { name: "typing-indicator", attrs: ['role="status"'] },
    { name: "dataviz", attrs: ['role="img"'] },
  ];

  for (const { name, attrs } of ariaComponents) {
    test(`${name} includes ARIA: ${attrs.join(', ')}`, () => {
      const htmlPath = join(ROOT, "components", name, `${name}.html`);
      if (!existsSync(htmlPath)) return;
      const html = readFileSync(htmlPath, "utf-8");
      for (const attr of attrs) {
        expect(html).toContain(attr);
      }
    });
  }
});

describe("keyboard navigation in JS files", () => {
  const keyboardComponents = [
    { name: "tabs", keys: ["ArrowRight", "ArrowLeft"] },
    { name: "dropdown", keys: ["Escape", "ArrowDown"] },
    { name: "accordion", keys: ["ArrowDown", "ArrowUp"] },
  ];

  for (const { name, keys } of keyboardComponents) {
    test(`${name} handles keyboard: ${keys.join(', ')}`, () => {
      const jsPath = join(ROOT, "components", name, `${name}.js`);
      if (!existsSync(jsPath)) return;
      const js = readFileSync(jsPath, "utf-8");
      for (const key of keys) {
        expect(js).toContain(key);
      }
    });
  }
});

describe("new AI components", () => {
  test("code-block has CSS", () => {
    expect(existsSync(join(ROOT, "components/code-block/code-block.css"))).toBe(true);
  });

  test("code-block has JS with clipboard", () => {
    const js = readFileSync(join(ROOT, "components/code-block/code-block.js"), "utf-8");
    expect(js).toContain("clipboard");
    expect(js).toContain("writeText");
  });

  test("typing-indicator has CSS with animation", () => {
    const css = readFileSync(join(ROOT, "components/typing-indicator/typing-indicator.css"), "utf-8");
    expect(css).toContain("sk-typing-bounce");
    expect(css).toContain("prefers-reduced-motion");
  });

  test("typing-indicator has ASCII variant", () => {
    const css = readFileSync(join(ROOT, "components/typing-indicator/typing-indicator.css"), "utf-8");
    expect(css).toContain('data-variant="ascii"');
    expect(css).toContain("░");
    expect(css).toContain("▒");
    expect(css).toContain("▓");
  });

  test("markdown renderer has CSS", () => {
    expect(existsSync(join(ROOT, "components/markdown/markdown.css"))).toBe(true);
  });

  test("markdown renderer has JS", () => {
    const js = readFileSync(join(ROOT, "components/markdown/markdown.js"), "utf-8");
    expect(js).toContain("SkMarkdown");
    expect(js).toContain("render");
  });

  test("streaming-text has JS with real streaming", () => {
    const js = readFileSync(join(ROOT, "components/streaming-text/streaming-text.js"), "utf-8");
    expect(js).toContain("SkStreamingText");
    expect(js).toContain("stream");
    expect(js).toContain("streamTokens");
    expect(js).toContain("AbortController");
  });

  test("chat-bubble has JS with actions", () => {
    const js = readFileSync(join(ROOT, "components/chat-bubble/chat-bubble.js"), "utf-8");
    expect(js).toContain("chat:retry");
    expect(js).toContain("chat:edit");
    expect(js).toContain("clipboard");
  });
});

describe("engine files", () => {
  test("shader.ts exists and has WebGL", () => {
    const ts = readFileSync(join(ROOT, "engine/shader.ts"), "utf-8");
    expect(ts).toContain("DitherShader");
    expect(ts).toContain("WebGLRenderingContext");
    expect(ts).toContain("BAYER_DITHER_FRAGMENT");
    expect(ts).toContain("gl_FragColor");
  });

  test("video.ts exists with pipeline", () => {
    const ts = readFileSync(join(ROOT, "engine/video.ts"), "utf-8");
    expect(ts).toContain("VideoAsciiPipeline");
    expect(ts).toContain("ServerRenderer");
    expect(ts).toContain("requestAnimationFrame");
  });

  test("worker.ts exists with pool", () => {
    const ts = readFileSync(join(ROOT, "engine/worker.ts"), "utf-8");
    expect(ts).toContain("DitherWorkerPool");
    expect(ts).toContain("workerMain");
    expect(ts).toContain("postMessage");
  });

  test("animate.ts exists with effects", () => {
    const ts = readFileSync(join(ROOT, "engine/animate.ts"), "utf-8");
    expect(ts).toContain("AsciiAnimation");
    expect(ts).toContain("rain");
    expect(ts).toContain("flow");
    expect(ts).toContain("pulse");
    expect(ts).toContain("matrix");
    expect(ts).toContain("prefers-reduced-motion");
  });

  test("canvas.ts has SSR guard", () => {
    const ts = readFileSync(join(ROOT, "engine/canvas.ts"), "utf-8");
    expect(ts).toContain("typeof document === 'undefined'");
  });
});

describe("CSS token consistency", () => {
  const reg = JSON.parse(readFileSync(join(ROOT, "registry.json"), "utf-8"));

  for (const comp of reg.components) {
    const cssPath = join(ROOT, "components", comp.name, `${comp.name}.css`);
    if (!existsSync(cssPath)) continue;

    test(`${comp.name} uses --sk-* tokens`, () => {
      const css = readFileSync(cssPath, "utf-8");
      expect(css).toMatch(/var\(--sk-/);
    });

    test(`${comp.name} uses a font token (sans/mono) or inherits`, () => {
      const css = readFileSync(cssPath, "utf-8");
      // Dual-font system: chrome (labels/code/metadata) uses --sk-font-mono,
      // prose surfaces (chat/markdown/reasoning) use --sk-font-sans, and
      // transparent wrappers (e.g. streaming-text) inherit the surrounding font.
      // The invariant is token discipline: never a hardcoded font stack.
      expect(css).toMatch(/var\(--sk-font-(mono|sans)\b|font:\s*inherit/);
    });
  }
});

describe("reduced-motion support", () => {
  const animatedCSS = ["dither.css", "motion/motion.css", "typing-indicator/typing-indicator.css"];

  for (const file of animatedCSS) {
    test(`${file} respects prefers-reduced-motion`, () => {
      const paths = [
        join(ROOT, "engine", file),
        join(ROOT, "components", file),
      ];
      const p = paths.find(existsSync);
      if (!p) return;
      const css = readFileSync(p, "utf-8");
      expect(css).toContain("prefers-reduced-motion");
    });
  }
});
