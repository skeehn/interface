"use client";

import { CodeBlock } from "@skeehn/react";
import { Conversation } from "@skeehn/react/ai";
import type { UIMessage } from "@skeehn/react/ai";

/* A realistic AI SDK v5 transcript — text, reasoning, a tool call, and a source. */
const TRANSCRIPT: UIMessage[] = [
  { id: "u1", role: "user", parts: [{ type: "text", text: "What's the weather in Paris right now — and cite a source?" }] },
  {
    id: "a1",
    role: "assistant",
    parts: [
      { type: "reasoning", text: "The user wants the current conditions plus a citation. I'll call the weather tool, then ground the answer in a source.", state: "done" },
      { type: "tool-getWeather", toolCallId: "c1", state: "output-available", input: { city: "Paris", units: "metric" }, output: { tempC: 18, condition: "Partly cloudy", humidity: 0.62 } },
      { type: "text", text: "It's 18°C and partly cloudy in Paris right now, with humidity around 62%.", state: "done" },
      { type: "source-url", url: "https://weather.example.com/paris", title: "Paris — current conditions" },
    ],
  },
];

const WIRE_CODE = `'use client';
import { useChat } from '@ai-sdk/react';
import { Conversation } from '@skeehn/react/ai';
import '@skeehn/core/engine.css';

export function Chat() {
  const { messages, sendMessage } = useChat();
  // skeehn maps every UIMessage.part to the right component for you:
  return <Conversation messages={messages} />;
}`;

const SERVER_CODE = `// app/api/chat/route.ts
import { streamText, convertToModelMessages } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: 'anthropic/claude-sonnet-4-6',   // via the AI Gateway
    messages: convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();   // emits UIMessage parts
}`;

const MAPPING: [string, string][] = [
  ["text", "ChatBubble (Markdown for assistant prose)"],
  ["reasoning", "ThinkingBlock"],
  ["tool-* / dynamic-tool", "ToolCard (input · output · error)"],
  ["tool · awaiting-approval", "ToolApproval — human-in-the-loop gate"],
  ["source-url / source-document", "CitationCard"],
  ["file (image/*)", "<img> · otherwise FileAttachment"],
  ["step-start", "Divider between steps"],
  ["data-*", "your renderData() override"],
];

export default function AiSdkPage() {
  return (
    <div className="max-w-3xl">
      <p className="docs-label mb-3">Interop</p>
      <h1 className="docs-heading text-3xl sm:text-4xl tracking-tight mb-4">A drop-in for the AI SDK</h1>
      <p className="text-lg text-muted-fg leading-relaxed mb-6">
        skeehn renders <code className="sk-code-inline">@ai-sdk/react</code>&rsquo;s{" "}
        <code className="sk-code-inline">useChat().messages</code> out of the box. Pass them to{" "}
        <code className="sk-code-inline">&lt;Conversation&gt;</code> and every{" "}
        <code className="sk-code-inline">UIMessage</code> part — text, reasoning, tool calls, sources,
        files — maps to the right skeehn component. No glue code, and{" "}
        <strong className="text-foreground font-medium">zero hard dependency on <code className="sk-code-inline">ai</code></strong>:
        the types are structural, so your bundle stays clean and the native zero-dep path still works.
      </p>

      {/* Live demo */}
      <p className="docs-label mb-3">Live — rendered from a real UIMessage[] transcript</p>
      <div className="rounded-xl border border-border overflow-hidden mb-10" style={{ height: 440 }}>
        <Conversation messages={TRANSCRIPT} />
      </div>

      {/* Client wiring */}
      <h2 className="docs-heading text-xl tracking-tight mb-3">Your component</h2>
      <p className="text-muted-fg leading-relaxed mb-4">
        Wire <code className="sk-code-inline">useChat</code> to your endpoint and hand the messages to{" "}
        <code className="sk-code-inline">&lt;Conversation&gt;</code>. It autoscrolls while streaming and
        shows a &ldquo;jump to latest&rdquo; affordance when you scroll up.
      </p>
      <div className="mb-8" data-theme="default"><CodeBlock language="tsx" code={WIRE_CODE} lineNumbers /></div>

      <h2 className="docs-heading text-xl tracking-tight mb-3">Your route handler</h2>
      <p className="text-muted-fg leading-relaxed mb-4">
        Standard AI SDK v5 — stream a model and return a UIMessage stream. skeehn renders whatever it emits.
      </p>
      <div className="mb-10" data-theme="default"><CodeBlock language="ts" code={SERVER_CODE} lineNumbers /></div>

      {/* Mapping */}
      <h2 className="docs-heading text-xl tracking-tight mb-4">How parts map to components</h2>
      <div className="rounded-xl border border-border overflow-hidden mb-10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left font-medium text-foreground px-4 py-2.5">UIMessage part</th>
              <th className="text-left font-medium text-foreground px-4 py-2.5">skeehn component</th>
            </tr>
          </thead>
          <tbody>
            {MAPPING.map(([part, comp]) => (
              <tr key={part} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-mono text-[0.8rem] text-accent align-top">{part}</td>
                <td className="px-4 py-2.5 text-muted-fg">{comp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customise */}
      <h2 className="docs-heading text-xl tracking-tight mb-3">Customize any part</h2>
      <p className="text-muted-fg leading-relaxed mb-4">
        Override a part type, or plug in your markdown renderer (react-markdown, streamdown) — everything
        else keeps skeehn&rsquo;s defaults.
      </p>
      <div className="mb-10" data-theme="default">
        <CodeBlock
          language="tsx"
          code={`<Conversation
  messages={messages}
  renderMarkdown={(text) => <Streamdown>{text}</Streamdown>}
  components={{
    tool: (part) => <MyToolCard part={part} />,
  }}
/>`}
        />
      </div>

      <h2 className="docs-heading text-xl tracking-tight mb-3">Composed primitives</h2>
      <p className="text-muted-fg leading-relaxed mb-2">
        Build your own surface from the same parts:{" "}
        <code className="sk-code-inline">&lt;Message&gt;</code>,{" "}
        <code className="sk-code-inline">&lt;MessageActions&gt;</code> (copy · regenerate · edit · feedback),{" "}
        <code className="sk-code-inline">&lt;Sources&gt;</code>,{" "}
        <code className="sk-code-inline">&lt;ModelPicker&gt;</code>, and{" "}
        <code className="sk-code-inline">&lt;ScrollToBottomButton&gt;</code> — all token-themed across every skeehn theme.
      </p>
    </div>
  );
}
