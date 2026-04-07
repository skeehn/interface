/**
 * skeehn — Dither Engine v2.0
 * Canvas-based pixel-perfect dithering algorithms.
 *
 * API:
 *   SkDither.bayer(canvas, opts)           — Bayer ordered dithering
 *   SkDither.floydSteinberg(canvas, opts)  — Error diffusion
 *   SkDither.atkinson(canvas, opts)        — Atkinson (Mac original)
 *   SkDither.text(str, opts)               — Render text → dithered canvas/ASCII/pre
 *   SkDither.gradientPre(opts)             — Generate dithered gradient as <pre>
 *   SkDither.toAscii(canvas, opts)         — Canvas → ASCII string array
 *   SkDither.initElements(root)            — Auto-init [data-sk-dither] elements
 *
 * window.SkDither is set for non-module usage.
 * Also exports as ES module default.
 */

// ═══════════════════════════════════════════════════════════
// PALETTES
// ═══════════════════════════════════════════════════════════

const PALETTE_BLOCKS  = [' ', '░', '▒', '▓', '█'];                                   // 5 levels
const PALETTE_DOTS    = [' ', '·', ':', ';', '!', '|', 'l', 'x', 'X', '#', '@', '█']; // 12 levels
const PALETTE_BINARY  = [' ', '█'];                                                    // pure 2-level
const PALETTE_SHADES  = [' ', '.', '`', '-', '~', '+', '=', '*', '#', '%', '@', '█']; // 12 levels
const PALETTE_MINIMAL = [' ', '░', '▓'];                                               // 3 levels

// ═══════════════════════════════════════════════════════════
// BAYER MATRICES
// ═══════════════════════════════════════════════════════════

// 2×2
const BAYER2 = [
  [0, 2],
  [3, 1],
];

// 4×4 (normalized 0-15)
const BAYER4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
];

// 8×8 (normalized 0-63)
const BAYER8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

// ═══════════════════════════════════════════════════════════
// SKDITHER CLASS
// ═══════════════════════════════════════════════════════════

class SkDither {

  // ─────────────────────────────────────────────────────────
  // BAYER ORDERED DITHERING
  // Deterministic, no error accumulation. Each pixel's
  // luminance is compared against a spatially-varying
  // threshold derived from the Bayer matrix, producing
  // characteristic crosshatch patterns at fine detail.
  // ─────────────────────────────────────────────────────────

  /**
   * Apply Bayer ordered dithering to a canvas in-place.
   *
   * @param {HTMLCanvasElement} canvas
   * @param {object} opts
   * @param {2|4|8}   opts.matrix    — Bayer matrix size (default 4)
   * @param {boolean} opts.invert    — Invert output (default false)
   * @param {number}  opts.threshold — Unused; kept for API symmetry
   * @returns {HTMLCanvasElement} The same canvas, mutated.
   */
  static bayer(canvas, { matrix = 4, invert = false, threshold = 0.5 } = {}) {
    const M = matrix === 8 ? BAYER8 : matrix === 2 ? BAYER2 : BAYER4;
    const size = M.length;
    const max = size * size; // number of distinct threshold values

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const d = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        // Perceptual luminance (ITU-R BT.709)
        const gray = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
        // Normalized threshold in [0, 1)
        const t = (M[y % size][x % size] + 0.5) / max;
        const lit = invert ? gray < t : gray >= t;
        const v = lit ? 255 : 0;
        d[i] = d[i + 1] = d[i + 2] = v;
        // Alpha channel untouched
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  // ─────────────────────────────────────────────────────────
  // FLOYD-STEINBERG ERROR DIFFUSION
  // The canonical error-diffusion algorithm. Quantization
  // error from each pixel is distributed to four spatial
  // neighbors with weights 7/16, 3/16, 5/16, 1/16.
  // Serpentine mode alternates scan direction each row,
  // eliminating the slight directional bias of the original.
  // ─────────────────────────────────────────────────────────

  /**
   * Apply Floyd-Steinberg error diffusion to a canvas in-place.
   *
   * @param {HTMLCanvasElement} canvas
   * @param {object}  opts
   * @param {boolean} opts.invert      — Invert output (default false)
   * @param {boolean} opts.serpentine  — Alternate row direction (default false)
   * @returns {HTMLCanvasElement} The same canvas, mutated.
   */
  static floydSteinberg(canvas, { invert = false, serpentine = false } = {}) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const { width, height } = canvas;
    const src = ctx.getImageData(0, 0, width, height);
    const d = src.data;

    // Extract perceptual luminance into a float buffer for error accumulation
    const lum = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const j = i * 4;
      lum[i] = (0.2126 * d[j] + 0.7152 * d[j + 1] + 0.0722 * d[j + 2]) / 255;
    }

