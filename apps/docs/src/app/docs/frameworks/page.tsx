import type { Metadata } from "next";
import { CodeBlock } from "@skeehn/react";

export const metadata: Metadata = {
  title: "Use anywhere — frameworks",
  description:
    "skeehn is CSS-first, so it works in React, Vue, Svelte, Astro, Lit, or plain HTML — via @skeehn/react, the @skeehn/wc Web Components, or the raw CSS classes.",
};

const REACT = `npm i @skeehn/react
import '@skeehn/core/styles.css';
import { ChatBubble } from '@skeehn/react';

<ChatBubble role="assistant">Hello from skeehn</ChatBubble>`;

const WC = `<link rel="stylesheet" href="https://unpkg.com/@skeehn/core/dist/styles.css" />
<script type="module">
  import { defineSkeehnElements } from '@skeehn/wc';
  defineSkeehnElements();
</script>

<skeehn-button variant="solid">Send</skeehn-button>
<skeehn-chat-bubble role="assistant">Hello from skeehn</skeehn-chat-bubble>`;

const CSS_ONLY = `<link rel="stylesheet" href="https://unpkg.com/@skeehn/core/dist/styles.css" />
<html data-theme="light">  <!-- or dark, default, terminal, brutal… -->

<button class="sk-btn" data-variant="solid">Send</button>
<div class="sk-chat-bubble" data-role="assistant">
  <div class="sk-chat-bubble__content">Hello from skeehn</div>
</div>`;

function Block({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <p className="docs-label mb-2">{label}</p>
      <h2 className="docs-heading text-xl sm:text-2xl tracking-tight mb-3">{title}</h2>
      <div className="text-[0.95rem] text-muted-fg leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function FrameworksPage() {
  return (
    <div className="max-w-3xl">
      <p className="docs-label mb-3">Ecosystem</p>
      <h1 className="docs-heading text-3xl sm:text-4xl tracking-tight mb-4">Use skeehn anywhere</h1>
      <p className="text-lg text-muted-fg leading-relaxed mb-10">
        skeehn is <strong className="text-foreground font-medium">CSS-first</strong> — every component
        is plain CSS on plain markup, driven by tokens. So it works in React today, in Vue / Svelte /
        Astro / Lit / plain HTML via Web Components, or with no framework at all.
      </p>

      <Block label="First-class" title="React">
        <p>Typed wrappers, hooks, the AI SDK layer, and blocks:</p>
        <div data-theme="default"><CodeBlock language="tsx" code={REACT} /></div>
      </Block>

      <Block label="Anywhere" title="Web Components — Vue, Svelte, Astro, Lit, HTML">
        <p>
          <code className="sk-code-inline">@skeehn/wc</code> ships light-DOM custom elements that
          render skeehn markup, so the global CSS styles them. Zero dependencies:
        </p>
        <div data-theme="default"><CodeBlock language="html" code={WC} /></div>
      </Block>

      <Block label="No framework" title="CSS-only">
        <p>
          Include the stylesheet, set <code className="sk-code-inline">data-theme</code>, and write the
          markup with skeehn classes — no JavaScript required:
        </p>
        <div data-theme="default"><CodeBlock language="html" code={CSS_ONLY} /></div>
      </Block>

      <Block label="Starter" title="Clone a full app">
        <p>
          The{" "}
          <a className="text-accent hover:underline" href="https://github.com/skeehn/interface/tree/main/examples/starter">
            examples/starter
          </a>{" "}
          is a deployable Next.js app with <strong className="text-foreground font-medium">chat</strong>{" "}
          (AI SDK), <strong className="text-foreground font-medium">voice</strong>, and{" "}
          <strong className="text-foreground font-medium">site</strong> surfaces — all from one
          themeable foundation. See also{" "}
          <a className="text-accent hover:underline" href="/docs/agents">Use with AI agents</a>.
        </p>
      </Block>
    </div>
  );
}
