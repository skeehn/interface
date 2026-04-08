'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   DITHERING ALGORITHMS & PALETTES
   ═══════════════════════════════════════════════════════════════ */

const BAYER2 = [
  [0, 2],
  [3, 1],
];
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const BAYER8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

type Algorithm = 'bayer' | 'floyd-steinberg' | 'atkinson';
type Palette = 'blocks' | 'dots' | 'binary' | 'shades' | 'minimal';
type BayerSize = 2 | 4 | 8;

const PALETTES: Record<Palette, string> = {
  blocks: ' ░▒▓█',
  dots: ' ·:;!|lxX#@█',
  binary: ' █',
  shades: ' .:-=+*#%@',
  minimal: ' .:*#',
};

const PALETTE_LABELS: Record<Palette, string> = {
  blocks: 'Blocks  ░▒▓█',
  dots: 'Dots  ·:;!|lxX#@█',
  binary: 'Binary   █',
  shades: 'Shades  .:-=+*#%@',
  minimal: 'Minimal  .:*#',
};

function luminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

function getBayerMatrix(size: BayerSize): number[][] {
  switch (size) {
    case 2: return BAYER2;
    case 4: return BAYER4;
    case 8: return BAYER8;
  }
}

function applyContrast(value: number, contrast: number): number {
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  return clamp(factor * (value - 128) + 128, 0, 255);
}

interface DitherOptions {
  algorithm: Algorithm;
  bayerSize: BayerSize;
  palette: Palette;
  width: number;
  contrast: number;
  invert: boolean;
  colorMode: boolean;
}

interface ColorChar {
  char: string;
  r: number;
  g: number;
  b: number;
}

function ditherImage(
  imageData: ImageData,
  targetWidth: number,
  opts: DitherOptions
): ColorChar[][] {
  const { algorithm, bayerSize, palette, contrast, invert, colorMode } = opts;
  const chars = PALETTES[palette];
  const srcW = imageData.width;
  const srcH = imageData.height;

  // Character aspect ratio correction (~2:1 height:width for monospace)
  const aspectRatio = 0.5;
  const targetHeight = Math.round((targetWidth * srcH * aspectRatio) / srcW);

  // Downsample to target resolution
  const lum = new Float32Array(targetWidth * targetHeight);
  const colors: Array<[number, number, number]> = new Array(targetWidth * targetHeight);
  const scaleX = srcW / targetWidth;
  const scaleY = srcH / targetHeight;

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const sx = Math.floor(x * scaleX);
      const sy = Math.floor(y * scaleY);
      const idx = (sy * srcW + sx) * 4;
      let r = imageData.data[idx];
      let g = imageData.data[idx + 1];
      let b = imageData.data[idx + 2];

      // Apply contrast
      r = applyContrast(r, contrast);
      g = applyContrast(g, contrast);
      b = applyContrast(b, contrast);

      let l = luminance(r, g, b);
      if (invert) l = 255 - l;

      lum[y * targetWidth + x] = l;
      colors[y * targetWidth + x] = [r, g, b];
    }
  }

  // Apply dithering algorithm
  const output: ColorChar[][] = [];

  if (algorithm === 'bayer') {
    const matrix = getBayerMatrix(bayerSize);
    const mSize = matrix.length;
    const mMax = mSize * mSize;

    for (let y = 0; y < targetHeight; y++) {
      const row: ColorChar[] = [];
      for (let x = 0; x < targetWidth; x++) {
        const i = y * targetWidth + x;
        const l = lum[i];
        const threshold = ((matrix[y % mSize][x % mSize] + 0.5) / mMax) * 255;
        const adjusted = l + (threshold - 128) * 0.5;
        const charIdx = Math.round(
          (clamp(adjusted, 0, 255) / 255) * (chars.length - 1)
        );
        const [r, g, b] = colors[i];
        row.push({ char: chars[charIdx], r, g, b });
      }
      output.push(row);
    }
  } else if (algorithm === 'floyd-steinberg') {
    const buf = Float32Array.from(lum);

    for (let y = 0; y < targetHeight; y++) {
      const row: ColorChar[] = [];
      for (let x = 0; x < targetWidth; x++) {
        const i = y * targetWidth + x;
        const old = buf[i];
        const charIdx = Math.round(
          (clamp(old, 0, 255) / 255) * (chars.length - 1)
        );
        const newVal = (charIdx / (chars.length - 1)) * 255;
        const err = old - newVal;

        if (x + 1 < targetWidth)
          buf[i + 1] += err * (7 / 16);
        if (y + 1 < targetHeight) {
          if (x - 1 >= 0)
            buf[(y + 1) * targetWidth + x - 1] += err * (3 / 16);
          buf[(y + 1) * targetWidth + x] += err * (5 / 16);
          if (x + 1 < targetWidth)
            buf[(y + 1) * targetWidth + x + 1] += err * (1 / 16);
        }

        const [r, g, b] = colors[i];
        row.push({ char: chars[charIdx], r, g, b });
      }
      output.push(row);
    }
  } else {
    // Atkinson dithering
    const buf = Float32Array.from(lum);

    for (let y = 0; y < targetHeight; y++) {
      const row: ColorChar[] = [];
      for (let x = 0; x < targetWidth; x++) {
        const i = y * targetWidth + x;
        const old = buf[i];
        const charIdx = Math.round(
          (clamp(old, 0, 255) / 255) * (chars.length - 1)
        );
        const newVal = (charIdx / (chars.length - 1)) * 255;
        const err = (old - newVal) / 8;

        const spread = [
          [1, 0], [2, 0],
          [-1, 1], [0, 1], [1, 1],
          [0, 2],
        ];
        for (const [dx, dy] of spread) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < targetWidth && ny < targetHeight) {
            buf[ny * targetWidth + nx] += err;
          }
        }

        const [r, g, b] = colors[i];
        row.push({ char: chars[charIdx], r, g, b });
      }
      output.push(row);
    }
  }

  return output;
}

