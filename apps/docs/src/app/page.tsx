"use client";

import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  Badge,
  ChatBubble,
  CodeBlock,
  ToolCard,
  ThinkingBlock,
} from "@skeehn/react";

const THEMES = [
  { id: "default", label: "Editorial" },
  { id: "brutal", label: "Brutalist" },
  { id: "terminal", label: "Terminal" },
] as const;

const FEATURES = [
  { title: "ASCII dither engine", body: "Real-time Bayer, Floyd–Steinberg & Atkinson dithering on images, video and backgrounds — a genuine rendering moat, not a filter." },
  { title: "Built for AI", body: "Chat, streaming text, reasoning traces, tool calls, citations, agent status — 15 components shaped for modern AI interfaces." },
  { title: "Themeable to the core", body: "One token contract, seven built-in skins. Change a single attribute and the entire UI reskins — no rewrites." },
  { title: "You own the code", body: "Copy-paste via the CLI or shadcn registry. Source lands in your repo. Zero runtime dependencies, zero lock-in." },
] as const;

const GROUPS = [
  { label: "Core", items: [["Button","button"],["Card","card"],["Input","input"],["Badge","badge"],["Alert","alert"],["Dialog","dialog"],["Tabs","tabs"],["Toggle","toggle"],["Progress","progress"],["Avatar","avatar"],["Tooltip","tooltip"],["Dropdown","dropdown"],["Table","table"],["Accordion","accordion"]] },
  { label: "AI", items: [["Chat Bubble","chat-bubble"],["Chat Input","chat-input"],["Thinking Block","thinking-block"],["Reasoning Step","reasoning-step"],["Tool Card","tool-card"],["Streaming Text","streaming-text"],["Code Block","code-block"],["Agent Status","agent-status"],["Typing Indicator","typing-indicator"],["Markdown","markdown"],["Voice Session","voice-session"],["Prompt Suggestions","prompt-suggestions"],["File Attachment","file-attachment"],["Citation Card","citation-card"],["Terminal Panel","terminal-panel"]] },
  { label: "Layout & viz", items: [["Layout","layout"],["Data Viz","dataviz"],["Motion","motion"]] },
] as const;

