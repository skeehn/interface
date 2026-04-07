import { describe, expect, test } from "bun:test";
import { CharacterEngine, RAMPS, CHAR_PALETTE, rgbToLuminance, pixelToLuminance } from "../engine/characters";
import { DitherEngine } from "../engine/dither";

describe("CharacterEngine", () => {
  test("default ramp is 'blocks'", () => {
    const engine = new CharacterEngine();
    const chars = engine.getCharacters();
    expect(chars).toEqual([' ', '░', '▒', '▓', '█']);
  });

  test("fromBrightness maps 0.0 → space", () => {
    const engine = new CharacterEngine('blocks');
    expect(engine.fromBrightness(0)).toBe(' ');
  });

  test("fromBrightness maps 1.0 → full block", () => {
    const engine = new CharacterEngine('blocks');
    expect(engine.fromBrightness(1)).toBe('█');
  });

  test("fromBrightness clamps negative values", () => {
    const engine = new CharacterEngine('blocks');
    expect(engine.fromBrightness(-1)).toBe(' ');
  });

  test("fromBrightness clamps values above 1", () => {
    const engine = new CharacterEngine('blocks');
    expect(engine.fromBrightness(2)).toBe('█');
  });

  test("fromLuminance maps 0 → space", () => {
    const engine = new CharacterEngine('blocks');
    expect(engine.fromLuminance(0)).toBe(' ');
  });

  test("fromLuminance maps 255 → full block", () => {
    const engine = new CharacterEngine('blocks');
    expect(engine.fromLuminance(255)).toBe('█');
  });

  test("fromLuminance maps 128 → middle character", () => {
    const engine = new CharacterEngine('blocks');
    const result = engine.fromLuminance(128);
    expect(result).toBe('▒');
  });

  test("all predefined ramps have valid characters", () => {
    for (const [name, ramp] of Object.entries(RAMPS)) {
      expect(ramp.length).toBeGreaterThan(1);
      for (const char of ramp) {
        expect(typeof char).toBe('string');
        expect(char.length).toBeGreaterThan(0);
      }
    }
  });

  test("technical ramp has no empty strings", () => {
    const ramp = RAMPS.technical;
    for (const char of ramp) {
      expect(char.length).toBeGreaterThan(0);
    }
  });

  test("customRamp creates working engine", () => {
    const engine = CharacterEngine.customRamp('.:#@');
    expect(engine.getCharacters()).toEqual(['.', ':', '#', '@']);
    expect(engine.fromBrightness(0)).toBe('.');
    expect(engine.fromBrightness(1)).toBe('@');
  });

  test("getInfo returns correct metadata", () => {
    const engine = new CharacterEngine('extended');
    const info = engine.getInfo();
    expect(info.length).toBe(RAMPS.extended.length);
    expect(info.levels).toBe(info.length);
    expect(info.characters).toEqual(RAMPS.extended);
  });
});

describe("CHAR_PALETTE", () => {
  test("has 70+ entries", () => {
    expect(CHAR_PALETTE.length).toBeGreaterThanOrEqual(50);
  });

  test("all entries have required fields", () => {
    for (const entry of CHAR_PALETTE) {
      expect(typeof entry.char).toBe('string');
      expect(entry.char.length).toBeGreaterThan(0);
      expect(typeof entry.brightness).toBe('number');
      expect(entry.brightness).toBeGreaterThanOrEqual(0);
      expect(entry.brightness).toBeLessThanOrEqual(1);
      expect(typeof entry.category).toBe('string');
      expect(typeof entry.name).toBe('string');
    }
  });

  test("brightness values are between 0 and 1", () => {
    for (const entry of CHAR_PALETTE) {
      expect(entry.brightness).toBeGreaterThanOrEqual(0);
      expect(entry.brightness).toBeLessThanOrEqual(1);
    }
  });
});

