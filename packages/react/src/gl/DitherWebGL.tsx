import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { parseCSSColor as parseCSSColorShared, type RGBA } from '../../../../engine/color';

/**
 * DitherWebGL — GPU-accelerated dither overlay
 * --------------------------------------------
 * A drop-in component that renders a dithered surface (gradient, image, video,
 * or any external `HTMLCanvasElement`) behind its children, using a fragment
 * shader for real-time performance at native resolution.
 *
 * Algorithms: bayer (2/4/8), blue-noise (hash), halftone (radial), crosshatch.
 * Palette mapping: any number of colors, quantized via luminance.
 * Sources: built-in linear/radial gradient, or external `HTMLImageElement` /
 *          `HTMLVideoElement` / `HTMLCanvasElement` via the `source` prop.
 *
 * Falls back gracefully to a CSS gradient when WebGL is unavailable.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DitherWebGLAlgorithm =
  | 'bayer'
  | 'blue-noise'
  | 'halftone'
  | 'crosshatch';

export type DitherWebGLMatrix = 2 | 4 | 8;

export interface DitherGradientStop {
  /** 0..1 position along the gradient. */
  pos: number;
  /** Any CSS color string. */
  color: string;
}

export interface DitherGradient {
  /** Gradient shape. Default: 'linear'. */
  type?: 'linear' | 'radial';
  /** Angle in degrees for linear gradients. 0 = top→bottom. Default: 135. */
  angle?: number;
  /** Color stops (need at least two). Default: black → white. */
  stops?: DitherGradientStop[];
}

export type DitherSource =
  | HTMLImageElement
  | HTMLVideoElement
  | HTMLCanvasElement
  | string; // string = image URL (loaded internally)

/**
 * Mask shape — controls how the dithered surface is faded to transparency at
 * its edges. Lets the dither sit inside whitespace rather than always being a
 * full-bleed wall of texture. Default: 'none'.
 *
 * - `none`     — solid alpha everywhere (legacy behavior)
 * - `radial`   — fades from center outward; combine with `maskFade` for the
 *                width of the falloff (use case: dither blob with soft edges)
 * - `linear`   — fades along `maskAngle`; useful for "dither at the top, clean
 *                at the bottom" cards
 * - `vignette` — opaque in the center, falls off near the rect borders
 *                (use case: framed photograph feel)
 */
export type DitherWebGLMask = 'none' | 'radial' | 'linear' | 'vignette';

export interface DitherWebGLProps {
  /** Algorithm used for thresholding. Default: 'bayer'. */
  algorithm?: DitherWebGLAlgorithm;
  /** Bayer matrix size (ignored for non-bayer algorithms). Default: 8. */
  matrix?: DitherWebGLMatrix;
  /** Pixels per dither cell (≥1). Larger = chunkier output. Default: 2. */
  cellSize?: number;
  /** Threshold spread; controls dither contrast. 0..1. Default: 0.5. */
  threshold?: number;
  /**
   * Mask shape controlling how alpha fades at the edges. Use to compose dither
   * with whitespace — e.g. a circular dither blob in the corner of a card,
   * a top-half-dithered hero, or a vignetted photograph. Default: 'none'.
   */
  mask?: DitherWebGLMask;
  /**
   * Fade width for radial / vignette / linear masks. 0 = sharp cutoff,
   * 1 = the entire surface is the falloff. Default: 0.4.
   */
  maskFade?: number;
  /**
   * Angle (degrees) for the linear mask, measured from the +x axis going
   * counter-clockwise. 0 = fade L→R, 90 = fade T→B, 180 = fade R→L.
   * Ignored when `mask !== 'linear'`. Default: 90.
   */
  maskAngle?: number;
  /**
   * Color palette used to quantize the dithered luminance. Provide 2–8 colors;
   * pixels are mapped to the nearest entry by luma. Default: ['#000','#fff'].
   */
  palette?: string[];
  /** External source overriding the built-in gradient. */
  source?: DitherSource;
  /** Built-in procedural gradient (ignored when `source` is set). */
  gradient?: DitherGradient;
  /** Enable animated gradient distortion. Default: false. */
  animate?: boolean;
  /** Animation speed multiplier. Default: 1. */
  speed?: number;
  /**
   * Render the dithered layer at the device pixel ratio. Set to a number to
   * pin a custom DPR (lower = faster). Default: true (uses window.devicePixelRatio).
   */
  pixelRatio?: boolean | number;
  /** Additional CSS class for the wrapper element. */
  className?: string;
  /** Inline styles for the wrapper element. */
  style?: React.CSSProperties;
  /** Content rendered on top of the dither layer. */
  children?: React.ReactNode;
}

