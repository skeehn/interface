import React from 'react';

// ── DitherPulse ──

/** Effect type for DitherPulse. */
export type DitherPulseEffect = 'pulse' | 'morph' | 'scan' | 'flow';

/** Props for the {@link DitherPulse} component. */
export interface DitherPulseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Animation effect applied to the dither overlay. */
  effect?: DitherPulseEffect;
  /** Additional CSS class names. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Animated dither overlay effect wrapper.
 * Renders a `<div>` with `sk-dither-pulse`.
 */
export const DitherPulse = React.forwardRef<HTMLDivElement, DitherPulseProps>(
  ({ effect = 'pulse', className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-dither-pulse${className ? ` ${className}` : ''}`}
      data-effect={effect}
      {...rest}
    >
      {children}
    </div>
  ),
);

DitherPulse.displayName = 'DitherPulse';

// ── AsciiRain ──

/** Density preset for AsciiRain. */
export type AsciiRainDensity = 'sparse' | 'normal' | 'dense';

/** Props for the {@link AsciiRain} component. */
export interface AsciiRainProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Density of rain columns. */
  density?: AsciiRainDensity;
  /** Additional CSS class names. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Matrix-style ASCII rain animation overlay.
 * Renders a `<div>` with `sk-ascii-rain`.
 */
export const AsciiRain = React.forwardRef<HTMLDivElement, AsciiRainProps>(
  ({ density = 'normal', className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-ascii-rain${className ? ` ${className}` : ''}`}
      data-density={density}
      {...rest}
    >
      {children}
    </div>
  ),
);

AsciiRain.displayName = 'AsciiRain';

// ── Glitch ──

/** Intensity for the Glitch effect. */
export type GlitchIntensity = 'subtle' | 'severe';

/** Props for the {@link Glitch} component. */
export interface GlitchProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the glitch effect is active. */
  active?: boolean;
  /** Text content used for the glitch pseudo-element overlays. */
  text?: string;
  /** Glitch animation intensity. */
  intensity?: GlitchIntensity;
  /** Additional CSS class names. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Glitch text/element effect with color-shifted overlays.
 * Uses `data-text` and `data-active` attributes for CSS-driven animation.
 */
export const Glitch = React.forwardRef<HTMLDivElement, GlitchProps>(
  ({ active, text, intensity, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-glitch${className ? ` ${className}` : ''}`}
      data-active={active ? 'true' : undefined}
      data-text={text}
      data-intensity={intensity}
      {...rest}
    >
      {children}
    </div>
  ),
);

Glitch.displayName = 'Glitch';

// ── TextureMask ──

/** Trigger for the TextureMask reveal. */
export type TextureMaskTrigger = 'hover' | 'focus' | 'active';

/** Direction for the TextureMask reveal. */
export type TextureMaskDirection = 'fade' | 'wipe' | 'dissolve';

/** Props for the {@link TextureMask} component. */
export interface TextureMaskProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Event that triggers the texture reveal. */
  trigger?: TextureMaskTrigger;
  /** Direction/animation of the reveal. */
  direction?: TextureMaskDirection;
  /** Additional CSS class names. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Texture reveal mask overlay that shows on hover, focus, or active state.
 * Wraps children and adds an animated dither reveal layer.
 */
export const TextureMask = React.forwardRef<HTMLDivElement, TextureMaskProps>(
  ({ trigger = 'hover', direction, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-texture-mask${className ? ` ${className}` : ''}`}
      data-trigger={trigger}
      data-direction={direction}
      {...rest}
    >
      {children}
      <div className="sk-texture-mask__reveal" />
    </div>
  ),
);

TextureMask.displayName = 'TextureMask';
