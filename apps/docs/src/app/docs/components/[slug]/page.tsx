import { notFound } from 'next/navigation';
import { getComponent, getAllSlugs, getCategoryLabel } from '@/lib/registry';
import { getCodeExample } from '@/lib/code-examples';
import { PropsTable } from '@/components/docs/PropsTable';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CopyButton } from '@/components/docs/CopyButton';
import { CodeBlock } from '@/components/docs/CodeBlock';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const component = getComponent(slug);
  if (!component) return { title: 'Not Found' };
  return {
    title: `${component.name} | skeehn`,
    description: component.description,
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  core: 'text-muted-fg border-border',
  ai: 'text-accent border-accent/30 bg-accent/5',
  layout: 'text-muted-fg border-border',
  dataviz: 'text-muted-fg border-border',
  motion: 'text-muted-fg border-border',
};

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const component = getComponent(slug);

  if (!component) {
    notFound();
  }

  const installCmd = `npx skeehn add ${component.name}`;
  const codeExample = getCodeExample(slug);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="docs-heading text-4xl tracking-tight mb-3">
          {component.name}
        </h1>

        <p className="text-lg text-muted-fg leading-relaxed mb-5">
          {component.description}
        </p>

        <div className="flex gap-2 flex-wrap">
          <span
            className={`px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider border rounded-full ${CATEGORY_COLORS[component.category] ?? 'text-muted-fg border-border'}`}
          >
            {getCategoryLabel(component.category)}
          </span>
          {component.files.map((f) => (
            <span
              key={f}
              className="px-2.5 py-0.5 text-[11px] font-mono text-muted-fg border border-border rounded-full"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Install */}
      <section>
        <h2 className="docs-heading text-2xl mb-6">Installation</h2>
        <div className="bg-surface border border-border rounded-xl px-5 py-4 font-mono text-sm flex justify-between items-center">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-muted-fg select-none">$</span>
            <code className="text-foreground truncate">{installCmd}</code>
          </div>
          <CopyButton text={installCmd} />
        </div>
      </section>

      {/* Preview */}
      <section>
        <h2 className="docs-heading text-2xl mb-6">Preview</h2>
        <ComponentPreview slug={slug} />
      </section>

      {/* Props */}
      <section>
        <h2 className="docs-heading text-2xl mb-6">Props</h2>
        <PropsTable slug={slug} />
      </section>

      {/* Code Example */}
      <section>
        <h2 className="docs-heading text-2xl mb-6">Usage</h2>
        <CodeBlock code={codeExample} language="tsx" filename={`${component.name}.tsx`} />
      </section>
    </div>
  );
}
