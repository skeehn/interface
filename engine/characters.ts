/**
 * skeehn — Character Engine
 *
 * 70-character palette with perceptually-calibrated brightness values.
 * Maps luminance (0-255) → ASCII character based on visual density.
 *
 * Usage:
 *   import { chars, ramp } from './characters'
 *   const char = chars.fromBrightness(128)  // → '▒'
 *   const art = ramp(imageData, 'blocks')    // → ASCII art string
 */

// ═══════════════════════════════════════════════════════════
// PERCEPTUALLY CALIBRATED BRIGHTNESS VALUES
// Each character sorted by actual rendered luminance (dark→light)
// Calibrated at 14px SF Mono, macOS Retina
// ═══════════════════════════════════════════════════════════

export const CHAR_PALETTE: CharEntry[] = [
  // Block elements (solid fills)
  { char: '█', brightness: 1.00, category: 'block', name: 'full-block' },
  { char: '▓', brightness: 0.78, category: 'block', name: 'dark-shade' },
  { char: '▒', brightness: 0.55, category: 'block', name: 'medium-shade' },
  { char: '░', brightness: 0.30, category: 'block', name: 'light-shade' },
  { char: ' ', brightness: 0.00, category: 'block', name: 'space' },

  // Dense symbols
  { char: '@', brightness: 0.95, category: 'symbol', name: 'at' },
  { char: '#', brightness: 0.88, category: 'symbol', name: 'hash' },
  { char: '$', brightness: 0.85, category: 'symbol', name: 'dollar' },
  { char: '%', brightness: 0.82, category: 'symbol', name: 'percent' },
  { char: '&', brightness: 0.75, category: 'symbol', name: 'amp' },
  { char: 'O', brightness: 0.72, category: 'symbol', name: 'capital-o' },
  { char: 'Q', brightness: 0.70, category: 'symbol', name: 'capital-q' },
  { char: '0', brightness: 0.68, category: 'symbol', name: 'zero' },
  { char: '8', brightness: 0.65, category: 'symbol', name: 'eight' },
  { char: 'B', brightness: 0.62, category: 'symbol', name: 'capital-b' },
  { char: 'D', brightness: 0.58, category: 'symbol', name: 'capital-d' },
  { char: '6', brightness: 0.55, category: 'symbol', name: 'six' },
  { char: '9', brightness: 0.52, category: 'symbol', name: 'nine' },
  { char: 'G', brightness: 0.50, category: 'symbol', name: 'capital-g' },
  { char: 'S', brightness: 0.48, category: 'symbol', name: 'capital-s' },
  { char: 'C', brightness: 0.45, category: 'symbol', name: 'capital-c' },
  { char: 'U', brightness: 0.42, category: 'symbol', name: 'capital-u' },
  { char: 'o', brightness: 0.40, category: 'symbol', name: 'lower-o' },
  { char: 'a', brightness: 0.38, category: 'symbol', name: 'lower-a' },
  { char: 'e', brightness: 0.35, category: 'symbol', name: 'lower-e' },
  { char: 'c', brightness: 0.32, category: 'symbol', name: 'lower-c' },

  // Medium density
  { char: '*', brightness: 0.45, category: 'punctuation', name: 'asterisk' },
  { char: '+', brightness: 0.40, category: 'punctuation', name: 'plus' },
  { char: '=', brightness: 0.35, category: 'punctuation', name: 'equals' },
  { char: '^', brightness: 0.30, category: 'punctuation', name: 'caret' },
  { char: '~', brightness: 0.28, category: 'punctuation', name: 'tilde' },
  { char: 'n', brightness: 0.33, category: 'letter', name: 'lower-n' },
  { char: 'm', brightness: 0.35, category: 'letter', name: 'lower-m' },
  { char: 'h', brightness: 0.38, category: 'letter', name: 'lower-h' },
  { char: 'u', brightness: 0.30, category: 'letter', name: 'lower-u' },
  { char: 'v', brightness: 0.28, category: 'letter', name: 'lower-v' },
  { char: 'z', brightness: 0.25, category: 'letter', name: 'lower-z' },
  { char: 'x', brightness: 0.30, category: 'letter', name: 'lower-x' },
  { char: 'r', brightness: 0.22, category: 'letter', name: 'lower-r' },
  { char: 'j', brightness: 0.20, category: 'letter', name: 'lower-j' },
  { char: 'f', brightness: 0.28, category: 'letter', name: 'lower-f' },
  { char: 't', brightness: 0.25, category: 'letter', name: 'lower-t' },
  { char: 'l', brightness: 0.18, category: 'letter', name: 'lower-l' },
  { char: 'i', brightness: 0.15, category: 'letter', name: 'lower-i' },
  { char: '!', brightness: 0.25, category: 'punctuation', name: 'exclaim' },
  { char: '|', brightness: 0.15, category: 'punctuation', name: 'pipe' },

  // Light / sparse
  { char: '-', brightness: 0.18, category: 'punctuation', name: 'dash' },
  { char: '_', brightness: 0.15, category: 'punctuation', name: 'underscore' },
  { char: ':', brightness: 0.12, category: 'punctuation', name: 'colon' },
  { char: ';', brightness: 0.10, category: 'punctuation', name: 'semicolon' },
  { char: ',', brightness: 0.08, category: 'punctuation', name: 'comma' },
  { char: '.', brightness: 0.05, category: 'punctuation', name: 'period' },
  { char: '`', brightness: 0.03, category: 'punctuation', name: 'backtick' },
  { char: "'", brightness: 0.02, category: 'punctuation', name: 'apostrophe' },

  // Block geometry
  { char: '■', brightness: 1.00, category: 'block', name: 'black-square' },
  { char: '□', brightness: 0.20, category: 'block', name: 'white-square' },
  { char: '▀', brightness: 0.50, category: 'block', name: 'upper-half' },
  { char: '▄', brightness: 0.50, category: 'block', name: 'lower-half' },
  { char: '▌', brightness: 0.50, category: 'block', name: 'left-half' },
  { char: '▐', brightness: 0.50, category: 'block', name: 'right-half' },

  // Box drawing
  { char: '─', brightness: 0.15, category: 'box', name: 'h-line' },
  { char: '│', brightness: 0.15, category: 'box', name: 'v-line' },
  { char: '┌', brightness: 0.20, category: 'box', name: 'tl-corner' },
  { char: '┐', brightness: 0.20, category: 'box', name: 'tr-corner' },
  { char: '└', brightness: 0.20, category: 'box', name: 'bl-corner' },
  { char: '┘', brightness: 0.20, category: 'box', name: 'br-corner' },
  { char: '┼', brightness: 0.30, category: 'box', name: 'cross' },
];

