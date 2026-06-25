'use client';

import React from 'react';

/** State of the thinking block. */
export type ThinkingBlockState = 'thinking' | 'done' | 'error';

/** Props for the {@link ThinkingBlock} component. */
export interface ThinkingBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current thinking state. */
  state?: ThinkingBlockState;
  /** Label text displayed in the header. */
  label?: string;
  /** Metadata string (e.g. duration) displayed to the right. */
  meta?: string;
  /** Whether the block is expanded. When undefined, defaults to `true` during thinking. */
  expanded?: boolean;
  /** Default expanded state (uncontrolled). */
  defaultExpanded?: boolean;
  /** Called when the expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Additional CSS class names. */
  className?: string;
  /** Thinking content displayed when expanded. */
  children?: React.ReactNode;
}

/**
 * AI extended thinking block with pulse animation and expand/collapse.
 * Auto-expands while `state` is `"thinking"` and collapses when `"done"`.
 */
export const ThinkingBlock = React.forwardRef<HTMLDivElement, ThinkingBlockProps>(
  (
    {
      state = 'thinking',
      label = 'Thinking...',
      meta,
      expanded: controlledExpanded,
      defaultExpanded,
      onExpandedChange,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState(defaultExpanded ?? state === 'thinking');
    const isExpanded = controlledExpanded ?? internal;

    // Auto-expand/collapse based on state changes
    React.useEffect(() => {
      if (controlledExpanded !== undefined) return;
      if (state === 'thinking') setInternal(true);
      else if (state === 'done') setInternal(false);
    }, [state, controlledExpanded]);

    const toggle = React.useCallback(() => {
      const next = !isExpanded;
      if (controlledExpanded === undefined) setInternal(next);
      onExpandedChange?.(next);
    }, [isExpanded, controlledExpanded, onExpandedChange]);

    return (
      <div
        ref={ref}
        className={`sk-thinking-block${className ? ` ${className}` : ''}`}
        data-state={state}
        data-expanded={isExpanded ? 'true' : 'false'}
        aria-busy={state === 'thinking' ? true : undefined}
        {...rest}
      >
        <button className="sk-thinking-block__header" onClick={toggle} aria-expanded={isExpanded}>
          <span className="sk-thinking-block__dot" />
          <span className="sk-thinking-block__label">{label}</span>
          {meta && <span className="sk-thinking-block__meta">{meta}</span>}
          <i className="sk-thinking-block__chevron">{'\u25B8'}</i>
        </button>
        {isExpanded && children && (
          <div className="sk-thinking-block__content">{children}</div>
        )}
      </div>
    );
  },
);

ThinkingBlock.displayName = 'ThinkingBlock';
