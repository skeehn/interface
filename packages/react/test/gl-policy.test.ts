import { describe, expect, test } from 'bun:test';
import {
  detectGLTier,
  GLFrameMonitor,
  downgradeTier,
  TIER_FPS_CAP,
  TIER_PIXEL_SCALE,
  type GLTierSignals,
} from '../src/gl/policy';

const base: GLTierSignals = {
  reducedMotion: false,
  webglAvailable: true,
  deviceMemory: 8,
  maxTouchPoints: 0,
  hardwareConcurrency: 8,
};

describe('detectGLTier', () => {
  test('healthy device = A', () => {
    expect(detectGLTier(base)).toBe('A');
  });

  test('reduced motion = C (motion disallowed, not merely paused)', () => {
    expect(detectGLTier({ ...base, reducedMotion: true })).toBe('C');
  });

  test('no WebGL = C', () => {
    expect(detectGLTier({ ...base, webglAvailable: false })).toBe('C');
  });

  test('weak device = B', () => {
    expect(detectGLTier({ ...base, deviceMemory: 2 })).toBe('B');
    expect(detectGLTier({ ...base, deviceMemory: 1 })).toBe('B');
    expect(detectGLTier({ ...base, hardwareConcurrency: 2 })).toBe('B');
    expect(detectGLTier({ ...base, hardwareConcurrency: 3 })).toBe('A');
  });

  test('touch-heavy device = B', () => {
    expect(detectGLTier({ ...base, maxTouchPoints: 5 })).toBe('B');
    expect(detectGLTier({ ...base, maxTouchPoints: 4 })).toBe('A');
  });

  test('forceTier overrides all signals', () => {
    expect(detectGLTier({ ...base, forceTier: 'C' })).toBe('C');
    expect(detectGLTier({ ...base, reducedMotion: true, forceTier: 'B' })).toBe('B');
  });
});

describe('GLFrameMonitor', () => {
  test('below window: never overloaded', () => {
    const m = new GLFrameMonitor(33, 90);
    for (let i = 0; i < 89; i++) m.record(100);
    const { overloaded } = m.record(100);
    expect(overloaded).toBe(true);
  });

  test('sustained >33ms in 90 frames downgrades', () => {
    const m = new GLFrameMonitor(33, 90);
    let verdict = { overloaded: false, avgMs: 0 };
    for (let i = 0; i < 90; i++) verdict = m.record(50);
    expect(verdict.overloaded).toBe(true);
    expect(verdict.avgMs).toBe(50);
  });

  test('fast frames never trigger', () => {
    const m = new GLFrameMonitor(33, 90);
    for (let i = 0; i < 90; i++) m.record(10);
    const { overloaded, avgMs } = m.record(10);
    expect(overloaded).toBe(false);
    expect(avgMs).toBe(10);
  });

  test('mixed window resets cleanly', () => {
    const m = new GLFrameMonitor(33, 5);
    for (let i = 0; i < 5; i++) m.record(40);
    m.reset();
    for (let i = 0; i < 5; i++) m.record(10);
    expect(m.record(10).overloaded).toBe(false);
  });
});

describe('tier downgrade', () => {
  test('A->B->C; C is terminal', () => {
    expect(downgradeTier('A')).toBe('B');
    expect(downgradeTier('B')).toBe('C');
    expect(downgradeTier(downgradeTier('C'))).toBe('C');
  });

  test('tier budgets are monotone', () => {
    expect(TIER_FPS_CAP.C).toBe(0);
    expect(TIER_FPS_CAP.B).toBeLessThan(TIER_FPS_CAP.A);
    expect(TIER_PIXEL_SCALE.C).toBeLessThanOrEqual(TIER_PIXEL_SCALE.B);
    expect(TIER_PIXEL_SCALE.B).toBeLessThan(TIER_PIXEL_SCALE.A);
  });
});
