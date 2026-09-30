"use client";

import Link from "next/link";
import {
  Button,
  Badge,
  ChatBubble,
  ChatInput,
  CodeBlock,
  ToolCard,
  ThinkingBlock,
} from "@skeehn/react";
import { Reveal } from "@/components/Reveal";

/* ── data ───────────────────────────────────────────────────────────────── */

const THEMES = [
  { id: "default", label: "Editorial", q: "How does dithering work?", a: "It thresholds pixels against a Bayer matrix to fake more shades." },
  { id: "brutal", label: "Brutalist", q: "How does dithering work?", a: "It thresholds pixels against a Bayer matrix to fake more shades." },
  { id: "terminal", label: "Terminal", q: "How does dithering work?", a: "It thresholds pixels against a Bayer matrix to fake more shades." },
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
  { k: "A", title: "You own the code", body: "Copy components into your repo with the CLI or shadcn registry — or just npm i. No black box, no lock-in, edit anything." },
  { k: "B", title: "Theme it to your brand", body: "One token contract, eight built-in skins, or your own. Flip one data-attribute and the whole UI reskins — no rewrites." },
  { k: "C", title: "Built for AI, not bolted on", body: "15 components shaped for real AI UX — streaming, reasoning, tools, agents — on top of 14 core primitives." },
  { k: "D", title: "Zero runtime dependencies", body: "Plain CSS with an optional React wrapper. Works with any framework, with server components, even without JS." },
] as const;

const GROUPS = [
  { label: "Core", items: [["Button","button"],["Card","card"],["Input","input"],["Badge","badge"],["Alert","alert"],["Dialog","dialog"],["Tabs","tabs"],["Toggle","toggle"],["Progress","progress"],["Avatar","avatar"],["Tooltip","tooltip"],["Dropdown","dropdown"],["Table","table"],["Accordion","accordion"]] },
  { label: "AI", items: [["Chat Bubble","chat-bubble"],["Chat Input","chat-input"],["Thinking Block","thinking-block"],["Reasoning Step","reasoning-step"],["Tool Card","tool-card"],["Streaming Text","streaming-text"],["Code Block","code-block"],["Agent Status","agent-status"],["Typing Indicator","typing-indicator"],["Markdown","markdown"],["Voice Session","voice-session"],["Prompt Suggestions","prompt-suggestions"],["File Attachment","file-attachment"],["Citation Card","citation-card"],["Terminal Panel","terminal-panel"]] },
  { label: "Layout · Viz · Motion", items: [["Layout","layout"],["Data Viz","dataviz"],["Motion","motion"]] },
] as const;

const HERO_CODE = `import { ChatConsole } from '@skeehn/react/blocks';
import { useChat } from '@skeehn/react/hooks';
import '@skeehn/core/styles.css';

export function Chat() {
  const { messages, sendMessage, onStop } = useChat();
  return (
    <ChatConsole messages={messages} onSend={sendMessage} onStop={onStop} />
  );
}`;

/* ── primitives ─────────────────────────────────────────────────────────── */

function CropMarks() {
  return (
    <>
      <span className="crop crop-tl" aria-hidden />
      <span className="crop crop-tr" aria-hidden />
      <span className="crop crop-bl" aria-hidden />
      <span className="crop crop-br" aria-hidden />
    </>
  );
}

function SectionHead({ n, label, title, intro }: { n: string; label: string; title: React.ReactNode; intro?: string }) {
  return (
    <div className="rule-t pt-6">
      <div className="flex items-baseline gap-5 mb-5">
        <span className="eyebrow text-accent">{n}</span>
        <span className="eyebrow">{label}</span>
      </div>
      <h2 className="display text-foreground" style={{ fontSize: "clamp(1.9rem, 4.4vw, 3.25rem)" }}>{title}</h2>
      {intro && <p className="mt-4 max-w-2xl text-muted-fg leading-relaxed">{intro}</p>}
    </div>
  );
}

