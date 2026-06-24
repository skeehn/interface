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
  /** Called when the user submits (Enter without Shift). */
  onSubmit?: (value: string) => void;
  /** Hint text displayed below the input. */
  hint?: string;
  /** Whether the textarea is disabled. */
  disabled?: boolean;
  /** Additional CSS class names. */
  className?: string;
  /** Extra action elements (e.g. mic button) rendered in the actions area. */
  actions?: React.ReactNode;
}

/**
 * AI prompt input with auto-resize textarea and action buttons.
 * Handles Enter-to-submit and Shift+Enter for newlines.
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

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const v = e.target.value;
        if (value === undefined) setInternal(v);
        onValueChange?.(v);
      },
      [value, onValueChange],
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && onSubmit) {
          e.preventDefault();
          onSubmit(text);
          if (value === undefined) setInternal('');
        }
      },
      [text, onSubmit, value],
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
            disabled={disabled || state === 'streaming'}
            rows={1}
          />
          {actions && <div className="sk-chat-input__actions">{actions}</div>}
        </div>
        {hint && <div className="sk-chat-input__hint">{hint}</div>}
      </div>
    );
  },
);

ChatInput.displayName = 'ChatInput';
