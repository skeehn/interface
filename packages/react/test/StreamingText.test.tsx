import { describe, test, expect } from "bun:test";
import { StreamingText } from "../src/components/StreamingText";
import { renderC } from "./harness";

const CARETS = ["block", "line"] as const;
const EFFECTS = ["scanline", "wave", "fade"] as const;

describe("StreamingText", () => {
  test("mounts as a div with base class and renders children", () => {
    const { root } = renderC(<StreamingText>streaming…</StreamingText>);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-streaming-text");
    expect(root).toHaveTextContent("streaming…");
  });

  test("root always has aria-live=polite", () => {
    const { root } = renderC(<StreamingText>x</StreamingText>);
    expect(root).toHaveAttribute("aria-live", "polite");
  });

  test.each(CARETS)("caret=%s sets data-caret and aria-busy=true", (c) => {
    const { root } = renderC(<StreamingText caret={c}>x</StreamingText>);
    expect(root).toHaveAttribute("data-caret", c);
    expect(root).toHaveAttribute("aria-busy", "true");
  });

  test("no caret prop -> no data-caret and no aria-busy", () => {
    const { root } = renderC(<StreamingText>x</StreamingText>);
    expect(root).not.toHaveAttribute("data-caret");
    expect(root).not.toHaveAttribute("aria-busy");
  });

  test("caret={false} -> no data-caret and no aria-busy", () => {
    const { root } = renderC(<StreamingText caret={false}>x</StreamingText>);
    expect(root).not.toHaveAttribute("data-caret");
    expect(root).not.toHaveAttribute("aria-busy");
  });

  test("deprecated cursor=true resolves data-caret=block + aria-busy", () => {
    const { root } = renderC(<StreamingText cursor>x</StreamingText>);
    expect(root).toHaveAttribute("data-caret", "block");
    expect(root).toHaveAttribute("aria-busy", "true");
  });

  test("cursor=false alone leaves caret unset", () => {
    const { root } = renderC(<StreamingText cursor={false}>x</StreamingText>);
    expect(root).not.toHaveAttribute("data-caret");
    expect(root).not.toHaveAttribute("aria-busy");
  });

  test("caret prop wins over deprecated cursor", () => {
    const { root } = renderC(
      <StreamingText caret="line" cursor>
        x
      </StreamingText>,
    );
    expect(root).toHaveAttribute("data-caret", "line");
  });

  test("caret={false} overrides cursor=true (resolves to undefined)", () => {
    const { root } = renderC(
      <StreamingText caret={false} cursor>
        x
      </StreamingText>,
    );
    expect(root).not.toHaveAttribute("data-caret");
    expect(root).not.toHaveAttribute("aria-busy");
  });

  test.each(EFFECTS)("effect=%s sets data-effect", (e) => {
    const { root } = renderC(<StreamingText effect={e}>x</StreamingText>);
    expect(root).toHaveAttribute("data-effect", e);
  });

  test("omits data-effect when no effect", () => {
    const { root } = renderC(<StreamingText>x</StreamingText>);
    expect(root).not.toHaveAttribute("data-effect");
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<StreamingText className="extra">x</StreamingText>);
    expect(root).toHaveClass("sk-streaming-text");
    expect(root).toHaveClass("extra");
  });
});
