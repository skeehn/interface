import React from 'react';

/** Visual variant for the TypingIndicator. */
export type TypingIndicatorVariant = 'ascii' | 'dither';

/** Size preset for the TypingIndicator. */
export type TypingIndicatorSize = 'compact';

/** Props for the {@link TypingIndicator} component. */
export interface TypingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant. */
  variant?: TypingIndicatorVariant;
  /** Size preset. */
  size?: TypingIndicatorSize;
  /** Optional text label (e.g. "typing..."). */
  text?: string;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Animated typing/thinking indicator for AI chat interfaces.
 * Renders three bouncing dots (or ASCII block characters in the `ascii` variant).
 */
export const TypingIndicator = React.forwardRef<HTMLDivElement, TypingIndicatorProps>(
  ({ variant, size, text, className, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-typing-indicator${className ? ` ${className}` : ''}`}
      data-variant={variant}
      data-size={size}
      {...rest}
    >
      <span className="sk-typing-indicator__dots">
        <span className="sk-typing-indicator__dot" />
        <span className="sk-typing-indicator__dot" />
        <span className="sk-typing-indicator__dot" />
      </span>
      {text && <span className="sk-typing-indicator__text">{text}</span>}
    </div>
  ),
);

TypingIndicator.displayName = 'TypingIndicator';
