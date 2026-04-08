import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AnimationEffect = 'rain' | 'flow' | 'pulse' | 'noise' | 'wave' | 'matrix';

export type AnimationPalette = 'blocks' | 'dots' | 'binary' | 'shades' | 'minimal';

export interface AsciiAnimationProps {
  /** Procedural animation effect. Default: 'rain' */
  effect?: AnimationEffect;
  /** Target frames per second. Default: 12 */
  fps?: number;
  /** Density of the animation (0-1). Default: 0.5 */
  density?: number;
  /** Character palette. Default: 'blocks' */
  palette?: AnimationPalette;
  /** CSS opacity of the animation layer. Default: 0.3 */
  opacity?: number;
  /** CSS color for the characters. Default: 'inherit' */
  color?: string;
  /** Additional CSS class names. */
  className?: string;
  /** Inline styles merged onto the wrapper. */
  style?: React.CSSProperties;
  /** Content rendered on top of the animation. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Palettes (dark-to-light ordering)
// ---------------------------------------------------------------------------

const PALETTES: Record<AnimationPalette, string[]> = {
  blocks: [' ', '\u2591', '\u2592', '\u2593', '\u2588'],
  dots: [' ', '\u00B7', ':', ';', '!', '|', 'l', 'x', 'X', '#', '@', '\u2588'],
  binary: [' ', '\u2588'],
  shades: [' ', '.', '`', '-', '~', '+', '=', '*', '#', '%', '@', '\u2588'],
  minimal: [' ', '\u2591', '\u2593'],
};

// ---------------------------------------------------------------------------
// Character sizing constants (approximate monospace character dimensions)
// ---------------------------------------------------------------------------

const CHAR_W = 6;
const CHAR_H = 10;

// ---------------------------------------------------------------------------
// Effect update functions
// ---------------------------------------------------------------------------

function fromBrightness(chars: string[], brightness: number): string {
  const clamped = Math.max(0, Math.min(1, brightness));
  const idx = Math.floor(clamped * (chars.length - 1));
  return chars[idx];
}

type EffectUpdater = (
  grid: string[][],
  state: Float32Array,
  cols: number,
  rows: number,
  time: number,
  density: number,
  chars: string[],
) => void;

const effects: Record<AnimationEffect, EffectUpdater> = {
  rain(grid, state, cols, rows, _time, density, chars) {
    for (let x = 0; x < cols; x++) {
      if (Math.random() < density * 0.1) {
        state[x] = rows;
      }
      for (let y = rows - 1; y >= 0; y--) {
        const idx = y * cols + x;
        if (state[idx] > 0) {
          state[idx] -= 1;
          grid[y][x] = fromBrightness(chars, state[idx] / rows);
        } else {
          grid[y][x] = ' ';
        }
      }
    }
  },

  flow(grid, _state, cols, rows, time, density, chars) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const val =
          Math.sin(x * 0.1 + time * 2) * Math.cos(y * 0.15 + time * 1.5) * 0.5 + 0.5;
        grid[y][x] = fromBrightness(chars, val * density);
      }
    }
  },

  pulse(grid, _state, cols, rows, time, density, chars) {
    const pulse = Math.sin(time * 3) * 0.5 + 0.5;
    const cx = cols / 2;
    const cy = rows / 2;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const wave = Math.sin(dist * 0.3 - time * 4) * 0.5 + 0.5;
        grid[y][x] = fromBrightness(chars, wave * pulse * density);
      }
    }
  },

  noise(grid, _state, cols, rows, _time, density, chars) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (Math.random() < density * 0.3) {
          grid[y][x] = chars[Math.floor(Math.random() * chars.length)];
        } else {
          grid[y][x] = ' ';
        }
      }
    }
  },

  wave(grid, _state, cols, rows, time, density, chars) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const w = Math.sin(x * 0.2 + time * 3 + y * 0.1) * 0.5 + 0.5;
        grid[y][x] = fromBrightness(chars, w > 1 - density ? w : 0);
      }
    }
  },

  matrix(grid, state, cols, rows, _time, density, chars) {
    for (let x = 0; x < cols; x++) {
      if (Math.random() < 0.02) state[x] = 0;
      if (state[x] < rows) {
        const y = Math.floor(state[x]);
        if (y >= 0 && y < rows) {
          grid[y][x] = chars[Math.floor(Math.random() * chars.length)];
        }
        state[x] += density * 2;
      }
      // Fade existing characters
      for (let y = 0; y < rows; y++) {
        if (y !== Math.floor(state[x])) {
          const fade = grid[y][x];
          if (fade !== ' ') {
            const currentIdx = chars.indexOf(fade);
            if (currentIdx > 0) {
              grid[y][x] = chars[currentIdx - 1];
            } else {
              grid[y][x] = ' ';
            }
          }
        }
      }
    }
  },
};

// ---------------------------------------------------------------------------
// Static frame for reduced-motion
// ---------------------------------------------------------------------------

function renderStaticFrame(
  cols: number,
  rows: number,
  density: number,
  chars: string[],
): string {
  const lines: string[] = [];
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      if (Math.random() < density * 0.15) {
        line += chars[Math.floor(Math.random() * chars.length)];
      } else {
        line += ' ';
      }
    }
    lines.push(line);
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Procedural ASCII animation overlay.
 *
 * Renders a full-container animated ASCII pattern as a `<pre>` element using
 * requestAnimationFrame with frame budgeting. Respects prefers-reduced-motion
 * by rendering a single static frame.
 */
export const AsciiAnimation = React.forwardRef<HTMLDivElement, AsciiAnimationProps>(
  (
    {
      effect = 'rain',
      fps = 12,
      density = 0.5,
      palette: paletteName = 'blocks',
      opacity = 0.3,
      color = 'inherit',
      className,
      style,
      children,
    },
    ref,
  ) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const preRef = useRef<HTMLPreElement>(null);
    const frameRef = useRef<number>(0);
    const gridRef = useRef<string[][]>([]);
    const stateRef = useRef<Float32Array>(new Float32Array(0));
    const dimsRef = useRef<{ cols: number; rows: number }>({ cols: 0, rows: 0 });
    const [reducedMotion, setReducedMotion] = useState(false);

    const chars = useMemo(() => PALETTES[paletteName] ?? PALETTES.blocks, [paletteName]);

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

    // Resize calculation
    const recalcDimensions = useCallback(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const cols = Math.max(1, Math.floor(wrapper.clientWidth / CHAR_W));
      const rows = Math.max(1, Math.floor(wrapper.clientHeight / CHAR_H));

      dimsRef.current = { cols, rows };
      gridRef.current = Array.from({ length: rows }, () => Array(cols).fill(' '));
      stateRef.current = new Float32Array(cols * rows);
    }, []);

