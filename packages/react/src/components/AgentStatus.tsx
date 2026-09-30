import React from 'react';

/** Agent state values. */
export type AgentStatusValue = 'idle' | 'thinking' | 'acting' | 'done' | 'error';

/** Props for the {@link AgentStatus} component. */
export interface AgentStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current agent status. */
  status: AgentStatusValue;
  /** Override label text. Defaults to the status name. */
  label?: string;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Agent state indicator with dot and label.
 * Renders a `<div>` with `sk-agent-status` and `data-status`.
 */
export const AgentStatus = React.forwardRef<HTMLDivElement, AgentStatusProps>(
  ({ status, label, className, ...rest }, ref) => {
    const defaultLabels: Record<AgentStatusValue, string> = {
      idle: 'idle',
      thinking: 'thinking',
      acting: 'acting',
      done: 'done',
      error: 'error',
    };
    return (
      <div
        ref={ref}
        className={`sk-agent-status${className ? ` ${className}` : ''}`}
        data-status={status}
        role="status"
        aria-live="polite"
        {...rest}
      >
        <span className="sk-agent-status__indicator" />
        <span className="sk-agent-status__text">{label ?? defaultLabels[status]}</span>
      </div>
    );
  },
);

AgentStatus.displayName = 'AgentStatus';
