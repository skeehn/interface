/**
 * skeehn — Canvas Renderer
 *
 * Browser-based ASCII art generation from images.
 * Uses Canvas 2D to read pixel data, then dithers to ASCII.
 *
 * Usage:
 *   const renderer = new CanvasRenderer()
 *   const ascii = await renderer.fromImage(imageElement)
 *   const ascii = await renderer.fromUrl('photo.jpg')
 */

import { CharacterEngine, defaultEngine, RAMPS } from './characters';
import { DitherEngine, DitherAlgorithm, BayerSize } from './dither';

export interface RenderOptions {
  algorithm?: DitherAlgorithm;
  bayerSize?: BayerSize;
  ramp?: keyof typeof RAMPS;
  resolution?: number;    // Width in characters (default: 80)
  cellWidth?: number;     // Pixels per character column (default: auto)
  cellHeight?: number;    // Pixels per character row (default: auto)
  contrast?: number;      // Contrast multiplier (default: 1.0)
  brightness?: number;    // Brightness offset (default: 0)
  invert?: boolean;       // Invert luminance (default: false)
}

const DEFAULT_OPTIONS: Required<RenderOptions> = {
  algorithm: 'floyd',
  bayerSize: 4,
  ramp: 'blocks',
  resolution: 120,
  cellWidth: 0,
  cellHeight: 0,
  contrast: 1.0,
  brightness: 0,
  invert: false,
};

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreen: OffscreenCanvas | null = null;

  constructor() {
    if (typeof document === 'undefined') {
      throw new Error('CanvasRenderer requires a browser environment. Use ServerRenderer for SSR.');
    }
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Render an image element to ASCII art
   */
  async fromImage(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    options: RenderOptions = {}
  ): Promise<string> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Draw image to canvas
    const imgW = 'naturalWidth' in image ? image.naturalWidth : image.width;
    const imgH = 'naturalHeight' in image ? image.naturalHeight : image.height;

    this.canvas.width = imgW;
    this.canvas.height = imgH;
    this.ctx.drawImage(image, 0, 0);

    return this.renderFromCanvas(opts);
  }

  /**
   * Render from image URL
   */
  async fromUrl(url: string, options: RenderOptions = {}): Promise<string> {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          const result = await this.fromImage(img, options);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  /**
   * Render from video element (current frame)
   */
  async fromVideo(video: HTMLVideoElement, options: RenderOptions = {}): Promise<string> {
    return this.fromImage(video, options);
  }

  /**
   * Render from raw pixel data
   */
  async fromPixels(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    options: RenderOptions = {}
  ): Promise<string> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    this.canvas.width = width;
    this.canvas.height = height;
    const imageData = new ImageData(new Uint8ClampedArray(pixels.buffer as ArrayBuffer), width, height);
    this.ctx.putImageData(imageData, 0, 0);

    return this.renderFromCanvas(opts);
  }

  /**
   * Get dimensions for a given image and resolution
   */
  getDimensions(
    imageWidth: number,
    imageHeight: number,
    resolution: number,
    cellWidth: number = 0,
    cellHeight: number = 0
  ): { outW: number; outH: number; cellW: number; cellH: number } {
    // Character aspect ratio: most monospace chars are ~0.5 wide as tall
    const charAspect = 0.5;

    const effectiveCellW = cellWidth > 0 ? cellWidth : 1;
    const effectiveCellH = cellHeight > 0 ? cellHeight : Math.round(1 / charAspect);

    const outW = Math.min(resolution, Math.floor(imageWidth / effectiveCellW));
    const outH = Math.floor((outW * imageHeight) / (imageWidth * charAspect));

    const cellW = Math.max(1, Math.floor(imageWidth / outW));
    const cellH = Math.max(1, Math.floor(imageHeight / outH));

    return { outW: Math.floor(imageWidth / cellW), outH: Math.floor(imageHeight / cellH), cellW, cellH };
  }

  // ─── Internal ────────────────────────────────────────────

  private async renderFromCanvas(options: Required<RenderOptions>): Promise<string> {
    const { width, height } = this.canvas;
    const { outW, outH, cellW, cellH } = this.getDimensions(
      width, height, options.resolution, options.cellWidth, options.cellHeight
    );

    // Get pixel data
    const imageData = this.ctx.getImageData(0, 0, width, height);

    // Apply contrast/brightness
    if (options.contrast !== 1.0 || options.brightness !== 0) {
      this.adjustImageData(imageData.data, options.contrast, options.brightness);
    }

    // Create engines
    const charEngine = new CharacterEngine(options.ramp);
    const ditherEngine = new DitherEngine(options.algorithm, options.bayerSize, charEngine);

    // Generate ASCII
    let ascii = ditherEngine.ditherImageData(imageData, cellW, cellH);

    // Invert if requested
    if (options.invert) {
      const inverseEngine = this.getInverseEngine(charEngine);
      const inverseDither = new DitherEngine(options.algorithm, options.bayerSize, inverseEngine);
      ascii = inverseDither.ditherImageData(imageData, cellW, cellH);
    }

    return ascii;
  }

  private adjustImageData(data: Uint8ClampedArray, contrast: number, brightness: number) {
    for (let i = 0; i < data.length; i += 4) {
      data[i]     = Math.min(255, Math.max(0, ((data[i] / 255 - 0.5) * contrast + 0.5 + brightness / 255) * 255));
      data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] / 255 - 0.5) * contrast + 0.5 + brightness / 255) * 255));
      data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] / 255 - 0.5) * contrast + 0.5 + brightness / 255) * 255));
    }
  }

  private getInverseEngine(original: CharacterEngine): CharacterEngine {
    const chars = original.getCharacters();
    return CharacterEngine.customRamp([...chars].reverse().join(''));
  }
}

