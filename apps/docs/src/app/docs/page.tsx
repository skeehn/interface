import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Get started with skeehn — ASCII native AI components. Installation, usage, and API reference.",
};

export default function DocsPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
        Documentation
      </h1>
      <p className="text-sm text-muted-fg mb-10 leading-relaxed max-w-lg">
        skeehn is an ASCII-native component library for building AI interfaces.
        32 components, 7 themes, zero dependencies. Like shadcn &mdash; you own
        every line.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border mb-12">
        <Link
          href="/docs/installation"
          className="flex flex-col p-6 bg-background hover:bg-accent/30 transition-colors group"
        >
          <span className="text-xs text-muted-fg uppercase tracking-widest mb-2">
            01
          </span>
          <span className="text-sm font-medium text-foreground group-hover:underline">
            Installation
          </span>
          <span className="text-xs text-muted-fg mt-1">
            Install via CLI or copy components directly
          </span>
        </Link>

        <Link
          href="/docs/usage"
          className="flex flex-col p-6 bg-background hover:bg-accent/30 transition-colors group"
        >
          <span className="text-xs text-muted-fg uppercase tracking-widest mb-2">
            02
          </span>
          <span className="text-sm font-medium text-foreground group-hover:underline">
            Usage
          </span>
          <span className="text-xs text-muted-fg mt-1">
            Import components and start building
          </span>
        </Link>

        <Link
          href="/docs/components/button"
          className="flex flex-col p-6 bg-background hover:bg-accent/30 transition-colors group"
        >
          <span className="text-xs text-muted-fg uppercase tracking-widest mb-2">
            03
          </span>
          <span className="text-sm font-medium text-foreground group-hover:underline">
            Components
          </span>
          <span className="text-xs text-muted-fg mt-1">
            Browse 32 components across core and AI
          </span>
        </Link>

        <Link
          href="/docs/themes"
          className="flex flex-col p-6 bg-background hover:bg-accent/30 transition-colors group"
        >
          <span className="text-xs text-muted-fg uppercase tracking-widest mb-2">
            04
          </span>
          <span className="text-sm font-medium text-foreground group-hover:underline">
            Themes
          </span>
          <span className="text-xs text-muted-fg mt-1">
            7 themes including terminal, brutal, and grain
          </span>
        </Link>
      </div>

      <div className="border border-border p-6 bg-surface">
        <h2 className="text-sm font-medium text-foreground mb-3">
          Quick start
        </h2>
        <div className="font-mono text-xs text-muted-fg space-y-1">
          <p>
            <span className="text-foreground">$</span> npx skeehn init
          </p>
          <p>
            <span className="text-foreground">$</span> npx skeehn add button
            card chat-bubble
          </p>
          <p className="text-muted-fg/50 pt-2">
            # Components are copied to your project. You own the source.
          </p>
        </div>
      </div>
    </div>
  );
}
