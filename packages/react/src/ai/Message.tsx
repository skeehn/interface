/**
 * @module @skeehn/react/ai — Message
 *
 * Renders a single AI SDK v5 `UIMessage` by mapping its `parts[]` onto skeehn
 * components. Drop-in for `@ai-sdk/react`:
 *
 * ```tsx
 * import { useChat } from '@ai-sdk/react';
 * import { Message } from '@skeehn/react/ai';
 *
 * const { messages } = useChat();
 * return messages.map((m) => <Message key={m.id} message={m} />);
 * ```
 */
import * as React from 'react';
import { renderParts } from './renderParts';
import type {
  DataUIPart,
  PartContext,
  SkeehnPartOverrides,
  UIMessage,
} from './types';

export interface MessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** An AI SDK v5 `UIMessage` (or any structurally-compatible message). */
  message: UIMessage;
  /** Per-part-type render overrides. */
  components?: SkeehnPartOverrides;
  /** Transform text/reasoning strings (e.g. a markdown renderer). */
  renderMarkdown?: (text: string) => React.ReactNode;
  /** Render a custom `data-*` part. */
  renderData?: (part: DataUIPart, ctx: PartContext) => React.ReactNode;
}

/** Render one `UIMessage`'s parts as skeehn components. */
export const Message = React.forwardRef<HTMLDivElement, MessageProps>(function Message(
  { message, components, renderMarkdown, renderData, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`sk-ai-message${className ? ` ${className}` : ''}`}
      data-role={message.role}
      {...rest}
    >
      {renderParts(message.parts, { role: message.role, components, renderMarkdown, renderData })}
    </div>
  );
});
