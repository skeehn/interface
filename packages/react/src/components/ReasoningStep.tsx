'use client';

import React from 'react';

/** Status of the reasoning step. */
export type ReasoningStepStatus = 'pending' | 'active' | 'completed' | 'error';

/** Props for the {@link ReasoningStep} component. */
export interface ReasoningStepProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current status of this step. */
  status: ReasoningStepStatus;
  /** Title text displayed in the header. */
  title: string;
  /** Whether the step is expanded by default. */
  defaultExpanded?: boolean;
  /** Additional CSS class names. */
  className?: string;
  /** Step content, shown when expanded. */
  children?: React.ReactNode;
}

/**
 * Expandable reasoning trace step.
 * Renders a collapsible section with a status indicator icon.
 */
export const ReasoningStep = React.forwardRef<HTMLDivElement, ReasoningStepProps>(
  ({ status, title, defaultExpanded, className, children, ...rest }, ref) => {
    const [expanded, setExpanded] = React.useState(defaultExpanded ?? false);
    const icon =
      status === 'completed' ? '\u2713' :
      status === 'error'     ? '\u2717' :
      status === 'active'    ? '\u25B8' : '\u25CB';

    return (
      <div
        ref={ref}
        className={`sk-reasoning-step${className ? ` ${className}` : ''}`}
        data-status={status}
        data-expanded={expanded ? 'true' : 'false'}
        {...rest}
      >
        <button
          className="sk-reasoning-step__header"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
        >
          <span className="sk-reasoning-step__indicator">{icon}</span>
          <span className="sk-reasoning-step__title">{title}</span>
          <span className="sk-reasoning-step__chevron">{expanded ? '\u25BE' : '\u25B8'}</span>
        </button>
        {expanded && children && (
          <div className="sk-reasoning-step__content">{children}</div>
        )}
      </div>
    );
  },
);

ReasoningStep.displayName = 'ReasoningStep';
