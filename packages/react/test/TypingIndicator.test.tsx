import { describe, test, expect } from "bun:test";
import { TypingIndicator } from "../src/components/TypingIndicator";
import { renderC } from "./harness";

const VARIANTS = ["ascii", "dither"] as const;

describe("TypingIndicator", () => {
  test("mounts as a div with base class", () => {
    const { root } = renderC(<TypingIndicator />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-typing-indicator");
  });

  test("renders three dots inside the dots container", () => {
    const { root } = renderC(<TypingIndicator />);
    const dots = root.querySelector(".sk-typing-indicator__dots");
    expect(dots).not.toBeNull();
    expect(root.querySelectorAll(".sk-typing-indicator__dot").length).toBe(3);
  });

  test.each(VARIANTS)("variant=%s sets data-variant", (v) => {
    const { root } = renderC(<TypingIndicator variant={v} />);
    expect(root).toHaveAttribute("data-variant", v);
  });

  test("omits data-variant when not provided", () => {
    const { root } = renderC(<TypingIndicator />);
    expect(root).not.toHaveAttribute("data-variant");
  });

  test("size=compact sets data-size", () => {
    const { root } = renderC(<TypingIndicator size="compact" />);
    expect(root).toHaveAttribute("data-size", "compact");
  });

  test("omits data-size when not provided", () => {
    const { root } = renderC(<TypingIndicator />);
    expect(root).not.toHaveAttribute("data-size");
  });

  test("renders text label in the text element when provided", () => {
    const { root, getByText } = renderC(<TypingIndicator text="typing..." />);
    expect(root.querySelector(".sk-typing-indicator__text")).not.toBeNull();
    expect(getByText("typing...")).toHaveClass("sk-typing-indicator__text");
  });

  test("omits the text element when no text", () => {
    const { root } = renderC(<TypingIndicator />);
    expect(root.querySelector(".sk-typing-indicator__text")).toBeNull();
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<TypingIndicator className="extra" />);
    expect(root).toHaveClass("sk-typing-indicator");
    expect(root).toHaveClass("extra");
  });

  // The component sets no role of its own; verify role="status" passes through
  // via the spread HTML attributes so callers can announce it to AT.
  test("forwards role and aria attributes", () => {
    const { root } = renderC(<TypingIndicator role="status" aria-label="Assistant is typing" />);
    expect(root).toHaveAttribute("role", "status");
    expect(root).toHaveAttribute("aria-label", "Assistant is typing");
  });
});
