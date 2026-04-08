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
        width: '100vw',
        maxWidth: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div className="border-b border-border px-8 py-6">
        <h1 className="docs-heading text-2xl tracking-tight mb-1"
          style={{ fontFamily: 'var(--sk-font-sans)' }}>
          ASCII Engine Playground
        </h1>
        <p className="text-sm text-muted-fg max-w-xl">
          Real-time image-to-ASCII dithering. Upload an image, use your webcam,
          or tweak the demo scene below.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* ── Left: Controls Sidebar ── */}
        <div className="w-full lg:w-80 shrink-0 bg-neutral-900 border-r border-neutral-800 p-6 space-y-6 overflow-y-auto lg:max-h-[calc(100vh-100px)]">

          {/* Image upload / drop zone */}
          <section>
            <SidebarLabel>Source Image</SidebarLabel>
            <div
              className={`mt-2 border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-neutral-500 bg-neutral-800/50'
                  : 'border-neutral-700 hover:border-neutral-500'
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
              <div className="text-neutral-500 text-xs tracking-wide">
                {isDragging
                  ? 'DROP IMAGE HERE'
                  : fileName
                    ? fileName
                    : 'DRAG & DROP or CLICK'}
              </div>
              {!fileName && !isDragging && (
                <div className="text-neutral-600 text-[10px] mt-2">
                  PNG, JPG, GIF, WebP
                </div>
              )}
            </div>
          </section>

          {/* Webcam button */}
          <section>
            <button
              onClick={toggleWebcam}
              className={`w-full py-3 px-4 text-xs font-bold tracking-widest uppercase border transition-colors cursor-pointer ${
                webcamActive
                  ? 'bg-red-900/50 border-red-700 text-red-300 hover:bg-red-900/70'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:border-neutral-600'
              }`}
              style={{ fontFamily: 'var(--sk-font-mono)' }}
            >
              {webcamActive ? 'STOP WEBCAM' : 'USE WEBCAM'}
            </button>
          </section>

          <SidebarDivider />

          {/* Algorithm */}
          <section>
            <SidebarLabel>Algorithm</SidebarLabel>
            <div className="space-y-1.5 mt-3">
              {(['bayer', 'floyd-steinberg', 'atkinson'] as Algorithm[]).map(
                (alg) => (
                  <SidebarRadio
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
              <SidebarLabel>Bayer Matrix Size</SidebarLabel>
              <div className="flex gap-2 mt-3">
                {([2, 4, 8] as BayerSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setBayerSize(s)}
                    className={`flex-1 py-1.5 text-xs font-mono border transition-colors cursor-pointer ${
                      bayerSize === s
                        ? 'bg-white text-black border-white'
                        : 'bg-transparent text-neutral-400 border-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    {s}x{s}
                  </button>
                ))}
              </div>
            </section>
          )}

          <SidebarDivider />

          {/* Palette */}
          <section>
            <SidebarLabel>Character Palette</SidebarLabel>
            <div className="space-y-1.5 mt-3">
              {(Object.keys(PALETTES) as Palette[]).map((p) => (
                <SidebarRadio
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

          <SidebarDivider />

          {/* Resolution slider */}
          <section>
            <SidebarLabel>
              Resolution <span className="text-neutral-300 ml-1">{resolution} chars</span>
            </SidebarLabel>
            <input
              type="range"
              min={40}
              max={200}
              value={resolution}
              onChange={(e) => setResolution(Number(e.target.value))}
              className="w-full mt-3 accent-white"
            />
            <div className="flex justify-between text-[10px] text-neutral-600 mt-1">
              <span>40</span>
              <span>200</span>
            </div>
          </section>

          {/* Contrast slider */}
          <section>
            <SidebarLabel>
              Contrast <span className="text-neutral-300 ml-1">{contrast}</span>
            </SidebarLabel>
            <input
              type="range"
              min={-128}
              max={128}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full mt-3 accent-white"
            />
            <div className="flex justify-between text-[10px] text-neutral-600 mt-1">
              <span>-128</span>
              <span>+128</span>
            </div>
          </section>

          <SidebarDivider />

          {/* Toggles */}
          <section className="space-y-4">
            <SidebarToggle
              label="Invert"
              checked={invert}
              onChange={setInvert}
            />
            <SidebarToggle
              label="Preserve Colors"
              checked={colorMode}
              onChange={setColorMode}
            />
          </section>
        </div>

        {/* ── Right: Output Area ── */}
        <div className="flex-1 flex flex-col overflow-hidden lg:max-h-[calc(100vh-100px)]">
          {/* Output toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-800 bg-black/50">
            <span className="text-[11px] text-neutral-500 font-mono tracking-wide">
              {output
                ? `${output[0]?.length ?? 0} x ${output.length} characters`
                : 'No output'}
            </span>
            <button
              onClick={copyAscii}
              disabled={!output}
              className={`px-3 py-1 text-[11px] font-mono border transition-colors cursor-pointer ${
                copied
                  ? 'border-green-800 bg-green-900/30 text-green-400'
                  : output
                    ? 'border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
                    : 'border-neutral-800 text-neutral-700 cursor-default'
              }`}
            >
              {copied ? 'COPIED' : 'COPY ASCII'}
            </button>
          </div>

          {/* ASCII output */}
          <div className="flex-1 overflow-auto p-4 bg-black">
            <pre
              className="font-mono text-xs leading-none p-4 border border-neutral-800 overflow-auto"
              style={{
                fontSize: `clamp(3px, ${Math.max(3, 10 - resolution * 0.04)}px, 10px)`,
                lineHeight: 1.0,
                letterSpacing: '0.05em',
                whiteSpace: 'pre',
                background: colorMode ? '#000' : undefined,
                color: colorMode ? undefined : 'hsl(var(--sk-foreground))',
              }}
            >
              {output ? renderOutput(output, colorMode) : 'Waiting for image...'}
            </pre>
          </div>
        </div>
      </div>

      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <video ref={videoRef} className="hidden" playsInline muted />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR UI COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function SidebarLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold"
      style={{ fontSize: '9px', letterSpacing: '0.15em' }}>
      {children}
    </div>
  );
}

function SidebarDivider() {
  return <div className="border-t border-neutral-800" />;
}

function SidebarRadio({
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
      className={`flex items-center gap-2.5 py-1 cursor-pointer text-xs font-mono transition-colors ${
        checked ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
      }`}
    >
      <span
        className={`w-3 h-3 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          checked ? 'border-white' : 'border-neutral-600'
        }`}
      >
        {checked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </span>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      {label}
    </label>
  );
}

function SidebarToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-xs font-mono text-neutral-400 group-hover:text-neutral-300 transition-colors">
        {label}
      </span>
      <button
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        className={`w-9 h-5 rounded-full border-2 relative transition-colors cursor-pointer ${
          checked
            ? 'bg-white border-white'
            : 'bg-transparent border-neutral-600 hover:border-neutral-500'
        }`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${
            checked
              ? 'left-[18px] bg-black'
              : 'left-0.5 bg-neutral-500'
          }`}
        />
      </button>
    </label>
  );
}
