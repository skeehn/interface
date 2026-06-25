import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Get started with skeehn — ASCII native AI components. Installation, usage, and API reference.",
};

const CARDS = [
  { href: "/docs/getting-started", n: "01", title: "Getting started", body: "Install via CLI or copy components directly into your project." },
  { href: "/docs/usage", n: "02", title: "Usage", body: "Import components, wire the hooks, and start building." },
  { href: "/docs/components", n: "03", title: "Components", body: "Browse 32 components across core, AI, layout and viz." },
  { href: "/docs/themes", n: "04", title: "Themes", body: "Seven built-in skins — editorial, terminal, brutal and more." },
];

export default function DocsPage() {
  return (
    <div>
      <h1 className="docs-heading text-4xl text-foreground mb-4">Documentation</h1>
      <p className="text-lg text-muted-fg leading-relaxed max-w-xl mb-14">
        skeehn is the open-source component library for building AI interfaces — chat, streaming,
        reasoning, tool calls, agents. Copy components into your project, theme them to your brand,
        and own every line. 32 components, 7 themes, zero runtime dependencies.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-xl border border-border bg-surface p-6 hover:border-foreground/20 hover:bg-muted/50 transition-colors"
          >
            <span className="text-xs font-medium text-accent tracking-wider">{c.n}</span>
            <span className="mt-3 block text-base font-semibold text-foreground">{c.title}</span>
            <span className="mt-1.5 block text-sm text-muted-fg leading-relaxed">{c.body}</span>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="px-6 pt-5 pb-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Quick start</h2>
        </div>
        <div className="px-6 py-5 font-mono text-sm space-y-2">
          <p className="text-foreground"><span className="text-muted-fg select-none mr-2">$</span>npx skeehn init</p>
          <p className="text-foreground"><span className="text-muted-fg select-none mr-2">$</span>npx skeehn add button card chat-bubble</p>
          <p className="text-muted-fg/70 pt-1.5 text-xs"># Components are copied into your project. You own the source.</p>
        </div>
      </div>
    </div>
  );
}
