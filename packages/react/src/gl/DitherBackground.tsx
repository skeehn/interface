'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DitherAlgorithm = 'bayer' | 'floyd' | 'atkinson';

export interface DitherBackgroundProps {
  /** Dithering algorithm. Default: 'bayer' */
  algorithm?: DitherAlgorithm;
  /** Bayer matrix size (only applies to bayer algorithm). Default: 8 */
  matrix?: 2 | 4 | 8;
  /** Gradient start color (any CSS color). Default: 'hsl(270,30%,8%)' */
  colorA?: string;
  /** Gradient end color (any CSS color). Default: 'hsl(45,96%,52%)' */
  colorB?: string;
  /** Enable time-based animation. Default: false */
  animate?: boolean;
  /** Dither density 0-1. Default: 0.8 */
  intensity?: number;
  /** Animation speed multiplier. Default: 0.5 */
  speed?: number;
  /** Additional CSS class names. */
  className?: string;
  /** Inline styles applied to the wrapper div. */
  style?: React.CSSProperties;
  /** Content rendered on top of the dither background. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Bayer matrices (normalized)
// ---------------------------------------------------------------------------

const BAYER2 = [
  [0, 2],
  [3, 1],
];
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const BAYER8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

function getBayerMatrix(size: 2 | 4 | 8) {
  if (size === 2) return BAYER2;
  if (size === 8) return BAYER8;
  return BAYER4;
}

// ---------------------------------------------------------------------------
// Color parsing helper — converts any CSS color to [r,g,b] via a temp canvas
// ---------------------------------------------------------------------------

function parseColor(color: string, ctx: CanvasRenderingContext2D): [number, number, number] {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ---------------------------------------------------------------------------
// Dither algorithms (operate on ImageData in-place)
// ---------------------------------------------------------------------------

function applyBayer(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  matrix: number[][],
  intensity: number,
) {
  const size = matrix.length;
  const max = size * size;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const gray =
        (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      const threshold = (matrix[y % size][x % size] + 0.5) / max;
      const adjusted = gray * intensity + (1 - intensity) * 0.5;
      const lit = adjusted >= threshold;
      const v = lit ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = v;
    }
  }
}

function applyFloydSteinberg(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number,
) {
  const lum = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const j = i * 4;
    const raw = (0.2126 * data[j] + 0.7152 * data[j + 1] + 0.0722 * data[j + 2]) / 255;
    lum[i] = raw * intensity + (1 - intensity) * 0.5;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldV = Math.max(0, Math.min(1, lum[idx]));
      const newV = oldV >= 0.5 ? 1 : 0;
      lum[idx] = newV;
      const err = oldV - newV;

      const spread = (di: number, frac: number) => {
        if (di >= 0 && di < width * height) {
          lum[di] = Math.max(0, Math.min(1, lum[di] + err * frac));
        }
      };

      spread(idx + 1, 7 / 16);
      spread(idx + width - 1, 3 / 16);
      spread(idx + width, 5 / 16);
      spread(idx + width + 1, 1 / 16);
    }
  }

  for (let i = 0; i < width * height; i++) {
    const j = i * 4;
    const v = lum[i] < 0.5 ? 0 : 255;
    data[j] = data[j + 1] = data[j + 2] = v;
  }
}

function applyAtkinson(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number,
) {
  const lum = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const j = i * 4;
    const raw = (0.2126 * data[j] + 0.7152 * data[j + 1] + 0.0722 * data[j + 2]) / 255;
    lum[i] = raw * intensity + (1 - intensity) * 0.5;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldV = Math.max(0, Math.min(1, lum[idx]));
      const newV = oldV >= 0.5 ? 1 : 0;
      lum[idx] = newV;
      const e = (oldV - newV) / 8;

      const safe = (di: number) => {
        if (di >= 0 && di < width * height) lum[di] = Math.max(0, Math.min(1, lum[di] + e));
      };

      if (x + 1 < width) safe(idx + 1);
      if (x + 2 < width) safe(idx + 2);
      if (y + 1 < height) {
        const r1 = (y + 1) * width;
        if (x - 1 >= 0) safe(r1 + x - 1);
        safe(r1 + x);
        if (x + 1 < width) safe(r1 + x + 1);
      }
      if (y + 2 < height) safe((y + 2) * width + x);
    }
  }

  for (let i = 0; i < width * height; i++) {
    const j = i * 4;
    const v = lum[i] < 0.5 ? 0 : 255;
    data[j] = data[j + 1] = data[j + 2] = v;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Full-viewport animated dither gradient background.
 *
 * Renders a gradient between two colors, applies a selected dithering
 * algorithm via Canvas2D, and optionally animates the gradient over time.
 */
export const DitherBackground = React.forwardRef<HTMLDivElement, DitherBackgroundProps>(
  (
    {
      algorithm = 'bayer',
      matrix = 8,
      colorA = 'hsl(270,30%,8%)',
      colorB = 'hsl(45,96%,52%)',
      animate = false,
      intensity = 0.8,
      speed = 0.5,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<number>(0);
    const colorsRef = useRef<{
      a: [number, number, number];
      b: [number, number, number];
    } | null>(null);
    const [reducedMotion, setReducedMotion] = useState(false);

    // SSR guard
    if (typeof window === 'undefined') {
      return (
        <div
          ref={ref}
          className={className}
          style={{ position: 'relative', overflow: 'hidden', ...style }}
        >
          {children}
        </div>
      );
    }

    // Detect reduced-motion preference
    useEffect(() => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }, []);

    // Parse colors once (or when they change)
    const parseColors = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      colorsRef.current = {
        a: parseColor(colorA, ctx),
        b: parseColor(colorB, ctx),
      };
    }, [colorA, colorB]);

