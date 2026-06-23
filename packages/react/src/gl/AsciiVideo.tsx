'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AsciiVideoAlgorithm = 'bayer' | 'floyd' | 'atkinson';

export type AsciiVideoPalette = 'blocks' | 'dots' | 'binary' | 'shades' | 'minimal';

export interface AsciiVideoProps {
  /**
   * Video source. Can be:
   * - A string URL to a video file
   * - A React ref to an existing HTMLVideoElement
   * - The literal string 'webcam' to request camera access
   */
  src: string | React.RefObject<HTMLVideoElement | null>;
  /** Dithering algorithm. Default: 'bayer' */
  algorithm?: AsciiVideoAlgorithm;
  /** Character palette. Default: 'dots' */
  palette?: AsciiVideoPalette;
  /** Width in characters. Default: 80 */
  resolution?: number;
  /** Target frames per second. Default: 30 */
  fps?: number;
  /** Preserve original colors (span per character). Default: false */
  color?: boolean;
  /** Invert luminance mapping. Default: false */
  invert?: boolean;
  /** Additional CSS class names. */
  className?: string;
  /** Inline styles applied to the wrapper. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Palettes
// ---------------------------------------------------------------------------

const PALETTES: Record<AsciiVideoPalette, string[]> = {
  blocks: [' ', '\u2591', '\u2592', '\u2593', '\u2588'],
  dots: [' ', '\u00B7', ':', ';', '!', '|', 'l', 'x', 'X', '#', '@', '\u2588'],
  binary: [' ', '\u2588'],
  shades: [' ', '.', '`', '-', '~', '+', '=', '*', '#', '%', '@', '\u2588'],
  minimal: [' ', '\u2591', '\u2593'],
};

// ---------------------------------------------------------------------------
// Frame rendering
// ---------------------------------------------------------------------------

interface ColorChar {
  char: string;
  r: number;
  g: number;
  b: number;
}

function renderVideoFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  palette: string[],
  cols: number,
  invert: boolean,
  color: boolean,
): { text: string; colorLines: ColorChar[][] | null } {
  const { videoWidth: vw, videoHeight: vh } = video;
  if (!vw || !vh) return { text: '', colorLines: null };

  if (canvas.width !== vw || canvas.height !== vh) {
    canvas.width = vw;
    canvas.height = vh;
  }

  ctx.drawImage(video, 0, 0);

  const charAspect = 0.45;
  const cellW = Math.max(1, Math.floor(vw / cols));
  const cellH = Math.max(1, Math.round(cellW / charAspect));
  const rows = Math.floor(vh / cellH);
  const actualCols = Math.floor(vw / cellW);

  const fullData = ctx.getImageData(0, 0, vw, vh);
  const d = fullData.data;

  const textLines: string[] = [];
  const colorLines: ColorChar[][] | null = color ? [] : null;

  for (let r = 0; r < rows; r++) {
    let line = '';
    const colorRow: ColorChar[] = [];

    for (let c = 0; c < actualCols; c++) {
      const px = c * cellW;
      const py = r * cellH;
      const w = Math.min(cellW, vw - px);
      const h = Math.min(cellH, vh - py);

      if (w <= 0 || h <= 0) {
        line += ' ';
        if (color) colorRow.push({ char: ' ', r: 0, g: 0, b: 0 });
        continue;
      }

      let lumSum = 0;
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let count = 0;

      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          const i = ((py + dy) * vw + (px + dx)) * 4;
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

    textLines.push(line);
    if (colorLines) colorLines.push(colorRow);
  }

  return { text: textLines.join('\n'), colorLines };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Real-time video-to-ASCII renderer.
 *
 * Accepts a video URL, an existing video element ref, or the string 'webcam'
 * to request camera access via getUserMedia. Each frame is sampled on a
 * hidden canvas and converted to ASCII characters in a <pre> element.
 */
export const AsciiVideo = React.forwardRef<HTMLPreElement, AsciiVideoProps>(
  (
    {
      src,
      algorithm = 'bayer',
      palette: paletteName = 'dots',
      resolution = 80,
      fps = 30,
      color = false,
      invert = false,
      className,
      style,
    },
    ref,
  ) => {
    const preRef = useRef<HTMLPreElement>(null);
    const internalVideoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const frameRef = useRef<number>(0);
    const streamRef = useRef<MediaStream | null>(null);
    const [text, setText] = useState('');
    const [colorLines, setColorLines] = useState<ColorChar[][] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reducedMotion, setReducedMotion] = useState(false);

    const palette = useMemo(() => PALETTES[paletteName] ?? PALETTES.dots, [paletteName]);

    const isBrowser = typeof window !== 'undefined';

    // Reduced motion detection
    useEffect(() => {
      if (!isBrowser) return;
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }, [isBrowser]);

    // Resolve the video element
    const getVideo = useCallback((): HTMLVideoElement | null => {
      if (typeof src === 'object' && src && 'current' in src) {
        return src.current;
      }
      return internalVideoRef.current;
    }, [src]);

    // Initialize canvas
    useEffect(() => {
      if (!isBrowser) return;
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      ctxRef.current = canvasRef.current.getContext('2d', { willReadFrequently: true });
    }, [isBrowser]);

    // Setup video source
    useEffect(() => {
      if (!isBrowser) return;

      // If src is a ref, we don't manage the video element
      if (typeof src === 'object') return;

      let cancelled = false;

      if (src === 'webcam') {
        // Request camera access
        if (!navigator.mediaDevices?.getUserMedia) {
          setError('getUserMedia is not supported in this browser');
          return;
        }

        const video = document.createElement('video');
        video.playsInline = true;
        video.muted = true;
        internalVideoRef.current = video;

        navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then((stream) => {
            if (cancelled) {
              stream.getTracks().forEach((t) => t.stop());
              return;
            }
            streamRef.current = stream;
            video.srcObject = stream;
            video.play().catch(() => {});
          })
          .catch((err) => {
            if (!cancelled) setError(`Camera access denied: ${err.message}`);
          });
      } else {
        // URL source
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.playsInline = true;
        video.muted = true;
        video.loop = true;
        video.src = src;
        internalVideoRef.current = video;
        video.play().catch(() => {});
      }

      return () => {
        cancelled = true;
        // Cleanup webcam stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (internalVideoRef.current) {
          internalVideoRef.current.pause();
          internalVideoRef.current.srcObject = null;
          internalVideoRef.current.removeAttribute('src');
          internalVideoRef.current = null;
        }
      };
    }, [src, isBrowser]);

