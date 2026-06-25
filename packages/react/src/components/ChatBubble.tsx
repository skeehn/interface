import React from 'react';

/** Role of the chat message author. */
export type ChatBubbleRole = 'user' | 'assistant' | 'tool' | 'system';

/** Props for the {@link ChatBubble} component. */
export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Message author role. */
  role: ChatBubbleRole;
  /** Whether the message is currently streaming. */
  streaming?: boolean;
  /** Additional CSS class names. */
  className?: string;
  children: React.ReactNode;
}

/**
 * AI message bubble with streaming indicator.
 * Renders a `<div>` with `sk-chat-bubble` and `data-role` / `data-streaming` attributes.
 */
export const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ role, streaming, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-chat-bubble${className ? ` ${className}` : ''}`}
      data-role={role}
      data-streaming={streaming ? 'true' : undefined}
      aria-live={streaming ? 'polite' : undefined}
      aria-busy={streaming ? true : undefined}
      {...rest}
    >
      <div className="sk-chat-bubble__content">{children}</div>
    </div>
  ),
);

ChatBubble.displayName = 'ChatBubble';

/** Convenience alias for ChatBubble. */
export const Message = ChatBubble;