/* ── page ───────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      {/* ═══ MASTHEAD ═══ */}
      <header className="sticky top-0 z-50 rule-b bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2 text-foreground">
            <span className="text-accent text-base leading-none">▚</span>
            <span className="spec font-semibold tracking-tight text-[0.95rem]">skeehn</span>
          </Link>
          <nav className="flex items-center gap-6 eyebrow">
            <Link href="/docs" className="hover:text-accent transition-colors">Docs</Link>
            <Link href="/docs/components" className="hover:text-accent transition-colors">Components</Link>
            <Link href="/docs/themes" className="hover:text-accent transition-colors hidden sm:inline">Themes</Link>
            <a href="https://github.com/skeehn/skeehn" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">GitHub&#8239;↗</a>
          </nav>
        </div>
      </header>

      {/* spec ticker */}
      <div className="rule-b bg-surface">
        <div className="max-w-6xl mx-auto px-6 h-9 flex items-center gap-x-5 overflow-hidden whitespace-nowrap spec text-[0.7rem] text-muted-fg">
          <span className="text-accent">●</span>
          <span className="text-foreground">v2.0.0</span><span className="text-border">/</span>
          <span>32 COMPONENTS</span><span className="text-border">/</span>
          <span>8 THEMES</span><span className="text-border">/</span>
          <span>0 RUNTIME DEPS</span><span className="text-border">/</span>
          <span>MIT</span><span className="text-border hidden sm:inline">/</span>
          <span className="hidden sm:inline">LIVE ON NPM &amp; THE SHADCN REGISTRY</span>
        </div>
      </div>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute top-0 right-0 w-[46%] h-[480px] halftone pointer-events-none"
          style={{ opacity: 0.55, maskImage: "radial-gradient(58% 75% at 85% 5%, #000, transparent 72%)", WebkitMaskImage: "radial-gradient(58% 75% at 85% 5%, #000, transparent 72%)" }} />

        <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-[150px_1fr] gap-x-10">
          {/* margin rail */}
          <aside className="hidden lg:flex flex-col pt-20 rule-r pr-6">
            <div className="sk-rise spec text-[0.7rem] text-muted-fg leading-[1.9]" style={{ animationDelay: "0ms" }}>
              <p className="eyebrow text-accent mb-3">§00</p>
              <p>EST. 2026</p>
              <p>OPEN SOURCE</p>
              <p>REACT 18+</p>
              <p>ZERO DEPS</p>
              <p className="mt-4 text-accent tracking-[0.3em]">▚▚▚▚</p>
            </div>
          </aside>

          {/* main column */}
          <div className="pt-16 lg:pt-20 pb-14">
            <p className="eyebrow sk-rise" style={{ animationDelay: "40ms" }}>{"// the ui layer for ai interfaces"}</p>
            <h1 className="display text-foreground mt-5 sk-rise" style={{ fontSize: "clamp(2.9rem, 7.6vw, 6.25rem)", animationDelay: "90ms" }}>
              Build an AI interface<br className="hidden sm:block" /> that looks like <em className="text-accent">yours</em>,<br className="hidden sm:block" /> not theirs.
            </h1>
            <p className="mt-7 max-w-xl text-[1.075rem] leading-relaxed text-muted-fg sk-rise" style={{ animationDelay: "150ms" }}>
              The open-source React components for AI products — chat, streaming, reasoning, tool
              calls, agents. Copy them in, theme them to your brand, own every line. Zero runtime
              dependencies.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3 sk-rise" style={{ animationDelay: "210ms" }}>
              <Link href="/docs/getting-started"><Button variant="solid" size="lg">Get started →</Button></Link>
              <Link href="/docs/ai-chat"><Button variant="outline" size="lg">See the live demo</Button></Link>
              <span className="spec text-sm text-muted-fg ml-1"><span className="text-accent">$</span>&nbsp;npm i @skeehn/react</span>
            </div>
          </div>
        </div>

        {/* FIG. 01 — chat demo plate */}
        <div className="relative max-w-6xl mx-auto px-6 pb-20">
          <figure className="sk-rise" style={{ animationDelay: "320ms" }}>
            <div className="relative border rule-ink bg-surface">
              <CropMarks />
              <div className="flex items-center gap-2 px-4 h-10 rule-b">
                <span className="flex items-center gap-1.5" aria-hidden>
                  <span className="w-2.5 h-2.5 rounded-full border border-border" />
                  <span className="w-2.5 h-2.5 rounded-full border border-border" />
                  <span className="w-2.5 h-2.5 rounded-full border border-border" />
                </span>
                <span className="spec text-[0.72rem] text-muted-fg ml-1">chat.tsx</span>
                <span className="eyebrow ml-auto">streaming</span>
              </div>
              <div className="p-5 md:p-6 flex flex-col gap-3">
                <ChatBubble role="user">Refactor <code>parseTree</code> to O(n) and explain the tradeoff.</ChatBubble>
                <ThinkingBlock state="done" label="Thought for 3.2s" meta="412 tok" defaultExpanded={false}>
                  Nested find() in the loop is O(n²). Hoist the lookup into a Map → one O(n) pass, +O(n) memory.
                </ThinkingBlock>
                <ChatBubble role="assistant">
                  Replace the inner <code>find()</code> with a pre-built <code>Map</code> so each node is visited once:
                </ChatBubble>
                <div data-theme="default"><CodeBlock language="ts" code={"const index = new Map(nodes.map(n => [n.id, n]));\nfor (const n of nodes) link(n, index.get(n.parent));"} /></div>
                <ToolCard name="search_codebase" status="success">3 matches in src/parse/*.ts — applied to parseTree.ts:42</ToolCard>
                <div className="pt-1"><ChatInput placeholder="Message skeehn…" disabled /></div>
              </div>
            </div>
            <figcaption className="mt-3 flex items-center justify-between spec text-[0.7rem] text-muted-fg">
              <span><span className="text-foreground">FIG. 01</span> — STREAMING CHAT · REASONING · TOOL CALL</span>
              <span className="hidden sm:inline">9 skeehn COMPONENTS, ZERO CONFIG</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ═══ AI SDK INTEROP ═══ */}
      <section className="rule-t rule-b bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1.5">
          <span className="eyebrow text-accent shrink-0">A drop-in for the AI SDK</span>
          <span className="text-sm text-muted-fg">
            Render <code className="sk-code-inline">@ai-sdk/react</code> messages with{" "}
            <code className="sk-code-inline">&lt;Conversation&gt;</code> — text, reasoning, tools &amp; sources, mapped for you.
          </span>
          <Link href="/docs/ai-sdk" className="elink spec text-sm sm:ml-auto shrink-0">See the drop-in →</Link>
        </div>
      </section>

      {/* ═══ §01 — CAPABILITIES ═══ */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20">
        <Reveal>
          <SectionHead n="§01" label="What you get" title="Everything an AI product needs"
            intro="Stop rebuilding the same chat surface for every project. skeehn ships the full AI-interface layer — polished, accessible, and tested." />
        </Reveal>
        <Reveal className="grid sm:grid-cols-2 lg:grid-cols-3 mt-12 rule-t rule-l">
          {CAPABILITIES.map((c, i) => (
            <div key={c.title} className="rule-r rule-b p-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="spec text-[0.72rem] text-accent tnum">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="spec font-semibold text-foreground text-[0.95rem]">{c.title}</h3>
              </div>
              <p className="text-sm text-muted-fg leading-relaxed pl-7">{c.body}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ═══ §02 — THEMES ═══ */}
      <section className="rule-t bg-surface">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20">
          <Reveal>
            <SectionHead n="§02" label="Make it yours" title="One component, eight aesthetics"
              intro="A clean, neutral default ships in the box — then seven more skins take you anywhere, from green-phosphor Terminal to Brutalist, all from one token contract. The same exchange, three ways:" />
          </Reveal>
          <Reveal className="grid md:grid-cols-3 gap-6 mt-12">
            {THEMES.map((t, i) => (
              <figure key={t.id}>
                <div data-theme={t.id} className="relative border rule-ink" style={{ background: "hsl(var(--sk-background))" }}>
                  <CropMarks />
                  <div className="flex items-center justify-between px-3 h-8 rule-b">
                    <span className="spec text-[0.68rem] uppercase tracking-[0.15em]" style={{ color: "hsl(var(--sk-muted-foreground))" }}>{t.label}</span>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--sk-accent))" }} />
                  </div>
                  <div className="p-4 flex flex-col gap-2.5 min-h-[190px]">
                    <ChatBubble role="user">{t.q}</ChatBubble>
                    <ChatBubble role="assistant">{t.a}</ChatBubble>
                    <div className="mt-auto pt-1"><Button variant="solid" size="sm">Send</Button></div>
                  </div>
                </div>
                <figcaption className="mt-2.5 spec text-[0.68rem] text-muted-fg">
                  <span className="text-foreground">FIG. 02{String.fromCharCode(97 + i)}</span> — {t.label.toUpperCase()}
                </figcaption>
              </figure>
            ))}
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/docs/themes" className="elink spec text-sm">Browse all eight themes →</Link>
            <Link href="/docs/theme-generator" className="elink spec text-sm">Generate one from your brand color →</Link>
          </div>
        </div>
      </section>

      {/* ═══ §03 — CATALOG (parts index) ═══ */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20">
        <Reveal>
          <SectionHead n="§03" label="The catalog" title="Thirty-two components, one install"
            intro="14 core · 15 AI · 3 layout, viz & motion bundles. Each ships as plain CSS with an optional React wrapper — add one or add them all." />
        </Reveal>
        <Reveal className="grid lg:grid-cols-3 gap-x-10 gap-y-10 mt-12">
          {GROUPS.map((g) => (
            <div key={g.label}>
              <div className="rule-b flex items-baseline justify-between pb-2 mb-1">
                <span className="eyebrow text-foreground">{g.label}</span>
                <span className="spec text-[0.68rem] text-muted-fg tnum">{String(g.items.length).padStart(2, "0")}</span>
              </div>
              <ul>
                {g.items.map(([name, slug], i) => (
                  <li key={slug}>
                    <Link href={`/docs/components/${slug}`} className="group flex items-baseline gap-3 py-[7px] rule-b hover:bg-background transition-colors">
                      <span className="spec text-[0.68rem] text-muted-fg tnum w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <span className="spec text-[0.85rem] text-foreground group-hover:text-accent transition-colors">{name}</span>
                      <span className="spec text-[0.64rem] text-muted-fg ml-auto opacity-0 group-hover:opacity-100 transition-opacity">SPEC ↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ═══ §04 — WHY ═══ */}
      <section className="rule-t bg-surface">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20">
          <Reveal>
            <SectionHead n="§04" label="Why skeehn" title={<>A library, <em>not</em> a lock-in</>}
              intro="Most AI kits hand you a black box that looks like everyone else’s. skeehn hands you the source." />
          </Reveal>
          <Reveal className="grid sm:grid-cols-2 mt-12 rule-t rule-l">
            {WHY.map((f) => (
              <div key={f.k} className="rule-r rule-b p-7">
                <div className="flex items-baseline gap-3">
                  <span className="display text-accent text-3xl leading-none">{f.k}</span>
                  <h3 className="spec font-semibold text-foreground">{f.title}</h3>
                </div>
                <p className="mt-3 text-sm text-muted-fg leading-relaxed">{f.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ═══ COLOPHON / CTA ═══ */}
      <section className="rule-t">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-[1fr_1fr] gap-x-12 gap-y-10 items-center">
          <div>
            <p className="eyebrow text-accent">Ship today</p>
            <h2 className="display text-foreground mt-4" style={{ fontSize: "clamp(2.2rem, 5vw, 3.75rem)" }}>
              Ship your AI interface this afternoon.
            </h2>
            <p className="mt-5 max-w-md text-muted-fg leading-relaxed">
              Wire the <code className="sk-code-inline">useChat</code> hook to your endpoint, drop in{" "}
              <code className="sk-code-inline">ChatBubble</code>, and you have a streaming chat UI. Then theme it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/docs/getting-started"><Button variant="solid" size="lg">Read the docs →</Button></Link>
              <Link href="/docs/components"><Button variant="outline" size="lg">Browse components</Button></Link>
            </div>
            <div className="mt-7 flex items-center gap-2">
              <Badge color="success">0 dependencies</Badge>
              <Badge variant="outline">MIT</Badge>
              <Badge variant="outline">React 18+</Badge>
            </div>
          </div>
          <figure className="sk-reveal" data-shown="true">
            <div className="relative border rule-ink" data-theme="default">
              <CropMarks />
              <CodeBlock language="tsx" code={HERO_CODE} lineNumbers />
            </div>
            <figcaption className="mt-2.5 spec text-[0.7rem] text-muted-fg"><span className="text-foreground">FIG. 03</span> — A STREAMING CHAT IN SEVEN LINES</figcaption>
          </figure>
        </div>
      </section>

      {/* ═══ FOOTER COLOPHON ═══ */}
      <footer className="rule-t bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="spec text-[0.72rem] text-muted-fg leading-relaxed">
            <span className="text-accent">▚</span> skeehn — built by skeehn · MIT · open source<br className="sm:hidden" />
            <span className="hidden sm:inline"> · </span>set in Instrument Serif &amp; IBM Plex
          </p>
          <div className="flex items-center gap-6 eyebrow">
            <a href="https://github.com/skeehn/skeehn" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">GitHub</a>
            <a href="https://www.npmjs.com/org/skeehn" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">npm</a>
            <Link href="/docs" className="hover:text-accent transition-colors">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