    useEffect(() => {
      parseColors();
    }, [parseColors]);

    // Core render function
    const renderFrame = useCallback(
      (time: number) => {
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        if (!canvas || !wrapper || !colorsRef.current) return;

        const { clientWidth: w, clientHeight: h } = wrapper;
        if (w === 0 || h === 0) return;

        // Use a reduced resolution for performance — 1px per 2 CSS pixels
        const scale = 0.5;
        const pw = Math.floor(w * scale);
        const ph = Math.floor(h * scale);

        if (canvas.width !== pw || canvas.height !== ph) {
          canvas.width = pw;
          canvas.height = ph;
        }

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const { a, b } = colorsRef.current;
        const shouldAnimate = animate && !reducedMotion;
        const t = shouldAnimate ? time * 0.001 * speed : 0;

        // Draw gradient with optional time offset
        const imageData = ctx.createImageData(pw, ph);
        const data = imageData.data;

        for (let y = 0; y < ph; y++) {
          for (let x = 0; x < pw; x++) {
            // Diagonal gradient with time-based shift
            const diag = (x / pw + y / ph) * 0.5;
            const animated = shouldAnimate
              ? (diag + Math.sin(t + y * 0.01) * 0.15 + Math.cos(t * 0.7 + x * 0.008) * 0.1) % 1
              : diag;
            const f = Math.max(0, Math.min(1, animated));

            const i = (y * pw + x) * 4;
            data[i] = lerp(a[0], b[0], f);
            data[i + 1] = lerp(a[1], b[1], f);
            data[i + 2] = lerp(a[2], b[2], f);
            data[i + 3] = 255;
          }
        }

        ctx.putImageData(imageData, 0, 0);

        // Apply dither
        const idata = ctx.getImageData(0, 0, pw, ph);
        switch (algorithm) {
          case 'bayer':
            applyBayer(idata.data, pw, ph, getBayerMatrix(matrix), intensity);
            break;
          case 'floyd':
            applyFloydSteinberg(idata.data, pw, ph, intensity);
            break;
          case 'atkinson':
            applyAtkinson(idata.data, pw, ph, intensity);
            break;
        }
        ctx.putImageData(idata, 0, 0);
      },
      [algorithm, matrix, intensity, animate, speed, reducedMotion],
    );

    // Animation loop
    useEffect(() => {
      let running = true;

      const tick = (time: number) => {
        if (!running) return;
        renderFrame(time);
        if (animate && !reducedMotion) {
          frameRef.current = requestAnimationFrame(tick);
        }
      };

      // Always render at least one frame
      requestAnimationFrame((time) => {
        renderFrame(time);
        if (animate && !reducedMotion && running) {
          frameRef.current = requestAnimationFrame(tick);
        }
      });

      return () => {
        running = false;
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }, [renderFrame, animate, reducedMotion]);

    // Resize handling
    useEffect(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper || typeof ResizeObserver === 'undefined') return;

      const ro = new ResizeObserver(() => {
        // Re-render on resize. If not animating, do a single frame.
        if (!animate || reducedMotion) {
          requestAnimationFrame((t) => renderFrame(t));
        }
      });
      ro.observe(wrapper);
      return () => ro.disconnect();
    }, [renderFrame, animate, reducedMotion]);

    return (
      <div
        ref={(node) => {
          (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={className}
        style={{
          position: 'relative',
          overflow: 'hidden',
          ...style,
        }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            pointerEvents: 'none',
          }}
        />
        {children && (
          <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        )}
      </div>
    );
  },
);

DitherBackground.displayName = 'DitherBackground';