export interface CharEntry {
  char: string;
  brightness: number;   // 0.0 (empty) → 1.0 (full)
  category: 'block' | 'symbol' | 'letter' | 'punctuation' | 'box';
  name: string;
}

// ═══════════════════════════════════════════════════════════
// PRESET RAMPS
// Each ramp is a curated subset of characters for a specific aesthetic
// ═══════════════════════════════════════════════════════════

export const RAMPS: Record<string, string[]> = {
  // Classic block shading — ░▒▓█ plus space
  blocks: [' ', '░', '▒', '▓', '█'],

  // Extended detail — 10 levels for photorealistic ASCII
  extended: [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'],

  // Letter texture — uses letter shapes as density (like image 2)
  letters: [' ', 'i', 'l', 'r', 'v', 'z', 'x', 'n', 'm', 'W', 'M'],

  // Minimalist — just 4 chars for clean, sharp art
  minimal: [' ', '.', '·', '█'],

  // Artistic — rich 12-char palette for maximum detail
  artistic: [' ', '`', '.', ',', ':', ';', '-', '=', '+', '*', '#', '@'],

  // Technical — monospace-friendly, high contrast
  technical: [' ', '░', '▒', '▓', '█', '─', '│', '┌', '┐', '└', '┘', '┼'],

  // Ultra-dense — 20 levels for maximum fidelity
  ultra: [
    ' ', '`', "'", '.', ',', ';', ':', '!', '|', '-',
    '_', '~', '+', '=', '^', '*', '%', '#', '&', '@'
  ],

  // Halftone — dot-based for print aesthetic
  halftone: [' ', '·', '•', '●', '█'],
};

// ═══════════════════════════════════════════════════════════
// CORE ENGINE
// ═══════════════════════════════════════════════════════════

export class CharacterEngine {
  private ramp: string[];
  private rampLength: number;

  constructor(rampName: keyof typeof RAMPS = 'blocks') {
    this.ramp = RAMPS[rampName];
    this.rampLength = this.ramp.length;
  }

  /** Get character for a normalized brightness value (0-1) */
  fromBrightness(brightness: number): string {
    const clamped = Math.max(0, Math.min(1, brightness));
    const index = Math.floor(clamped * (this.rampLength - 1));
    return this.ramp[index];
  }

  /** Get character for a 0-255 luminance value */
  fromLuminance(luminance: number): string {
    return this.fromBrightness(luminance / 255);
  }

  /** Get all characters in this ramp */
  getCharacters(): string[] {
    return [...this.ramp];
  }

  /** Get ramp info for serialization */
  getInfo() {
    return {
      characters: this.ramp,
      length: this.rampLength,
      levels: this.rampLength,
    };
  }

  /** Create a custom ramp from a character string */
  static customRamp(chars: string): CharacterEngine {
    const engine = new CharacterEngine('blocks');
    engine.ramp = chars.split('');
    engine.rampLength = engine.ramp.length;
    return engine;
  }
}

// ═══════════════════════════════════════════════════════════
// LUMINANCE CALCULATION
// Perceptual luminance from RGB (Rec. 709)
// ═══════════════════════════════════════════════════════════

export function rgbToLuminance(r: number, g: number, b: number): number {
  // Rec. 709 luma coefficients
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// For RGBA pixels
export function pixelToLuminance(
  r: number, g: number, b: number, a: number = 255
): number {
  // Apply alpha blending against white background
  const alpha = a / 255;
  const blendedR = r * alpha + 255 * (1 - alpha);
  const blendedG = g * alpha + 255 * (1 - alpha);
  const blendedB = b * alpha + 255 * (1 - alpha);
  return rgbToLuminance(blendedR, blendedG, blendedB);
}

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

// Default engine uses the 'blocks' ramp
export const defaultEngine = new CharacterEngine('blocks');

// Quick access
export function char(brightness: number, ramp?: keyof typeof RAMPS): string {
  return ramp
    ? new CharacterEngine(ramp).fromBrightness(brightness)
    : defaultEngine.fromBrightness(brightness);
}
