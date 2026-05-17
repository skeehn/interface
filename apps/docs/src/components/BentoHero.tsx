"use client";

/* ─────────────────────────────────────────────────────────────────────
 * BentoHero — live component dock for the marketing home.
 *
 * 12-cell asymmetric grid on lg+ (single column on mobile). Each cell
 * runs an actual skeehn component in a real state, not a screenshot.
 * The whole block is wrapped in [data-theme="dark"] so the component
 * tokens resolve to dark surfaces and pair cleanly with the marketing
 * page chrome (which is hardcoded bg-black for unrelated reasons).
 *
 * Live animations are driven by setInterval + a single shared "tick"
 * so we don't burn 8 separate timers — one timer, derive state from it.
 * ─────────────────────────────────────────────────────────────────── */

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  ChatBubble,
  AgentStatus,
  Progress,
  ToolCard,
  TypingIndicator,
  type AgentStatusValue,
  type ToolCardStatus,
} from "@skeehn/react";
import { DitherWebGL } from "@skeehn/react/gl";

const META =
  "font-mono text-[10px] uppercase tracking-[0.18em] text-white/45";

const CHAT_SCRIPT = [
  { role: "user" as const, text: "Help me ship a dithered hero." },
  {
    role: "assistant" as const,
    text: "Drop DitherWebGL into a Card, set mask=\"radial\", give it some whitespace.",
  },
  { role: "user" as const, text: "Make it animate." },
  {
    role: "assistant" as const,
    text: "Add animate + speed={1.2}. Sixty fps on the GPU.",
  },
] as const;

const TOOL_STATES: { status: ToolCardStatus; label: string }[] = [
  { status: "pending", label: "queued" },
  { status: "running", label: "running 02s" },
  { status: "success", label: "ok · 04s" },
];

const AGENT_STATES: AgentStatusValue[] = ["idle", "thinking", "acting", "done"];

