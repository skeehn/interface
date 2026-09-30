import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@skeehn/react";

export const metadata: Metadata = {
  title: "Usage",
  description:
    "Render skeehn components, stream chat with the AI SDK or the built-in hooks, theme with a single attribute, and drop in whole-interface blocks.",
};

const BASIC = `import { ChatBubble, ToolCard } from "@skeehn/react";

export function Demo() {
  return (
    <>
      <ChatBubble role="user">Summarize this thread.</ChatBubble>
      <ChatBubble role="assistant">Three decisions, two open questions.</ChatBubble>
      <ToolCard name="search" status="success">3 results</ToolCard>
    </>
  );
}`;

const AISDK = `"use client";
import { useChat } from "@ai-sdk/react";
import { Conversation } from "@skeehn/react/ai";

export function Chat() {
  const { messages } = useChat();           // AI SDK v5
  return <Conversation messages={messages} />; // parts → skeehn, mapped for you
}`;

const NATIVE = `"use client";
import { useChat } from "@skeehn/react/hooks"; // zero-dep, parts-based
import { Conversation } from "@skeehn/react/ai";

export function Chat() {
  const { messages, sendMessage, status, submitApproval } = useChat({ api: "/api/chat" });
  return <Conversation messages={messages} />; // text · reasoning · tools · sources
}`;

const BLOCK = `import { ChatConsole } from "@skeehn/react/blocks";

<ChatConsole
  messages={messages}
  busy={status === "streaming"}
  onSend={(text) => sendMessage({ text })}
/>;`;

const THEME = `<div data-theme="terminal">{/* this subtree is green-phosphor CRT */}</div>`;

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <p className="docs-label mb-2">{label}</p>
      <h2 className="docs-heading text-xl sm:text-2xl tracking-tight mb-3">{title}</h2>
      <div className="text-[0.95rem] text-muted-fg leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function UsagePage() {
  return (
    <div className="max-w-3xl">
      <p className="docs-label mb-3">Getting started</p>
      <h1 className="docs-heading text-3xl sm:text-4xl tracking-tight mb-4">Usage</h1>
      <p className="text-lg text-muted-fg leading-relaxed mb-10">
        After <Link className="text-accent hover:underline" href="/docs/installation">installing</Link>, import
        components and render them. Stream chat with the AI SDK or the built-in hooks, theme any subtree with one
        attribute, and reach for blocks when you want a whole surface.
      </p>

      <Section label="Render" title="Components">
        <div data-theme="default"><CodeBlock language="tsx" code={BASIC} /></div>
      </Section>

      <Section label="Stream" title="With the AI SDK (recommended)">
        <p>skeehn renders <code className="sk-code-inline">@ai-sdk/react</code> messages directly — text, reasoning, tool calls and sources are mapped to the right components.</p>
        <div data-theme="default"><CodeBlock language="tsx" code={AISDK} /></div>
        <p>Prefer zero dependencies? The built-in hook works too:</p>
        <div data-theme="default"><CodeBlock language="tsx" code={NATIVE} /></div>
      </Section>

      <Section label="Compose" title="Blocks — whole interfaces">
        <p>Drop-in surfaces from <code className="sk-code-inline">@skeehn/react/blocks</code>: <code className="sk-code-inline">ChatConsole</code>, <code className="sk-code-inline">AgentConsole</code>, <code className="sk-code-inline">VoiceConsole</code>, <code className="sk-code-inline">HeroSection</code>.</p>
        <div data-theme="default"><CodeBlock language="tsx" code={BLOCK} /></div>
      </Section>

      <Section label="Theme" title="Re-skin any subtree">
        <p>Every component reads one token contract. Change <code className="sk-code-inline">data-theme</code> on any ancestor and the whole subtree re-skins — no rewrites.</p>
        <div data-theme="default"><CodeBlock language="tsx" code={THEME} /></div>
      </Section>

      <p className="text-sm text-muted-fg mt-10 pt-6 border-t border-border">
        Next: <Link className="text-accent hover:underline" href="/docs/components">Browse components</Link> ·{" "}
        <Link className="text-accent hover:underline" href="/docs/blocks">Blocks</Link> ·{" "}
        <Link className="text-accent hover:underline" href="/docs/frameworks">Use anywhere</Link>
      </p>
    </div>
  );
}
