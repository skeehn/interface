/**
 * Shared CSS color parser — consolidates the duplicated `parseColor` /
 * `parseCSSColor` helpers that used to live in `gl/DitherBackground.tsx`
 * and `gl/DitherWebGL.tsx`. Uses a single 1×1 canvas in browser
 * environments and returns an SSR-safe default elsewhere.
 *
 * Output is normalised [0..1] r/g/b/a, the form the WebGL shader pipeline
 * expects.
 */

export type RGBA = readonly [number, number, number, number];

let _scratch: HTMLCanvasElement | null = null;
let _ctx: CanvasRenderingContext2D | null = null;

const FALLBACK: RGBA = [0, 0, 0, 1];

function context(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (_ctx) return _ctx;
  _scratch = document.createElement('canvas');
  _scratch.width = _scratch.height = 1;
  _ctx = _scratch.getContext('2d', { willReadFrequently: true });
  return _ctx;
}

/** Parse any CSS color (hex, rgb, hsl, named) into normalised [r,g,b,a]. */
export function parseCSSColor(color: string): RGBA {
  const ctx = context();
  if (!ctx) return FALLBACK;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#000';   // baseline so invalid input doesn't bleed
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
}

/** Parse to byte triple [r,g,b] in 0..255 — what Canvas2D consumers want. */
export function parseCSSColorBytes(color: string): readonly [number, number, number] {
  const [r, g, b] = parseCSSColor(color);
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
