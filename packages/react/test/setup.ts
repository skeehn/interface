/**
 * Test preload — registers a happy-dom DOM into Bun's global scope BEFORE any
 * react-dom import sees `document`, wires jest-dom matchers into bun:test's
 * expect, auto-cleans RTL between tests, and stubs the browser APIs happy-dom
 * under-implements. Referenced from bunfig.toml `[test] preload`.
 */
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register({ url: "http://localhost/", width: 1440, height: 900 });

import { expect, afterEach } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
expect.extend(matchers as any);

import { cleanup } from "@testing-library/react";
afterEach(() => cleanup());

/* ── stubs for browser APIs happy-dom doesn't fully implement ── */

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false;
    },
  })) as any;
}

if (!("IntersectionObserver" in globalThis)) {
  class IO {
    constructor(_cb?: unknown, _opts?: unknown) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  (globalThis as any).IntersectionObserver = IO;
}

if (!("ResizeObserver" in globalThis)) {
  class RO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as any).ResizeObserver = RO;
}

if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
    setTimeout(() => cb(Date.now()), 0)) as any;
  globalThis.cancelAnimationFrame = ((id: any) => clearTimeout(id)) as any;
}

try {
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => {}, readText: async () => "" },
      configurable: true,
    });
  }
} catch {
  /* read-only in some environments — fine */
}

// Native <dialog> methods are version-dependent in happy-dom.
const dialogProto: any = (globalThis as any).HTMLDialogElement?.prototype;
if (dialogProto && typeof dialogProto.showModal !== "function") {
  dialogProto.showModal = function (this: any) {
    this.open = true;
  };
  dialogProto.show = function (this: any) {
    this.open = true;
  };
  dialogProto.close = function (this: any) {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
}
