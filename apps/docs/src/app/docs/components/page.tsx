import Link from 'next/link';
import { getComponentsByCategory, getCategoryLabel } from '@/lib/registry';

export const metadata = {
  title: 'Components | skeehn',
  description: 'Browse all 32 ASCII/dither components for building AI interfaces.',
};

const CATEGORY_ORDER = ['core', 'ai', 'layout', 'dataviz', 'motion'];

const CATEGORY_COLORS: Record<string, string> = {
  core: 'bg-primary/10 text-primary border-primary/20',
  ai: 'bg-accent/10 text-accent border-accent/20',
  layout: 'bg-muted/30 text-muted-fg border-muted/40',
  dataviz: 'bg-primary/10 text-primary border-primary/20',
  motion: 'bg-accent/10 text-accent border-accent/20',
};

export default function ComponentsIndexPage() {
  const grouped = getComponentsByCategory();

  return (
    <>
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight mb-3">Components</h1>
        <p className="text-muted-fg text-base">
          32 ASCII/dither components for AI interfaces. Every component ships as plain CSS with optional React wrappers.
        </p>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const components = grouped[cat];
        if (!components?.length) return null;

        return (
          <section key={cat} className="mb-10">
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
              {getCategoryLabel(cat)}
              <span className="text-xs font-normal text-muted-fg">
                ({components.length})
              </span>
            </h2>

            <div className="grid gap-2">
              {components.map((c) => (
                <Link
                  key={c.name}
                  href={`/docs/components/${c.name}`}
                  className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded border border-border hover:border-primary/40 hover:bg-surface/50 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-sm font-medium group-hover:text-primary transition-colors shrink-0">
                      {c.name}
                    </span>
                    <span className="text-sm text-muted-fg truncate hidden sm:inline">
                      {c.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.files.slice(0, 1).map((f) => (
                      <span
                        key={f}
                        className="text-[10px] font-mono text-muted-fg bg-muted/20 px-1.5 py-0.5 rounded hidden sm:inline"
                      >
                        {f}
                      </span>
                    ))}
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[c.category] ?? 'bg-muted/20 text-muted-fg border-muted/30'}`}
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
    </>
  );
}
