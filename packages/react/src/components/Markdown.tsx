import React from 'react';

/** Props for the {@link Markdown} component. */
export interface MarkdownProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS class names. */
  className?: string;
  /** Pre-rendered HTML or React nodes to display with markdown styling. */
  children?: React.ReactNode;
}

/**
 * Markdown renderer container for AI chat content.
 * Applies `sk-markdown` typography styles to child content.
 * This component does not parse raw markdown; pass pre-rendered HTML or React elements.
 */
export const Markdown = React.forwardRef<HTMLDivElement, MarkdownProps>(
  ({ className, children, ...rest }, ref) => (
    <div ref={ref} className={`sk-markdown${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </div>
  ),
);

Markdown.displayName = 'Markdown';
