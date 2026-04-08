import React from 'react';

/** Visual variant for the CitationCard. */
export type CitationCardVariant = 'compact' | 'inline';

/** Props for the {@link CitationCard} component. */
export interface CitationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Citation index number displayed in the icon badge. */
  index?: number;
  /** Source name / title. */
  source: string;
  /** Snippet / excerpt from the source. */
  snippet?: string;
  /** URL of the source. */
  href?: string;
  /** Metadata strings (e.g. date, page number). */
  meta?: string[];
  /** Visual variant. */
  variant?: CitationCardVariant;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Source reference card with ASCII metadata display.
 * Renders a `<div>` (or `<a>` when `href` is provided) with `sk-citation-card`.
 */
export const CitationCard = React.forwardRef<HTMLDivElement, CitationCardProps>(
  ({ index, source, snippet, href, meta, variant, className, ...rest }, ref) => {
    const Tag = href ? 'a' : 'div';
    const linkProps = href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {};
    return (
      <Tag
        ref={ref as React.Ref<HTMLDivElement & HTMLAnchorElement>}
        className={`sk-citation-card${className ? ` ${className}` : ''}`}
        data-variant={variant}
        {...linkProps}
        {...(rest as React.HTMLAttributes<HTMLElement>)}
      >
        <span className="sk-citation-card__icon">{index ?? '#'}</span>
        <div className="sk-citation-card__content">
          <span className="sk-citation-card__source">{source}</span>
          {snippet && <p className="sk-citation-card__snippet">{snippet}</p>}
          {meta && meta.length > 0 && (
            <div className="sk-citation-card__meta">
              {meta.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          )}
        </div>
      </Tag>
    );
  },
);

CitationCard.displayName = 'CitationCard';
