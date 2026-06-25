'use client';

/**
 * @module @skeehn/react/ai — Conversation
 *
 * A scrollable chat transcript with sticky autoscroll + a "jump to latest"
 * button. Pass AI SDK `messages` directly, or compose `<Message>` children.
 *
 * ```tsx
 * import { useChat } from '@ai-sdk/react';
 * import { Conversation } from '@skeehn/react/ai';
 *
 * const { messages } = useChat();
 * return <Conversation messages={messages} />;
 * ```
 */
import * as React from 'react';
import { useStickyScroll } from '../hooks/useStickyScroll';
import { ScrollToBottomButton } from '../components/ScrollToBottom';
import { Message } from './Message';
import type {
  DataUIPart,
  PartContext,
  SkeehnPartOverrides,
  UIMessage,
} from './types';

export interface ConversationProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** AI SDK v5 messages to render. Omit and pass `children` to compose manually. */
  messages?: ReadonlyArray<UIMessage>;
  /** Manually-composed transcript (used when `messages` is omitted). */
  children?: React.ReactNode;
  /** Per-part-type render overrides, forwarded to every `<Message>`. */
  components?: SkeehnPartOverrides;
  /** Transform text/reasoning strings (e.g. a markdown renderer). */
  renderMarkdown?: (text: string) => React.ReactNode;
  /** Render a custom `data-*` part. */
  renderData?: (part: DataUIPart, ctx: PartContext) => React.ReactNode;
  /** Show the "jump to latest" button when scrolled up. @defaultValue true */
  showScrollButton?: boolean;
}

/** Autoscrolling chat transcript that renders AI SDK messages with skeehn. */
export const Conversation = React.forwardRef<HTMLDivElement, ConversationProps>(
  function Conversation(
    {
      messages,
      children,
      components,
      renderMarkdown,
      renderData,
      showScrollButton = true,
      className,
      ...rest
    },
    ref,
  ) {
    // Re-pin to bottom whenever the message list (or its streaming tail) grows.
    const watch = messages ? messages.map((m) => m.parts.length).join(',') + ':' + messages.length : children;
    const { ref: scrollRef, atBottom, scrollToBottom } = useStickyScroll(watch);

    return (
      <div
        ref={ref}
        className={`sk-ai-conversation${className ? ` ${className}` : ''}`}
        {...rest}
      >
        <div ref={scrollRef} className="sk-ai-conversation__scroll">
          {messages
            ? messages.map((m, i) => (
                <Message
                  key={m.id ?? i}
                  message={m}
                  components={components}
                  renderMarkdown={renderMarkdown}
                  renderData={renderData}
                />
              ))
            : children}
        </div>
        {showScrollButton && !atBottom && (
          <ScrollToBottomButton
            className="sk-ai-conversation__jump"
            onClick={() => scrollToBottom()}
          />
        )}
      </div>
    );
  },
);
