"use client";

import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  Badge,
  ChatBubble,
  ChatInput,
  CodeBlock,
  ToolCard,
  ThinkingBlock,
} from "@skeehn/react";
import { Reveal } from "@/components/Reveal";

const THEMES = [
  { id: "default", label: "Editorial" },
  { id: "brutal", label: "Brutalist" },
  { id: "terminal", label: "Terminal" },
] as const;

const CAPABILITIES = [
  { title: "Chat & messages", body: "Bubbles for user, assistant, tool and system roles — grouped, timestamped, with hover actions." },
  { title: "Streaming", body: "Token-paced streaming text with a real caret and sticky auto-scroll — not cheap per-token flicker." },
  { title: "Reasoning & thinking", body: "Collapsible thinking blocks and step-by-step reasoning traces with status and timing." },
  { title: "Tool calls", body: "Tool cards with pending / running / success / error states, parameters and result output." },
  { title: "Citations & code", body: "Source citation cards and copy-ready code blocks with line numbers and syntax tokens." },
  { title: "Agents & voice", body: "Agent status, typing indicators, voice sessions with a live waveform, and prompt suggestions." },
] as const;

const WHY = [
  { title: "You own the code", body: "Copy components into your repo with the CLI or shadcn registry — or just npm i. No black box, no lock-in, edit anything." },
  { title: "Theme it to your brand", body: "One token contract, eight built-in skins, or your own. Flip one data-attribute and the whole UI reskins — no rewrites." },
  { title: "Built for AI, not bolted on", body: "15 components shaped for real AI UX — streaming, reasoning, tools, agents — on top of the 14 core primitives you'd build anyway." },
  { title: "Zero runtime dependencies", body: "Plain CSS with an optional React wrapper. Works with any framework, with server components, even without JavaScript." },
] as const;

const GROUPS = [
  { label: "Core", items: [["Button","button"],["Card","card"],["Input","input"],["Badge","badge"],["Alert","alert"],["Dialog","dialog"],["Tabs","tabs"],["Toggle","toggle"],["Progress","progress"],["Avatar","avatar"],["Tooltip","tooltip"],["Dropdown","dropdown"],["Table","table"],["Accordion","accordion"]] },
  { label: "AI", items: [["Chat Bubble","chat-bubble"],["Chat Input","chat-input"],["Thinking Block","thinking-block"],["Reasoning Step","reasoning-step"],["Tool Card","tool-card"],["Streaming Text","streaming-text"],["Code Block","code-block"],["Agent Status","agent-status"],["Typing Indicator","typing-indicator"],["Markdown","markdown"],["Voice Session","voice-session"],["Prompt Suggestions","prompt-suggestions"],["File Attachment","file-attachment"],["Citation Card","citation-card"],["Terminal Panel","terminal-panel"]] },
  { label: "Layout & viz", items: [["Layout","layout"],["Data Viz","dataviz"],["Motion","motion"]] },
] as const;

