import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@skeehn/react";

export const metadata: Metadata = {
  title: "Installation",
  description:
    "Install skeehn three ways: the npm packages, copy-paste via the shadcn registry, or the skeehn CLI. Then import the CSS and pick a theme.",
};

const NPM = `# Components, hooks, the AI SDK layer, and blocks
npm i @skeehn/react

# Optional: the framework-agnostic CSS + dither engine
npm i @skeehn/core`;

const CSS = `// app/layout.tsx (or your global entry) — once, anywhere above your UI
import "@skeehn/core/styles.css";`;

const THEME = `// Set a theme on <html> (or any parent). Neutral light is the default.
<html data-theme="light">   {/* dark · default · terminal · brutal · grain · print · mardi-gras */}`;

const REGISTRY = `# Copy-paste ownership — works in any project with shadcn installed
npx shadcn@latest add https://ui.skeehn.com/r/button.json
npx shadcn@latest add https://ui.skeehn.com/r/chat-bubble.json
# every component lives at https://ui.skeehn.com/r/<name>.json`;

const CLI = `# Or the skeehn CLI — fetches inline content from the live registry
npx skeehn add chat-bubble
npx skeehn add all`;

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <p className="docs-label mb-2">{label}</p>
      <h2 className="docs-heading text-xl sm:text-2xl tracking-tight mb-3">{title}</h2>
      <div className="text-[0.95rem] text-muted-fg leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function InstallationPage() {
  return (
    <div className="max-w-3xl">
      <p className="docs-label mb-3">Getting started</p>
      <h1 className="docs-heading text-3xl sm:text-4xl tracking-tight mb-4">Installation</h1>
      <p className="text-lg text-muted-fg leading-relaxed mb-10">
        skeehn is React-first but CSS-driven. Install the package, import the stylesheet once, and set a
        theme. Prefer to own the source? Pull components in via the shadcn registry or the CLI instead.
      </p>

      <Section label="Recommended" title="npm">
        <div data-theme="default"><CodeBlock language="bash" code={NPM} /></div>
        <p>Peer deps: React 18+. For the AI SDK drop-in also add <code className="sk-code-inline">ai</code> and <code className="sk-code-inline">@ai-sdk/react</code>.</p>
      </Section>

      <Section label="Once" title="Import the CSS">
        <div data-theme="default"><CodeBlock language="tsx" code={CSS} /></div>
        <p>
          <code className="sk-code-inline">@skeehn/core/styles.css</code> is batteries-included (engine + all
          components + all themes). Need finer control? Import <code className="sk-code-inline">@skeehn/core/css</code>{" "}
          (engine only) plus individual <code className="sk-code-inline">@skeehn/core/components/*</code>.
        </p>
      </Section>

      <Section label="Pick a look" title="Set a theme">
        <div data-theme="default"><CodeBlock language="tsx" code={THEME} /></div>
        <p>
          Or generate one from your brand color with the{" "}
          <Link className="text-accent hover:underline" href="/docs/theme-generator">theme generator</Link>.
        </p>
      </Section>

      <Section label="Alternative" title="Own the source — registry or CLI">
        <div data-theme="default"><CodeBlock language="bash" code={REGISTRY} /></div>
        <div className="mt-3" data-theme="default"><CodeBlock language="bash" code={CLI} /></div>
        <p>See the <Link className="text-accent hover:underline" href="/docs/cli">CLI reference</Link> for all commands.</p>
      </Section>

      <p className="text-sm text-muted-fg mt-10 pt-6 border-t border-border">
        Next: <Link className="text-accent hover:underline" href="/docs/usage">Usage</Link> ·{" "}
        <Link className="text-accent hover:underline" href="/docs/ai-sdk">AI SDK drop-in</Link> ·{" "}
        <Link className="text-accent hover:underline" href="/docs/blocks">Blocks</Link>
      </p>
    </div>
  );
}
