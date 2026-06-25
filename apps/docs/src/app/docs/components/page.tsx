import Link from 'next/link';
import { getComponentsByCategory, getCategoryLabel } from '@/lib/registry';

export const metadata = {
  title: 'Components | skeehn',
  description: 'Browse all 32 ASCII/dither components for building AI interfaces.',
};

const CATEGORY_ORDER = ['core', 'ai', 'layout', 'dataviz', 'motion'];

const CATEGORY_COLORS: Record<string, string> = {
  core: 'text-muted-fg border-border',
  ai: 'text-accent border-accent/30 bg-accent/5',
  layout: 'text-muted-fg border-border',
  dataviz: 'text-muted-fg border-border',
  motion: 'text-muted-fg border-border',
};

export default function ComponentsIndexPage() {
  const grouped = getComponentsByCategory();

  return (
    <div className="space-y-14">
      <div>
        <h1 className="docs-heading text-4xl text-foreground mb-4">Components</h1>
        <p className="text-lg text-muted-fg leading-relaxed max-w-xl">
          32 components for AI interfaces. Every one ships as plain CSS with an optional React wrapper.
        </p>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const components = grouped[cat];
        if (!components?.length) return null;

        return (
          <section key={cat}>
            <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2.5 uppercase tracking-wide">
              {getCategoryLabel(cat)}
              <span className="text-xs font-normal text-muted-fg normal-case tracking-normal">
                {components.length}
              </span>
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {components.map((c) => (
                <Link
                  key={c.name}
                  href={`/docs/components/${c.name}`}
                  className="group rounded-xl border border-border bg-surface p-5 hover:border-foreground/20 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-semibold text-base text-foreground block">
                        {c.name}
                      </span>
                      <span className="text-sm text-muted-fg mt-1.5 block leading-relaxed">
                        {c.description}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border rounded-full shrink-0 mt-0.5 ${CATEGORY_COLORS[c.category] ?? 'text-muted-fg border-border'}`}
                    >
                      {getCategoryLabel(c.category)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
