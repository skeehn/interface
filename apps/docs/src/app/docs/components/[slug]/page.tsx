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
  core: 'bg-primary/10 text-primary border-primary/20',
  ai: 'bg-accent/10 text-accent border-accent/20',
  layout: 'bg-muted/30 text-muted-fg border-muted/40',
  dataviz: 'bg-primary/10 text-primary border-primary/20',
  motion: 'bg-accent/10 text-accent border-accent/20',
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
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-3">
          {component.name}
        </h1>

        <p className="text-muted-fg text-base mb-4">{component.description}</p>

        <div className="flex gap-2 flex-wrap">
          <span
            className={`text-xs font-mono px-2 py-1 rounded border ${CATEGORY_COLORS[component.category] ?? 'bg-muted/20 text-muted-fg border-muted/30'}`}
          >
            {getCategoryLabel(component.category)}
          </span>
          {component.files.map((f) => (
            <span
              key={f}
              className="text-xs font-mono px-2 py-1 rounded border border-border bg-muted/10 text-muted-fg"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Install */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Installation</h2>
        <div className="flex items-center gap-3 bg-surface/50 border border-border rounded px-4 py-3 font-mono text-sm">
          <span className="text-muted-fg select-none">$</span>
          <code className="flex-1 min-w-0 truncate">{installCmd}</code>
          <CopyButton text={installCmd} />
        </div>
      </section>

      {/* Preview */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Preview</h2>
        <ComponentPreview slug={slug} />
      </section>

      {/* Props */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Props</h2>
        <PropsTable slug={slug} />
      </section>

      {/* Code Example */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-1">Usage</h2>
        <CodeBlock code={codeExample} language="tsx" filename={`${component.name}.tsx`} />
      </section>
    </>
  );
}