function renderOutput(grid: ColorChar[][], colorMode: boolean): React.ReactNode {
  if (!colorMode) {
    return grid.map((row) => row.map((c) => c.char).join('')).join('\n');
  }

  return grid.map((row, y) => (
    <span key={y}>
      {row.map((c, x) => (
        <span key={x} style={{ color: `rgb(${c.r},${c.g},${c.b})` }}>
          {c.char}
        </span>
      ))}
      {'\n'}
    </span>
  ));
}

/* ═══════════════════════════════════════════════════════════════
   DEMO IMAGES (generated procedurally as fallback)
   ═══════════════════════════════════════════════════════════════ */

function generateDemoImage(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const w = 400;
  const h = 300;
  canvas.width = w;
  canvas.height = h;

  // Gradient background with shapes
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(0.5, '#16213e');
  grad.addColorStop(1, '#0f3460');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Moon
  ctx.beginPath();
  ctx.arc(300, 80, 50, 0, Math.PI * 2);
  ctx.fillStyle = '#e2e2e2';
  ctx.fill();

  // Mountains
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(100, 120);
  ctx.lineTo(200, h);
  ctx.fillStyle = '#1a1a2e';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(150, h);
  ctx.lineTo(280, 100);
  ctx.lineTo(400, h);
  ctx.fillStyle = '#16213e';
  ctx.fill();

  // Stars
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 40; i++) {
    const sx = Math.random() * w;
    const sy = Math.random() * h * 0.5;
    ctx.fillRect(sx, sy, 2, 2);
  }

  // Ground gradient
  const ground = ctx.createLinearGradient(0, h - 60, 0, h);
  ground.addColorStop(0, '#0f3460');
  ground.addColorStop(1, '#533483');
  ctx.fillStyle = ground;
  ctx.fillRect(0, h - 60, w, 60);

  return ctx.getImageData(0, 0, w, h);
}