    for (let y = 0; y < height; y++) {
      // Serpentine mode: reverse direction on odd rows
      const leftToRight = !serpentine || (y % 2 === 0);
      const xStart = leftToRight ? 0 : width - 1;
      const xEnd   = leftToRight ? width : -1;
      const xStep  = leftToRight ? 1 : -1;

      for (let x = xStart; x !== xEnd; x += xStep) {
        const idx = y * width + x;
        const oldV = Math.max(0, Math.min(1, lum[idx]));
        const newV = oldV >= 0.5 ? 1 : 0;
        lum[idx] = newV;
        const err = oldV - newV;

        // Inline bounds-safe error spread
        const spread = (di, fraction) => {
          if (di >= 0 && di < width * height) {
            lum[di] = Math.max(0, Math.min(1, lum[di] + err * fraction));
          }
        };

        if (leftToRight) {
          // Standard Floyd-Steinberg kernel (left-to-right)
          //        * 7/16
          //  3/16 5/16 1/16
          spread(idx + 1,             7 / 16);
          spread(idx + width - 1,     3 / 16);
          spread(idx + width,         5 / 16);
          spread(idx + width + 1,     1 / 16);
        } else {
          // Mirrored kernel for right-to-left serpentine pass
          //  7/16 *
          //  1/16 5/16 3/16
          spread(idx - 1,             7 / 16);
          spread(idx + width + 1,     3 / 16);
          spread(idx + width,         5 / 16);
          spread(idx + width - 1,     1 / 16);
        }
      }
    }

    // Write quantized values back to RGBA
    for (let i = 0; i < width * height; i++) {
      const j = i * 4;
      const v = invert
        ? (lum[i] < 0.5 ? 255 : 0)
        : (lum[i] < 0.5 ? 0   : 255);
      d[j] = d[j + 1] = d[j + 2] = v;
    }

