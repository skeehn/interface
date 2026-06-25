import React from 'react';

/**
 * Props for the {@link Markdown} component.
 *
 * Syntax-highlight token-class contract
 * -------------------------------------
 * `Markdown` is a styling container; it does not tokenize code. A highlighter
 * (server-side, or the `highlight` render prop below) may emit `<span>`s inside
 * fenced code blocks using these classes, each mapped to one semantic token in
 * `markdown.css` so highlighting tracks the active theme:
 *
 *   - `sk-md-tok-keyword`     → accent
 *   - `sk-md-tok-string`      → success
 *   - `sk-md-tok-number`      → info
 *   - `sk-md-tok-comment`     → muted-foreground (italic)
 *   - `sk-md-tok-function`    → foreground (emphasized)
 *   - `sk-md-tok-punctuation` → muted-foreground
 *
 * Wide tables should be wrapped in `<div class="sk-markdown__table-wrap">` so
 * they scroll instead of overflowing.
 */
export interface MarkdownProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS class names. */
  className?: string;
  /** Pre-rendered HTML or React nodes to display with markdown styling. */
  children?: React.ReactNode;
  /**
   * Optional transform applied to `children` before rendering — e.g. a syntax
   * highlighter that emits the `sk-md-tok-*` spans documented above. Opt-in:
   * when omitted, `children` render unchanged. The component still does not
   * parse raw markdown; this only post-processes already-provided content.
   */
  highlight?: (children: React.ReactNode) => React.ReactNode;
}

/**
 * Markdown renderer container for AI chat content.
 * Applies `sk-markdown` typography styles to child content.
 * This component does not parse raw markdown; pass pre-rendered HTML or React elements.
 */
export const Markdown = React.forwardRef<HTMLDivElement, MarkdownProps>(
  ({ className, children, highlight, ...rest }, ref) => (
    <div ref={ref} className={`sk-markdown${className ? ` ${className}` : ''}`} {...rest}>
      {highlight ? highlight(children) : children}
    </div>
  ),
);

Markdown.displayName = 'Markdown';
