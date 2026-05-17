import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

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

  gl_FragColor = vec4(outColor, 1.0);
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

let _colorCanvas: HTMLCanvasElement | null = null;
function parseCSSColor(c: string): [number, number, number, number] {
  if (typeof document === 'undefined') return [0, 0, 0, 1];
  if (!_colorCanvas) {
    _colorCanvas = document.createElement('canvas');
    _colorCanvas.width = _colorCanvas.height = 1;
  }
  const ctx = _colorCanvas.getContext('2d', { willReadFrequently: true })!;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#000';
  ctx.fillStyle = c;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
}

function isMediaSource(s: unknown): s is HTMLImageElement | HTMLVideoElement | HTMLCanvasElement {
  if (typeof window === 'undefined') return false;
  return (
    s instanceof HTMLImageElement ||
    s instanceof HTMLVideoElement ||
    s instanceof HTMLCanvasElement
  );
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
    const startRef = useRef<number>(0);
    const rafRef = useRef<number>(0);
    const loadedImageRef = useRef<HTMLImageElement | null>(null);
    const reducedMotionRef = useRef(false);

    const [ready, setReady] = useState(false);

    // Resolve `source` if it's a URL string by loading an internal Image.
    const [resolvedSource, setResolvedSource] = useState<
      HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | null
    >(null);

    useEffect(() => {
      if (!source) {
        loadedImageRef.current = null;
        setResolvedSource(null);
        return;
      }
      if (isMediaSource(source)) {
        setResolvedSource(source);
        return;
      }
      // string URL
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.src = source;
      loadedImageRef.current = img;
      const onLoad = () => setResolvedSource(img);
      img.addEventListener('load', onLoad);
      return () => {
        img.removeEventListener('load', onLoad);
        loadedImageRef.current = null;
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

    // Normalised gradient (memoised so changes are detected by ref identity)
    const grad = useMemo<Required<DitherGradient>>(() => {
      const g = gradient ?? DEFAULT_GRADIENT;
      const stops = (g.stops && g.stops.length >= 2 ? g.stops : DEFAULT_GRADIENT.stops)
        .slice()
        .sort((a, b) => a.pos - b.pos)
        .slice(0, 6); // shader supports up to 6 stops
      return {
        type: g.type ?? 'linear',
        angle: g.angle ?? 135,
        stops,
      };
    }, [gradient]);

    const paletteVec = useMemo(() => {
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
        startRef.current = performance.now();
        setReady(true);
      } catch (err) {
        console.warn('[DitherWebGL] init failed, falling back:', err);
        setReady(false);
      }

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const g = glRef.current;
        if (g) {
          if (programRef.current) g.deleteProgram(programRef.current);
          if (textureRef.current) g.deleteTexture(textureRef.current);
        }
        glRef.current = null;
        programRef.current = null;
        textureRef.current = null;
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
      if (!gl || !program || !canvas || !tex) return;

      if (!resize()) return;

      gl.useProgram(program);
      gl.bindTexture(gl.TEXTURE_2D, tex);

      const useSrc = !!resolvedSource;
      if (useSrc && resolvedSource) {
        try {
          // Video & canvas update every frame; image uploads once via state.
          gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
            resolvedSource as TexImageSource,
          );
        } catch {
          // CORS or not yet decoded — silently skip this frame.
        }
      }

      const t = (performance.now() - startRef.current) / 1000;
      const shouldAnimate = animate && !reducedMotionRef.current;

      const u = (name: string) => gl.getUniformLocation(program, name);
      gl.uniform2f(u('u_res'), canvas.width, canvas.height);
      gl.uniform1f(u('u_time'), t);
      gl.uniform1f(u('u_cellSize'), Math.max(1, cellSize));
      gl.uniform1f(u('u_threshold'), threshold);
      gl.uniform1i(u('u_algo'), ALGO_INDEX[algorithm] ?? 0);
      gl.uniform1i(u('u_matrix'), matrix);
      gl.uniform1f(u('u_animate'), shouldAnimate ? 1 : 0);
      gl.uniform1f(u('u_speed'), speed);
      gl.uniform1i(u('u_src'), 0);
      gl.uniform1f(u('u_useSrc'), useSrc ? 1 : 0);

      gl.uniform1f(u('u_grad_kind'), grad.type === 'radial' ? 1 : 0);
      gl.uniform1f(u('u_grad_angle'), (grad.angle * Math.PI) / 180);

      // Pad stops to 6 entries (color & position arrays).
      const padded = grad.stops.slice();
      while (padded.length < 6) {
        padded.push(padded[padded.length - 1]);
      }
      gl.uniform1i(u('u_grad_count'), grad.stops.length);
      for (let i = 0; i < 6; i++) {
        const [r, g, b, a] = parseCSSColor(padded[i].color);
        gl.uniform4f(u(`u_grad_c${i}`), r, g, b, a);
        gl.uniform1f(u(`u_grad_p${i}`), padded[i].pos);
      }

      // Palette: pad with the final color so quantize() is well-defined.
      gl.uniform1i(u('u_pal_count'), paletteVec.length);
      const tail = paletteVec[paletteVec.length - 1] ?? [0, 0, 0, 1];
      for (let i = 0; i < 8; i++) {
        const c = paletteVec[i] ?? tail;
        gl.uniform4f(u(`u_pal[${i}]`), c[0], c[1], c[2], c[3]);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }, [
      algorithm,
      matrix,
      cellSize,
      threshold,
      paletteVec,
      grad,
      animate,
      speed,
      resolvedSource,
      resize,
    ]);

    // ---- Animation loop ----------------------------------------------------
    useEffect(() => {
      if (!ready) return;

      // Always draw at least one frame on every settings change.
      draw();

      const isVideo =
        typeof window !== 'undefined' &&
        resolvedSource instanceof HTMLVideoElement;
      const needsLoop =
        (animate && !reducedMotionRef.current) || isVideo;

      if (!needsLoop) return;

      const tick = () => {
        draw();
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      };
    }, [ready, draw, animate, resolvedSource]);

    // ---- Redraw on container resize ----------------------------------------
    useEffect(() => {
      if (!ready) return;
      const wrapper = wrapperRef.current;
      if (!wrapper || typeof ResizeObserver === 'undefined') return;
      const ro = new ResizeObserver(() => draw());
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
