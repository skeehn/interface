/**
 * skeehn — Video-to-ASCII Pipeline
 *
 * Real-time video → ASCII conversion using Canvas2D.
 * Renders each video frame through the dither engine.
 *
 * Usage:
 *   const pipeline = new VideoAsciiPipeline(videoElement, outputElement)
 *   pipeline.start()
 *   pipeline.stop()
 */

import { CharacterEngine, RAMPS } from './characters';
import { DitherEngine, DitherAlgorithm, BayerSize } from './dither';

export interface VideoAsciiOptions {
  algorithm?: DitherAlgorithm;
  bayerSize?: BayerSize;
  ramp?: keyof typeof RAMPS;
  resolution?: number;
  fps?: number;
  contrast?: number;
  brightness?: number;
  invert?: boolean;
  color?: boolean;
}

const DEFAULT_VIDEO_OPTIONS: Required<VideoAsciiOptions> = {
  algorithm: 'bayer',
  bayerSize: 4,
  ramp: 'blocks',
  resolution: 80,
  fps: 15,
  contrast: 1.0,
  brightness: 0,
  invert: false,
  color: false,
};

export class VideoAsciiPipeline {
  private video: HTMLVideoElement;
  private output: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: Required<VideoAsciiOptions>;
  private animFrame: number = 0;
  private lastFrameTime: number = 0;
  private running: boolean = false;
  private charEngine: CharacterEngine;
  private ditherEngine: DitherEngine;

  constructor(
    video: HTMLVideoElement,
    output: HTMLElement,
    options: VideoAsciiOptions = {}
  ) {
    if (typeof document === 'undefined') {
      throw new Error('VideoAsciiPipeline requires a browser environment.');
    }
    this.video = video;
    this.output = output;
    this.options = { ...DEFAULT_VIDEO_OPTIONS, ...options };
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
    this.charEngine = new CharacterEngine(this.options.ramp);
    this.ditherEngine = new DitherEngine(this.options.algorithm, this.options.bayerSize, this.charEngine);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrameTime = 0;
    this._tick();
  }

  stop() {
    this.running = false;
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = 0;
    }
  }

  setOption<K extends keyof VideoAsciiOptions>(key: K, value: VideoAsciiOptions[K]) {
    (this.options as any)[key] = value;
    if (key === 'ramp') {
      this.charEngine = new CharacterEngine(this.options.ramp);
      this.ditherEngine.setCharEngine(this.charEngine);
    }
    if (key === 'algorithm') this.ditherEngine.setAlgorithm(this.options.algorithm);
    if (key === 'bayerSize') this.ditherEngine.setBayerSize(this.options.bayerSize);
  }

  renderFrame(): string {
    const { videoWidth, videoHeight } = this.video;
    if (!videoWidth || !videoHeight) return '';

    const charAspect = 0.5;
    const outW = Math.min(this.options.resolution, videoWidth);
    const outH = Math.floor((outW * videoHeight) / (videoWidth / charAspect));

    this.canvas.width = videoWidth;
    this.canvas.height = videoHeight;
    this.ctx.drawImage(this.video, 0, 0);

    const imageData = this.ctx.getImageData(0, 0, videoWidth, videoHeight);

    if (this.options.contrast !== 1.0 || this.options.brightness !== 0) {
      this._adjustPixels(imageData.data);
    }

    const cellW = Math.max(1, Math.floor(videoWidth / outW));
    const cellH = Math.max(1, Math.floor(videoHeight / outH));

    return this.ditherEngine.ditherImageData(imageData, cellW, cellH);
  }

  destroy() {
    this.stop();
  }

  private _tick() {
    if (!this.running) return;

    const now = performance.now();
    const frameInterval = 1000 / this.options.fps;

    if (now - this.lastFrameTime >= frameInterval) {
      this.lastFrameTime = now;

      if (!this.video.paused && !this.video.ended && this.video.readyState >= 2) {
        const ascii = this.renderFrame();
        this.output.textContent = ascii;
      }
    }

    this.animFrame = requestAnimationFrame(() => this._tick());
  }

  private _adjustPixels(data: Uint8ClampedArray) {
    const { contrast, brightness } = this.options;
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        data[i + c] = Math.min(255, Math.max(0,
          ((data[i + c] / 255 - 0.5) * contrast + 0.5 + brightness / 255) * 255
        ));
      }
    }
  }
}

/**
 * ServerRenderer — SSR-safe ASCII generation from raw pixel data.
 * Does not depend on DOM APIs.
 */
export class ServerRenderer {
  private charEngine: CharacterEngine;
  private ditherEngine: DitherEngine;

  constructor(
    algorithm: DitherAlgorithm = 'floyd',
    bayerSize: BayerSize = 4,
    ramp: keyof typeof RAMPS = 'blocks'
  ) {
    this.charEngine = new CharacterEngine(ramp);
    this.ditherEngine = new DitherEngine(algorithm, bayerSize, this.charEngine);
  }

  fromLuminanceArray(
    luminance: number[],
    width: number,
    height: number
  ): string {
    return this.ditherEngine.dither1D(luminance, width, height);
  }

  fromRGBA(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    cellWidth: number = 1,
    cellHeight: number = 2
  ): string {
    const imageData = { data: pixels, width, height } as ImageData;
    return this.ditherEngine.ditherImageData(imageData, cellWidth, cellHeight);
  }
}
