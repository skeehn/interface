import Link from 'next/link';
import { getComponentsByCategory, getCategoryLabel } from '@/lib/registry';

export const metadata = {
  title: 'Components | skeehn',
  description: 'Browse all 32 ASCII/dither components for building AI interfaces.',
};

const CATEGORY_ORDER = ['core', 'ai', 'layout', 'dataviz', 'motion'];

const CATEGORY_COLORS: Record<string, string> = {
  core: 'text-blue-400 border-blue-400/30',
  ai: 'text-violet-400 border-violet-400/30',
  layout: 'text-muted-fg border-border',
  dataviz: 'text-cyan-400 border-cyan-400/30',
  motion: 'text-orange-400 border-orange-400/30',
};

export default function ComponentsIndexPage() {
  const grouped = getComponentsByCategory();

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-mono font-bold tracking-tight mb-3">Components</h1>
        <p className="text-muted-fg text-base leading-relaxed">
          32 ASCII/dither components for AI interfaces. Every component ships as plain CSS with optional React wrappers.
        </p>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const components = grouped[cat];
        if (!components?.length) return null;

        return (
          <section key={cat}>
            <h2 className="text-lg font-mono font-bold mb-4 flex items-center gap-3">
              {getCategoryLabel(cat)}
              <span className="text-xs font-normal text-muted-fg font-mono">
                {components.length}
              </span>
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {components.map((c) => (
                <Link
                  key={c.name}
                  href={`/docs/components/${c.name}`}
                  className="group border border-border bg-surface/30 p-6 hover:bg-muted/50 hover:border-border transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-lg text-foreground group-hover:text-foreground transition-colors block">
                        {c.name}
                      </span>
                      <span className="text-sm text-muted-fg mt-2 block leading-relaxed">
                        {c.description}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border shrink-0 mt-1 ${CATEGORY_COLORS[c.category] ?? 'text-muted-fg border-border'}`}
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
