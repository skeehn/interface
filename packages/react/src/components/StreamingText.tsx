import React from 'react';

/** Effect applied to streaming text. */
export type StreamingTextEffect = 'scanline' | 'wave' | 'fade';

/** Props for the {@link StreamingText} component. */
export interface StreamingTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show the blinking cursor. */
  cursor?: boolean;
  /** Animation effect applied to the text. */
  effect?: StreamingTextEffect;
  /** Additional CSS class names. */
  className?: string;
  /** Text content to display. */
  children?: React.ReactNode;
}

/**
 * Streaming text animation with optional cursor and effects.
 * Renders a `<div>` with `sk-streaming-text` and data attributes for cursor/effect.
 */
export const StreamingText = React.forwardRef<HTMLDivElement, StreamingTextProps>(
  ({ cursor, effect, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-streaming-text${className ? ` ${className}` : ''}`}
      data-cursor={cursor ? 'true' : undefined}
      data-effect={effect}
      {...rest}
    >
      {children}
    </div>
  ),
);

StreamingText.displayName = 'StreamingText';
