'use client';

import * as React from 'react';

export interface MessageActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Message text; when set, a Copy button appears and copies it to the clipboard. */
  content?: string;
  /** Regenerate this response. */
  onRegenerate?: () => void;
  /** Edit this message. */
  onEdit?: () => void;
  /** Positive feedback. */
  onLike?: () => void;
  /** Negative feedback. */
  onDislike?: () => void;
  /** Extra custom actions, rendered after the built-ins. */
  children?: React.ReactNode;
}

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  glyph: string;
}

function ActionButton({ label, glyph, ...rest }: ActionButtonProps) {
  return (
    <button type="button" className="sk-msg-actions__btn" aria-label={label} title={label} {...rest}>
      <span aria-hidden="true">{glyph}</span>
    </button>
  );
}

/**
 * A hover/inline action bar for a chat message — copy, regenerate, edit, and
 * thumbs feedback. Each action only renders when you wire its handler (Copy
 * needs `content`). Drop custom actions in via `children`.
 */
export const MessageActions = React.forwardRef<HTMLDivElement, MessageActionsProps>(
  function MessageActions(
    { content, onRegenerate, onEdit, onLike, onDislike, children, className, ...rest },
    ref,
  ) {
    const [copied, setCopied] = React.useState(false);

    const copy = React.useCallback(() => {
      if (content == null) return;
      try {
        void navigator.clipboard?.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        /* clipboard unavailable — no-op */
      }
    }, [content]);

    return (
      <div
        ref={ref}
        className={`sk-msg-actions${className ? ` ${className}` : ''}`}
        role="toolbar"
        aria-label="Message actions"
        {...rest}
      >
        {content != null && (
          <ActionButton label={copied ? 'Copied' : 'Copy'} glyph={copied ? '✓' : '⧉'} onClick={copy} />
        )}
        {onRegenerate && <ActionButton label="Regenerate" glyph="↻" onClick={onRegenerate} />}
        {onEdit && <ActionButton label="Edit" glyph="✎" onClick={onEdit} />}
        {onLike && <ActionButton label="Good response" glyph="▲" onClick={onLike} />}
        {onDislike && <ActionButton label="Bad response" glyph="▼" onClick={onDislike} />}
        {children}
      </div>
    );
  },
);
