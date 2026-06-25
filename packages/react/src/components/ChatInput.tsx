'use client';

import React from 'react';

/** Input state for the ChatInput. */
export type ChatInputState = 'streaming' | 'recording';

/** Visual variant for the ChatInput. */
export type ChatInputVariant = 'compact';

/** Props for the {@link ChatInput} component. */
export interface ChatInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  /** Current state of the input. */
  state?: ChatInputState;
  /** Visual variant. */
  variant?: ChatInputVariant;
  /** Placeholder text for the textarea. */
  placeholder?: string;
  /** Controlled value of the textarea. */
  value?: string;
  /** Called when the textarea value changes. */
  onValueChange?: (value: string) => void;
  /** Called when the user submits (Enter without Shift, or the send button). */
  onSubmit?: (value: string) => void;
  /** Render a built-in mic button; called when it is toggled. */
  onMicToggle?: () => void;
  /** Show the built-in send button (only renders when `onSubmit` is set). Defaults to true. */
  showSend?: boolean;
  /** Soft character limit — shows a live count that turns destructive when exceeded. */
  maxLength?: number;
  /** Hint text displayed below the input. */
  hint?: string;
  /** Whether the textarea is disabled. */
  disabled?: boolean;
  /** Additional CSS class names. */
  className?: string;
  /** Extra action elements rendered before the send button. */
  actions?: React.ReactNode;
}

/**
 * AI prompt input with auto-resize textarea, built-in send/mic buttons, and an
 * optional character count. Handles Enter-to-submit and Shift+Enter for newlines.
 */
export const ChatInput = React.forwardRef<HTMLDivElement, ChatInputProps>(
  (
    {
      state,
      variant,
      placeholder = 'Type a message...',
      value,
      onValueChange,
      onSubmit,
      onMicToggle,
      showSend = true,
      maxLength,
      hint,
      disabled,
      actions,
      className,
      ...rest
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState('');
    const text = value ?? internal;
    const recording = state === 'recording';
    const locked = disabled || state === 'streaming';
    const canSend = text.trim().length > 0 && !locked;
    const overLimit = maxLength !== undefined && text.length > maxLength;

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const v = e.target.value;
        if (value === undefined) setInternal(v);
        onValueChange?.(v);
      },
      [value, onValueChange],
    );

    const submit = React.useCallback(() => {
      if (!text.trim() || locked) return;
      onSubmit?.(text);
      if (value === undefined) setInternal('');
    }, [text, locked, onSubmit, value]);

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          submit();
        }
      },
      [submit],
    );

    return (
      <div
        ref={ref}
        className={`sk-chat-input${className ? ` ${className}` : ''}`}
        data-state={state}
        data-variant={variant}
        {...rest}
      >
        <div className="sk-chat-input__wrapper">
          <textarea
            className="sk-chat-input__field"
            placeholder={placeholder}
            aria-label={placeholder}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={locked}
            rows={1}
          />
          <div className="sk-chat-input__actions">
            {onMicToggle && (
              <button
                type="button"
                className="sk-chat-input__mic"
                data-mic-state={recording ? 'recording' : undefined}
                aria-label={recording ? 'Stop recording' : 'Start voice input'}
                aria-pressed={recording}
                onClick={onMicToggle}
              >
                {'◎'}
              </button>
            )}
            {actions}
            {showSend && onSubmit && (
              <button
                type="button"
                className="sk-chat-input__send"
                aria-label="Send message"
                disabled={!canSend}
                onClick={submit}
              >
                {'↑'}
              </button>
            )}
          </div>
        </div>
        {(hint || maxLength !== undefined) && (
          <div className="sk-chat-input__footer">
            {hint && <span className="sk-chat-input__hint">{hint}</span>}
            {maxLength !== undefined && (
              <span
                className="sk-chat-input__char-count"
                data-over-limit={overLimit ? '' : undefined}
              >
                {text.length}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

ChatInput.displayName = 'ChatInput';