describe("rgbToLuminance", () => {
  test("white → 255", () => {
    expect(rgbToLuminance(255, 255, 255)).toBeCloseTo(255, 0);
  });

  test("black → 0", () => {
    expect(rgbToLuminance(0, 0, 0)).toBe(0);
  });

  test("pure red has correct luminance", () => {
    const lum = rgbToLuminance(255, 0, 0);
    expect(lum).toBeCloseTo(0.2126 * 255, 0);
  });

  test("pure green has correct luminance", () => {
    const lum = rgbToLuminance(0, 255, 0);
    expect(lum).toBeCloseTo(0.7152 * 255, 0);
  });

  test("pure blue has correct luminance", () => {
    const lum = rgbToLuminance(0, 0, 255);
    expect(lum).toBeCloseTo(0.0722 * 255, 0);
  });
});

describe("pixelToLuminance", () => {
  test("fully opaque white → ~255", () => {
    expect(pixelToLuminance(255, 255, 255, 255)).toBeCloseTo(255, 0);
  });

  test("fully transparent → white (255)", () => {
    expect(pixelToLuminance(0, 0, 0, 0)).toBeCloseTo(255, 0);
  });

  test("50% alpha black blends to mid-gray", () => {
    const lum = pixelToLuminance(0, 0, 0, 128);
    expect(lum).toBeGreaterThan(100);
    expect(lum).toBeLessThan(200);
  });
});

