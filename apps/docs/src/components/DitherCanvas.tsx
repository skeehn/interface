"use client";

import { useEffect, useRef } from "react";

/**
 * Animated Bayer-dithered gradient background.
 * Renders a dark purple -> deep teal gradient with 4x4 ordered dither,
 * slowly shifting hue over time via requestAnimationFrame.
 *
 * Self-contained — no engine imports. Pure canvas.
 */

// 4x4 Bayer threshold matrix (normalized to 0-1)
const BAYER_4X4 = [
  [0 / 16, 8 / 16, 2 / 16, 10 / 16],
  [12 / 16, 4 / 16, 14 / 16, 6 / 16],
  [3 / 16, 11 / 16, 1 / 16, 9 / 16],
  [15 / 16, 7 / 16, 13 / 16, 5 / 16],
];

const PIXEL_SIZE = 4; // Each "dither pixel" is 4x4 screen pixels

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function lerpColor(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): [number, number, number] {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t,
  ];
}

function luminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export default function DitherCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Use lower resolution for performance — we're rendering chunky pixels anyway
      const scale = 1 / dpr;
      width = Math.ceil((canvas!.clientWidth * dpr) / PIXEL_SIZE);
      height = Math.ceil((canvas!.clientHeight * dpr) / PIXEL_SIZE);
      canvas!.width = width;
      canvas!.height = height;
    }

    resize();
    window.addEventListener("resize", resize);

    function render(time: number) {
      // Re-check dimensions on each frame (cheap comparison)
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const expectedW = Math.ceil((canvas!.clientWidth * dpr) / PIXEL_SIZE);
      const expectedH = Math.ceil((canvas!.clientHeight * dpr) / PIXEL_SIZE);
      if (expectedW !== width || expectedH !== height) {
        resize();
      }

      const img = ctx!.createImageData(width, height);
      const data = img.data;

      // Slow hue shift: cycle through color stops over ~60 seconds
      const shift = reducedMotion.current ? 0 : (time * 0.0001) % 1;

      // Color stops (HSL) — mono + brutalist gold, subtle lightness drift
      const drift = shift * 6;
      const color1 = hslToRgb(0, 0, 4 + drift * 0.2); // near-black
      const color2 = hslToRgb(0, 0, 7); // dark gray
      const color3 = hslToRgb(45, 14, 7); // warm-dark toward gold
      const color4 = hslToRgb(0, 0, 3); // black edge

      // Two "light" colors for dither mixing — gray + muted gold glow
      const light1 = hslToRgb(0, 0, 16 + drift); // mid gray
      const light2 = hslToRgb(45, 78, 30 + drift); // muted gold

      for (let y = 0; y < height; y++) {
        const vy = y / height; // 0..1 vertical position
        for (let x = 0; x < width; x++) {
          const vx = x / width; // 0..1 horizontal position
          const idx = (y * width + x) * 4;

          // Multi-stop gradient: diagonal from top-left purple to bottom-right teal
          const t = vx * 0.6 + vy * 0.4; // diagonal bias

          // Pick dark and light color based on gradient position
          let dark: [number, number, number];
          let light: [number, number, number];

          if (t < 0.33) {
            const lt = t / 0.33;
            dark = lerpColor(color1, color2, lt);
            light = lerpColor(light1, lerpColor(light1, light2, 0.3), lt);
          } else if (t < 0.66) {
            const lt = (t - 0.33) / 0.33;
            dark = lerpColor(color2, color3, lt);
            light = lerpColor(lerpColor(light1, light2, 0.3), light2, lt);
          } else {
            const lt = (t - 0.66) / 0.34;
            dark = lerpColor(color3, color4, lt);
            light = lerpColor(light2, light2, lt);
          }

          // Bayer threshold determines which color to use
          const threshold = BAYER_4X4[y % 4][x % 4];

          // Mix ratio — creates the dither density gradient
          // More light pixels in the center, more dark at edges
          const centerDist = Math.sqrt(
            (vx - 0.5) * (vx - 0.5) * 0.6 + (vy - 0.45) * (vy - 0.45) * 0.8
          );
          const mixRatio = 0.15 + centerDist * 0.5;

          // Subtle noise variation for organic feel
          const noise =
            Math.sin(x * 0.7 + y * 1.3 + time * 0.0003) * 0.04;

          const useDark = threshold > mixRatio + noise;

          const color = useDark ? dark : light;

          data[idx] = color[0];
          data[idx + 1] = color[1];
          data[idx + 2] = color[2];
          data[idx + 3] = 255;
        }
      }

      ctx!.putImageData(img, 0, 0);

      if (!reducedMotion.current) {
        animRef.current = requestAnimationFrame(render);
      }
    }

    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    />
  );
}
