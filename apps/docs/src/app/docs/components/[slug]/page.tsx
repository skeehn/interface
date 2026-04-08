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
  core: 'text-blue-400 border-blue-400/30',
  ai: 'text-violet-400 border-violet-400/30',
  layout: 'text-neutral-400 border-neutral-600',
  dataviz: 'text-cyan-400 border-cyan-400/30',
  motion: 'text-orange-400 border-orange-400/30',
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
        <h1 className="text-3xl font-mono font-bold tracking-tight mb-3">
          {component.name}
        </h1>

        <p className="text-neutral-400 text-base leading-relaxed mb-5">
          {component.description}
        </p>

        <div className="flex gap-2 flex-wrap">
          <span
            className={`px-2 py-0.5 text-xs font-mono uppercase tracking-wider border ${CATEGORY_COLORS[component.category] ?? 'text-neutral-400 border-neutral-600'}`}
          >
            {getCategoryLabel(component.category)}
          </span>
          {component.files.map((f) => (
            <span
              key={f}
              className="px-2 py-0.5 text-xs font-mono text-neutral-500 border border-neutral-800"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Install */}
      <section>
        <h2 className="text-2xl font-mono font-bold mb-6">Installation</h2>
        <div className="bg-neutral-900 border border-neutral-800 p-4 font-mono text-sm flex justify-between items-center">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-neutral-600 select-none">$</span>
            <code className="text-neutral-200 truncate">{installCmd}</code>
          </div>
          <CopyButton text={installCmd} />
        </div>
      </section>

      {/* Preview */}
      <section>
        <h2 className="text-2xl font-mono font-bold mb-6">Preview</h2>
        <ComponentPreview slug={slug} />
      </section>

      {/* Props */}
      <section>
        <h2 className="text-2xl font-mono font-bold mb-6">Props</h2>
        <PropsTable slug={slug} />
      </section>

      {/* Code Example */}
      <section>
        <h2 className="text-2xl font-mono font-bold mb-6">Usage</h2>
        <CodeBlock code={codeExample} language="tsx" filename={`${component.name}.tsx`} />
      </section>
    </div>
  );
}
