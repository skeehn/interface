import React from 'react';

/** Visual variant for the Progress bar. */
export type ProgressVariant = 'dither';

/** Loading state for the Progress bar. */
export type ProgressState = 'loading';

/** Props for the {@link Progress} component. */
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value (0-100). */
  value?: number;
  /** Maximum value. Defaults to 100. */
  max?: number;
  /** Visual variant. */
  variant?: ProgressVariant;
  /** State that controls animations. */
  state?: ProgressState;
  /** Label text (e.g. "75%") displayed to the right. */
  label?: string;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Loading indicator with dither fill.
 * Renders a track and indicator bar using the `sk-progress` classes.
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, max = 100, variant, state, label, className, ...rest }, ref) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <div
        ref={ref}
        className={`sk-progress${className ? ` ${className}` : ''}`}
        data-variant={variant}
        data-state={state}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...rest}
      >
        <div className="sk-progress__track">
          <div className="sk-progress__indicator" style={{ width: `${pct}%` }} />
        </div>
        {label && <span className="sk-progress__label">{label}</span>}
      </div>
    );
  },
);

Progress.displayName = 'Progress';
