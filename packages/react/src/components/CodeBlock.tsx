import React from 'react';

/** Props for the {@link CodeBlock} component. */
export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Code string to display. */
  code: string;
  /** Programming language label. */
  language?: string;
  /** Whether to show line numbers. */
  lineNumbers?: boolean;
  /** Called when the copy button is clicked. Receives the code string. */
  onCopy?: (code: string) => void;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Code display with copy button and optional line numbers.
 * Renders a `<div>` with `sk-code-block`, a header with language label and copy button,
 * and a body with a `<pre><code>` block.
 */
export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ code, language, lineNumbers, onCopy, className, ...rest }, ref) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = React.useCallback(() => {
      if (onCopy) {
        onCopy(code);
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(code).catch(() => {});
      }
      setCopied(true);
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }, [code, onCopy]);

    const lines = lineNumbers ? code.split('\n') : null;

    return (
      <div
        ref={ref}
        className={`sk-code-block${className ? ` ${className}` : ''}`}
        data-line-numbers={lineNumbers ? '' : undefined}
        {...rest}
      >
        <div className="sk-code-block__header">
          {language && <span className="sk-code-block__lang">{language}</span>}
          <button
            className="sk-code-block__copy"
            data-copied={copied ? 'true' : undefined}
            onClick={handleCopy}
          >
            {copied ? 'copied' : 'copy'}
          </button>
        </div>
        <div className="sk-code-block__body">
          {lines && (
            <div className="sk-code-block__lines">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      </div>
    );
  },
);

CodeBlock.displayName = 'CodeBlock';
