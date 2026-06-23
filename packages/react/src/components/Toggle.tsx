'use client';

import React from 'react';

/** Props for the {@link Toggle} component. */
export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Whether the toggle is on (controlled). */
  checked?: boolean;
  /** Default checked state (uncontrolled). */
  defaultChecked?: boolean;
  /** Called when the toggle value changes. */
  onCheckedChange?: (checked: boolean) => void;
  /** Label text displayed next to the toggle. */
  label?: string;
  /** Additional CSS class names on the outer wrapper. */
  className?: string;
}

/**
 * Two-state switch with dither texture on the active thumb.
 * Renders a `<label>` wrapping a hidden checkbox and a styled thumb.
 */
export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ checked, defaultChecked, onCheckedChange, label, className, onChange, ...rest }, ref) => {
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onCheckedChange?.(e.target.checked);
        onChange?.(e);
      },
      [onCheckedChange, onChange],
    );

    return (
      <label className={`sk-toggle${className ? ` ${className}` : ''}`}>
        <input
          ref={ref}
          type="checkbox"
          className="sk-toggle__input"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          {...rest}
        />
        <span className="sk-toggle__thumb" />
        {label && <span className="sk-toggle__label">{label}</span>}
      </label>
    );
  },
);

Toggle.displayName = 'Toggle';
