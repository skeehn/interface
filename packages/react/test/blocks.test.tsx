import { describe, test, expect, mock } from "bun:test";
import { ChatConsole } from "../src/blocks/ChatConsole";
import { AgentConsole } from "../src/blocks/AgentConsole";
import { VoiceConsole } from "../src/blocks/VoiceConsole";
import { HeroSection } from "../src/blocks/HeroSection";
import type { UIMessage } from "../src/ai/types";
import { renderC } from "./harness";

const MSGS: UIMessage[] = [
  { id: "u", role: "user", parts: [{ type: "text", text: "hi" }] },
  { id: "a", role: "assistant", parts: [{ type: "text", text: "hello" }] },
];

describe("ChatConsole", () => {
  test("frame: header title + input", () => {
    const { root, container } = renderC(<ChatConsole messages={MSGS} onSend={() => {}} title="Support" />);
    expect(root).toHaveClass("sk-chat-console");
    expect(container.querySelector(".sk-chat-console__title")).toHaveTextContent("Support");
    expect(container.querySelector(".sk-chat-input")).not.toBeNull();
  });

  test("renders the conversation when there are messages", () => {
    const { container } = renderC(<ChatConsole messages={MSGS} onSend={() => {}} />);
    expect(container.querySelector(".sk-ai-conversation")).not.toBeNull();
    expect(container.querySelectorAll(".sk-ai-message").length).toBe(2);
    expect(container.querySelector(".sk-chat-console__empty")).toBeNull();
  });

  test("empty state shows prompt suggestions; selecting one sends its text", async () => {
    const onSend = mock((_t: string) => {});
    const { container, user } = renderC(
      <ChatConsole messages={[]} onSend={onSend} suggestions={[{ value: "s1", text: "Draft a reply" }]} />,
    );
    expect(container.querySelector(".sk-chat-console__empty")).not.toBeNull();
    await user.click(container.querySelector(".sk-prompt-suggestions button, .sk-prompt-suggestion")!);
    expect(onSend).toHaveBeenCalledWith("Draft a reply");
  });

  test("model picker renders when models provided", () => {
    const { container } = renderC(
      <ChatConsole messages={MSGS} onSend={() => {}} models={["gpt-4o", "o3"]} model="gpt-4o" />,
    );
    expect(container.querySelector(".sk-model-picker")).not.toBeNull();
  });
});

describe("AgentConsole", () => {
  test("renders status + conversation; input only with onSend", () => {
    const { root, container, rerender } = renderC(
      <AgentConsole status="thinking" messages={MSGS} title="Builder" task="Ship the feature" />,
    );
    expect(root).toHaveClass("sk-agent-console");
    expect(container.querySelector(".sk-agent-console__title")).toHaveTextContent("Builder");
    expect(container.querySelector(".sk-agent-console__task")).toHaveTextContent("Ship the feature");
    expect(container.querySelector(".sk-agent-status")).not.toBeNull();
    expect(container.querySelector(".sk-ai-conversation")).not.toBeNull();
    expect(container.querySelector(".sk-agent-console__footer")).toBeNull();

    rerender(<AgentConsole status="acting" messages={MSGS} onSend={() => {}} />);
    expect(container.querySelector(".sk-agent-console__footer")).not.toBeNull();
  });
});

describe("VoiceConsole", () => {
  test("renders title, status label + voice session", () => {
    const { root, container } = renderC(<VoiceConsole title="Hotline" status="listening" hint="Tap to talk" />);
    expect(root).toHaveClass("sk-voice-console");
    expect(container.querySelector(".sk-voice-console__title")).toHaveTextContent("Hotline");
    expect(container.querySelector(".sk-voice-console__status")).toHaveTextContent("Listening");
    expect(container.querySelector(".sk-voice-session")).not.toBeNull();
    expect(container.querySelector(".sk-voice-console__hint")).toHaveTextContent("Tap to talk");
  });
});

describe("HeroSection", () => {
  test("renders eyebrow, title, subtitle, actions", () => {
    const { root, container } = renderC(
      <HeroSection
        eyebrow="Open source"
        title="Build it with skeehn"
        subtitle="A themeable foundation"
        actions={<button className="cta">Start</button>}
      />,
    );
    expect(root).toHaveClass("sk-hero");
    expect(container.querySelector(".sk-hero__eyebrow")).toHaveTextContent("Open source");
    expect(container.querySelector(".sk-hero__title")).toHaveTextContent("Build it with skeehn");
    expect(container.querySelector(".sk-hero__subtitle")).toHaveTextContent("A themeable foundation");
    expect(container.querySelector(".cta")).not.toBeNull();
  });

  test("align=center by default", () => {
    const { root } = renderC(<HeroSection title="x" />);
    expect(root.getAttribute("data-align")).toBe("center");
  });
});