export function BentoHero() {
  // One central tick (per 1.4s) feeds every cell — keeps perf flat.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1400);
    return () => clearInterval(id);
  }, []);

  // Derive cell states from tick.
  const chatStep = tick % (CHAT_SCRIPT.length + 1);
  const toolStep = (tick + 1) % TOOL_STATES.length;
  const agentStep = tick % AGENT_STATES.length;
  const progressVal = useMemo(() => {
    const v = ((tick * 17) % 100);
    return v < 5 ? 5 : v;
  }, [tick]);

  // The streaming bubble fakes token-by-token by walking the string.
  // Picks the current assistant message in the script and reveals it
  // proportionally to where we are in this tick.
  const lastAssistant = CHAT_SCRIPT.slice(0, chatStep + 1)
    .reverse()
    .find((m) => m.role === "assistant");
  const isStreaming = chatStep > 0 && chatStep <= CHAT_SCRIPT.length;

  return (
    <section
      data-theme="dark"
      className="sk-bento-wrap relative"
      aria-label="Live component dock"
    >
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-6 px-6 lg:px-10">
        <div>
          <span className={META}>The library, live</span>
          <h2 className="mt-2 font-mono font-medium text-3xl md:text-4xl text-white leading-[1] tracking-tight">
            Every component, running.
          </h2>
        </div>
        <span className={`${META} hidden md:inline`}>
          12 cells · always on
        </span>
      </div>

      <div className="sk-bento px-6 lg:px-10">
        {/* ──────────── LARGE: ChatBubble streaming script ──────────── */}
        <div className="sk-bento-cell sk-bento-cell--xl">
          <CellHeader label="ChatBubble · streaming" tag="AI" />
          <div className="flex flex-col gap-3 px-4 pb-4 pt-2 min-h-[260px]">
            {CHAT_SCRIPT.slice(0, chatStep + 1).map((m, i) => {
              const isLast = i === chatStep;
              const showStreaming = isLast && isStreaming && m.role === "assistant";
              const text = showStreaming
                ? m.text.slice(0, Math.min(m.text.length, ((tick * 7) % m.text.length) + 6))
                : m.text;
              return (
                <ChatBubble key={i} role={m.role} streaming={showStreaming}>
                  {text}
                </ChatBubble>
              );
            })}
            {chatStep < CHAT_SCRIPT.length && (
              <div className="pl-2 pt-1">
                <TypingIndicator />
              </div>
            )}
          </div>
        </div>

        {/* ──────────── MEDIUM: DitherWebGL inside a Card with mask=radial ──────────── */}
        <div className="sk-bento-cell sk-bento-cell--md-r1">
          <CellHeader label="DitherWebGL · mask=radial" tag="GL" />
          <div className="relative aspect-[2/1.1] overflow-hidden">
            <DitherWebGL
              algorithm="bayer"
              matrix={8}
              cellSize={2}
              threshold={0.5}
              palette={["#0a0612", "#5a1e8a", "#d4a02a", "#1e7a4e"]}
              gradient={{
                type: "linear",
                angle: 200,
                stops: [
                  { pos: 0, color: "#150829" },
                  { pos: 0.5, color: "#3a1268" },
                  { pos: 1, color: "#d4a02a" },
                ],
              }}
              animate
              speed={0.8}
              mask="radial"
              maskFade={0.45}
              style={{ position: "absolute", inset: 0, background: "transparent" }}
            />
            <div className="absolute inset-0 flex items-end p-4 pointer-events-none">
              <span className="font-mono text-xs text-white/85">
                Halftoned · faded edges · 60 fps
              </span>
            </div>
          </div>
        </div>

        {/* ──────────── MEDIUM: ToolCard cycling status ──────────── */}
        <div className="sk-bento-cell sk-bento-cell--md-r2">
          <CellHeader label="ToolCard · live status" tag="AI" />
          <div className="p-4">
            <ToolCard
              name="search_docs"
              status={TOOL_STATES[toolStep].status}
              statusLabel={TOOL_STATES[toolStep].label}
            >
              <pre className="font-mono text-xs text-white/55 whitespace-pre-wrap">
                {TOOL_STATES[toolStep].status === "success"
                  ? '{ "matches": 12, "top": "DitherWebGL.tsx" }'
                  : TOOL_STATES[toolStep].status === "running"
                    ? "// scanning packages/react/src ..."
                    : "// awaiting agent..."}
              </pre>
            </ToolCard>
          </div>
        </div>

        {/* ──────────── SMALL: Button variants ──────────── */}
        <div className="sk-bento-cell sk-bento-cell--sm">
          <CellHeader label="Button · variants" tag="UI" />
          <div className="grid grid-cols-2 gap-2 p-4">
            <Button variant="default" size="sm">Primary</Button>
            <Button variant="outline" size="sm">Outline</Button>
            <Button variant="ghost" size="sm">Ghost</Button>
            <Button variant="default" size="sm" loading>Loading</Button>
          </div>
        </div>

        {/* ──────────── SMALL: Progress + value ──────────── */}
        <div className="sk-bento-cell sk-bento-cell--sm">
          <CellHeader label="Progress · value" tag="UI" />
          <div className="flex flex-col gap-3 p-4 justify-center min-h-[110px]">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-xs text-white/65">indexing</span>
              <span className="font-mono text-xs text-white">{Math.round(progressVal)}%</span>
            </div>
            <Progress value={progressVal} />
          </div>
        </div>

        {/* ──────────── SMALL: Badge variants ──────────── */}
        <div className="sk-bento-cell sk-bento-cell--sm">
          <CellHeader label="Badge · semantics" tag="UI" />
          <div className="flex flex-wrap gap-2 p-4">
            <Badge>default</Badge>
            <Badge color="green">success</Badge>
            <Badge color="amber">pending</Badge>
            <Badge color="red">error</Badge>
            <Badge variant="outline">ghost</Badge>
            <Badge color="blue">info</Badge>
          </div>
        </div>

        {/* ──────────── SMALL: AgentStatus cycling ──────────── */}
        <div className="sk-bento-cell sk-bento-cell--sm">
          <CellHeader label="AgentStatus · cycle" tag="AI" />
          <div className="p-4 flex items-center min-h-[80px]">
            <AgentStatus status={AGENT_STATES[agentStep]} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CellHeader({ label, tag }: { label: string; tag: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
      <span className={META}>{label}</span>
      <span className="font-mono text-[10px] tracking-[0.18em] text-white/65 border border-white/20 px-1.5 py-0.5">
        {tag}
      </span>
    </div>
  );
}
