import { describe, test, expect } from "bun:test";
import { ChatBubble, Message } from "../src/components/ChatBubble";
import { renderC } from "./harness";

const ROLES = ["user", "assistant", "tool", "system"] as const;

describe("ChatBubble", () => {
  test("mounts as a div with base class and renders children", () => {
    const { root, getByText } = renderC(<ChatBubble role="user">Hello</ChatBubble>);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-chat-bubble");
    expect(getByText("Hello")).toHaveClass("sk-chat-bubble__content");
  });

  test.each(ROLES)("role=%s sets data-role", (r) => {
    const { root } = renderC(<ChatBubble role={r}>x</ChatBubble>);
    expect(root).toHaveAttribute("data-role", r);
  });

  test("streaming sets data-streaming, aria-live=polite, aria-busy=true", () => {
    const { root } = renderC(
      <ChatBubble role="assistant" streaming>
        x
      </ChatBubble>,
    );
    expect(root).toHaveAttribute("data-streaming", "true");
    expect(root).toHaveAttribute("aria-live", "polite");
    expect(root).toHaveAttribute("aria-busy", "true");
  });

  test("omits streaming/live/busy attributes when not streaming", () => {
    const { root } = renderC(<ChatBubble role="assistant">x</ChatBubble>);
    expect(root).not.toHaveAttribute("data-streaming");
    expect(root).not.toHaveAttribute("aria-live");
    expect(root).not.toHaveAttribute("aria-busy");
  });

  test("streaming={false} behaves like not streaming", () => {
    const { root } = renderC(
      <ChatBubble role="assistant" streaming={false}>
        x
      </ChatBubble>,
    );
    expect(root).not.toHaveAttribute("data-streaming");
    expect(root).not.toHaveAttribute("aria-live");
    expect(root).not.toHaveAttribute("aria-busy");
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(
      <ChatBubble role="user" className="extra">
        x
      </ChatBubble>,
    );
    expect(root).toHaveClass("sk-chat-bubble");
    expect(root).toHaveClass("extra");
  });

  test("forwards arbitrary html attributes via spread", () => {
    const { root } = renderC(
      <ChatBubble role="user" data-testid="bubble" id="b1">
        x
      </ChatBubble>,
    );
    expect(root).toHaveAttribute("data-testid", "bubble");
    expect(root).toHaveAttribute("id", "b1");
  });

  test("Message is an alias for ChatBubble", () => {
    expect(Message).toBe(ChatBubble);
    const { root } = renderC(<Message role="assistant">y</Message>);
    expect(root).toHaveClass("sk-chat-bubble");
    expect(root).toHaveAttribute("data-role", "assistant");
  });
});
