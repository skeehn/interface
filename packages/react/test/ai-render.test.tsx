import { describe, test, expect } from "bun:test";
import { Message } from "../src/ai/Message";
import { Conversation } from "../src/ai/Conversation";
import type { UIMessage } from "../src/ai/types";
import { renderC } from "./harness";

/**
 * A v5-shaped assistant message exercising every part type. If a real
 * `@ai-sdk/react` UIMessage weren't structurally assignable to our `UIMessage`,
 * this literal would not type-check — so this doubles as a compatibility guard.
 */
const assistantMsg: UIMessage = {
  id: "m1",
  role: "assistant",
  parts: [
    { type: "step-start" },
    { type: "reasoning", text: "The user wants the weather.", state: "done" },
    { type: "text", text: "It is sunny in Paris.", state: "done" },
    {
      type: "tool-getWeather",
      toolCallId: "call_1",
      state: "output-available",
      input: { city: "Paris" },
      output: { temp: 24, sky: "Sunny" },
    },
    { type: "source-url", url: "https://weather.example.com/paris", title: "Weather · Paris" },
    { type: "file", mediaType: "image/png", url: "https://img.example.com/p.png", filename: "p.png" },
  ],
};

describe("ai/renderParts mapping", () => {
  test("assistant message maps every part to a skeehn component", () => {
    const { container, root } = renderC(<Message message={assistantMsg} />);
    expect(root).toHaveClass("sk-ai-message");
    expect(root.getAttribute("data-role")).toBe("assistant");

    // text → ChatBubble
    const text = container.querySelector('[data-part="text"]');
    expect(text).not.toBeNull();
    expect(text).toHaveTextContent("It is sunny in Paris.");
    expect(text!.querySelector(".sk-chat-bubble")).not.toBeNull();

    // reasoning → ThinkingBlock
    expect(container.querySelector('[data-part="reasoning"]')).not.toBeNull();

    // tool-getWeather → ToolCard with name + output
    const tool = container.querySelector('[data-part="tool-getWeather"]');
    expect(tool).not.toBeNull();
    expect(tool).toHaveTextContent("getWeather");
    expect(tool).toHaveTextContent("Sunny");
    expect(tool!.querySelector(".sk-tool-card")).not.toBeNull();

    // source-url → CitationCard
    const src = container.querySelector('[data-part="source-url"]');
    expect(src).not.toBeNull();
    expect(src).toHaveTextContent("Weather · Paris");

    // file image → <img>
    const img = container.querySelector("img.sk-ai-image") as HTMLImageElement | null;
    expect(img).not.toBeNull();
    expect(img!.getAttribute("src")).toBe("https://img.example.com/p.png");

    // step-start at index 0 renders nothing
    expect(container.querySelector('[data-part="step-start"]')).toBeNull();
  });

  test("user text renders in a user bubble (no Markdown wrapper)", () => {
    const msg: UIMessage = { role: "user", parts: [{ type: "text", text: "hello there" }] };
    const { root, container } = renderC(<Message message={msg} />);
    expect(root.getAttribute("data-role")).toBe("user");
    const bubble = container.querySelector(".sk-chat-bubble");
    expect(bubble).not.toBeNull();
    expect(bubble).toHaveTextContent("hello there");
    expect(container.querySelector(".sk-markdown")).toBeNull();
  });

  test("tool error surfaces errorText", () => {
    const msg: UIMessage = {
      role: "assistant",
      parts: [
        {
          type: "tool-search",
          state: "output-error",
          input: { q: "x" },
          errorText: "rate limited",
        },
      ],
    };
    const { container } = renderC(<Message message={msg} />);
    expect(container.querySelector(".sk-ai-tool-error")).not.toBeNull();
    expect(container).toHaveTextContent("rate limited");
  });

  test("components.tool override replaces the default ToolCard", () => {
    const msg: UIMessage = {
      role: "assistant",
      parts: [{ type: "tool-foo", state: "output-available", output: 1 }],
    };
    const { container } = renderC(
      <Message message={msg} components={{ tool: () => <div className="custom-tool" /> }} />,
    );
    expect(container.querySelector(".custom-tool")).not.toBeNull();
    expect(container.querySelector(".sk-tool-card")).toBeNull();
  });

  test("renderMarkdown transforms assistant text", () => {
    const msg: UIMessage = { role: "assistant", parts: [{ type: "text", text: "hi" }] };
    const { container } = renderC(
      <Message message={msg} renderMarkdown={(t) => <strong className="md-out">{t.toUpperCase()}</strong>} />,
    );
    const out = container.querySelector(".md-out");
    expect(out).not.toBeNull();
    expect(out).toHaveTextContent("HI");
  });
});

describe("ai/Conversation", () => {
  test("renders one .sk-ai-message per message", () => {
    const messages: UIMessage[] = [
      { id: "a", role: "user", parts: [{ type: "text", text: "q" }] },
      { id: "b", role: "assistant", parts: [{ type: "text", text: "a" }] },
    ];
    const { container, root } = renderC(<Conversation messages={messages} />);
    expect(root).toHaveClass("sk-ai-conversation");
    expect(container.querySelectorAll(".sk-ai-message").length).toBe(2);
    expect(container.querySelector(".sk-ai-conversation__scroll")).not.toBeNull();
  });
});
