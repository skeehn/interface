/**
 * skeehn — Dither Web Worker
 *
 * Offloads heavy dither computation to a background thread.
 * Prevents main-thread jank during large image conversions.
 *
 * Usage:
 *   const worker = new DitherWorkerPool()
 *   const ascii = await worker.dither(imageData, options)
 *   worker.terminate()
 */

import { CharacterEngine, rgbToLuminance, pixelToLuminance, RAMPS } from './characters';
import { DitherEngine, type DitherAlgorithm, type BayerSize } from './dither';

export interface DitherWorkerMessage {
  type: 'dither';
  id: number;
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
  algorithm: DitherAlgorithm;
  bayerSize: BayerSize;
  ramp: string;
  cellWidth: number;
  cellHeight: number;
  contrast: number;
  brightness: number;
}

export interface DitherWorkerResult {
  type: 'result';
  id: number;
  ascii: string;
  duration: number;
}

/**
 * Worker entry point. Call this in a Web Worker context.
 */
export function workerMain() {
  self.addEventListener('message', (e: MessageEvent<DitherWorkerMessage>) => {
    const msg = e.data;
    if (msg.type !== 'dither') return;

    const start = performance.now();
    const { pixels, width, height, algorithm, bayerSize, ramp, cellWidth, cellHeight, contrast, brightness } = msg;

    // Apply contrast/brightness
    if (contrast !== 1.0 || brightness !== 0) {
      for (let i = 0; i < pixels.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          pixels[i + c] = Math.min(255, Math.max(0,
            ((pixels[i + c] / 255 - 0.5) * contrast + 0.5 + brightness / 255) * 255
          ));
        }
      }
    }

    const rampName = (ramp in RAMPS ? ramp : 'blocks') as keyof typeof RAMPS;
    const charEngine = new CharacterEngine(rampName);
    const ditherEngine = new DitherEngine(algorithm, bayerSize, charEngine);
    const imageData = { data: pixels, width, height } as ImageData;
    const ascii = ditherEngine.ditherImageData(imageData, cellWidth, cellHeight);

    const result: DitherWorkerResult = {
      type: 'result',
      id: msg.id,
      ascii,
      duration: performance.now() - start,
    };

    (self as any).postMessage(result);
  });
}

/**
 * DitherWorkerPool — manages a pool of Web Workers for parallel dithering.
 */
export class DitherWorkerPool {
  private workers: Worker[] = [];
  private nextId: number = 0;
  private pending: Map<number, { resolve: (ascii: string) => void; reject: (err: Error) => void }> = new Map();
  private roundRobin: number = 0;

  constructor(poolSize: number = navigator.hardwareConcurrency || 2) {
    if (typeof Worker === 'undefined') {
      console.warn('Web Workers not available. Dithering will run on main thread.');
      return;
    }

    const workerCode = `
      ${CharacterEngine.toString()}
      ${DitherEngine.toString()}
      ${rgbToLuminance.toString()}
      ${pixelToLuminance.toString()}
      const RAMPS = ${JSON.stringify(RAMPS)};
      (${workerMain.toString()})();
    `;

    // Note: In production, use a bundled worker file instead of blob URL
    for (let i = 0; i < Math.min(poolSize, 4); i++) {
      try {
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        worker.addEventListener('message', (e: MessageEvent<DitherWorkerResult>) => {
          const { id, ascii } = e.data;
          const entry = this.pending.get(id);
          if (entry) {
            entry.resolve(ascii);
            this.pending.delete(id);
          }
        });
        worker.addEventListener('error', (e) => {
          console.error('Worker error:', e.message);
        });
        this.workers.push(worker);
      } catch {
        break;
      }
    }
  }

  async dither(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    options: {
      algorithm?: DitherAlgorithm;
      bayerSize?: BayerSize;
      ramp?: string;
      cellWidth?: number;
      cellHeight?: number;
      contrast?: number;
      brightness?: number;
    } = {}
  ): Promise<string> {
    // Fallback to main thread if no workers
    if (this.workers.length === 0) {
      const rampName = (options.ramp && options.ramp in RAMPS ? options.ramp : 'blocks') as keyof typeof RAMPS;
      const charEngine = new CharacterEngine(rampName);
      const ditherEngine = new DitherEngine(
        options.algorithm || 'floyd',
        options.bayerSize || 4,
        charEngine
      );
      const imageData = { data: pixels, width, height } as ImageData;
      return ditherEngine.ditherImageData(
        imageData,
        options.cellWidth || 1,
        options.cellHeight || 2
      );
    }

    const id = this.nextId++;
    const worker = this.workers[this.roundRobin % this.workers.length];
    this.roundRobin++;

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });

      const msg: DitherWorkerMessage = {
        type: 'dither',
        id,
        pixels: new Uint8ClampedArray(pixels),
        width,
        height,
        algorithm: options.algorithm || 'floyd',
        bayerSize: options.bayerSize || 4,
        ramp: options.ramp || 'blocks',
        cellWidth: options.cellWidth || 1,
        cellHeight: options.cellHeight || 2,
        contrast: options.contrast || 1.0,
        brightness: options.brightness || 0,
      };

      worker.postMessage(msg, [msg.pixels.buffer]);
    });
  }

  terminate() {
    this.workers.forEach(w => w.terminate());
    this.workers = [];
    this.pending.forEach(entry => entry.reject(new Error('Worker terminated')));
    this.pending.clear();
  }
}
