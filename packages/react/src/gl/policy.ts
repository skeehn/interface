/**
 * @module @skeehn/gl — degradation policy
 *
 * Three-tier performance policy for GL/texture surfaces:
 *  A — full: 60fps, high resolution
 *  B — restrained: 30fps, half resolution
 *  C — static: one frozen frame (or a CSS fallback), zero loop
 *
 * Tier detection is deterministic from device+preference signals; the runtime
 * monitor downgrades on sustained slow frames. `prefers-reduced-motion` maps
 * to C by design — texture stays, motion does not.
 */

export type GLTier = 'A' | 'B' | 'C';

/** Target frame interval per tier (rAF pacing). */
export const TIER_FPS_CAP: Record<GLTier, number> = {
  A: 60,
  B: 30,
  C: 0,
};

/** Pixel scale per tier (fraction of CSS pixels rendered per canvas px). */
export const TIER_PIXEL_SCALE: Record<GLTier, number> = {
  A: 0.5,
  B: 0.25,
  C: 0.25,
};

/** Signals that feed {@link detectGLTier}. */
export interface GLTierSignals {
  reducedMotion: boolean;
  webglAvailable: boolean;
  /** navigator.deviceMemory (GB), if exposed. */
  deviceMemory?: number;
  /** navigator.maxTouchPoints. */
  maxTouchPoints?: number;
  /** navigator.hardwareConcurrency. */
  hardwareConcurrency?: number;
  /** CSS max resolution hint (already covered by tiers). */
  forceTier?: GLTier;
}

/** Detect the starting tier. Pure + synchronous. */
export function detectGLTier(s: GLTierSignals): GLTier {
  if (s.forceTier) return s.forceTier;
  if (s.reducedMotion || !s.webglAvailable) return 'C';
  const weakDevice =
    (s.deviceMemory != null && s.deviceMemory <= 2) ||
    (s.maxTouchPoints != null && s.maxTouchPoints > 4) ||
    (s.hardwareConcurrency != null && s.hardwareConcurrency <= 2);
  return weakDevice ? 'B' : 'A';
}

/** Is WebGL usable in `window` (done defensively; jsdom-safe). */
export function webglAvailableIn(win: typeof window): boolean {
  try {
    const canvas = win.document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') ?? canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

/**
 * Rolling-window frame monitor: downgrade when sustained average frame time
 * exceeds the budget. Pure class, driven manually by the render loop.
 */
export class GLFrameMonitor {
  /** Average-frame-time budget in ms (30fps floor before downgrade). */
  readonly budgetMs: number;
  /** Rolling window size — sustained, not single-frame, decisions. */
  readonly windowSize: number;
  private samples: number[] = [];

  constructor(budgetMs = 33, windowSize = 90) {
    this.budgetMs = budgetMs;
    this.windowSize = windowSize;
  }

  /** Record a frame duration; returns the downgrade verdict. */
  record(durationMs: number): { overloaded: boolean; avgMs: number } {
    this.samples.push(durationMs);
    if (this.samples.length > this.windowSize) this.samples.shift();
    const avgMs = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    if (this.samples.length < this.windowSize) return { overloaded: false, avgMs };
    return { overloaded: avgMs > this.budgetMs, avgMs };
  }

  reset(): void {
    this.samples = [];
  }
}

/** Downgrade one step; C is terminal. */
export function downgradeTier(tier: GLTier): GLTier {
  return tier === 'A' ? 'B' : 'C';
}

/* ── environment probing (browser-only) ───────────────────────────────────── */

export function readSignals(doc: Document, nav: Navigator): GLTierSignals {
  const reduced = doc.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false;
  return {
    reducedMotion: reduced,
    webglAvailable: webglAvailableIn(doc.defaultView as typeof window),
    deviceMemory: (nav as Navigator & { deviceMemory?: number }).deviceMemory,
    maxTouchPoints: nav.maxTouchPoints,
    hardwareConcurrency: nav.hardwareConcurrency,
  };
}

/** Combined tier decision for production use. */
export function resolveInitialTier(
  doc: Document,
  nav: Navigator,
  forceTier?: GLTier,
): { tier: GLTier; signals: GLTierSignals } {
  const signals = readSignals(doc, nav);
  const tier = detectGLTier({ ...signals, forceTier });
  return { tier, signals };
}
