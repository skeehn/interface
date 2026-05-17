import React from 'react';

/** Variant styles for the Button component. */
export type ButtonVariant =
  | 'solid'
  | 'dither'
  | 'outline'
  | 'ghost'
  | 'inverted'
  | 'ascii'
  | 'pixel'
  | 'retro';

/** Size options for the Button component. */
export type ButtonSize = 'sm' | 'lg' | 'xl';

/** Props for the {@link Button} component. */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button. */
  variant?: ButtonVariant;
  /** Size preset. Default renders at the base size. */
  size?: ButtonSize;
  /** Show a loading indicator and disable interaction. */
  loading?: boolean;
  /** Additional CSS class names. */
  className?: string;
  /** Button content. */
  children?: React.ReactNode;
}

/**
 * Interactive button with ASCII dither variants.
 * Renders a `<button>` with the `sk-btn` class and maps props to `data-*` attributes.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, loading, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      className={`sk-btn${className ? ` ${className}` : ''}`}
      data-variant={variant}
      data-size={size}
      data-loading={loading ? '' : undefined}
      disabled={disabled || loading}
      {...rest}
    >
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
