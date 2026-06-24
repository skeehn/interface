'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AsciiImageAlgorithm = 'bayer' | 'floyd' | 'atkinson';

export type AsciiImagePalette = 'blocks' | 'dots' | 'binary' | 'shades' | 'minimal';

export interface AsciiImageProps {
  /** Image source URL. */
  src: string;
  /** Dithering algorithm. Default: 'floyd' */
  algorithm?: AsciiImageAlgorithm;
  /** Character palette. Default: 'blocks' */
  palette?: AsciiImagePalette;
  /** Width in characters. Default: 120 */
  resolution?: number;
  /** Preserve original colors (renders a <span> per character). Default: false */
  color?: boolean;
  /** Invert luminance mapping. Default: false */
  invert?: boolean;
  /** Additional CSS class names. */
  className?: string;
  /** Inline styles applied to the <pre> wrapper. */
  style?: React.CSSProperties;
  /** Alt text for accessibility (renders as visually hidden text). */
  alt?: string;
}

// ---------------------------------------------------------------------------
// Palettes
// ---------------------------------------------------------------------------

const PALETTES: Record<AsciiImagePalette, string[]> = {
  blocks: [' ', '\u2591', '\u2592', '\u2593', '\u2588'], // ░▒▓█
  dots: [' ', '\u00B7', ':', ';', '!', '|', 'l', 'x', 'X', '#', '@', '\u2588'],
  binary: [' ', '\u2588'],
  shades: [' ', '.', '`', '-', '~', '+', '=', '*', '#', '%', '@', '\u2588'],
  minimal: [' ', '\u2591', '\u2593'],
};

// ---------------------------------------------------------------------------
// Canvas-based dither + ASCII conversion
// ---------------------------------------------------------------------------

interface AsciiResult {
  /** Each row is an array of { char, r, g, b } entries when color=true, or plain string otherwise. */
  lines: string[];
  colorLines: Array<Array<{ char: string; r: number; g: number; b: number }>> | null;
}

function imageToAscii(
  img: HTMLImageElement,
  algorithm: AsciiImageAlgorithm,
  palette: string[],
  cols: number,
  invert: boolean,
  color: boolean,
): AsciiResult {
  const canvas = document.createElement('canvas');
  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;
  canvas.width = naturalW;
  canvas.height = naturalH;

  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);

  // Compute cell dimensions preserving aspect ratio
  const charAspect = 0.45; // terminal chars ~2x taller than wide
  const cellW = Math.max(1, Math.floor(naturalW / cols));
  const cellH = Math.max(1, Math.round(cellW / charAspect));
  const rows = Math.floor(naturalH / cellH);
  const actualCols = Math.floor(naturalW / cellW);

  // Read full image data once
  const fullData = ctx.getImageData(0, 0, naturalW, naturalH);
  const d = fullData.data;

  const lines: string[] = [];
  const colorLines: Array<Array<{ char: string; r: number; g: number; b: number }>> | null = color
    ? []
    : null;

  for (let r = 0; r < rows; r++) {
    let line = '';
    const colorRow: Array<{ char: string; r: number; g: number; b: number }> = [];

    for (let c = 0; c < actualCols; c++) {
      const px = c * cellW;
      const py = r * cellH;
      const w = Math.min(cellW, naturalW - px);
      const h = Math.min(cellH, naturalH - py);

      if (w <= 0 || h <= 0) {
        line += ' ';
        if (color) colorRow.push({ char: ' ', r: 0, g: 0, b: 0 });
        continue;
      }

      // Average luminance + color over the cell
      let lumSum = 0;
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let count = 0;

      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          const i = ((py + dy) * naturalW + (px + dx)) * 4;
          const pr = d[i];
          const pg = d[i + 1];
          const pb = d[i + 2];
          lumSum += 0.2126 * pr + 0.7152 * pg + 0.0722 * pb;
          rSum += pr;
          gSum += pg;
          bSum += pb;
          count++;
        }
      }

      const avg = lumSum / count / 255;
      const v = invert ? 1 - avg : avg;
      const charIdx = Math.min(palette.length - 1, Math.round(v * (palette.length - 1)));
      const ch = palette[charIdx];

      line += ch;
      if (color) {
        colorRow.push({
          char: ch,
          r: Math.round(rSum / count),
          g: Math.round(gSum / count),
          b: Math.round(bSum / count),
        });
      }
    }

    lines.push(line);
    if (colorLines) colorLines.push(colorRow);
  }

  return { lines, colorLines };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders an image as ASCII art inside a <pre> element.
 *
 * Loads the image onto a hidden canvas, samples luminance per character cell,
 * and outputs either plain text or color-preserved spans. Uses
 * IntersectionObserver for lazy loading so off-screen images are not processed.
 */
