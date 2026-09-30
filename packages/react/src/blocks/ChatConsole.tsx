'use client';

/**
 * @module @skeehn/react/blocks — ChatConsole
 *
 * A complete, drop-in chat surface: a header (title + optional model picker),
 * an autoscrolling <Conversation> that renders AI SDK messages, an empty-state
 * with prompt suggestions, and a <ChatInput> footer. Wire it to `useChat`:
 *
 * ```tsx
 * const { messages, sendMessage, status } = useChat();
 * <ChatConsole
 *   messages={messages}
 *   busy={status === 'streaming'}
 *   onSend={(text) => sendMessage({ text })}
 *   suggestions={[{ value: 'a', text: 'Summarize this thread' }]}
 * />
 * ```
 */
import * as React from 'react';
import { Conversation } from '../ai/Conversation';
import type { DataUIPart, PartContext, SkeehnPartOverrides, UIMessage } from '../ai/types';
import { Button } from '../components/Button';
import { ChatInput } from '../components/ChatInput';
import { ModelPicker, type ModelOption } from '../components/ModelPicker';
import { PromptSuggestions, type PromptSuggestionItem } from '../components/PromptSuggestions';

export interface ChatConsoleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  /** Conversation messages (AI SDK v5 UIMessage[]). */
  messages: ReadonlyArray<UIMessage>;
  /** Called with the submitted text. */
  onSend: (text: string) => void;
  /** Header title. @defaultValue "Chat" */
  title?: string;
  /** Input placeholder. */
  placeholder?: string;
  /** While streaming: input shows the streaming state and disables send. */
  busy?: boolean;
  /** Status caption under the header (e.g. "thinking", "streaming", "3 tools used"). */
  statusLabel?: string;
  /** Rendered when `error` is set; pairs with `onRetry`. */
  error?: string | null;
  /** Re-run the failed turn. */
  onRetry?: () => void;
  /** Dismiss the error banner. */
  onDismissError?: () => void;
  /** Abort the in-flight stream (renders a stop control while `busy`). */
  onStop?: () => void;
  /** Show a model picker in the header. */
  models?: ReadonlyArray<ModelOption | string>;
  /** Selected model id. */
  model?: string;
  /** Called when the model changes. */
  onModelChange?: (id: string) => void;
  /** Prompt suggestions shown when there are no messages yet. */
  suggestions?: PromptSuggestionItem[];
  /** Per-part render overrides, forwarded to <Conversation>. */
  components?: SkeehnPartOverrides;
  /** Transform text/reasoning (e.g. a markdown renderer). */
  renderMarkdown?: (text: string) => React.ReactNode;
  /** Render a custom `data-*` part. */
  renderData?: (part: DataUIPart, ctx: PartContext) => React.ReactNode;
}

/** A full chat console: header · conversation · input. */
export const ChatConsole = React.forwardRef<HTMLDivElement, ChatConsoleProps>(function ChatConsole(
  {
    messages,
    onSend,
    title = 'Chat',
    placeholder = 'Message…',
    busy,
    statusLabel,
    error,
    onRetry,
    onDismissError,
    onStop,
    models,
    model,
    onModelChange,
    suggestions,
    components,
    renderMarkdown,
    renderData,
    className,
    ...rest
  },
  ref,
) {
  const [input, setInput] = React.useState('');
  const empty = messages.length === 0;

  const submit = React.useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      onSend(trimmed);
      setInput('');
    },
    [onSend, busy],
  );

  return (
    <div ref={ref} className={`sk-chat-console${className ? ` ${className}` : ''}`} {...rest}>
      <header className="sk-chat-console__header">
        <span className="sk-chat-console__title">{title}</span>
        {models && models.length > 0 && (
          <ModelPicker models={models} value={model} onChange={onModelChange} />
        )}
      </header>

      {statusLabel && (
        <div className="sk-chat-console__status" role="status">{statusLabel}</div>
      )}

      <div className="sk-chat-console__body">
        {empty && suggestions && suggestions.length > 0 ? (
          <div className="sk-chat-console__empty">
            <PromptSuggestions
              suggestions={suggestions}
              onSelect={(v) => submit(suggestions.find((s) => s.value === v)?.text ?? v)}
            />
          </div>
        ) : (
          <Conversation
            messages={messages}
            components={components}
            renderMarkdown={renderMarkdown}
            renderData={renderData}
          />
        )}
      </div>

      {error && (
        <div className="sk-chat-console__error" role="alert">
          <span className="sk-chat-console__error-text">{error}</span>
          <div className="sk-chat-console__error-actions">
            {onRetry && (
              <Button data-variant="outline" data-size="sm" onClick={onRetry}>
                Retry
              </Button>
            )}
            {onDismissError && (
              <Button data-variant="ghost" data-size="sm" onClick={onDismissError}>
                Dismiss
              </Button>
            )}
          </div>
        </div>
      )}

      <footer className="sk-chat-console__footer">
        <ChatInput
          value={input}
          onValueChange={setInput}
          onSubmit={submit}
          placeholder={placeholder}
          state={busy ? 'streaming' : undefined}
          disabled={busy}
        />
        {onStop && busy && (
          <div className="sk-chat-console__error-actions" style={{ paddingTop: 'var(--sk-space-2)' }}>
            <Button data-variant="outline" data-size="sm" onClick={onStop}>
              ■ Stop
            </Button>
          </div>
        )}
      </footer>
    </div>
  );
});
