'use client';

import { useMemo, useRef, useState } from 'react';
import {
  DitherWebGL,
  type DitherWebGLAlgorithm,
  type DitherWebGLHandle,
  type DitherWebGLMatrix,
} from '@skeehn/react/gl';

const ALGORITHMS: { value: DitherWebGLAlgorithm; label: string }[] = [
  { value: 'bayer', label: 'Bayer (ordered)' },
  { value: 'blue-noise', label: 'Blue-noise (hash)' },
  { value: 'halftone', label: 'Halftone' },
  { value: 'crosshatch', label: 'Crosshatch' },
];

const MATRICES: DitherWebGLMatrix[] = [2, 4, 8];

const PRESETS: {
  name: string;
  palette: string[];
  gradient: { type: 'linear' | 'radial'; angle: number; stops: { pos: number; color: string }[] };
}[] = [
  {
    name: 'Mono · paper',
    palette: ['#0a0a0a', '#f6f5ef'],
    gradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { pos: 0, color: '#0a0a0a' },
        { pos: 1, color: '#f6f5ef' },
      ],
    },
  },
  {
    name: 'Phosphor',
    palette: ['#001008', '#00aa55', '#aaffaa'],
    gradient: {
      type: 'radial',
      angle: 0,
      stops: [
        { pos: 0, color: '#013a22' },
        { pos: 1, color: '#000503' },
      ],
    },
  },
  {
    name: 'Mardi Gras',
    palette: ['#0a0612', '#5a1e8a', '#d4a02a', '#1e7a4e'],
    gradient: {
      type: 'linear',
      angle: 200,
      stops: [
        { pos: 0, color: '#150829' },
        { pos: 0.5, color: '#3a1268' },
        { pos: 1, color: '#d4a02a' },
      ],
    },
  },
  {
    name: 'Sunset',
    palette: ['#1a0533', '#5a1e6a', '#d2532a', '#f4c452'],
    gradient: {
      type: 'linear',
      angle: 160,
      stops: [
        { pos: 0, color: '#1a0533' },
        { pos: 1, color: '#f4c452' },
      ],
    },
  },
];