    // Animation loop
    useEffect(() => {
      if (!isBrowser || reducedMotion) return;

      let running = true;
      let lastTime = 0;
      const interval = 1000 / fps;

      const tick = (now: number) => {
        if (!running) return;

        if (now - lastTime >= interval) {
          lastTime = now;

          const video = getVideo();
          const canvas = canvasRef.current;
          const ctx = ctxRef.current;

          if (video && canvas && ctx && !video.paused && !video.ended && video.readyState >= 2) {
            const result = renderVideoFrame(video, canvas, ctx, palette, resolution, invert, color);
            if (color) {
              setColorLines(result.colorLines);
            } else {
              setText(result.text);
            }
          }
        }

        frameRef.current = requestAnimationFrame(tick);
      };

      frameRef.current = requestAnimationFrame(tick);

      return () => {
        running = false;
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }, [isBrowser, fps, palette, resolution, invert, color, getVideo, reducedMotion]);

    // Reduced motion: render a single frame when video is ready
    useEffect(() => {
      if (!isBrowser || !reducedMotion) return;

      const video = getVideo();
      if (!video) return;

      const onCanPlay = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;
        const result = renderVideoFrame(video, canvas, ctx, palette, resolution, invert, color);
        if (color) setColorLines(result.colorLines);
        else setText(result.text);
      };

      video.addEventListener('canplay', onCanPlay);
      if (video.readyState >= 2) onCanPlay();

      return () => video.removeEventListener('canplay', onCanPlay);
    }, [isBrowser, reducedMotion, getVideo, palette, resolution, invert, color]);

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

    if (!isBrowser) {
      return (
        <pre ref={setRefs} className={className} style={baseStyle} aria-label="ASCII video" />
      );
    }

    if (error) {
      return (
        <pre ref={setRefs} className={className} style={baseStyle}>
          {`[Error: ${error}]`}
        </pre>
      );
    }

    if (color && colorLines) {
      return (
        <pre ref={setRefs} className={className} style={baseStyle}>
          {colorLines.map((row, y) => (
            <React.Fragment key={y}>
              {row.map((cell, x) => (
                <span key={x} style={{ color: `rgb(${cell.r},${cell.g},${cell.b})` }}>
                  {cell.char}
                </span>
              ))}
              {'\n'}
            </React.Fragment>
          ))}
        </pre>
      );
    }

    return (
      <pre ref={setRefs} className={className} style={baseStyle}>
        {text}
      </pre>
    );
  },
);

AsciiVideo.displayName = 'AsciiVideo';
