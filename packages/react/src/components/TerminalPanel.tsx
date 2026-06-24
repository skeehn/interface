'use client';

import React from 'react';

/** Theme for the TerminalPanel. */
export type TerminalPanelTheme = 'terminal' | 'brutal';

/** Props for the {@link TerminalPanel} component. */
export interface TerminalPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Title displayed in the panel header. */
  title?: string;
  /** Theme variant. */
  theme?: TerminalPanelTheme;
  /** Whether to show the traffic-light action buttons. */
  showActions?: boolean;
  /** Called when the close action is clicked. */
  onClose?: () => void;
  /** Called when the minimize action is clicked. */
  onMinimize?: () => void;
  /** Called when the maximize action is clicked. */
  onMaximize?: () => void;
  /** Additional CSS class names. */
  className?: string;
  /** Terminal body content. */
  children?: React.ReactNode;
}

/**
 * Code execution terminal panel with ASCII borders.
 * Renders header with traffic-light buttons and a body with scanline overlay.
 */
export const TerminalPanel = React.forwardRef<HTMLDivElement, TerminalPanelProps>(
  (
    { title = 'terminal', theme, showActions = true, onClose, onMinimize, onMaximize, className, children, ...rest },
    ref,
  ) => (
    <div
      ref={ref}
      className={`sk-terminal-panel${className ? ` ${className}` : ''}`}
      data-theme={theme}
      {...rest}
    >
      <div className="sk-terminal-panel__header">
        <span className="sk-terminal-panel__title">{title}</span>
        {showActions && (
          <div className="sk-terminal-panel__actions">
            <button
              className="sk-terminal-panel__action sk-terminal-panel__action--close"
              aria-label="Close"
              onClick={onClose}
            />
            <button
              className="sk-terminal-panel__action sk-terminal-panel__action--minimize"
              aria-label="Minimize"
              onClick={onMinimize}
            />
            <button
              className="sk-terminal-panel__action sk-terminal-panel__action--maximize"
              aria-label="Maximize"
              onClick={onMaximize}
            />
          </div>
        )}
      </div>
      <div className="sk-terminal-panel__body">{children}</div>
    </div>
  ),
);

TerminalPanel.displayName = 'TerminalPanel';