export interface DitherWebGLHandle {
  /** Force a single redraw at the current settings. */
  redraw(): void;
  /** Export the current dither frame as a PNG data URL. */
  toDataURL(type?: string, quality?: number): string | null;
  /** Returns true when the WebGL pipeline initialised successfully. */
  readonly isReady: boolean;
}

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

/**
 * Master fragment shader. Branches at runtime via uniforms so we only compile
 * one program — the cost of a few conditionals is negligible vs. relinking.
 */
const FRAG = `
precision highp float;

varying vec2 v_uv;

uniform vec2  u_res;        // canvas size in pixels
uniform float u_time;       // seconds
uniform float u_cellSize;   // pixels per cell (>=1)
uniform float u_threshold;  // 0..1 spread
uniform int   u_algo;       // 0=bayer 1=blue-noise 2=halftone 3=crosshatch
uniform int   u_matrix;     // 2,4,8 (bayer)
uniform float u_animate;    // 0 or 1
uniform float u_speed;

// Source: either a sampled texture or a procedural gradient.
uniform sampler2D u_src;
uniform float u_useSrc;     // 1 = texture, 0 = gradient
uniform float u_grad_kind;  // 0 = linear, 1 = radial
uniform float u_grad_angle; // radians (linear only)
uniform vec4  u_grad_c0;
uniform vec4  u_grad_c1;
uniform vec4  u_grad_c2;
uniform vec4  u_grad_c3;
uniform vec4  u_grad_c4;
uniform vec4  u_grad_c5;
uniform float u_grad_p0;
uniform float u_grad_p1;
uniform float u_grad_p2;
uniform float u_grad_p3;
uniform float u_grad_p4;
uniform float u_grad_p5;
uniform int   u_grad_count;

// Palette (up to 8 entries) sampled into output colors.
uniform vec4  u_pal[8];
uniform int   u_pal_count;

// Mask — controls per-pixel alpha to fade the dither into whitespace.
uniform int   u_mask_kind;   // 0=none 1=radial 2=linear 3=vignette
uniform float u_mask_fade;   // 0..1 width of falloff
uniform float u_mask_angle;  // radians, linear only

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

float bayer4(vec2 p) {
  // Inlined 4x4 Bayer matrix.
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  int idx = y * 4 + x;
  float v = 0.0;
  if (idx == 0)  v = 0.0;  else if (idx == 1)  v = 8.0;
  else if (idx == 2)  v = 2.0;  else if (idx == 3)  v = 10.0;
  else if (idx == 4)  v = 12.0; else if (idx == 5)  v = 4.0;
  else if (idx == 6)  v = 14.0; else if (idx == 7)  v = 6.0;
  else if (idx == 8)  v = 3.0;  else if (idx == 9)  v = 11.0;
  else if (idx == 10) v = 1.0;  else if (idx == 11) v = 9.0;
  else if (idx == 12) v = 15.0; else if (idx == 13) v = 7.0;
  else if (idx == 14) v = 13.0; else if (idx == 15) v = 5.0;
  return v / 16.0;
}

float bayer2(vec2 p) {
  int x = int(mod(p.x, 2.0));
  int y = int(mod(p.y, 2.0));
  int idx = y * 2 + x;
  float v = 0.0;
  if (idx == 0) v = 0.0;
  else if (idx == 1) v = 2.0;
  else if (idx == 2) v = 3.0;
  else if (idx == 3) v = 1.0;
  return v / 4.0;
}

float bayer8(vec2 p) {
  // Recursive construction from bayer4.
  vec2 hi = floor(p / 2.0);
  vec2 lo = mod(p, 2.0);
  return (bayer4(hi) * 4.0 + bayer2(lo)) / 4.0;
}

// Cheap hash-based blue-noise-ish dither.
float hashNoise(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 sampleGradient(vec2 uv) {
  float t;
  if (u_grad_kind < 0.5) {
    // Linear gradient
    float a = u_grad_angle;
    vec2 dir = vec2(cos(a), sin(a));
    t = dot(uv - 0.5, dir) + 0.5;
  } else {
    // Radial gradient (centered)
    t = distance(uv, vec2(0.5)) * 1.4142;
  }
  if (u_animate > 0.5) {
    float w = sin(u_time * u_speed + uv.y * 6.2831) * 0.08 +
              cos(u_time * 0.7 * u_speed + uv.x * 4.0) * 0.06;
    t = clamp(t + w, 0.0, 1.0);
  }
  t = clamp(t, 0.0, 1.0);

  // Multi-stop interpolation. We hand-roll the loop so old GLSL/WebGL1 is happy.
  vec3 col = u_grad_c0.rgb;
  if (u_grad_count >= 2 && t >= u_grad_p0) {
    float k = clamp((t - u_grad_p0) / max(u_grad_p1 - u_grad_p0, 1e-4), 0.0, 1.0);
    col = mix(u_grad_c0.rgb, u_grad_c1.rgb, k);
  }
  if (u_grad_count >= 3 && t >= u_grad_p1) {
    float k = clamp((t - u_grad_p1) / max(u_grad_p2 - u_grad_p1, 1e-4), 0.0, 1.0);
    col = mix(u_grad_c1.rgb, u_grad_c2.rgb, k);
  }
  if (u_grad_count >= 4 && t >= u_grad_p2) {
    float k = clamp((t - u_grad_p2) / max(u_grad_p3 - u_grad_p2, 1e-4), 0.0, 1.0);
    col = mix(u_grad_c2.rgb, u_grad_c3.rgb, k);
  }
  if (u_grad_count >= 5 && t >= u_grad_p3) {
    float k = clamp((t - u_grad_p3) / max(u_grad_p4 - u_grad_p3, 1e-4), 0.0, 1.0);
    col = mix(u_grad_c3.rgb, u_grad_c4.rgb, k);
  }
  if (u_grad_count >= 6 && t >= u_grad_p4) {
    float k = clamp((t - u_grad_p4) / max(u_grad_p5 - u_grad_p4, 1e-4), 0.0, 1.0);
    col = mix(u_grad_c4.rgb, u_grad_c5.rgb, k);
  }
  return col;
}

// Map a luma value to the nearest palette entry.
vec3 quantize(float L) {
  if (u_pal_count <= 1) return u_pal[0].rgb;
  float idx = floor(L * float(u_pal_count - 1) + 0.5);
  idx = clamp(idx, 0.0, float(u_pal_count - 1));
  if (idx < 0.5) return u_pal[0].rgb;
  if (idx < 1.5) return u_pal[1].rgb;
  if (idx < 2.5) return u_pal[2].rgb;
  if (idx < 3.5) return u_pal[3].rgb;
  if (idx < 4.5) return u_pal[4].rgb;
  if (idx < 5.5) return u_pal[5].rgb;
  if (idx < 6.5) return u_pal[6].rgb;
  return u_pal[7].rgb;
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy / u_cellSize);
  vec2 cellUV = (cell * u_cellSize + u_cellSize * 0.5) / u_res;

  vec3 src;
  if (u_useSrc > 0.5) {
    vec2 sUV = vec2(cellUV.x, 1.0 - cellUV.y);
    src = texture2D(u_src, sUV).rgb;
  } else {
    src = sampleGradient(cellUV);
  }
  float L = luma(src);

  float d = 0.5;
  if (u_algo == 0) {
    if (u_matrix == 2) d = bayer2(cell);
    else if (u_matrix == 8) d = bayer8(cell);
    else d = bayer4(cell);
  } else if (u_algo == 1) {
    d = hashNoise(cell);
  } else if (u_algo == 2) {
    // Halftone — radial within each cell.
    vec2 f = fract(gl_FragCoord.xy / u_cellSize) - 0.5;
    float r = length(f) * 2.0;     // 0..~1.4
    d = 1.0 - r;                    // brighter near center
  } else {
    // Crosshatch — diagonal lines, density depends on luma.
    vec2 f = gl_FragCoord.xy;
    float l1 = step(0.5, fract((f.x + f.y) / u_cellSize));
    float l2 = step(0.5, fract((f.x - f.y) / u_cellSize));
    d = mix(l1, (l1 + l2) * 0.5, 0.5);
  }

  // Apply threshold spread, then quantize through the palette.
  float adjusted = L + (d - 0.5) * u_threshold;
  adjusted = clamp(adjusted, 0.0, 1.0);
  vec3 outColor = quantize(adjusted);

  // Mask / alpha
  // Computed from the centered cell UV. All masks start fully opaque in
  // the "primary" region and fall off to 0 across a band of width
  // u_mask_fade (smoothstep falloff).
  float maskAlpha = 1.0;
  if (u_mask_kind == 1) {
    // Radial — opaque at center, transparent at corners.
    float r = length(cellUV - 0.5) * 1.4142; // 0 at center, 1 at corners
    float fade = max(u_mask_fade, 1e-3);
    maskAlpha = 1.0 - smoothstep(1.0 - fade, 1.0, r);
  } else if (u_mask_kind == 2) {
    // Linear — fade along u_mask_angle (0=L→R, 90°=T→B).
    vec2 dir = vec2(cos(u_mask_angle), sin(u_mask_angle));
    float t = dot(cellUV - 0.5, dir) + 0.5; // 0..1 along the axis
    float fade = max(u_mask_fade, 1e-3);
    // Opaque until (1 - fade), then ramps to 0 by 1.
    maskAlpha = 1.0 - smoothstep(1.0 - fade, 1.0, t);
  } else if (u_mask_kind == 3) {
    // Vignette — opaque in the center, falloff near rect edges.
    vec2 d2 = abs(cellUV - 0.5) * 2.0;  // 0 at center, 1 at edges
    float edge = max(d2.x, d2.y);
    float fade = max(u_mask_fade, 1e-3);
    maskAlpha = 1.0 - smoothstep(1.0 - fade, 1.0, edge);
  }

  gl_FragColor = vec4(outColor, maskAlpha);
}
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_PALETTE = ['#000000', '#ffffff'];
const DEFAULT_GRADIENT: Required<DitherGradient> = {
  type: 'linear',
  angle: 135,
  stops: [
    { pos: 0, color: '#0a0a0a' },
    { pos: 1, color: '#ffffff' },
  ],
};

const ALGO_INDEX: Record<DitherWebGLAlgorithm, number> = {
  bayer: 0,
  'blue-noise': 1,
  halftone: 2,
  crosshatch: 3,
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return sh;
}

function link(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader) {
  const p = gl.createProgram()!;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p);
    gl.deleteProgram(p);
    throw new Error(`Program link failed: ${log}`);
  }
  return p;
}

function parseCSSColor(c: string): RGBA {
  return parseCSSColorShared(c);
}

function isMediaSource(s: unknown): s is HTMLImageElement | HTMLVideoElement | HTMLCanvasElement {
  if (typeof window === 'undefined') return false;
  return (
    s instanceof HTMLImageElement ||
    s instanceof HTMLVideoElement ||
    s instanceof HTMLCanvasElement
  );
}

/**
 * All uniform names looked up at link time so `draw()` doesn't pay the
 * `getUniformLocation` cost (≈ 20 calls × every frame) — the spec
 * guarantees locations are stable across a program's lifetime.
 */
const UNIFORM_NAMES = [
  'u_res',
  'u_time',
  'u_cellSize',
  'u_threshold',
  'u_algo',
  'u_matrix',
  'u_animate',
  'u_speed',
  'u_src',
  'u_useSrc',
  'u_grad_kind',
  'u_grad_angle',
  'u_grad_count',
  'u_pal_count',
  'u_grad_c0',
  'u_grad_c1',
  'u_grad_c2',
  'u_grad_c3',
  'u_grad_c4',
  'u_grad_c5',
  'u_grad_p0',
  'u_grad_p1',
  'u_grad_p2',
  'u_grad_p3',
  'u_grad_p4',
  'u_grad_p5',
  'u_pal[0]',
  'u_pal[1]',
  'u_pal[2]',
  'u_pal[3]',
  'u_pal[4]',
  'u_pal[5]',
  'u_pal[6]',
  'u_pal[7]',
  'u_mask_kind',
  'u_mask_fade',
  'u_mask_angle',
] as const;

type UniformMap = Map<string, WebGLUniformLocation | null>;

function collectUniforms(gl: WebGLRenderingContext, program: WebGLProgram): UniformMap {
  const map: UniformMap = new Map();
  for (const name of UNIFORM_NAMES) {
    map.set(name, gl.getUniformLocation(program, name));
  }
  return map;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const DitherWebGL = React.forwardRef<DitherWebGLHandle, DitherWebGLProps>(
  function DitherWebGL(
    {
      algorithm = 'bayer',
      matrix = 8,
      cellSize = 2,
      threshold = 0.5,
      palette = DEFAULT_PALETTE,
      source,
      gradient,
      animate = false,
      speed = 1,
      pixelRatio = true,
      mask = 'none',
      maskFade = 0.4,
      maskAngle = 90,
      className,
      style,
      children,
    },
    ref,
  ) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const textureRef = useRef<WebGLTexture | null>(null);
    const uniformsRef = useRef<UniformMap | null>(null);
    const startRef = useRef<number>(0);
    const rafRef = useRef<number>(0);
    const rafActiveRef = useRef(false);
    // Tracks whether the current `resolvedSource` has been uploaded to the
    // texture at least once. Set false on source change, then flipped to
    // true after a successful upload — videos/canvases re-upload every
    // frame anyway, but static images only need to upload once.
    const sourceUploadedRef = useRef(false);
    const reducedMotionRef = useRef(false);

    const [ready, setReady] = useState(false);

    // Resolve `source` if it's a URL string by loading an internal Image.
    const [resolvedSource, setResolvedSource] = useState<
      HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | null
    >(null);

    useEffect(() => {
      sourceUploadedRef.current = false;
      if (!source) {
        setResolvedSource(null);
        return;
      }
      if (isMediaSource(source)) {
        setResolvedSource(source);
        return;
      }
      // string URL — load internally; only commits when load fires
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      const onLoad = () => setResolvedSource(img);
      img.addEventListener('load', onLoad);
      img.src = source;
      return () => {
        img.removeEventListener('load', onLoad);
      };
    }, [source]);

    // Reduced-motion preference
    useEffect(() => {
      if (typeof window === 'undefined') return;
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      reducedMotionRef.current = mq.matches;
      const fn = (e: MediaQueryListEvent) => {
        reducedMotionRef.current = e.matches;
      };
      mq.addEventListener('change', fn);
      return () => mq.removeEventListener('change', fn);
    }, []);

    // Normalised gradient. The shader unrolls up to 6 stops (WebGL1 doesn't
    // support dynamic uniform-array indexing reliably across drivers).
    const grad = useMemo<Required<DitherGradient>>(() => {
      const g = gradient ?? DEFAULT_GRADIENT;
      const stops = (g.stops && g.stops.length >= 2 ? g.stops : DEFAULT_GRADIENT.stops)
        .slice()
        .sort((a, b) => a.pos - b.pos)
        .slice(0, 6);
      return {
        type: g.type ?? 'linear',
        angle: g.angle ?? 135,
        stops,
      };
    }, [gradient]);

    // Pre-parse gradient stop colors alongside the gradient itself so we
    // don't pay the canvas-readback cost every frame.
    const gradColors = useMemo<RGBA[]>(() => {
      const padded = grad.stops.slice();
      while (padded.length < 6) padded.push(padded[padded.length - 1]);
      return padded.map((s) => parseCSSColor(s.color));
    }, [grad]);

    const paletteVec = useMemo<RGBA[]>(() => {
      const list = (palette && palette.length > 0 ? palette : DEFAULT_PALETTE).slice(0, 8);
      return list.map((c) => parseCSSColor(c));
    }, [palette]);

    // ---- Init WebGL once ---------------------------------------------------
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const gl = canvas.getContext('webgl', {
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
      });
      if (!gl) {
        setReady(false);
        return;
      }

      try {
        const vs = compile(gl, gl.VERTEX_SHADER, VERT);
        const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
        const program = link(gl, vs, fs);
        gl.useProgram(program);

        const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
        const posLoc = gl.getAttribLocation(program, 'a_pos');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        // Enable alpha blending so the `mask` prop can fade the dither into
        // transparent edges. With premultipliedAlpha:false, SRC_ALPHA blend
        // is the correct compositing path against the wrapper background.
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // Clear color must be transparent or the masked-out area shows
        // the canvas clear, not the wrapper bg.
        gl.clearColor(0, 0, 0, 0);

        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        // 1x1 placeholder so the sampler is always valid.
        gl.texImage2D(
          gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
          new Uint8Array([0, 0, 0, 255]),
        );

        glRef.current = gl;
        programRef.current = program;
        textureRef.current = tex;
        uniformsRef.current = collectUniforms(gl, program);
        startRef.current = performance.now();
        setReady(true);
      } catch (err) {
        console.warn('[DitherWebGL] init failed, falling back:', err);
        setReady(false);
      }

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafActiveRef.current = false;
        const g = glRef.current;
        if (g) {
          if (programRef.current) g.deleteProgram(programRef.current);
          if (textureRef.current) g.deleteTexture(textureRef.current);
        }
        glRef.current = null;
        programRef.current = null;
        textureRef.current = null;
        uniformsRef.current = null;
      };
    }, []);

    // ---- Sync canvas size to wrapper ---------------------------------------
    const resize = useCallback(() => {
      const canvas = canvasRef.current;
      const wrapper = wrapperRef.current;
      if (!canvas || !wrapper) return false;
      const rect = wrapper.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      const dpr =
        typeof pixelRatio === 'number'
          ? Math.max(0.25, pixelRatio)
          : pixelRatio
            ? Math.min(2, window.devicePixelRatio || 1)
            : 1;
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        const gl = glRef.current;
        if (gl) gl.viewport(0, 0, w, h);
      }
      return true;
    }, [pixelRatio]);

    // ---- Render one frame --------------------------------------------------
    const draw = useCallback(() => {
      const gl = glRef.current;
      const program = programRef.current;
      const canvas = canvasRef.current;
      const tex = textureRef.current;
      const uniforms = uniformsRef.current;
      if (!gl || !program || !canvas || !tex || !uniforms) return;

      if (!resize()) return;

      gl.useProgram(program);
      gl.bindTexture(gl.TEXTURE_2D, tex);

      const useSrc = !!resolvedSource;
      if (useSrc && resolvedSource) {
        // Video & external canvas frames change every tick; HTMLImageElement
        // is static so we only upload it once after it resolves.
        const isLive =
          resolvedSource instanceof HTMLVideoElement ||
          resolvedSource instanceof HTMLCanvasElement;
        if (isLive || !sourceUploadedRef.current) {
          try {
            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              gl.RGBA,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              resolvedSource as TexImageSource,
            );
            sourceUploadedRef.current = true;
          } catch {
            // CORS or not yet decoded — silently skip this frame.
          }
        }
      }

      const t = (performance.now() - startRef.current) / 1000;
      const shouldAnimate = animate && !reducedMotionRef.current;

      const loc = (name: string) => uniforms.get(name) ?? null;
      gl.uniform2f(loc('u_res'), canvas.width, canvas.height);
      gl.uniform1f(loc('u_time'), t);
      gl.uniform1f(loc('u_cellSize'), Math.max(1, cellSize));
      gl.uniform1f(loc('u_threshold'), threshold);
      gl.uniform1i(loc('u_algo'), ALGO_INDEX[algorithm] ?? 0);
      gl.uniform1i(loc('u_matrix'), matrix);
      gl.uniform1f(loc('u_animate'), shouldAnimate ? 1 : 0);
      gl.uniform1f(loc('u_speed'), speed);
      gl.uniform1i(loc('u_src'), 0);
      gl.uniform1f(loc('u_useSrc'), useSrc ? 1 : 0);

      gl.uniform1f(loc('u_grad_kind'), grad.type === 'radial' ? 1 : 0);
      gl.uniform1f(loc('u_grad_angle'), (grad.angle * Math.PI) / 180);
      gl.uniform1i(loc('u_grad_count'), grad.stops.length);

      const padded = grad.stops.slice();
      while (padded.length < 6) padded.push(padded[padded.length - 1]);
      for (let i = 0; i < 6; i++) {
        const [r, g, b, a] = gradColors[i];
        gl.uniform4f(loc(`u_grad_c${i}`), r, g, b, a);
        gl.uniform1f(loc(`u_grad_p${i}`), padded[i].pos);
      }

      gl.uniform1i(loc('u_pal_count'), paletteVec.length);
      const tail = paletteVec[paletteVec.length - 1] ?? ([0, 0, 0, 1] as const);
      for (let i = 0; i < 8; i++) {
        const c = paletteVec[i] ?? tail;
        gl.uniform4f(loc(`u_pal[${i}]`), c[0], c[1], c[2], c[3]);
      }

      // Mask uniforms — see shader for shape semantics.
      const maskKind =
        mask === 'radial' ? 1 : mask === 'linear' ? 2 : mask === 'vignette' ? 3 : 0;
      gl.uniform1i(loc('u_mask_kind'), maskKind);
      gl.uniform1f(loc('u_mask_fade'), Math.min(1, Math.max(0, maskFade)));
      gl.uniform1f(loc('u_mask_angle'), (maskAngle * Math.PI) / 180);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }, [
      algorithm,
      matrix,
      cellSize,
      threshold,
      paletteVec,
      grad,
      gradColors,
      animate,
      speed,
      resolvedSource,
      resize,
      mask,
      maskFade,
      maskAngle,
    ]);

    // ---- Animation loop ----------------------------------------------------
    useEffect(() => {
      if (!ready) return;

      // Always draw at least one frame on every settings change.
      draw();

      const isLiveSource =
        typeof window !== 'undefined' &&
        (resolvedSource instanceof HTMLVideoElement ||
          resolvedSource instanceof HTMLCanvasElement);
      const needsLoop =
        (animate && !reducedMotionRef.current) || isLiveSource;

      if (!needsLoop) {
        rafActiveRef.current = false;
        return;
      }

      rafActiveRef.current = true;
      const tick = () => {
        draw();
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        rafActiveRef.current = false;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      };
    }, [ready, draw, animate, resolvedSource]);

    // ---- Redraw on container resize. Skip when the RAF loop is already
    //      ticking — it will pick up the new size on its next frame.
    useEffect(() => {
      if (!ready) return;
      const wrapper = wrapperRef.current;
      if (!wrapper || typeof ResizeObserver === 'undefined') return;
      const ro = new ResizeObserver(() => {
        if (!rafActiveRef.current) draw();
      });
      ro.observe(wrapper);
      return () => ro.disconnect();
    }, [ready, draw]);

    // ---- Imperative handle -------------------------------------------------
    useImperativeHandle(
      ref,
      () => ({
        redraw: () => draw(),
        toDataURL: (type, quality) => {
          // Force a fresh draw so preserveDrawingBuffer captures the latest.
          draw();
          return canvasRef.current?.toDataURL(type, quality) ?? null;
        },
        get isReady() {
          return ready;
        },
      }),
      [draw, ready],
    );

    // ---- Fallback gradient (SSR + no-WebGL) --------------------------------
    const fallbackBg = useMemo(() => {
      const stops = grad.stops
        .map((s) => `${s.color} ${Math.round(s.pos * 100)}%`)
        .join(', ');
      return grad.type === 'radial'
        ? `radial-gradient(circle at 50% 50%, ${stops})`
        : `linear-gradient(${grad.angle}deg, ${stops})`;
    }, [grad]);

    return (
      <div
        ref={wrapperRef}
        className={className}
        style={{
          position: 'relative',
          overflow: 'hidden',
          ...style,
        }}
        data-dither-ready={ready ? 'true' : 'false'}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            background: fallbackBg,
            imageRendering: 'pixelated',
            pointerEvents: 'none',
          }}
        />
        {children != null && (
          <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        )}
      </div>
    );
  },
);

DitherWebGL.displayName = 'DitherWebGL';