// ═══════════════════════════════════════════════════════════
// TEXT-TO-ASCII ART (Large styled text)
// ═══════════════════════════════════════════════════════════

const ASCII_FONTS: Record<string, Record<string, string[]>> = {
  // Simple 5-line block font
  block: {
    'A': [' ███ ', '█   █', '█████', '█   █', '█   █'],
    'B': ['████ ', '█   █', '████ ', '█   █', '████ '],
    'C': [' ████', '█    ', '█    ', '█    ', ' ████'],
    'D': ['████ ', '█   █', '█   █', '█   █', '████ '],
    'E': ['█████', '█    ', '████ ', '█    ', '█████'],
    'F': ['█████', '█    ', '████ ', '█    ', '█    '],
    'G': [' ████', '█    ', '█  ██', '█   █', ' ████'],
    'H': ['█   █', '█   █', '█████', '█   █', '█   █'],
    'I': ['█████', '  █  ', '  █  ', '  █  ', '█████'],
    'J': ['  ███', '    █', '    █', '█   █', ' ███ '],
    'K': ['█   █', '█  █ ', '███  ', '█  █ ', '█   █'],
    'L': ['█    ', '█    ', '█    ', '█    ', '█████'],
    'M': ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
    'N': ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
    'O': [' ███ ', '█   █', '█   █', '█   █', ' ███ '],
    'P': ['████ ', '█   █', '████ ', '█    ', '█    '],
    'Q': [' ███ ', '█   █', '█ █ █', '█  █ ', ' ██ █'],
    'R': ['████ ', '█   █', '████ ', '█  █ ', '█   █'],
    'S': [' ████', '█    ', ' ███ ', '    █', '████ '],
    'T': ['█████', '  █  ', '  █  ', '  █  ', '  █  '],
    'U': ['█   █', '█   █', '█   █', '█   █', ' ███ '],
    'V': ['█   █', '█   █', '█   █', ' █ █ ', '  █  '],
    'W': ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
    'X': ['█   █', ' █ █ ', '  █  ', ' █ █ ', '█   █'],
    'Y': ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
    'Z': ['█████', '   █ ', '  █  ', ' █   ', '█████'],
    ' ': ['     ', '     ', '     ', '     ', '     '],
    '0': [' ███ ', '█  ██', '█ █ █', '██  █', ' ███ '],
    '1': ['  █  ', ' ██  ', '  █  ', '  █  ', '█████'],
    '2': [' ███ ', '█   █', '  ██ ', ' █   ', '█████'],
    '3': [' ███ ', '    █', ' ███ ', '    █', ' ███ '],
    '4': ['█   █', '█   █', '█████', '    █', '    █'],
    '5': ['█████', '█    ', '████ ', '    █', '████ '],
    '6': [' ███ ', '█    ', '████ ', '█   █', ' ███ '],
    '7': ['█████', '   █ ', '  █  ', ' █   ', '█    '],
    '8': [' ███ ', '█   █', ' ███ ', '█   █', ' ███ '],
    '9': [' ███ ', '█   █', ' ████', '    █', ' ███ '],
  },
};

export class TextToAscii {
  /**
   * Convert text to large ASCII art
   */
  static render(text: string, fontName: string = 'block', char: string = '█'): string {
    const font = ASCII_FONTS[fontName];
    if (!font) throw new Error(`Font "${fontName}" not found. Available: ${Object.keys(ASCII_FONTS).join(', ')}`);

    const lines: string[][] = [];
    for (const c of text.toUpperCase()) {
      const glyph = font[c] || font[' '] || [];
      for (let i = 0; i < glyph.length; i++) {
        if (!lines[i]) lines[i] = [];
        lines[i].push(glyph[i].replace(/█/g, char));
      }
    }

    return lines.map(line => line.join(' ')).join('\n');
  }
}
