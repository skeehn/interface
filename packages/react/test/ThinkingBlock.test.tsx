import { describe, test, expect, mock } from "bun:test";
import { ThinkingBlock } from "../src/components/ThinkingBlock";
import { renderC } from "./harness";

const STATES = ["thinking", "done", "error"] as const;

describe("ThinkingBlock", () => {
  test("mounts as a div with base class and default label", () => {
    const { root, getByText } = renderC(<ThinkingBlock state="done">trace</ThinkingBlock>);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-thinking-block");
    expect(getByText("Thinking...")).toHaveClass("sk-thinking-block__label");
  });

  test("renders a custom label and meta", () => {
    const { getByText } = renderC(
      <ThinkingBlock state="done" label="Reasoning" meta="2.4s">
        trace
      </ThinkingBlock>,
    );
    expect(getByText("Reasoning")).toHaveClass("sk-thinking-block__label");
    expect(getByText("2.4s")).toHaveClass("sk-thinking-block__meta");
  });

  test.each(STATES)("state=%s sets data-state", (s) => {
    const { root } = renderC(<ThinkingBlock state={s}>x</ThinkingBlock>);
    expect(root).toHaveAttribute("data-state", s);
  });

  test("aria-busy=true only while thinking", () => {
    const thinking = renderC(<ThinkingBlock state="thinking">x</ThinkingBlock>);
    expect(thinking.root).toHaveAttribute("aria-busy", "true");

    const done = renderC(<ThinkingBlock state="done">x</ThinkingBlock>);
    expect(done.root).not.toHaveAttribute("aria-busy");

    const error = renderC(<ThinkingBlock state="error">x</ThinkingBlock>);
    expect(error.root).not.toHaveAttribute("aria-busy");
  });

  test("auto-expands while thinking: data-expanded=true, content + aria-expanded shown", () => {
    const { root, getByRole } = renderC(
      <ThinkingBlock state="thinking">secret reasoning</ThinkingBlock>,
    );
    expect(root).toHaveAttribute("data-expanded", "true");
    expect(getByRole("button")).toHaveAttribute("aria-expanded", "true");
    expect(root.querySelector(".sk-thinking-block__content")).toHaveTextContent("secret reasoning");
  });

  test("collapsed when done by default: data-expanded=false, no content", () => {
    const { root, getByRole } = renderC(<ThinkingBlock state="done">hidden</ThinkingBlock>);
    expect(root).toHaveAttribute("data-expanded", "false");
    expect(getByRole("button")).toHaveAttribute("aria-expanded", "false");
    expect(root.querySelector(".sk-thinking-block__content")).toBeNull();
  });

  // For `error` the auto-expand/collapse effect does not run, so the
  // uncontrolled `defaultExpanded` seed is what sticks.
  test("defaultExpanded seeds the expanded state for non-auto states (error)", () => {
    const { root, getByRole } = renderC(
      <ThinkingBlock state="error" defaultExpanded>
        visible
      </ThinkingBlock>,
    );
    expect(root).toHaveAttribute("data-expanded", "true");
    expect(getByRole("button")).toHaveAttribute("aria-expanded", "true");
    expect(root.querySelector(".sk-thinking-block__content")).toHaveTextContent("visible");
  });

  // Current behavior: the mount-time auto-collapse effect for `done` wins over
  // a `defaultExpanded` seed — the block ends up collapsed.
  test("state=done auto-collapses on mount even with defaultExpanded", () => {
    const { root } = renderC(
      <ThinkingBlock state="done" defaultExpanded>
        hidden
      </ThinkingBlock>,
    );
    expect(root).toHaveAttribute("data-expanded", "false");
    expect(root.querySelector(".sk-thinking-block__content")).toBeNull();
  });

  test("clicking the header toggles expansion + fires onExpandedChange", async () => {
    const onExpandedChange = mock();
    const { root, getByRole, user } = renderC(
      <ThinkingBlock state="done" onExpandedChange={onExpandedChange}>
        body
      </ThinkingBlock>,
    );
    const header = getByRole("button");
    expect(header).toHaveAttribute("aria-expanded", "false");

    await user.click(header);
    expect(header).toHaveAttribute("aria-expanded", "true");
    expect(root).toHaveAttribute("data-expanded", "true");
    expect(root.querySelector(".sk-thinking-block__content")).toHaveTextContent("body");
    expect(onExpandedChange).toHaveBeenLastCalledWith(true);

    await user.click(header);
    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(root).toHaveAttribute("data-expanded", "false");
    expect(root.querySelector(".sk-thinking-block__content")).toBeNull();
    expect(onExpandedChange).toHaveBeenLastCalledWith(false);
  });

  test("controlled expanded prop wins and click does not change DOM state", async () => {
    const onExpandedChange = mock();
    const { root, getByRole, user } = renderC(
      <ThinkingBlock state="done" expanded={false} onExpandedChange={onExpandedChange}>
        body
      </ThinkingBlock>,
    );
    expect(root).toHaveAttribute("data-expanded", "false");
    await user.click(getByRole("button"));
    // still controlled-false, but the callback still fires with the requested next value
    expect(root).toHaveAttribute("data-expanded", "false");
    expect(onExpandedChange).toHaveBeenCalledWith(true);
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(
      <ThinkingBlock state="done" className="extra">
        x
      </ThinkingBlock>,
    );
    expect(root).toHaveClass("sk-thinking-block");
    expect(root).toHaveClass("extra");
  });
});
