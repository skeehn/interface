import * as React from 'react';
import { CitationCard } from './CitationCard';

export interface SourceItem {
  /** Source title / name. */
  source: string;
  /** URL of the source. */
  href?: string;
  /** Snippet / excerpt. */
  snippet?: string;
  /** Metadata strings (date, page, etc.). */
  meta?: string[];
}

export interface SourcesProps extends Omit<React.HTMLAttributes<HTMLDetailsElement>, 'children'> {
  /** Sources to list. Omit and pass `children` (CitationCards) to compose manually. */
  sources?: SourceItem[];
  /** Summary label. @defaultValue "Sources" */
  label?: string;
  /** Start expanded. @defaultValue false */
  defaultOpen?: boolean;
  /** Manually-composed source list. */
  children?: React.ReactNode;
}

/**
 * A collapsible list of citations for a grounded answer. Wraps `CitationCard`
 * and works with zero JS (native `<details>`). Pass `sources`, or compose
 * `CitationCard` children directly.
 */
export const Sources = React.forwardRef<HTMLDetailsElement, SourcesProps>(function Sources(
  { sources, label = 'Sources', defaultOpen = false, children, className, ...rest },
  ref,
) {
  const count = sources?.length ?? React.Children.count(children);
  return (
    <details
      ref={ref}
      className={`sk-sources${className ? ` ${className}` : ''}`}
      open={defaultOpen}
      {...rest}
    >
      <summary className="sk-sources__summary">
        <span className="sk-sources__label">{label}</span>
        {count > 0 && <span className="sk-sources__count">{count}</span>}
      </summary>
      <div className="sk-sources__list">
        {sources
          ? sources.map((s, i) => (
              <CitationCard
                key={i}
                index={i + 1}
                variant="compact"
                source={s.source}
                href={s.href}
                snippet={s.snippet}
                meta={s.meta}
              />
            ))
          : children}
      </div>
    </details>
  );
});
