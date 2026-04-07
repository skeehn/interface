/**
 * skeehn — Animation Engine
 *
 * Procedural ASCII animation system for backgrounds, hero sections,
 * and ambient visual layers. Uses requestAnimationFrame with
 * performance budgeting and reduced-motion respect.
 *
 * Usage:
 *   const anim = new AsciiAnimation(container, { effect: 'rain' })
 *   anim.start()
 *   anim.stop()
 */

import { CharacterEngine, RAMPS } from './characters';

export type AnimationEffect = 'rain' | 'flow' | 'pulse' | 'noise' | 'wave' | 'matrix';

export interface AnimationOptions {
  effect?: AnimationEffect;
  fps?: number;
  density?: number;
  ramp?: keyof typeof RAMPS;
  color?: string;
  opacity?: number;
  respectReducedMotion?: boolean;
}

const DEFAULT_ANIM_OPTIONS: Required<AnimationOptions> = {
  effect: 'rain',
  fps: 12,
  density: 0.5,
  ramp: 'blocks',
  color: 'inherit',
  opacity: 0.3,
  respectReducedMotion: true,
};

export class AsciiAnimation {
  private container: HTMLElement;
  private canvas: HTMLPreElement;
  private options: Required<AnimationOptions>;
  private charEngine: CharacterEngine;
  private animFrame: number = 0;
  private lastTick: number = 0;
  private cols: number = 0;
  private rows: number = 0;
  private grid: string[][] = [];
  private state: Float32Array = new Float32Array(0);
  private running: boolean = false;

  constructor(container: HTMLElement, options: AnimationOptions = {}) {
    this.container = container;
    this.options = { ...DEFAULT_ANIM_OPTIONS, ...options };
    this.charEngine = new CharacterEngine(this.options.ramp);

    this.canvas = document.createElement('pre');
    this.canvas.style.cssText = `
      position:absolute;inset:0;margin:0;padding:0;overflow:hidden;
      font-family:var(--sk-font-mono,monospace);font-size:0.6rem;line-height:1.1;
      color:${this.options.color};opacity:${this.options.opacity};
      pointer-events:none;z-index:0;user-select:none;
    `;
    this.canvas.setAttribute('aria-hidden', 'true');

    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }
    container.appendChild(this.canvas);
  }

  start() {
    if (this.options.respectReducedMotion && this._prefersReducedMotion()) {
      this._renderStaticFrame();
      return;
    }
    this._resize();
    this.running = true;
    this._tick();

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(() => this._resize()).observe(this.container);
    }
  }

  stop() {
    this.running = false;
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.animFrame = 0;
  }

  destroy() {
    this.stop();
    this.canvas.remove();
  }

  private _resize() {
    const { clientWidth, clientHeight } = this.container;
    const charW = 6;
    const charH = 10;
    this.cols = Math.floor(clientWidth / charW);
    this.rows = Math.floor(clientHeight / charH);
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(' '));
    this.state = new Float32Array(this.cols * this.rows);
  }

  private _tick() {
    if (!this.running) return;

    const now = performance.now();
    const interval = 1000 / this.options.fps;

    if (now - this.lastTick >= interval) {
      this.lastTick = now;
      this._update(now / 1000);
      this._render();
    }

    this.animFrame = requestAnimationFrame(() => this._tick());
  }

  private _update(time: number) {
    const chars = this.charEngine.getCharacters();
    const { cols, rows, state, options } = this;

    switch (options.effect) {
      case 'rain':
        for (let x = 0; x < cols; x++) {
          if (Math.random() < options.density * 0.1) {
            state[x] = rows;
          }
          for (let y = rows - 1; y >= 0; y--) {
            const idx = y * cols + x;
            if (state[idx] > 0) {
              state[idx] -= 1;
              const brightness = state[idx] / rows;
              this.grid[y][x] = this.charEngine.fromBrightness(brightness);
            } else {
              this.grid[y][x] = ' ';
            }
          }
        }
        break;

      case 'flow':
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const val = Math.sin(x * 0.1 + time * 2) * Math.cos(y * 0.15 + time * 1.5) * 0.5 + 0.5;
            this.grid[y][x] = this.charEngine.fromBrightness(val * options.density);
          }
        }
        break;

      case 'pulse':
        const pulse = Math.sin(time * 3) * 0.5 + 0.5;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const dist = Math.sqrt(Math.pow(x - cols / 2, 2) + Math.pow(y - rows / 2, 2));
            const wave = Math.sin(dist * 0.3 - time * 4) * 0.5 + 0.5;
            this.grid[y][x] = this.charEngine.fromBrightness(wave * pulse * options.density);
          }
        }
        break;

      case 'noise':
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            if (Math.random() < options.density * 0.3) {
              const idx = Math.floor(Math.random() * chars.length);
              this.grid[y][x] = chars[idx];
            } else {
              this.grid[y][x] = ' ';
            }
          }
        }
        break;

      case 'wave':
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const wave = Math.sin(x * 0.2 + time * 3 + y * 0.1) * 0.5 + 0.5;
            this.grid[y][x] = this.charEngine.fromBrightness(wave > (1 - options.density) ? wave : 0);
          }
        }
        break;

      case 'matrix':
        for (let x = 0; x < cols; x++) {
          const idx = x;
          if (Math.random() < 0.02) state[idx] = 0;
          if (state[idx] < rows) {
            const y = Math.floor(state[idx]);
            if (y >= 0 && y < rows) {
              this.grid[y][x] = chars[Math.floor(Math.random() * chars.length)];
            }
            state[idx] += options.density * 2;
          }
          for (let y = 0; y < rows; y++) {
            if (y !== Math.floor(state[x])) {
              const fade = this.grid[y][x];
              if (fade !== ' ') {
                const currentIdx = chars.indexOf(fade);
                if (currentIdx > 0) {
                  this.grid[y][x] = chars[currentIdx - 1];
                } else {
                  this.grid[y][x] = ' ';
                }
              }
            }
          }
        }
        break;
    }
  }

  private _render() {
    this.canvas.textContent = this.grid.map(row => row.join('')).join('\n');
  }

  private _renderStaticFrame() {
    this._resize();
    const chars = this.charEngine.getCharacters();
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (Math.random() < this.options.density * 0.15) {
          this.grid[y][x] = chars[Math.floor(Math.random() * chars.length)];
        }
      }
    }
    this._render();
  }

  private _prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