const HERO_CODE = `import { useChat, ChatBubble } from '@skeehn/react';

export function Chat() {
  const { messages } = useChat();
  return messages.map(m =>
    <ChatBubble key={m.id} role={m.role}>{m.content}</ChatBubble>
  );
}`;

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <Link href="/" className="font-semibold tracking-tight text-[0.95rem] flex items-center gap-2">
            <span className="text-accent">▚</span> skeehn
          </Link>
          <div className="flex items-center gap-7 text-sm text-muted-fg">
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link href="/docs/components" className="hover:text-foreground transition-colors">Components</Link>
            <Link href="/docs/themes" className="hover:text-foreground transition-colors hidden sm:inline">Themes</Link>
            <a href="https://github.com/skeehn/skeehn" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[480px] pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(60% 100% at 50% 0%, hsl(var(--sk-accent) / 0.07), transparent 70%)" }} />
        <div className="relative max-w-4xl mx-auto px-6 pt-28 pb-16 text-center">
          <Link href="/docs" className="inline-flex items-center gap-2 text-[0.8rem] text-muted-fg border border-border rounded-full pl-2 pr-3 py-1 mb-8 hover:border-foreground/20 transition-colors">
            <span className="text-accent font-medium bg-accent/10 rounded-full px-2 py-0.5 text-[0.72rem]">v1.0</span>
            Now on npm &amp; the shadcn registry →
          </Link>
          <h1 className="font-semibold tracking-[-0.03em] leading-[1.06] text-foreground text-balance mx-auto max-w-3xl" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
            AI components that don&rsquo;t look like every other chatbot.
          </h1>
          <p className="mt-6 text-lg text-muted-fg leading-relaxed max-w-xl mx-auto">
            32 open-source React components for AI interfaces — chat, streaming, reasoning, tool calls. ASCII-dithered, fully themeable, copy-paste yours.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/docs/getting-started"><Button variant="solid" size="lg">Get started</Button></Link>
            <Link href="/docs/components"><Button variant="outline" size="lg">Browse components</Button></Link>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-fg font-mono">
            <span className="opacity-50">$</span> npm i @skeehn/react
          </div>
        </div>

        {/* product shot */}
        <div className="relative max-w-2xl mx-auto px-6 pb-24">
          <Card>
            <CardBody>
              <div className="flex flex-col gap-3">
                <ChatBubble role="user">Refactor <code>parseTree</code> to O(n) and explain the tradeoff.</ChatBubble>
                <ThinkingBlock state="done" label="Thought for 3.2s" meta="412 tok" defaultExpanded={false}>
                  Nested find() in the loop is O(n²). Hoist the lookup into a Map → one O(n) pass, +O(n) memory.
                </ThinkingBlock>
                <ChatBubble role="assistant">
                  Replace the inner <code>find()</code> with a pre-built <code>Map</code> so each node is visited once:
                </ChatBubble>
                <CodeBlock language="ts" code={`const index = new Map(nodes.map(n => [n.id, n]));\nfor (const n of nodes) link(n, index.get(n.parent));`} />
                <ToolCard name="search_codebase" status="success">3 matches in src/parse/*.ts — applied to parseTree.ts:42</ToolCard>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* ── THEMES STRIP ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-12">
            <h2 className="font-semibold tracking-[-0.02em] text-foreground" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)" }}>One core, every skin</h2>
            <p className="mt-3 text-muted-fg leading-relaxed">Every component reads from one token contract. Change <code className="sk-code-inline">data-theme</code> and the whole UI reskins. The same chat, in three of the seven built-in themes:</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {THEMES.map((t) => (
              <div key={t.id} data-theme={t.id} className="rounded-xl overflow-hidden border" style={{ background: "hsl(var(--sk-background))", color: "hsl(var(--sk-foreground))", borderColor: "hsl(var(--sk-border-color))" }}>
                <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "hsl(var(--sk-border-color))" }}>
                  <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "hsl(var(--sk-muted-foreground))" }}>{t.label}</span>
                  <span className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--sk-accent))" }} />
                </div>
                <div className="p-4 flex flex-col gap-2.5">
                  <ChatBubble role="user">How does dithering work?</ChatBubble>
                  <ChatBubble role="assistant">It thresholds pixels against a Bayer matrix to fake more shades.</ChatBubble>
                  <div className="pt-1"><Button variant="solid" size="sm">Send</Button></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-2xl mb-14">
          <h2 className="font-semibold tracking-[-0.02em] text-foreground" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)" }}>Designed, not generated</h2>
          <p className="mt-3 text-muted-fg leading-relaxed">The functional bar is table stakes. skeehn wins on a point of view — a real aesthetic, a real theme system, and the polish details most libraries skip.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-12">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4 font-mono text-sm">▚</div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-[0.95rem] text-muted-fg leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATALOG ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-12">
            <h2 className="font-semibold tracking-[-0.02em] text-foreground" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)" }}>32 components, one install</h2>
            <p className="mt-3 text-muted-fg leading-relaxed">14 core · 15 AI · 3 layout, viz &amp; motion bundles. Each ships as plain CSS with an optional React wrapper.</p>
          </div>
          <div className="space-y-9">
            {GROUPS.map((g) => (
              <div key={g.label}>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-fg mb-3">{g.label}</p>
                <div className="flex flex-wrap gap-2">
                  {g.items.map(([name, slug]) => (
                    <Link key={slug} href={`/docs/components/${slug}`} className="text-sm bg-background border border-border rounded-lg px-3 py-1.5 text-muted-fg hover:text-foreground hover:border-foreground/20 transition-colors">
                      {name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTALL / CTA ── */}
      <section className="max-w-3xl mx-auto px-6 py-28 text-center">
        <h2 className="font-semibold tracking-[-0.025em] text-foreground" style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}>Ship an AI interface in minutes</h2>
        <p className="mt-4 text-lg text-muted-fg max-w-lg mx-auto leading-relaxed">Import the component, wire the hook, done. Or copy the source into your repo with one command.</p>
        <div className="mt-10 text-left"><CodeBlock language="tsx" code={HERO_CODE} lineNumbers /></div>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/docs/getting-started"><Button variant="solid" size="lg">Read the docs</Button></Link>
          <Link href="/docs/ai-chat"><Button variant="outline" size="lg">Live chat demo</Button></Link>
        </div>
        <div className="mt-7 flex items-center justify-center gap-2">
          <Badge color="success">0 dependencies</Badge>
          <Badge variant="outline">MIT</Badge>
          <Badge variant="outline">React 18+</Badge>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-fg">
          <p>Built by <span className="text-foreground font-medium">skeehn</span> · MIT License</p>
          <div className="flex items-center gap-6">
            <a href="https://github.com/skeehn/skeehn" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
            <a href="https://www.npmjs.com/org/skeehn" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">npm</a>
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
