/**
 * @skeehn/core — ASCII-native dither UI engine
 *
 * Exports all engine classes and utilities for canvas-based dithering,
 * WebGL shaders, image/video ASCII rendering, and procedural animations.
 *
 * @example
 * ```typescript
 * import { CanvasRenderer, DitherEngine, CharacterEngine } from '@skeehn/core';
 *
 * const renderer = new CanvasRenderer();
 * const ascii = await renderer.fromUrl('photo.jpg', { algorithm: 'floyd' });
 * ```
 *
 * @packageDocumentation
 */

// Character engine — palettes and ramps
export { CharacterEngine, defaultEngine, RAMPS } from '../../../engine/characters';

// Dither algorithms — Floyd-Steinberg, Bayer, Atkinson, Sierra
export { DitherEngine } from '../../../engine/dither';

// Canvas renderer — image → ASCII
export { CanvasRenderer } from '../../../engine/canvas';

// WebGL shader — GPU-accelerated Bayer dither
export { DitherShader } from '../../../engine/shader';

// Video pipeline — real-time video → ASCII
export { VideoAsciiPipeline } from '../../../engine/video';

// Animation engine — procedural ASCII effects
export { AsciiAnimation } from '../../../engine/animate';