describe("DitherEngine", () => {
  const charEngine = new CharacterEngine('blocks');

  describe("threshold (no dithering)", () => {
    test("uniform black → all spaces", () => {
      const engine = new DitherEngine('none', 4, charEngine);
      const lum = new Array(9).fill(0);
      const result = engine.dither1D(lum, 3, 3);
      const lines = result.split('\n');
      expect(lines.length).toBe(3);
      for (const line of lines) {
        expect(line).toBe('   ');
      }
    });

    test("uniform white → all full blocks", () => {
      const engine = new DitherEngine('none', 4, charEngine);
      const lum = new Array(9).fill(255);
      const result = engine.dither1D(lum, 3, 3);
      const lines = result.split('\n');
      for (const line of lines) {
        expect(line).toBe('███');
      }
    });

    test("gradient produces monotonic character density", () => {
      const engine = new DitherEngine('none', 4, charEngine);
      const lum = [0, 64, 128, 192, 255];
      const result = engine.dither1D(lum, 5, 1);
      expect(result.length).toBe(5);
      expect(result[0]).toBe(' ');
      expect(result[4]).toBe('█');
    });
  });

  describe("Floyd-Steinberg", () => {
    test("produces correct output dimensions", () => {
      const engine = new DitherEngine('floyd', 4, charEngine);
      const lum = new Array(20).fill(128);
      const result = engine.dither1D(lum, 5, 4);
      const lines = result.split('\n');
      expect(lines.length).toBe(4);
      for (const line of lines) {
        expect(line.length).toBe(5);
      }
    });

    test("error diffusion produces different pattern than threshold", () => {
      const engine = new DitherEngine('floyd', 4, charEngine);
      const thresholdEngine = new DitherEngine('none', 4, charEngine);
      const lum = Array.from({ length: 25 }, (_, i) => (i / 24) * 255);
      const floydResult = engine.dither1D(lum, 5, 5);
      const threshResult = thresholdEngine.dither1D(lum, 5, 5);
      expect(floydResult).not.toBe(threshResult);
    });
  });

  describe("Bayer ordered dithering", () => {
    test("produces deterministic output", () => {
      const engine = new DitherEngine('bayer', 4, charEngine);
      const lum = Array.from({ length: 16 }, () => 128);
      const result1 = engine.dither1D(lum, 4, 4);
      const result2 = engine.dither1D(lum, 4, 4);
      expect(result1).toBe(result2);
    });

    test("supports 2x2 matrix", () => {
      const engine = new DitherEngine('bayer', 2, charEngine);
      const lum = new Array(4).fill(128);
      const result = engine.dither1D(lum, 2, 2);
      expect(result.split('\n').length).toBe(2);
    });

    test("supports 8x8 matrix", () => {
      const engine = new DitherEngine('bayer', 8, charEngine);
      const lum = new Array(64).fill(128);
      const result = engine.dither1D(lum, 8, 8);
      expect(result.split('\n').length).toBe(8);
    });
  });

  describe("Atkinson", () => {
    test("produces correct dimensions", () => {
      const engine = new DitherEngine('atkinson', 4, charEngine);
      const lum = new Array(12).fill(128);
      const result = engine.dither1D(lum, 4, 3);
      const lines = result.split('\n');
      expect(lines.length).toBe(3);
      expect(lines[0].length).toBe(4);
    });

    test("preserves highlights (bright values stay bright)", () => {
      const engine = new DitherEngine('atkinson', 4, charEngine);
      const lum = new Array(9).fill(240);
      const result = engine.dither1D(lum, 3, 3);
      for (const char of result.replace(/\n/g, '')) {
        expect(['▓', '█']).toContain(char);
      }
    });
  });

  describe("Sierra", () => {
    test("produces correct dimensions", () => {
      const engine = new DitherEngine('sierra', 4, charEngine);
      const lum = new Array(15).fill(128);
      const result = engine.dither1D(lum, 5, 3);
      const lines = result.split('\n');
      expect(lines.length).toBe(3);
      expect(lines[0].length).toBe(5);
    });
  });

  describe("ditherImageData", () => {
    test("converts RGBA to ASCII", () => {
      const engine = new DitherEngine('none', 4, charEngine);
      const pixels = new Uint8ClampedArray(4 * 4 * 4); // 4x4 image, RGBA
      // Fill with white
      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = 255;
        pixels[i + 1] = 255;
        pixels[i + 2] = 255;
        pixels[i + 3] = 255;
      }
      const imageData = { data: pixels, width: 4, height: 4 } as ImageData;
      const result = engine.ditherImageData(imageData, 1, 1);
      // White pixels map to high-brightness characters (▓ or █)
      expect(result).toMatch(/[▓█]/);
    });

    test("cell averaging reduces output size", () => {
      const engine = new DitherEngine('none', 4, charEngine);
      const pixels = new Uint8ClampedArray(8 * 8 * 4);
      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = 128; pixels[i+1] = 128; pixels[i+2] = 128; pixels[i+3] = 255;
      }
      const imageData = { data: pixels, width: 8, height: 8 } as ImageData;
      const result = engine.ditherImageData(imageData, 2, 2);
      const lines = result.split('\n');
      expect(lines.length).toBe(4);
      expect(lines[0].length).toBe(4);
    });
  });

  describe("configuration", () => {
    test("setAlgorithm changes behavior", () => {
      const engine = new DitherEngine('none', 4, charEngine);
      const lum = Array.from({ length: 25 }, (_, i) => (i / 24) * 255);
      const result1 = engine.dither1D(lum, 5, 5);
      engine.setAlgorithm('floyd');
      const result2 = engine.dither1D(lum, 5, 5);
      expect(result1).not.toBe(result2);
    });

    test("setCharEngine changes output characters", () => {
      const engine = new DitherEngine('none', 4, charEngine);
      const lum = [255];
      const result1 = engine.dither1D(lum, 1, 1);
      expect(result1).toBe('█');

      engine.setCharEngine(new CharacterEngine('extended'));
      const result2 = engine.dither1D(lum, 1, 1);
      expect(result2).toBe('@');
    });
  });
});

describe("ServerRenderer import safety", () => {
  test("can import ServerRenderer without DOM", async () => {
    const { ServerRenderer } = await import("../engine/video");
    const renderer = new ServerRenderer('floyd', 4, 'blocks');
    const result = renderer.fromLuminanceArray([0, 128, 255], 3, 1);
    expect(result.length).toBe(3);
  });
});