/* ═══════════════════════════════════════════════════════════════
   ENGINE PLAYGROUND COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function EnginePage() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('bayer');
  const [bayerSize, setBayerSize] = useState<BayerSize>(4);
  const [palette, setPalette] = useState<Palette>('blocks');
  const [resolution, setResolution] = useState(100);
  const [contrast, setContrast] = useState(0);
  const [invert, setInvert] = useState(false);
  const [colorMode, setColorMode] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [output, setOutput] = useState<ColorChar[][] | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number>(0);
  const imageDataRef = useRef<ImageData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(
    (imgData: ImageData) => {
      const result = ditherImage(imgData, resolution, {
        algorithm,
        bayerSize,
        palette,
        width: resolution,
        contrast,
        invert,
        colorMode,
      });
      setOutput(result);
    },
    [algorithm, bayerSize, palette, resolution, contrast, invert, colorMode]
  );

  // Reprocess when settings change
  useEffect(() => {
    if (imageDataRef.current && !webcamActive) {
      processImage(imageDataRef.current);
    }
  }, [processImage, webcamActive]);

  // Generate demo on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = generateDemoImage(canvas);
    imageDataRef.current = data;
    setFileName('demo scene');
    processImage(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadImageFile = useCallback(
    (file: File) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, img.width, img.height);
        imageDataRef.current = data;
        setFileName(file.name);
        processImage(data);
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    },
    [processImage]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadImageFile(file);
    },
    [loadImageFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        loadImageFile(file);
      }
    },
    [loadImageFile]
  );

  // Webcam
  const toggleWebcam = useCallback(async () => {
    if (webcamActive) {
      // Stop
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      cancelAnimationFrame(animRef.current);
      setWebcamActive(false);
      // Restore last static image
      if (imageDataRef.current) processImage(imageDataRef.current);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setWebcamActive(true);
      setFileName(null);

      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;

      const tick = () => {
        if (!streamRef.current) return;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        processImage(data);
        animRef.current = setTimeout(() => {
          requestAnimationFrame(tick);
        }, 66) as unknown as number; // ~15fps
      };
      tick();
    } catch {
      // Camera denied or not available
      setWebcamActive(false);
    }
  }, [webcamActive, processImage]);

  // Cleanup webcam on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const copyAscii = useCallback(() => {
    if (!output) return;
    const text = output.map((row) => row.map((c) => c.char).join('')).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: 'var(--sk-font-mono)',
        /* Break out of the max-w-3xl prose container */
        width: '100vw',
        maxWidth: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--sk-font-sans)' }}
        >
          ASCII Engine Playground
        </h1>
        <p className="text-sm text-muted-fg mt-1">
          Real-time image-to-ASCII dithering. Upload an image, use your webcam,
          or tweak the demo scene.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* ── Left: Controls ── */}
        <div className="w-full lg:w-80 shrink-0 border-r border-border p-5 space-y-5 overflow-y-auto lg:max-h-[calc(100vh-80px)]">
          {/* Image upload */}
          <section>
            <Label>Source Image</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-fg'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="text-xs text-muted-fg">
                {isDragging ? '[ DROP IMAGE ]' : fileName ? `[ ${fileName} ]` : '[ DRAG & DROP or CLICK ]'}
              </div>
            </div>
          </section>

          {/* Webcam */}
          <section>
            <button
              onClick={toggleWebcam}
              className="sk-button w-full"
              data-variant={webcamActive ? 'destructive' : 'default'}
              style={{
                padding: 'var(--sk-space-2) var(--sk-space-4)',
                border: 'var(--sk-border)',
                fontFamily: 'var(--sk-font-mono)',
                fontSize: 'var(--sk-font-size-sm)',
                cursor: 'pointer',
                width: '100%',
                background: webcamActive
                  ? 'hsl(var(--sk-destructive))'
                  : 'hsl(var(--sk-surface))',
                color: webcamActive
                  ? 'hsl(var(--sk-background))'
                  : 'hsl(var(--sk-foreground))',
              }}
            >
              {webcamActive ? '[ STOP WEBCAM ]' : '[ USE WEBCAM ]'}
            </button>
          </section>

          <Hr />

          {/* Algorithm */}
          <section>
            <Label>Algorithm</Label>
            <div className="space-y-1 mt-2">
              {(['bayer', 'floyd-steinberg', 'atkinson'] as Algorithm[]).map(
                (alg) => (
                  <RadioRow
                    key={alg}
                    name="algorithm"
                    value={alg}
                    checked={algorithm === alg}
                    onChange={() => setAlgorithm(alg)}
                    label={
                      alg === 'bayer'
                        ? 'Bayer (ordered)'
                        : alg === 'floyd-steinberg'
                          ? 'Floyd-Steinberg'
                          : 'Atkinson'
                    }
                  />
                )
              )}
            </div>
          </section>

          {/* Bayer size */}
          {algorithm === 'bayer' && (
            <section>
              <Label>Bayer Matrix Size</Label>
              <div className="flex gap-2 mt-2">
                {([2, 4, 8] as BayerSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setBayerSize(s)}
                    style={{
                      padding: 'var(--sk-space-1) var(--sk-space-3)',
                      border: 'var(--sk-border)',
                      background:
                        bayerSize === s
                          ? 'hsl(var(--sk-foreground))'
                          : 'transparent',
                      color:
                        bayerSize === s
                          ? 'hsl(var(--sk-background))'
                          : 'hsl(var(--sk-foreground))',
                      fontFamily: 'var(--sk-font-mono)',
                      fontSize: 'var(--sk-font-size-xs)',
                      cursor: 'pointer',
                    }}
                  >
                    {s}x{s}
                  </button>
                ))}
              </div>
            </section>
          )}

          <Hr />

          {/* Palette */}
          <section>
            <Label>Character Palette</Label>
            <div className="space-y-1 mt-2">
              {(Object.keys(PALETTES) as Palette[]).map((p) => (
                <RadioRow
                  key={p}
                  name="palette"
                  value={p}
                  checked={palette === p}
                  onChange={() => setPalette(p)}
                  label={PALETTE_LABELS[p]}
                />
              ))}
            </div>
          </section>

          <Hr />

          {/* Resolution */}
          <section>
            <Label>
              Resolution: <span className="text-foreground">{resolution} chars</span>
            </Label>
            <input
              type="range"
              min={40}
              max={200}
              value={resolution}
              onChange={(e) => setResolution(Number(e.target.value))}
              className="w-full mt-2"
              style={{ accentColor: 'hsl(var(--sk-primary))' }}
            />
          </section>

          {/* Contrast */}
          <section>
            <Label>
              Contrast: <span className="text-foreground">{contrast}</span>
            </Label>
            <input
              type="range"
              min={-128}
              max={128}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full mt-2"
              style={{ accentColor: 'hsl(var(--sk-primary))' }}
            />
          </section>

          <Hr />

          {/* Toggles */}
          <section className="space-y-3">
            <ToggleRow
              label="Invert"
              checked={invert}
              onChange={setInvert}
            />
            <ToggleRow
              label="Preserve Colors"
              checked={colorMode}
              onChange={setColorMode}
            />
          </section>
        </div>

        {/* ── Right: Output ── */}
        <div className="flex-1 overflow-auto p-4 lg:p-6 lg:max-h-[calc(100vh-80px)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-fg" style={{ fontFamily: 'var(--sk-font-mono)' }}>
              {output
                ? `${output[0]?.length ?? 0}x${output.length} characters`
                : 'No output'}
            </span>
            <button
              onClick={copyAscii}
              disabled={!output}
              style={{
                padding: 'var(--sk-space-1) var(--sk-space-3)',
                border: 'var(--sk-border)',
                fontFamily: 'var(--sk-font-mono)',
                fontSize: 'var(--sk-font-size-xs)',
                cursor: output ? 'pointer' : 'default',
                background: copied
                  ? 'hsl(var(--sk-success) / 0.15)'
                  : 'hsl(var(--sk-surface))',
                color: copied
                  ? 'hsl(var(--sk-success))'
                  : 'hsl(var(--sk-foreground))',
                opacity: output ? 1 : 0.4,
              }}
            >
              {copied ? '[ COPIED ]' : '[ COPY ASCII ]'}
            </button>
          </div>

          <pre
            style={{
              fontFamily: 'var(--sk-font-mono)',
              fontSize: `clamp(3px, ${Math.max(3, 10 - resolution * 0.04)}px, 10px)`,
              lineHeight: 1.0,
              letterSpacing: '0.05em',
              whiteSpace: 'pre',
              overflow: 'auto',
              background: colorMode ? 'hsl(var(--sk-background))' : undefined,
              border: 'var(--sk-border)',
              padding: 'var(--sk-space-3)',
              borderRadius: 'var(--sk-radius)',
            }}
          >
            {output ? renderOutput(output, colorMode) : 'Waiting for image...'}
          </pre>
        </div>
      </div>

      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <video ref={videoRef} className="hidden" playsInline muted />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HELPER UI COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--sk-font-mono)',
        fontSize: '9px',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'hsl(var(--sk-muted-foreground))',
      }}
    >
      {children}
    </div>
  );
}

