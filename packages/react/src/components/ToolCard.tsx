import React from 'react';

/** Execution status for the ToolCard. */
export type ToolCardStatus = 'pending' | 'running' | 'success' | 'error';

/** Props for the {@link ToolCard} component. */
export interface ToolCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tool name displayed in the header. */
  name: string;
  /** Current execution status. */
  status?: ToolCardStatus;
  /** Status label override. */
  statusLabel?: string;
  /** Additional CSS class names. */
  className?: string;
  /** Tool card body content (input/output display). */
  children?: React.ReactNode;
}

/**
 * Tool execution result card with box-drawing borders.
 * Renders a `<div>` with `sk-tool-card` and `data-status`.
 */
export const ToolCard = React.forwardRef<HTMLDivElement, ToolCardProps>(
  ({ name, status = 'pending', statusLabel, className, children, ...rest }, ref) => {
    const defaultLabels: Record<ToolCardStatus, string> = {
      pending: 'pending',
      running: 'running',
      success: 'success',
      error: 'error',
    };
    return (
      <div
        ref={ref}
        className={`sk-tool-card${className ? ` ${className}` : ''}`}
        data-status={status}
        {...rest}
      >
        <div className="sk-tool-card__header">
          <span className="sk-tool-card__name">{name}</span>
          <span className="sk-tool-card__status" role="status" aria-live="polite">
            {statusLabel ?? defaultLabels[status]}
          </span>
        </div>
        <div className="sk-tool-card__body">{children}</div>
      </div>
    );
  },
);

ToolCard.displayName = 'ToolCard';