    ctx.putImageData(src, 0, 0);
    return canvas;
  }

  // ─────────────────────────────────────────────────────────
  // ATKINSON DITHERING
  // Bill Atkinson's 1984 algorithm from the original Mac.
  // Intentionally distributes only 6/8 of quantization error
  // (not all of it), yielding higher contrast and preserving
  // bright highlights / deep shadows. Beloved for its clean,
  // classic appearance on text and line art.
  //
  // Kernel (each neighbor gets err/8):
  //   . * 1 1      (* = current pixel)
  //   1 1 1 .
  //   . 1 . .
  // ─────────────────────────────────────────────────────────

  /**
   * Apply Atkinson dithering to a canvas in-place.
   *
   * @param {HTMLCanvasElement} canvas
   * @param {object}  opts
   * @param {boolean} opts.invert — Invert output (default false)
   * @returns {HTMLCanvasElement} The same canvas, mutated.
   */
  static atkinson(canvas, { invert = false } = {}) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const { width, height } = canvas;
    const src = ctx.getImageData(0, 0, width, height);
    const d = src.data;

    // Extract perceptual luminance
    const lum = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const j = i * 4;
      lum[i] = (0.2126 * d[j] + 0.7152 * d[j + 1] + 0.0722 * d[j + 2]) / 255;
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const oldV = Math.max(0, Math.min(1, lum[idx]));
        const newV = oldV >= 0.5 ? 1 : 0;
        lum[idx] = newV;

        // Atkinson distributes err/8 to each of 6 neighbors.
        // Only 6 of 8 error "units" are redistributed — the
        // remaining 2/8 are intentionally discarded to increase
        // contrast and prevent mud in dark/light areas.
        const e = (oldV - newV) / 8;

        // Row 0: x+1, x+2
        if (x + 1 < width)  lum[idx + 1]                    = Math.max(0, Math.min(1, lum[idx + 1] + e));
        if (x + 2 < width)  lum[idx + 2]                    = Math.max(0, Math.min(1, lum[idx + 2] + e));
        // Row +1: x-1, x, x+1
        if (y + 1 < height) {
          const row1 = (y + 1) * width;
          if (x - 1 >= 0)   lum[row1 + x - 1]               = Math.max(0, Math.min(1, lum[row1 + x - 1] + e));
                             lum[row1 + x]                   = Math.max(0, Math.min(1, lum[row1 + x] + e));
          if (x + 1 < width) lum[row1 + x + 1]              = Math.max(0, Math.min(1, lum[row1 + x + 1] + e));
        }
        // Row +2: x
        if (y + 2 < height) {
          const row2 = (y + 2) * width;
                             lum[row2 + x]                   = Math.max(0, Math.min(1, lum[row2 + x] + e));
        }
      }
    }

    // Write back
    for (let i = 0; i < width * height; i++) {
      const j = i * 4;
      const v = invert
        ? (lum[i] < 0.5 ? 255 : 0)
        : (lum[i] < 0.5 ? 0   : 255);
      d[j] = d[j + 1] = d[j + 2] = v;
    }

    ctx.putImageData(src, 0, 0);
    return canvas;
  }

  // ─────────────────────────────────────────────────────────
  // ASCII CONVERSION
  // Sample the canvas into a character grid using average
  // luminance per cell. Aspect ratio correction compensates
  // for the fact that terminal characters are ~2x taller than
  // wide, so a 1:1 pixel grid produces squashed output.
  // ─────────────────────────────────────────────────────────

  /**
   * Convert a canvas to an array of ASCII art strings (one per row).
   *
   * @param {HTMLCanvasElement} canvas
   * @param {object}   opts
   * @param {string[]} opts.palette     — Character palette ordered dark→light (default PALETTE_BLOCKS)
   * @param {number}   opts.cols        — Output columns (default 80)
   * @param {number}   opts.aspectRatio — char height/width ratio (default 0.45)
   * @param {boolean}  opts.invert      — Invert mapping (default false)
   * @returns {string[]} Array of strings, one per output row.
   */
  static toAscii(canvas, {
    palette     = PALETTE_BLOCKS,
    cols        = 80,
    aspectRatio = 0.45, // terminal chars ~2× taller than wide
    invert      = false,
  } = {}) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const { width, height } = canvas;

    const cellW = Math.max(1, Math.floor(width / cols));
    const cellH = Math.max(1, Math.round(cellW / aspectRatio));
    const rows  = Math.floor(height / cellH);
    const lines = [];

    for (let r = 0; r < rows; r++) {
      let line = '';
      for (let c = 0; c < cols; c++) {
        const px = c * cellW;
        const py = r * cellH;
        const w  = Math.min(cellW, width  - px);
        const h  = Math.min(cellH, height - py);

        if (w <= 0 || h <= 0) {
          line += ' ';
          continue;
        }

        const data = ctx.getImageData(px, py, w, h).data;
        let sum = 0;
        for (let k = 0; k < data.length; k += 4) {
          sum += 0.2126 * data[k] + 0.7152 * data[k + 1] + 0.0722 * data[k + 2];
        }
        const avg = (sum / (data.length / 4)) / 255;
        const v   = invert ? 1 - avg : avg;
        line += palette[Math.min(palette.length - 1, Math.round(v * (palette.length - 1)))];
      }
      lines.push(line);
    }

    return lines;
  }

  // ─────────────────────────────────────────────────────────
  // TEXT RENDERER
  // Renders a string to an offscreen canvas, applies a dither
  // algorithm, then returns either the raw canvas, an ASCII
  // string array, or a styled <pre> element depending on
  // outputMode. This is the primary entry point for generating
  // the skeehn design system's dithered typographic elements.
  // ─────────────────────────────────────────────────────────

  /**
   * Render a text string through the dither pipeline.
   *
   * @param {string}  str
   * @param {object}  opts
   * @param {number}  opts.width       — Canvas width in px (default 600)
   * @param {number}  opts.height      — Canvas height in px (default 80)
   * @param {string}  opts.fontFamily  — CSS font family (default 'monospace')
   * @param {number}  opts.fontSize    — Font size in px (default 64)
   * @param {string}  opts.fontWeight  — CSS font weight (default 'bold')
   * @param {string}  opts.fillStyle   — Text color (default '#fff')
   * @param {string}  opts.bgStyle     — Background color (default '#000')
   * @param {string}  opts.method      — 'bayer'|'floyd'|'atkinson'|'none' (default 'bayer')
   * @param {2|4|8}   opts.matrix      — Bayer matrix size (default 4)
   * @param {number}  opts.cols        — ASCII columns (default 60)
   * @param {string[]} opts.palette    — Palette for ASCII/pre output (default PALETTE_BLOCKS)
   * @param {string}  opts.outputMode  — 'canvas'|'ascii'|'pre' (default 'canvas')
   * @param {boolean} opts.invert      — Invert dither (default false)
   * @param {number}  opts.padding     — Min horizontal padding in px (default 8)
   * @returns {HTMLCanvasElement|string[]|HTMLPreElement}
   */
  static text(str, {
    width      = 600,
    height     = 80,
    fontFamily = 'monospace',
    fontSize   = 64,
    fontWeight = 'bold',
    fillStyle  = '#fff',
    bgStyle    = '#000',
    method     = 'bayer',
    matrix     = 4,
    cols       = 60,
    palette    = PALETTE_BLOCKS,
    outputMode = 'canvas',
    invert     = false,
    padding    = 8,
  } = {}) {
    const canvas = Object.assign(document.createElement('canvas'), { width, height });
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = bgStyle;
    ctx.fillRect(0, 0, width, height);

    // Render text centered with a minimum padding guard
    ctx.font         = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle    = fillStyle;
    ctx.textBaseline = 'middle';
    const metrics    = ctx.measureText(str);
    const x          = Math.max(padding, (width - metrics.width) / 2);
    ctx.fillText(str, x, height / 2);

    // Apply chosen dither algorithm
    if (method === 'bayer')     SkDither.bayer(canvas, { matrix, invert });
    else if (method === 'floyd')     SkDither.floydSteinberg(canvas, { invert });
    else if (method === 'atkinson') SkDither.atkinson(canvas, { invert });
    // method === 'none': leave canvas untouched

    // Return in requested format
    if (outputMode === 'ascii') {
      return SkDither.toAscii(canvas, { palette, cols, invert: false });
    }

    if (outputMode === 'pre') {
      const lines = SkDither.toAscii(canvas, { palette, cols, invert: false });
      const pre   = document.createElement('pre');
      pre.textContent = lines.join('\n');
      Object.assign(pre.style, {
        fontFamily : 'monospace',
        fontSize   : '8px',
        lineHeight : '1.05',
        margin     : '0',
        whiteSpace : 'pre',
        userSelect : 'none',
      });
      return pre;
    }

    return canvas;
  }

  // ─────────────────────────────────────────────────────────
  // GRADIENT PRE GENERATOR
  // Produces a pure ASCII/Unicode gradient <pre> element
  // without touching the canvas API. Useful as a decorative
  // background element or progress indicator in the design
  // system. No image processing required.
  // ─────────────────────────────────────────────────────────

  /**
   * Generate a dithered gradient as a <pre> element.
   *
   * @param {object}   opts
   * @param {number}   opts.width      — Characters wide (default 40)
   * @param {number}   opts.height     — Characters tall (default 8)
   * @param {string[]} opts.palette    — Character palette dark→light (default PALETTE_BLOCKS)
   * @param {string}   opts.direction  — 'horizontal'|'vertical'|'diagonal' (default 'horizontal')
   * @returns {HTMLPreElement}
   */
  static gradientPre({
    width     = 40,
    height    = 8,
    palette   = PALETTE_BLOCKS,
    direction = 'horizontal',
  } = {}) {
    let text = '';

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        let t;
        if (direction === 'vertical') {
          t = row / Math.max(1, height - 1);
        } else if (direction === 'diagonal') {
          t = (col + row) / Math.max(1, width + height - 2);
        } else {
          // horizontal (default)
          t = col / Math.max(1, width - 1);
        }
        const charIdx = Math.round(t * (palette.length - 1));
        text += palette[Math.max(0, Math.min(palette.length - 1, charIdx))];
      }
      text += '\n';
    }

    const pre = document.createElement('pre');
    pre.textContent = text;
    Object.assign(pre.style, {
      fontFamily : 'monospace',
      fontSize   : '10px',
      lineHeight : '1.1',
      margin     : '0',
      whiteSpace : 'pre',
    });
    return pre;
  }

  // ─────────────────────────────────────────────────────────
  // AUTO-INITIALIZATION
  // Scans the DOM for [data-sk-dither] elements and
  // processes them according to their data attributes.
  // Safe to call multiple times — elements are marked with
  // _skDitherInit to prevent double-processing.
  //
  // Supported modes:
  //   data-sk-dither="text"     — Render text through dither pipeline
  //   data-sk-dither="gradient" — Replace contents with gradient <pre>
  //
  // Per-element configuration via data attributes:
  //   data-method      — 'bayer' | 'floyd' | 'atkinson' | 'none'
  //   data-palette     — 'blocks' | 'dots' | 'shades' | 'binary' | 'minimal'
  //   data-cols        — integer column count
  //   data-text        — override text content for text mode
  //   data-width       — canvas/char width override
  //   data-height      — canvas/char height override
  //   data-font-size   — font size in px (text mode)
  //   data-invert      — presence inverts dither output
  //   data-direction   — 'horizontal' | 'vertical' | 'diagonal' (gradient mode)
  // ─────────────────────────────────────────────────────────

  /**
   * Auto-initialize all [data-sk-dither] elements under root.
   *
   * @param {Document|Element} root — Scope for querySelector (default document)
   */
  static initElements(root = document) {
    root.querySelectorAll('[data-sk-dither]').forEach(el => {
      // Guard: skip if already initialized
      if (el._skDitherInit) return;
      el._skDitherInit = true;

      const mode   = el.dataset.skDither;
      const method = el.dataset.method || 'bayer';

      // Resolve palette from data-palette attribute
      const palette = (
        el.dataset.palette === 'dots'    ? PALETTE_DOTS    :
        el.dataset.palette === 'shades'  ? PALETTE_SHADES  :
        el.dataset.palette === 'binary'  ? PALETTE_BINARY  :
        el.dataset.palette === 'minimal' ? PALETTE_MINIMAL :
        PALETTE_BLOCKS
      );

      const cols = parseInt(el.dataset.cols || '60', 10);

      if (mode === 'text') {
        const str    = el.dataset.text || el.textContent.trim();
        const width  = el.clientWidth  || parseInt(el.dataset.width  || '600', 10);
        const height = el.clientHeight || parseInt(el.dataset.height || '80',  10);
        const pre    = SkDither.text(str, {
          width,
          height,
          method,
          palette,
          cols,
          outputMode : 'pre',
          fontSize   : parseInt(el.dataset.fontSize || '64', 10),
          invert     : el.hasAttribute('data-invert'),
        });
        el.innerHTML = '';
        el.appendChild(pre);

      } else if (mode === 'gradient') {
        const pre = SkDither.gradientPre({
          width     : parseInt(el.dataset.width  || '40', 10),
          height    : parseInt(el.dataset.height || '6',  10),
          palette,
          direction : el.dataset.direction || 'horizontal',
        });
        el.innerHTML = '';
        el.appendChild(pre);
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════
// MODULE BOOTSTRAP
// ═══════════════════════════════════════════════════════════

// Auto-init on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SkDither.initElements());
  } else {
    // DOM already parsed (e.g. script loaded deferred or as module)
    SkDither.initElements();
  }
}

// Expose globally for non-module usage (<script src="...">)
if (typeof window !== 'undefined') window.SkDither = SkDither;

// ES module export
export { SkDither, PALETTE_BLOCKS, PALETTE_DOTS, PALETTE_BINARY, PALETTE_SHADES, PALETTE_MINIMAL };
export default SkDither;