function Hr() {
  return (
    <div
      style={{
        borderTop: '1px solid hsl(var(--sk-border-color))',
        margin: 'var(--sk-space-2) 0',
      }}
    />
  );
}

function RadioRow({
  name,
  value,
  checked,
  onChange,
  label,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sk-space-2)',
        fontFamily: 'var(--sk-font-mono)',
        fontSize: 'var(--sk-font-size-xs)',
        cursor: 'pointer',
        padding: '2px 0',
        color: checked ? 'hsl(var(--sk-foreground))' : 'hsl(var(--sk-muted-foreground))',
      }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        style={{ accentColor: 'hsl(var(--sk-primary))' }}
      />
      {label}
    </label>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'var(--sk-font-mono)',
        fontSize: 'var(--sk-font-size-xs)',
        cursor: 'pointer',
        color: 'hsl(var(--sk-muted-foreground))',
      }}
    >
      {label}
      <button
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        style={{
          width: '2rem',
          height: '1rem',
          border: 'var(--sk-border)',
          background: checked ? 'hsl(var(--sk-foreground))' : 'transparent',
          position: 'relative',
          cursor: 'pointer',
          borderRadius: '2px',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '1px',
            left: checked ? 'calc(100% - 13px)' : '1px',
            width: '10px',
            height: 'calc(100% - 2px)',
            background: checked
              ? 'hsl(var(--sk-background))'
              : 'hsl(var(--sk-muted-foreground))',
            transition: 'left 0.15s',
            borderRadius: '1px',
          }}
        />
      </button>
    </label>
  );
}
