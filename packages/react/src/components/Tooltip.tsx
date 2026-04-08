import React from 'react';

/** Props for the {@link Tooltip} component. */
export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Text displayed inside the tooltip. */
  text: string;
  /** Additional CSS class names on the wrapper. */
  className?: string;
  /** The element that triggers the tooltip on hover/focus. */
  children: React.ReactNode;
}

/**
 * Hover info tooltip with dither styling.
 * Wraps children in a `sk-tooltip-wrapper` and positions a `sk-tooltip` above them.
 */
export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ text, className, children, ...rest }, ref) => (
    <div ref={ref} className={`sk-tooltip-wrapper${className ? ` ${className}` : ''}`} {...rest}>
      {children}
      <span className="sk-tooltip" role="tooltip">{text}</span>
    </div>
  ),
);

Tooltip.displayName = 'Tooltip';