export default function DitherOverlayPage() {
  const [algorithm, setAlgorithm] = useState<DitherWebGLAlgorithm>('bayer');
  const [matrix, setMatrix] = useState<DitherWebGLMatrix>(8);
  const [cellSize, setCellSize] = useState(2);
  const [threshold, setThreshold] = useState(0.5);
  const [animate, setAnimate] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [presetIdx, setPresetIdx] = useState(2);
  const [overlayChildren, setOverlayChildren] = useState(true);

  const handleRef = useRef<DitherWebGLHandle | null>(null);

  const preset = PRESETS[presetIdx];

  const snippet = useMemo(
    () =>
      `import { DitherWebGL } from '@skeehn/react/gl';

<DitherWebGL
  algorithm="${algorithm}"${algorithm === 'bayer' ? `\n  matrix={${matrix}}` : ''}
  cellSize={${cellSize}}
  threshold={${threshold.toFixed(2)}}
  palette={${JSON.stringify(preset.palette)}}
  gradient={{
    type: '${preset.gradient.type}',
    angle: ${preset.gradient.angle},
    stops: ${JSON.stringify(preset.gradient.stops)},
  }}${animate ? `\n  animate\n  speed={${speed}}` : ''}
>
  {/* your content */}
</DitherWebGL>`,
    [algorithm, matrix, cellSize, threshold, animate, speed, preset],
  );

  const downloadPng = () => {
    const url = handleRef.current?.toDataURL('image/png');
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `skeehn-dither-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen text-neutral-100" style={{ fontFamily: 'var(--sk-font-mono, ui-monospace, monospace)' }}>
      <header className="mb-8">
        <h1 className="text-2xl tracking-tight mb-2" style={{ fontFamily: 'var(--sk-font-sans, system-ui)' }}>
          Dither Overlay · WebGL
        </h1>
        <p className="text-sm text-neutral-400 max-w-2xl">
          A single drop-in component that renders a dithered gradient (or image / video) at native
          resolution on the GPU. Configure the algorithm, palette, and cell size — or use a preset
          and ship it.
        </p>
      </header>

      {/* Live preview */}
      <div className="rounded-sm border border-neutral-800 overflow-hidden mb-6">
        <DitherWebGL
          ref={handleRef}
          algorithm={algorithm}
          matrix={matrix}
          cellSize={cellSize}
          threshold={threshold}
          palette={preset.palette}
          gradient={preset.gradient}
          animate={animate}
          speed={speed}
          style={{ width: '100%', height: 360 }}
        >
          {overlayChildren && (
            <div className="flex flex-col items-center justify-center h-[360px] text-center px-6">
              <div
                className="text-3xl md:text-5xl tracking-tight font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                style={{ fontFamily: 'var(--sk-font-sans, system-ui)', color: preset.palette[preset.palette.length - 1] }}
              >
                Every surface, a canvas.
              </div>
              <div
                className="mt-3 text-xs uppercase tracking-[0.25em]"
                style={{ color: preset.palette[Math.max(0, preset.palette.length - 2)] }}
              >
                skeehn · DitherWebGL
              </div>
            </div>
          )}
        </DitherWebGL>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Panel title="Presets">
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setPresetIdx(i)}
                className={`text-xs px-3 py-2 border transition-colors cursor-pointer ${
                  i === presetIdx
                    ? 'bg-white text-black border-white'
                    : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Algorithm">
          <div className="grid grid-cols-2 gap-2">
            {ALGORITHMS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setAlgorithm(value)}
                className={`text-xs px-3 py-2 border transition-colors cursor-pointer ${
                  algorithm === value
                    ? 'bg-white text-black border-white'
                    : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {algorithm === 'bayer' && (
            <div className="mt-4">
              <Label>Matrix size</Label>
              <div className="flex gap-2 mt-2">
                {MATRICES.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMatrix(m)}
                    className={`flex-1 text-xs py-1.5 border transition-colors cursor-pointer ${
                      matrix === m
                        ? 'bg-white text-black border-white'
                        : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                    }`}
                  >
                    {m}×{m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Cell size">
          <Slider value={cellSize} min={1} max={12} step={1} onChange={setCellSize} unit="px" />
        </Panel>

        <Panel title="Threshold">
          <Slider value={threshold} min={0} max={1} step={0.01} onChange={setThreshold} />
        </Panel>

        <Panel title="Animation">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-neutral-300">Enabled</span>
            <input
              type="checkbox"
              checked={animate}
              onChange={(e) => setAnimate(e.target.checked)}
              className="accent-white"
            />
          </label>
          <div className="mt-3">
            <Label>Speed</Label>
            <Slider value={speed} min={0} max={3} step={0.1} onChange={setSpeed} />
          </div>
        </Panel>

        <Panel title="Children">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-neutral-300">Show overlay text</span>
            <input
              type="checkbox"
              checked={overlayChildren}
              onChange={(e) => setOverlayChildren(e.target.checked)}
              className="accent-white"
            />
          </label>
          <button
            onClick={downloadPng}
            className="mt-4 w-full text-xs py-2 border border-neutral-700 hover:border-neutral-500 hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            Export current frame · PNG
          </button>
        </Panel>
      </div>

      {/* Code snippet */}
      <div>
        <h2 className="text-sm tracking-widest uppercase text-neutral-500 mb-2">Code</h2>
        <pre className="text-xs leading-relaxed bg-black border border-neutral-800 p-4 overflow-x-auto whitespace-pre-wrap">
          {snippet}
        </pre>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-neutral-800 p-4 bg-neutral-950">
      <Label>{title}</Label>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[10px] uppercase font-bold text-neutral-500"
      style={{ letterSpacing: '0.18em' }}
    >
      {children}
    </div>
  );
}

function Slider({
  value,
  min,
  max,
  step,
  onChange,
  unit,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-neutral-400 mb-1">
        <span>{min}</span>
        <span className="text-neutral-200">
          {value}
          {unit ? ` ${unit}` : ''}
        </span>
        <span>{max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-white"
      />
    </div>
  );
}