    // ResizeObserver
    useEffect(() => {
      if (!isBrowser) return;
      const wrapper = wrapperRef.current;
      if (!wrapper || typeof ResizeObserver === 'undefined') return;

      recalcDimensions();
      const ro = new ResizeObserver(() => recalcDimensions());
      ro.observe(wrapper);
      return () => ro.disconnect();
    }, [isBrowser, recalcDimensions]);

    // Render static frame for reduced motion
    useEffect(() => {
      if (!isBrowser || !reducedMotion) return;

      recalcDimensions();
      const { cols, rows } = dimsRef.current;
      if (cols > 0 && rows > 0 && preRef.current) {
        preRef.current.textContent = renderStaticFrame(cols, rows, density, chars);
      }
    }, [isBrowser, reducedMotion, density, chars, recalcDimensions]);

    // Animation loop
    useEffect(() => {
      if (!isBrowser || reducedMotion) return;

      let running = true;
      let lastTick = 0;
      const interval = 1000 / fps;
      const effectFn = effects[effect] ?? effects.rain;

      const tick = (now: number) => {
        if (!running) return;

        if (now - lastTick >= interval) {
          lastTick = now;
          const { cols, rows } = dimsRef.current;

          if (cols > 0 && rows > 0) {
            effectFn(gridRef.current, stateRef.current, cols, rows, now / 1000, density, chars);

            if (preRef.current) {
              preRef.current.textContent = gridRef.current
                .map((row) => row.join(''))
                .join('\n');
            }
          }
        }

        frameRef.current = requestAnimationFrame(tick);
      };

      // Ensure dimensions are set before starting
      recalcDimensions();
      frameRef.current = requestAnimationFrame(tick);

      return () => {
        running = false;
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }, [isBrowser, reducedMotion, effect, fps, density, chars, recalcDimensions]);

    // Merge refs
    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref],
    );

    if (!isBrowser) {
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

    return (
      <div
        ref={setRefs}
        className={className}
        style={{
          position: 'relative',
          overflow: 'hidden',
          ...style,
        }}
      >
        <pre
          ref={preRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            fontFamily: 'var(--sk-font-mono, monospace)',
            fontSize: '0.6rem',
            lineHeight: 1.1,
            color,
            opacity,
            pointerEvents: 'none',
            zIndex: 0,
            userSelect: 'none',
          }}
        />
        {children && (
          <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        )}
      </div>
    );
  },
);

AsciiAnimation.displayName = 'AsciiAnimation';
