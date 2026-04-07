/**
 * skeehn — Dither Engine
 *
 * Professional-grade dithering algorithms for ASCII art generation.
 * Implements Floyd-Steinberg, Bayer ordered, Atkinson, and Sierra dithering.
 *
 * Each algorithm maps continuous luminance → discrete character levels.
 */

import { CharacterEngine, rgbToLuminance, pixelToLuminance } from './characters';

export type DitherAlgorithm = 'floyd' | 'bayer' | 'atkinson' | 'sierra' | 'none';

// ═══════════════════════════════════════════════════════════
// BAYER MATRICES (2×2, 4×4, 8×8)
// Normalized 0-1 threshold matrices
// ═══════════════════════════════════════════════════════════

const BAYER_2: number[][] = [
  [0, 2],
  [3, 1],
];

const BAYER_4: number[][] = [
  [0,  8,  2, 10],
  [12, 4,  14, 6],
  [3,  11, 1,  9],
  [15, 7,  13, 5],
];

const BAYER_8: number[][] = [
  [0,  32, 8,  40, 2,  34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4,  36, 14, 46, 6,  38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3,  35, 11, 43, 1,  33, 9,  41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7,  39, 13, 45, 5,  37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

export type BayerSize = 2 | 4 | 8;

// ═══════════════════════════════════════════════════════════
// DITHER ENGINE CLASS
// ═══════════════════════════════════════════════════════════

export class DitherEngine {
  private algorithm: DitherAlgorithm;
  private bayerSize: BayerSize;
  private charEngine: CharacterEngine;
  private levels: number;

  constructor(
    algorithm: DitherAlgorithm = 'floyd',
    bayerSize: BayerSize = 4,
    charEngine: CharacterEngine
  ) {
    this.algorithm = algorithm;
    this.bayerSize = bayerSize;
    this.charEngine = charEngine;
    this.levels = charEngine.getCharacters().length;
  }

  /**
   * Dither a 1D luminance array → ASCII string
   * Input: flat array of luminance values (0-255)
   * Output: ASCII art string with newlines
   */
  dither1D(
    luminance: number[],
    width: number,
    height: number
  ): string {
    switch (this.algorithm) {
      case 'floyd':     return this.floydSteinberg(luminance, width, height);
      case 'bayer':     return this.bayerOrdered(luminance, width, height);
      case 'atkinson':  return this.atkinson(luminance, width, height);
      case 'sierra':    return this.sierra(luminance, width, height);
      case 'none':      return this.thresholdOnly(luminance, width, height);
      default:          return this.floydSteinberg(luminance, width, height);
    }
  }

  /**
   * Dither RGBA pixel data from ImageData
   */
  ditherImageData(imageData: ImageData, cellWidth: number = 1, cellHeight: number = 2): string {
    const { width, height, data } = imageData;

    // Calculate output dimensions
    const outW = Math.floor(width / cellWidth);
    const outH = Math.floor(height / cellHeight);

    // Average pixels in each cell
    const luminance: number[] = new Array(outW * outH);
    for (let y = 0; y < outH; y++) {
      for (let x = 0; x < outW; x++) {
        let sumL = 0;
        let count = 0;
        for (let dy = 0; dy < cellHeight && y * cellHeight + dy < height; dy++) {
          for (let dx = 0; dx < cellWidth && x * cellWidth + dx < width; dx++) {
            const px = (x * cellWidth + dx) + (y * cellHeight + dy) * width;
            const r = data[px * 4];
            const g = data[px * 4 + 1];
            const b = data[px * 4 + 2];
            const a = data[px * 4 + 3];
            sumL += pixelToLuminance(r, g, b, a);
            count++;
          }
        }
        luminance[y * outW + x] = sumL / count;
      }
    }

    return this.dither1D(luminance, outW, outH);
  }

  // ═══════════════════════════════════════════════════════
  // FLOYD-STEINBERG ERROR DIFFUSION
  // The gold standard — 7/16, 3/16, 5/16, 1/16 weights
  // ═══════════════════════════════════════════════════════

  private floydSteinberg(luminance: number[], w: number, h: number): string {
    const levels = this.levels;
    const step = 255 / (levels - 1);
    const error = new Float64Array(luminance); // Working copy
    const result: string[] = new Array(w * h);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        const oldPixel = Math.max(0, Math.min(255, error[idx]));
        const newPixel = Math.round(oldPixel / step) * step;
        result[idx] = this.charEngine.fromLuminance(newPixel);
        const quantError = oldPixel - newPixel;

        // Distribute error to neighbors
        if (x + 1 < w)              error[idx + 1]         += quantError * 7 / 16;
        if (x - 1 >= 0 && y + 1 < h) error[(y + 1) * w + x - 1] += quantError * 3 / 16;
        if (y + 1 < h)              error[(y + 1) * w + x] += quantError * 5 / 16;
        if (x + 1 < w && y + 1 < h) error[(y + 1) * w + x + 1] += quantError * 1 / 16;
      }
    }

    return this.arrayToString(result, w, h);
  }

  // ═══════════════════════════════════════════════════════
  // ATKINSON DITHERING
  // Cleaner than Floyd-Steinberg, preserves highlights
  // 1/8 to each of 6 neighbors (not 4)
  // ═══════════════════════════════════════════════════════

  private atkinson(luminance: number[], w: number, h: number): string {
    const levels = this.levels;
    const step = 255 / (levels - 1);
    const error = new Float64Array(luminance);
    const result: string[] = new Array(w * h);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        const oldPixel = Math.max(0, Math.min(255, error[idx]));
        const newPixel = Math.round(oldPixel / step) * step;
        result[idx] = this.charEngine.fromLuminance(newPixel);
        const quantError = (oldPixel - newPixel) / 8;

        // Atkinson distributes to 6 neighbors
        if (x + 1 < w)              error[idx + 1]         += quantError;
        if (x + 2 < w)              error[idx + 2]         += quantError;
        if (y + 1 < h) {
          if (x - 1 >= 0)           error[(y + 1) * w + x - 1] += quantError;
                                    error[(y + 1) * w + x]     += quantError;
          if (x + 1 < w)            error[(y + 1) * w + x + 1] += quantError;
        }
        if (y + 2 < h) {
                                    error[(y + 2) * w + x]     += quantError;
        }
      }
    }

    return this.arrayToString(result, w, h);
  }

  // ═══════════════════════════════════════════════════════
  // SIERRA DITHERING (Sierra-3 / "Sierra Lite")
  // 5-tap filter, good for smooth gradients
  // ═══════════════════════════════════════════════════════

  private sierra(luminance: number[], w: number, h: number): string {
    const levels = this.levels;
    const step = 255 / (levels - 1);
    const error = new Float64Array(luminance);
    const result: string[] = new Array(w * h);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        const oldPixel = Math.max(0, Math.min(255, error[idx]));
        const newPixel = Math.round(oldPixel / step) * step;
        result[idx] = this.charEngine.fromLuminance(newPixel);
        const quantError = oldPixel - newPixel;

        // Sierra-3 weights: 5/32, 3/32, 2/32, 2/32, 1/32, 1/32
        if (x + 1 < w)              error[idx + 1]         += quantError * 5 / 32;
        if (x + 2 < w)              error[idx + 2]         += quantError * 3 / 32;
        if (y + 1 < h) {
          if (x - 2 >= 0)           error[(y + 1) * w + x - 2] += quantError * 2 / 32;
          if (x - 1 >= 0)           error[(y + 1) * w + x - 1] += quantError * 4 / 32;
                                    error[(y + 1) * w + x]     += quantError * 5 / 32;
          if (x + 1 < w)            error[(y + 1) * w + x + 1] += quantError * 4 / 32;
          if (x + 2 < w)            error[(y + 1) * w + x + 2] += quantError * 2 / 32;
        }
        if (y + 2 < h) {
          if (x - 1 >= 0)           error[(y + 2) * w + x - 1] += quantError * 2 / 32;
                                    error[(y + 2) * w + x]     += quantError * 3 / 32;
          if (x + 1 < w)            error[(y + 2) * w + x + 1] += quantError * 2 / 32;
        }
      }
    }

    return this.arrayToString(result, w, h);
  }

  // ═══════════════════════════════════════════════════════
  // BAYER ORDERED DITHERING
  // Deterministic, no error diffusion — uses threshold matrix
  // ═══════════════════════════════════════════════════════

  private bayerOrdered(luminance: number[], w: number, h: number): string {
    const matrix = this.getBayerMatrix();
    const size = matrix.length;
    const levels = this.levels;
    const maxMatrix = size * size - 1;
    const result: string[] = new Array(w * h);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const mx = x % size;
        const my = y % size;
        const threshold = matrix[my][mx] / maxMatrix;

        // Apply threshold to luminance
        const normalized = luminance[y * w + x] / 255;
        const adjusted = Math.max(0, Math.min(1, normalized + (threshold - 0.5) * 0.5));
        result[y * w + x] = this.charEngine.fromBrightness(adjusted);
      }
    }

    return this.arrayToString(result, w, h);
  }

  private getBayerMatrix(): number[][] {
    switch (this.bayerSize) {
      case 2: return BAYER_2;
      case 8: return BAYER_8;
      default: return BAYER_4;
    }
  }

  // ═══════════════════════════════════════════════════════
  // SIMPLE THRESHOLD (no dithering)
  // ═══════════════════════════════════════════════════════

  private thresholdOnly(luminance: number[], w: number, h: number): string {
    const result = luminance.map(l => this.charEngine.fromLuminance(l));
    return this.arrayToString(result, w, h);
  }

  // ═══════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════

  private arrayToString(arr: string[], w: number, h: number): string {
    const lines: string[] = [];
    for (let y = 0; y < h; y++) {
      let line = '';
      for (let x = 0; x < w; x++) {
        line += arr[y * w + x];
      }
      lines.push(line);
    }
    return lines.join('\n');
  }

  // ═══════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════

  setAlgorithm(algo: DitherAlgorithm) { this.algorithm = algo; }
  setBayerSize(size: BayerSize) { this.bayerSize = size; }
  setCharEngine(engine: CharacterEngine) {
    this.charEngine = engine;
    this.levels = engine.getCharacters().length;
  }
}
