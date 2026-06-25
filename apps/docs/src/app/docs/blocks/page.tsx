"use client";

import { useState, useCallback } from "react";
import { Button, CodeBlock } from "@skeehn/react";
import { ChatConsole, AgentConsole, VoiceConsole, HeroSection } from "@skeehn/react/blocks";
import type { UIMessage } from "@skeehn/react/ai";

let _id = 0;
const uid = () => `m${_id++}`;

const AGENT_RUN: UIMessage[] = [
  { id: "ar1", role: "user", parts: [{ type: "text", text: "Refactor parseTree to O(n)." }] },
  {
    id: "ar2",
    role: "assistant",
    parts: [
      { type: "reasoning", text: "Nested find() in the loop is O(n²). Hoist the lookup into a Map.", state: "done" },
      { type: "tool-search_codebase", toolCallId: "t1", state: "output-available", input: { query: "parseTree" }, output: { matches: 3, file: "src/parse/parseTree.ts" } },
      { type: "tool-apply_edit", toolCallId: "t2", state: "output-available", input: { file: "parseTree.ts" }, output: { applied: true, lines: 12 } },
      { type: "text", text: "Done — replaced the inner find() with a pre-built Map. One O(n) pass.", state: "done" },
    ],
  },
];

const VOICE_TRANSCRIPT = [
  { role: "user" as const, text: "What's on my calendar today?" },
  { role: "assistant" as const, text: "You have three meetings — the first is standup at 10." },
];

const CHAT_CONSOLE_CODE = `import { useChat } from '@ai-sdk/react';
import { ChatConsole } from '@skeehn/react/blocks';
import '@skeehn/core/styles.css';

export function Support() {
  const { messages, sendMessage, status } = useChat();
  return (
    <ChatConsole
      title="Support"
      messages={messages}
      busy={status === 'streaming'}
      onSend={(text) => sendMessage({ text })}
      models={['anthropic/claude-opus-4-8', 'anthropic/claude-sonnet-4-6']}
      suggestions={[
        { value: 'refund', text: 'How do I get a refund?' },
        { value: 'status', text: 'Where is my order?' },
      ]}
    />
  );
}`;

function ChatDemo() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [busy, setBusy] = useState(false);

  const onSend = useCallback((text: string) => {
    setMessages((m) => [...m, { id: uid(), role: "user", parts: [{ type: "text", text }] }]);
    setBusy(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: uid(), role: "assistant", parts: [{ type: "text", text: `Thanks — this is a local demo, but a real app would stream the model's reply here. You said: “${text}”.` }] },
      ]);
      setBusy(false);
    }, 650);
  }, []);

  return (
    <ChatConsole
      title="Support"
      messages={messages}
      busy={busy}
      onSend={onSend}
      models={["anthropic/claude-opus-4-8", "anthropic/claude-sonnet-4-6"]}
      suggestions={[
        { value: "refund", text: "How do I get a refund?" },
        { value: "status", text: "Where is my order?" },
        { value: "hours", text: "What are your support hours?" },
      ]}
    />
  );
}

export default function BlocksPage() {
  return (
    <div className="max-w-3xl">
      <p className="docs-label mb-3">Blocks</p>
      <h1 className="docs-heading text-3xl sm:text-4xl tracking-tight mb-4">Drop in a whole interface</h1>
      <p className="text-lg text-muted-fg leading-relaxed mb-10">
        Blocks are pre-composed, themeable surfaces built from skeehn primitives + the AI SDK layer.
        Import one, wire your data, and re-skin it with any theme — chat, agent, voice, and site.
        Available from <code className="sk-code-inline">@skeehn/react/blocks</code>.
      </p>

      {/* ChatConsole — interactive */}
      <h2 className="docs-heading text-xl tracking-tight mb-2">ChatConsole</h2>
      <p className="text-muted-fg leading-relaxed mb-4">
        Header + model picker, an autoscrolling conversation, an empty-state with prompt suggestions,
        and an input. Try it — type or pick a suggestion:
      </p>
      <div className="rounded-xl border border-border overflow-hidden mb-5" style={{ height: 460 }}>
        <ChatDemo />
      </div>
      <div className="mb-12" data-theme="default"><CodeBlock language="tsx" code={CHAT_CONSOLE_CODE} lineNumbers /></div>

      {/* AgentConsole */}
      <h2 className="docs-heading text-xl tracking-tight mb-2">AgentConsole</h2>
      <p className="text-muted-fg leading-relaxed mb-4">
        A run monitor: a live status pill, the current task, and the agent&rsquo;s reasoning + tool calls
        as they stream.
      </p>
      <div className="rounded-xl border border-border overflow-hidden mb-12" style={{ height: 420 }}>
        <AgentConsole status="acting" title="Builder" task="Refactor parseTree to O(n)" messages={AGENT_RUN} />
      </div>

      {/* VoiceConsole */}
      <h2 className="docs-heading text-xl tracking-tight mb-2">VoiceConsole</h2>
      <p className="text-muted-fg leading-relaxed mb-4">
        A framed voice surface — waveform, transcript, and mute/end controls.
      </p>
      <div className="rounded-xl border border-border overflow-hidden mb-12" style={{ maxWidth: 460 }}>
        <VoiceConsole
          title="Assistant"
          status="listening"
          clock="00:42"
          transcript={VOICE_TRANSCRIPT}
          onMute={() => {}}
          onEnd={() => {}}
          hint="Speak naturally — tap End to finish"
        />
      </div>

      {/* HeroSection */}
      <h2 className="docs-heading text-xl tracking-tight mb-2">HeroSection</h2>
      <p className="text-muted-fg leading-relaxed mb-4">
        Not just chat — skeehn builds sites too. A themeable landing hero from the core foundation.
      </p>
      <div className="rounded-xl border border-border overflow-hidden mb-10">
        <HeroSection
          eyebrow="Open source · MIT"
          title="Build it with skeehn"
          subtitle="The customizable UI foundation for AI products and the sites around them."
          actions={
            <>
              <Button variant="solid" size="lg">Get started</Button>
              <Button variant="outline" size="lg">Browse components</Button>
            </>
          }
        />
      </div>

      <p className="text-sm text-muted-fg">
        Every block re-themes with <code className="sk-code-inline">data-theme</code> — try switching the
        theme from the navbar and watch them transform.
      </p>
    </div>
  );
}
