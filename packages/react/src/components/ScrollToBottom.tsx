'use client';

import * as React from 'react';

export interface ScrollToBottomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label. @defaultValue "Scroll to latest" */
  label?: string;
}

/**
 * A "jump to latest" affordance for streaming chat containers. Pair with
 * `useStickyScroll` — show it while `atBottom` is `false`, call `scrollToBottom`
 * on click. `<Conversation>` wires this up automatically.
 */
export const ScrollToBottomButton = React.forwardRef<
  HTMLButtonElement,
  ScrollToBottomButtonProps
>(function ScrollToBottomButton({ label = 'Scroll to latest', className, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={`sk-scroll-to-bottom${className ? ` ${className}` : ''}`}
      aria-label={label}
      {...rest}
    >
      <span aria-hidden="true">↓</span>
    </button>
  );
});
