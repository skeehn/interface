import React from 'react';
import { type SkState } from '../types';

/** Validation / lifecycle state for the Input (canonical state union). */
export type InputState = SkState;

/** Props for the {@link Input} component. */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Apply a dither pattern on focus. */
  dither?: boolean;
  /** Validation / lifecycle state. */
  state?: InputState;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Text input with dither focus effect.
 * Renders an `<input>` with the `sk-input` class.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ dither, state, className, disabled, ...rest }, ref) => (
    <input
      ref={ref}
      className={`sk-input${className ? ` ${className}` : ''}`}
      data-dither={dither ? '' : undefined}
      data-state={state}
      aria-busy={state === 'loading' || undefined}
      aria-invalid={state === 'error' || undefined}
      disabled={disabled || state === 'disabled'}
      {...rest}
    />
  ),
);

Input.displayName = 'Input';

/** Props for the {@link InputGroup} wrapper component. */
export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Label text shown above the input. */
  label?: string;
  /** Hint / error text shown below the input. */
  hint?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Input group with optional label and hint.
 * Wraps children in the `sk-input-group` structure.
 */
export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ label, hint, className, children, ...rest }, ref) => (
    <div ref={ref} className={`sk-input-group${className ? ` ${className}` : ''}`} {...rest}>
      {label && <label className="sk-input-label">{label}</label>}
      {children}
      {hint && <span className="sk-input-hint">{hint}</span>}
    </div>
  ),
);

InputGroup.displayName = 'InputGroup';