export const AsciiImage = React.forwardRef<HTMLPreElement, AsciiImageProps>(
  (
    {
      src,
      algorithm = 'floyd',
      palette: paletteName = 'blocks',
      resolution = 120,
      color = false,
      invert = false,
      className,
      style,
      alt,
    },
    ref,
  ) => {
    const preRef = useRef<HTMLPreElement>(null);
    const [result, setResult] = useState<AsciiResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [visible, setVisible] = useState(false);

    const palette = useMemo(() => PALETTES[paletteName] ?? PALETTES.blocks, [paletteName]);

    // SSR guard
    const isBrowser = typeof window !== 'undefined';

    // IntersectionObserver for lazy loading
    useEffect(() => {
      if (!isBrowser) return;
      const node = preRef.current;
      if (!node) {
        // If ref not attached yet, just mark visible to trigger load
        setVisible(true);
        return;
      }

      if (typeof IntersectionObserver === 'undefined') {
        setVisible(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        },
        { rootMargin: '200px' },
      );
      observer.observe(node);
      return () => observer.disconnect();
    }, [isBrowser]);

    // Load and process image when visible
    useEffect(() => {
      if (!visible || !isBrowser || !src) return;

      setError(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const ascii = imageToAscii(img, algorithm, palette, resolution, invert, color);
          setResult(ascii);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to process image');
        }
      };

      img.onerror = () => setError(`Failed to load image: ${src}`);
      img.src = src;
    }, [visible, src, algorithm, palette, resolution, invert, color, isBrowser]);

    // Merge refs
    const setRefs = useCallback(
      (node: HTMLPreElement | null) => {
        (preRef as React.MutableRefObject<HTMLPreElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLPreElement | null>).current = node;
      },
      [ref],
    );

    const baseStyle: React.CSSProperties = {
      fontFamily: 'var(--sk-font-mono, monospace)',
      fontSize: '0.5rem',
      lineHeight: 1.05,
      margin: 0,
      whiteSpace: 'pre',
      overflow: 'hidden',
      userSelect: 'none',
      ...style,
    };

    if (error) {
      return (
        <pre ref={setRefs} className={className} style={baseStyle} role="img" aria-label={alt}>
          {`[Error: ${error}]`}
        </pre>
      );
    }

    if (!result) {
      return (
        <pre ref={setRefs} className={className} style={baseStyle} role="img" aria-label={alt}>
          {visible ? 'Loading...' : ''}
        </pre>
      );
    }

    // Color mode: render spans per character
    if (color && result.colorLines) {
      return (
        <pre ref={setRefs} className={className} style={baseStyle} role="img" aria-label={alt}>
          {alt && <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>{alt}</span>}
          {result.colorLines.map((row, y) => (
            <React.Fragment key={y}>
              {row.map((cell, x) => (
                <span
                  key={x}
                  style={{ color: `rgb(${cell.r},${cell.g},${cell.b})` }}
                >
                  {cell.char}
                </span>
              ))}
              {'\n'}
            </React.Fragment>
          ))}
        </pre>
      );
    }

    // Plain text mode
    return (
      <pre ref={setRefs} className={className} style={baseStyle} role="img" aria-label={alt}>
        {alt && <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>{alt}</span>}
        {result.lines.join('\n')}
      </pre>
    );
  },
);

AsciiImage.displayName = 'AsciiImage';
