/**
 * @skeehn/react — WebGL Artistic Components
 *
 * Canvas2D-based visual components for dithered gradients,
 * image-to-ASCII, video-to-ASCII, and procedural ASCII animations.
 */

export { DitherBackground } from './DitherBackground';
export type { DitherBackgroundProps, DitherAlgorithm } from './DitherBackground';

export { detectGLTier, GLFrameMonitor, downgradeTier, resolveInitialTier } from './policy';
export type { GLTier, GLTierSignals } from './policy';
export { TIER_FPS_CAP, TIER_PIXEL_SCALE } from './policy';

export { AsciiImage } from './AsciiImage';
export type { AsciiImageProps, AsciiImageAlgorithm, AsciiImagePalette } from './AsciiImage';

export { AsciiVideo } from './AsciiVideo';
export type { AsciiVideoProps, AsciiVideoAlgorithm, AsciiVideoPalette } from './AsciiVideo';

export { AsciiAnimation } from './AsciiAnimation';
export type { AsciiAnimationProps, AnimationEffect, AnimationPalette } from './AsciiAnimation';
