import React from 'react';

/** Effect applied to streaming text. */
export type StreamingTextEffect = 'scanline' | 'wave' | 'fade';

/** Terminal-style caret shape rendered at the stream tail. */
export type StreamingTextCaret = 'block' | 'line';

/** Props for the {@link StreamingText} component. */
export interface StreamingTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Terminal-style blinking caret at the stream tail. `'block'` renders █,
   * `'line'` renders a thin ▏. Omit or `false` to hide. Pair with
   * `usePacedText`'s `isCatchingUp` so the caret shows only while text arrives.
   */
  caret?: StreamingTextCaret | false;
  /** @deprecated Use {@link StreamingTextProps.caret} instead. `true` ≈ `caret="block"`. */
  cursor?: boolean;
  /** Animation effect applied to the text. */
  effect?: StreamingTextEffect;
  /** Additional CSS class names. */
  className?: string;
  /** Text content to display. */
  children?: React.ReactNode;
}

/**
 * Streaming text container with a terminal-style block caret and optional
 * effects. Designed to render text whose reveal is already paced upstream
 * (e.g. via `usePacedText`) — it does not fade individual tokens, avoiding the
 * per-token opacity flicker that reads as cheap.
 *
 * Renders a `<div class="sk-streaming-text">` with `data-caret` / `data-effect`.
 */
export const StreamingText = React.forwardRef<HTMLDivElement, StreamingTextProps>(
  ({ caret, cursor, effect, className, children, ...rest }, ref) => {
    const resolvedCaret = caret === false ? undefined : caret ?? (cursor ? 'block' : undefined);
    return (
      <div
        ref={ref}
        className={`sk-streaming-text${className ? ` ${className}` : ''}`}
        data-caret={resolvedCaret}
        data-effect={effect}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

StreamingText.displayName = 'StreamingText';
