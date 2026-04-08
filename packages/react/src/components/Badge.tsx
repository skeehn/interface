import React from 'react';

/** Visual variant for the Badge. */
export type BadgeVariant = 'solid' | 'dither' | 'outline' | 'ghost' | 'inverted' | 'pixel';

/** Semantic color for the Badge. */
export type BadgeColor = 'success' | 'warning' | 'destructive' | 'info';

/** Props for the {@link Badge} component. */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual variant. */
  variant?: BadgeVariant;
  /** Semantic color override. */
  color?: BadgeColor;
  /** Animate with a pulsing effect. */
  pulsing?: boolean;
  /** Additional CSS class names. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Status indicator with dither fill.
 * Renders a `<span>` with the `sk-badge` class.
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, color, pulsing, className, children, ...rest }, ref) => (
    <span
      ref={ref}
      className={`sk-badge${className ? ` ${className}` : ''}`}
      data-variant={variant}
      data-color={color}
      data-pulsing={pulsing ? '' : undefined}
      {...rest}
    >
      {children}
    </span>
  ),
);

Badge.displayName = 'Badge';