const HERO_CODE = `import { ChatBubble } from '@skeehn/react';
import { useChat } from '@skeehn/react/hooks';

export function Chat() {
  const { messages } = useChat();
  return messages.map((m) => (
    <ChatBubble key={m.id} role={m.role}>{m.content}</ChatBubble>
  ));
}`;

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      {/* ── NAV (solid, light) ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
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

      {/* ── HERO (clean light, real-component demo as the star) ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[640px] pointer-events-none sk-dotgrid" aria-hidden="true"
          style={{ maskImage: "radial-gradient(72% 80% at 50% 0%, #000 22%, transparent 72%)", WebkitMaskImage: "radial-gradient(72% 80% at 50% 0%, #000 22%, transparent 72%)" }} />
        <div className="absolute inset-x-0 top-0 h-[560px] pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(60% 90% at 50% -10%, hsl(var(--sk-accent) / 0.08), transparent 70%)" }} />
        <div className="relative max-w-3xl mx-auto px-6 pt-28 pb-12 text-center sk-rise">
          <Link href="https://www.npmjs.com/org/skeehn" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[0.8rem] text-muted-fg border border-border rounded-full pl-2 pr-3 py-1 mb-8 hover:border-foreground/20 transition-colors">
            <span className="text-accent font-medium bg-accent/10 rounded-full px-2 py-0.5 text-[0.72rem]">v1.1</span>
            Live on npm &amp; the shadcn registry →
          </Link>
          <h1 className="font-semibold tracking-[-0.035em] leading-[1.04] text-foreground text-balance mx-auto max-w-3xl"
            style={{ fontSize: "clamp(2.5rem, 5.6vw, 4.25rem)" }}>
            Build an AI interface that looks like <span className="text-accent">yours</span>, not theirs.
          </h1>
          <p className="mt-6 text-lg text-muted-fg leading-relaxed max-w-2xl mx-auto text-balance">
            The open-source React component library for AI products — chat, streaming, reasoning, tool
            calls, agents. Copy the components into your app, theme them to your brand, own every line.
            Zero runtime dependencies.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/docs/getting-started"><Button variant="solid" size="lg">Get started</Button></Link>
            <Link href="/docs/ai-chat"><Button variant="outline" size="lg">See the live demo</Button></Link>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-fg font-mono">
            <span className="opacity-50">$</span> npm i @skeehn/react
          </div>
        </div>

        {/* hero demo — a real chat, framed as an app window */}
        <div className="relative max-w-2xl mx-auto px-6 pb-24 sk-rise" style={{ animationDelay: "160ms" }}>
          <div className="absolute -inset-x-6 -top-6 -bottom-6 pointer-events-none" aria-hidden="true"
            style={{ background: "radial-gradient(50% 50% at 50% 42%, hsl(var(--sk-accent) / 0.08), transparent 72%)" }} />
          <div className="relative rounded-2xl border border-border bg-background overflow-hidden"
            style={{ boxShadow: "0 1px 1px hsl(220 18% 12% / 0.04), 0 24px 60px -20px hsl(220 18% 12% / 0.22)" }}>
            <div className="flex items-center gap-2 px-4 h-11 border-b border-border bg-surface">
              <span className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(var(--sk-border-color))" }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(var(--sk-border-color))" }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(var(--sk-border-color))" }} />
              </span>
              <span className="text-xs text-muted-fg font-mono ml-1">chat.tsx · skeehn</span>
              <Badge variant="outline" className="ml-auto text-[0.65rem]">Editorial theme</Badge>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <ChatBubble role="user">Refactor <code>parseTree</code> to O(n) and explain the tradeoff.</ChatBubble>
              <ThinkingBlock state="done" label="Thought for 3.2s" meta="412 tok" defaultExpanded={false}>
                Nested find() in the loop is O(n²). Hoist the lookup into a Map → one O(n) pass, +O(n) memory.
              </ThinkingBlock>
              <ChatBubble role="assistant">
                Replace the inner <code>find()</code> with a pre-built <code>Map</code> so each node is visited once:
              </ChatBubble>
              <div data-theme="default"><CodeBlock language="ts" code={`const index = new Map(nodes.map(n => [n.id, n]));\nfor (const n of nodes) link(n, index.get(n.parent));`} /></div>
              <ToolCard name="search_codebase" status="success">3 matches in src/parse/*.ts — applied to parseTree.ts:42</ToolCard>
            </div>
            <div className="px-5 pb-5">
              <ChatInput placeholder="Message skeehn…" disabled />
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-fg">A real exchange — chat, reasoning, code, a tool call and an input, all skeehn components.</p>
        </div>
      </section>

      {/* ── AI SDK INTEROP BAND ── */}
      <section className="border-y border-border bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-x-3 gap-y-1.5 text-center text-sm">
          <span className="inline-flex items-center gap-2 text-foreground font-medium whitespace-nowrap">
            <span className="text-accent font-mono">▚</span> A drop-in for the AI SDK.
          </span>
          <span className="text-muted-fg">
            Render <code className="sk-code-inline">@ai-sdk/react</code> messages with{" "}
            <code className="sk-code-inline">&lt;Conversation&gt;</code> — text, reasoning, tools &amp; sources, mapped for you.
          </span>
          <Link href="/docs/ai-sdk" className="text-accent hover:underline whitespace-nowrap font-medium">See the drop-in →</Link>
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-2xl mb-14">
          <p className="docs-label mb-3">What you get</p>
          <h2 className="font-semibold tracking-[-0.02em] text-foreground" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)" }}>Everything an AI product needs</h2>
          <p className="mt-3 text-muted-fg leading-relaxed">Stop rebuilding the same chat surface for every project. skeehn ships the full AI-interface layer — polished, accessible, and tested.</p>
        </div>
        <Reveal className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
          {CAPABILITIES.map((c) => (
            <div key={c.title}>
              <h3 className="font-semibold text-foreground mb-1.5 flex items-center gap-2"><span className="text-accent font-mono text-xs">▚</span>{c.title}</h3>
              <p className="text-[0.95rem] text-muted-fg leading-relaxed">{c.body}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ── THEMES STRIP ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-12">
            <p className="docs-label mb-3">Make it yours</p>
            <h2 className="font-semibold tracking-[-0.02em] text-foreground" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)" }}>One component, every aesthetic</h2>
            <p className="mt-3 text-muted-fg leading-relaxed">A clean, neutral default ships in the box — then seven more skins take you as far as you want, from green-phosphor Terminal to Brutalist to soft-grain Print, all driven by one token contract. The same chat, three ways:</p>
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
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/docs/themes" className="text-sm text-accent hover:underline">Browse all eight themes →</Link>
            <Link href="/docs/theme-generator" className="text-sm text-accent hover:underline">Generate one from your brand color →</Link>
          </div>
        </div>
      </section>

      {/* ── WHY ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-2xl mb-14">
          <p className="docs-label mb-3">Why skeehn</p>
          <h2 className="font-semibold tracking-[-0.02em] text-foreground" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)" }}>A library, not a lock-in</h2>
          <p className="mt-3 text-muted-fg leading-relaxed">Most AI kits hand you a black box that looks like everyone else&rsquo;s. skeehn hands you the source.</p>
        </div>
        <Reveal className="grid sm:grid-cols-2 gap-x-12 gap-y-12">
          {WHY.map((f) => (
            <div key={f.title}>
              <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4 font-mono text-sm">▚</div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-[0.95rem] text-muted-fg leading-relaxed">{f.body}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ── CATALOG ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-12">
            <p className="docs-label mb-3">The catalog</p>
            <h2 className="font-semibold tracking-[-0.02em] text-foreground" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)" }}>32 components, one install</h2>
            <p className="mt-3 text-muted-fg leading-relaxed">14 core · 15 AI · 3 layout, viz &amp; motion bundles. Each ships as plain CSS with an optional React wrapper — add one or add them all.</p>
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

      {/* ── INSTALL / CTA (clean light) ── */}
      <section className="max-w-3xl mx-auto px-6 py-28 text-center">
        <h2 className="font-semibold tracking-[-0.025em] text-foreground" style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}>Ship your AI interface this afternoon</h2>
        <p className="mt-4 text-lg text-muted-fg max-w-lg mx-auto leading-relaxed">Wire the <code className="sk-code-inline">useChat</code> hook to your endpoint, drop in <code className="sk-code-inline">ChatBubble</code>, and you have a streaming chat UI. Then theme it.</p>
        <div className="mt-10 text-left" data-theme="default"><CodeBlock language="tsx" code={HERO_CODE} lineNumbers /></div>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/docs/getting-started"><Button variant="solid" size="lg">Read the docs</Button></Link>
          <Link href="/docs/components"><Button variant="outline" size="lg">Browse components</Button></Link>
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
          <p>Built by <span className="text-foreground font-medium">skeehn</span> · MIT License · Open source</p>
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
