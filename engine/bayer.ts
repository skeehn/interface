/**
 * Canonical Bayer ordered-dither threshold matrices.
 *
 * Each matrix is row-major, normalised by `size * size`. Consumers can use
 * the raw 0..(N²-1) integer form for shader uniforms, or the normalised
 * 0..1 form for CPU dithering.
 *
 * Previously duplicated across `gl/DitherBackground.tsx` and
 * `gl/DitherWebGL.tsx`; this is the single source of truth.
 */

export const BAYER_2: ReadonlyArray<ReadonlyArray<number>> = [
  [0, 2],
  [3, 1],
];

export const BAYER_4: ReadonlyArray<ReadonlyArray<number>> = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export const BAYER_8: ReadonlyArray<ReadonlyArray<number>> = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

export type BayerSize = 2 | 4 | 8;

export function getBayerMatrix(size: BayerSize): ReadonlyArray<ReadonlyArray<number>> {
  if (size === 2) return BAYER_2;
  if (size === 8) return BAYER_8;
  return BAYER_4;
}
