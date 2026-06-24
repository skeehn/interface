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
  CitationCard,
  TypingIndicator,
  AgentStatus,
} from "@skeehn/react";

const THEMES = [
  { id: "default", label: "Editorial" },
  { id: "brutal", label: "Brutalist" },
  { id: "terminal", label: "Terminal" },
] as const;

const FEATURES = [
  { icon: "░▒▓", title: "ASCII Dither Engine", body: "Real-time Bayer, Floyd–Steinberg & Atkinson dithering on images, video, and live backgrounds — a genuine rendering moat." },
  { icon: ">_", title: "15 AI Components", body: "Chat bubbles, streaming text, reasoning traces, tool calls, citations, agent status — purpose-built for AI UIs." },
  { icon: "[#]", title: "One Core, Many Skins", body: "A complete token contract. Swap ~30 variables and the same components become a different product." },
  { icon: "cp", title: "Copy-Paste Ownership", body: "Like shadcn — the CLI copies source into your repo. You own every line. Zero runtime lock-in." },
] as const;

const COMPONENTS = [
  ["Button", "button"], ["Card", "card"], ["Input", "input"], ["Badge", "badge"], ["Alert", "alert"], ["Dialog", "dialog"],
  ["Tabs", "tabs"], ["Toggle", "toggle"], ["Progress", "progress"], ["Avatar", "avatar"], ["Tooltip", "tooltip"], ["Dropdown", "dropdown"],
  ["Table", "table"], ["Accordion", "accordion"], ["Chat Bubble", "chat-bubble"], ["Chat Input", "chat-input"], ["Thinking Block", "thinking-block"],
  ["Reasoning Step", "reasoning-step"], ["Tool Card", "tool-card"], ["Streaming Text", "streaming-text"], ["Code Block", "code-block"],
  ["Agent Status", "agent-status"], ["Typing Indicator", "typing-indicator"], ["Markdown", "markdown"], ["Voice Session", "voice-session"],
  ["Prompt Suggestions", "prompt-suggestions"], ["File Attachment", "file-attachment"], ["Citation Card", "citation-card"], ["Terminal Panel", "terminal-panel"],
  ["Layout", "layout"], ["Data Viz", "dataviz"], ["Motion", "motion"],
] as const;

