import { describe, test, expect } from "bun:test";
import type { ReactElement } from "react";
import axe from "axe-core";
import { render } from "@testing-library/react";

import { Button } from "../src/components/Button";
import { Input } from "../src/components/Input";
import { Badge } from "../src/components/Badge";
import { Alert } from "../src/components/Alert";
import { Toggle } from "../src/components/Toggle";
import { Progress } from "../src/components/Progress";
import { Avatar } from "../src/components/Avatar";
import { Tabs } from "../src/components/Tabs";
import { Accordion } from "../src/components/Accordion";
import { ChatBubble } from "../src/components/ChatBubble";
import { ChatInput } from "../src/components/ChatInput";
import { ToolCard } from "../src/components/ToolCard";
import { CitationCard } from "../src/components/CitationCard";
import { AgentStatus } from "../src/components/AgentStatus";
import { TypingIndicator } from "../src/components/TypingIndicator";
import { StreamingText } from "../src/components/StreamingText";
import { MessageActions } from "../src/components/MessageActions";
import { Sources } from "../src/components/Sources";
import { ModelPicker } from "../src/components/ModelPicker";
import { ScrollToBottomButton } from "../src/components/ScrollToBottom";
import { ChatConsole } from "../src/blocks/ChatConsole";
import { AgentConsole } from "../src/blocks/AgentConsole";
import { VoiceConsole } from "../src/blocks/VoiceConsole";
import { HeroSection } from "../src/blocks/HeroSection";
import type { UIMessage } from "../src/ai/types";

// CSS isn't applied in the test DOM, so color-contrast isn't meaningful here;
// landmark/document-level rules don't apply to mounted component fragments.
// Everything else (names, roles, labels, aria) is enforced.
const AXE_OPTS = {
  rules: {
    "color-contrast": { enabled: false },
    region: { enabled: false },
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
    "document-title": { enabled: false },
    "html-has-lang": { enabled: false },
    bypass: { enabled: false },
  },
} as const;

async function violations(ui: ReactElement) {
  const { container, unmount } = render(ui);
  const results = await axe.run(container as unknown as Element, AXE_OPTS as never);
  unmount();
  return results.violations.map((v) => `${v.id} (${v.nodes.length})`);
}

const MSGS: UIMessage[] = [
  { id: "u", role: "user", parts: [{ type: "text", text: "hi" }] },
  { id: "a", role: "assistant", parts: [{ type: "text", text: "hello" }] },
];

const CASES: [string, ReactElement][] = [
  ["Button", <Button>Go</Button>],
  ["Button icon-only", <Button aria-label="Close">×</Button>],
  ["Input", <Input aria-label="Your name" placeholder="Name" />],
  ["Badge", <Badge color="success">ok</Badge>],
  ["Alert", <Alert type="info">Heads up</Alert>],
  ["Toggle", <Toggle aria-label="Dark mode" />],
  ["Progress", <Progress value={40} aria-label="Loading" />],
  ["Avatar", <Avatar alt="Ada Lovelace" />],
  ["Tabs", <Tabs tabs={[{ value: "a", label: "A", content: "x" }, { value: "b", label: "B", content: "y" }]} />],
  ["Accordion", <Accordion items={[{ value: "1", label: "Q", content: "A" }]} />],
  ["ChatBubble", <ChatBubble role="assistant">Hello there</ChatBubble>],
  ["ChatInput", <ChatInput placeholder="Message" onSubmit={() => {}} />],
  ["ToolCard", <ToolCard name="search" status="success">3 results</ToolCard>],
  ["CitationCard", <CitationCard source="Paper" href="https://x.example.com" />],
  ["AgentStatus", <AgentStatus status="thinking" />],
  ["TypingIndicator", <TypingIndicator />],
  ["StreamingText", <StreamingText>streaming…</StreamingText>],
  ["MessageActions", <MessageActions content="copy me" onRegenerate={() => {}} />],
  ["Sources", <Sources sources={[{ source: "A", href: "https://a.example.com" }]} />],
  ["ModelPicker", <ModelPicker models={["gpt-4o", "o3"]} value="gpt-4o" label="Model" />],
  ["ScrollToBottomButton", <ScrollToBottomButton />],
  ["ChatConsole", <ChatConsole messages={MSGS} onSend={() => {}} title="Chat" />],
  ["AgentConsole", <AgentConsole status="acting" messages={MSGS} title="Agent" />],
  ["VoiceConsole", <VoiceConsole title="Voice" status="listening" onMute={() => {}} onEnd={() => {}} />],
  ["HeroSection", <HeroSection title="Build it" subtitle="x" actions={<Button>Start</Button>} />],
];

describe("a11y (axe-core, structural)", () => {
  for (const [name, ui] of CASES) {
    test(name, async () => {
      const v = await violations(ui);
      if (v.length) console.error(`  ✗ ${name}: ${v.join(", ")}`);
      expect(v).toEqual([]);
    });
  }
});