const HERO_CODE = `import { useChat } from '@skeehn/react';

export function Chat() {
  const { messages, input, setInput, append } = useChat();
  return <ChatBubble role="assistant">{messages}</ChatBubble>;
}`;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4 font-mono">{children}</p>;
}

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 h-14 border-b border-border bg-background/85 backdrop-blur-md">
        <Link href="/" className="text-sm font-mono font-bold tracking-wide flex items-center gap-2">
          <span className="text-accent">▚</span> skeehn
        </Link>
        <div className="flex items-center gap-6 text-xs font-mono text-muted-fg">
          <Link href="/docs" className="hover:text-accent transition-colors">Docs</Link>
          <Link href="/docs/components" className="hover:text-accent transition-colors">Components</Link>
          <Link href="/docs/themes" className="hover:text-accent transition-colors hidden sm:inline">Themes</Link>
          <a href="https://github.com/skeehn/skeehn" className="hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.5]"
          style={{ background: "radial-gradient(60% 50% at 75% 30%, hsl(var(--sk-accent) / 0.10), transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-20 grid lg:grid-cols-2 gap-14 items-center">
          {/* copy */}
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-mono text-muted-fg border border-border rounded-full px-3 py-1 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" /> v1.0 — on npm + the shadcn registry
            </span>
            <h1 className="font-mono font-extrabold tracking-tighter leading-[0.95] text-foreground" style={{ fontSize: "clamp(2.75rem, 7vw, 5rem)" }}>
              AI components<br />with a <span className="text-accent">point of view</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-fg max-w-md leading-relaxed">
              32 components, 7 themes, zero dependencies. The only AI component library that doesn&rsquo;t look like every other chatbot — ASCII dither, terminal soul, dual-font polish.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-9">
              <Link href="/docs/getting-started"><Button variant="solid" size="lg">Get Started →</Button></Link>
              <Link href="/docs/components"><Button variant="outline" size="lg">Browse 32 Components</Button></Link>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-mono text-muted-fg">
              <code className="sk-code-inline">npm i @skeehn/react</code>
              <span className="opacity-50">or</span>
              <code className="sk-code-inline">npx shadcn add</code>
            </div>
          </div>

          {/* live demo — built from skeehn's own components */}
          <Card>
            <CardBody>
              <div className="flex flex-col gap-3">
                <ChatBubble role="user">Refactor <code>parseTree</code> to O(n) and explain the tradeoff.</ChatBubble>
                <ThinkingBlock state="done" label="Thought for 3.2s" meta="412 tok" defaultExpanded={false}>
                  Nested find() inside the loop is O(n²). Hoist the lookup into a Map → single O(n) pass, +O(n) memory.
                </ThinkingBlock>
                <ChatBubble role="assistant">
                  Replace the inner <code>find()</code> with a pre-built <code>Map</code> so each node is visited once:
                </ChatBubble>
                <CodeBlock language="ts" code={`const index = new Map(nodes.map(n => [n.id, n]));\nfor (const n of nodes) link(n, index.get(n.parent));`} />
                <ToolCard name="search_codebase" status="success">3 matches in src/parse/*.ts — applied to parseTree.ts:42</ToolCard>
                <div className="flex items-center gap-3 pt-1">
                  <AgentStatus status="done" label="done" />
                  <TypingIndicator />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* ═══ ONE CORE, MANY SKINS ═══ */}
      <section className="py-24 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <Eyebrow>// One core, every skin</Eyebrow>
          <h2 className="font-mono font-extrabold tracking-tight text-foreground mb-3" style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}>
            The same component, any aesthetic
          </h2>
          <p className="text-muted-fg max-w-2xl mb-12 leading-relaxed">
            Every component reads from one token contract. Change <code className="sk-code-inline">data-theme</code> and the whole UI reskins — no rewrites. Here&rsquo;s one chat exchange in three of the seven built-in themes:
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {THEMES.map((t) => (
              <div key={t.id} data-theme={t.id} className="border border-border rounded-lg overflow-hidden" style={{ background: "hsl(var(--sk-background))", color: "hsl(var(--sk-foreground))" }}>
                <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                  <span className="text-[0.65rem] uppercase tracking-[0.2em] font-mono text-muted-fg">{t.label}</span>
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

      {/* ═══ LIVE COMPONENT SHOWCASE ═══ */}
      <section className="py-24 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <Eyebrow>// Drop-in AI components</Eyebrow>
          <h2 className="font-mono font-extrabold tracking-tight text-foreground mb-12" style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}>
            Everything an AI interface needs
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <ShowcaseCard label="Reasoning trace">
              <ThinkingBlock state="done" label="Reasoning · 1.4s" meta="208 tok" defaultExpanded>
                Identified intent: refactor. Searched the parser. Generating a Map-based rewrite.
              </ThinkingBlock>
            </ShowcaseCard>
            <ShowcaseCard label="Tool execution">
              <ToolCard name="run_tests" status="running">vitest — 41 passing, 0 failing…</ToolCard>
            </ShowcaseCard>
            <ShowcaseCard label="Citations">
              <CitationCard index={1} source="react.dev — useMemo" href="https://react.dev" snippet="useMemo caches a computed value between renders so expensive work only re-runs when dependencies change." />
            </ShowcaseCard>
            <ShowcaseCard label="Code, copy-ready">
              <CodeBlock language="bash" code={`$ npx shadcn add https://ui.skeehn.com/r/chat-bubble.json`} />
            </ShowcaseCard>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-24 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <Eyebrow>// Why skeehn</Eyebrow>
          <h2 className="font-mono font-extrabold tracking-tight text-foreground mb-12" style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}>
            Every pixel deliberate
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="border border-border rounded-lg bg-surface p-7 hover:border-accent transition-colors">
                <span className="text-lg font-mono text-accent">{f.icon}</span>
                <h3 className="text-base font-mono font-bold text-foreground mt-4 mb-2">{f.title}</h3>
                <p className="text-sm text-muted-fg leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CATALOG ═══ */}
      <section className="py-24 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <Eyebrow>// The catalog</Eyebrow>
          <h2 className="font-mono font-extrabold tracking-tight text-foreground mb-3" style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}>
            32 components, one install
          </h2>
          <p className="text-muted-fg mb-10">14 core · 15 AI · 3 layout/viz/motion bundles.</p>
          <div className="flex flex-wrap gap-2.5">
            {COMPONENTS.map(([name, slug]) => (
              <Link key={slug} href={`/docs/components/${slug}`} className="group">
                <span className="inline-flex items-center gap-2 border border-border rounded-md px-3 py-1.5 text-sm font-mono text-muted-fg hover:text-foreground hover:border-accent transition-colors">
                  <span className="text-accent opacity-60 group-hover:opacity-100">▸</span>{name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ INSTALL / CTA ═══ */}
      <section className="py-24 px-6 border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <Eyebrow>// Ship in minutes</Eyebrow>
          <h2 className="font-mono font-extrabold tracking-tight text-foreground mb-8" style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}>
            Import the component. Wire the hook. Done.
          </h2>
          <div className="text-left mb-8"><CodeBlock language="tsx" code={HERO_CODE} lineNumbers /></div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/docs/getting-started"><Button variant="solid" size="lg">Read the docs →</Button></Link>
            <Link href="/docs/ai-chat"><Button variant="outline" size="lg">Try the live chat demo</Button></Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Badge color="success">0 dependencies</Badge>
            <Badge variant="outline">MIT</Badge>
            <Badge variant="outline">React 18+</Badge>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-fg font-mono">
          <p>Built by <span className="text-foreground font-bold">skeehn</span>. MIT License.</p>
          <div className="flex items-center gap-6 text-xs uppercase tracking-[0.15em]">
            <a href="https://github.com/skeehn/skeehn" className="hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.npmjs.com/org/skeehn" className="hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">npm</a>
            <Link href="/docs" className="hover:text-accent transition-colors">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ShowcaseCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg bg-surface p-5">
      <p className="text-[0.65rem] uppercase tracking-[0.2em] font-mono text-muted-fg mb-4">{label}</p>
      {children}
    </div>
  );
}
