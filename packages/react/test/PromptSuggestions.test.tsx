import { describe, test, expect, mock } from "bun:test";
import { PromptSuggestions } from "../src/components/PromptSuggestions";
import { renderC } from "./harness";

const SUGGESTIONS = [
  { value: "a", text: "Summarize this" },
  { value: "b", text: "Explain like I'm five" },
  { value: "c", text: "Write tests" },
];

const GROUPS = [
  {
    label: "Write",
    items: [
      { value: "w1", text: "Draft email" },
      { value: "w2", text: "Blog post" },
    ],
  },
  {
    label: "Code",
    items: [{ value: "c1", text: "Refactor" }],
  },
];

describe("PromptSuggestions", () => {
  test("mounts as a div with base class", () => {
    const { root } = renderC(<PromptSuggestions suggestions={SUGGESTIONS} />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-prompt-suggestions");
  });

  test("renders the label when provided", () => {
    const { root } = renderC(<PromptSuggestions label="Try asking" suggestions={SUGGESTIONS} />);
    expect(root.querySelector(".sk-prompt-suggestions__label")).toHaveTextContent("Try asking");
  });

  test("variant -> data-variant", () => {
    const { root } = renderC(<PromptSuggestions variant="chips" suggestions={SUGGESTIONS} />);
    expect(root).toHaveAttribute("data-variant", "chips");
  });

  test("flat suggestions render a button per item with the text", () => {
    const { getAllByRole } = renderC(<PromptSuggestions suggestions={SUGGESTIONS} />);
    const buttons = getAllByRole("button");
    expect(buttons.length).toBe(3);
    expect(buttons[0]).toHaveClass("sk-prompt-suggestion");
    expect(buttons[0]).toHaveTextContent("Summarize this");
  });

  test("clicking a suggestion fires onSelect with its value", async () => {
    const onSelect = mock();
    const { getByText, user } = renderC(
      <PromptSuggestions suggestions={SUGGESTIONS} onSelect={onSelect} />,
    );
    await user.click(getByText("Write tests"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("c");
  });

  test("renders an icon span when an item has an icon", () => {
    const { root } = renderC(
      <PromptSuggestions suggestions={[{ value: "x", text: "Go", icon: "★" }]} />,
    );
    const icon = root.querySelector(".sk-prompt-suggestion__icon");
    expect(icon).toHaveTextContent("★");
  });

  test("groups render a group block + group-label per group with all items", () => {
    const { root, getAllByRole } = renderC(<PromptSuggestions groups={GROUPS} />);
    const groupEls = root.querySelectorAll(".sk-prompt-suggestions__group");
    expect(groupEls.length).toBe(2);

    const labels = root.querySelectorAll(".sk-prompt-suggestions__group-label");
    expect(labels.length).toBe(2);
    expect(labels[0]).toHaveTextContent("Write");
    expect(labels[1]).toHaveTextContent("Code");

    // all 3 items across both groups render as buttons
    expect(getAllByRole("button").length).toBe(3);
  });

  test("grouped suggestions still fire onSelect with the item value", async () => {
    const onSelect = mock();
    const { getByText, user } = renderC(
      <PromptSuggestions groups={GROUPS} onSelect={onSelect} />,
    );
    await user.click(getByText("Refactor"));
    expect(onSelect).toHaveBeenCalledWith("c1");
  });

  test("ArrowDown / ArrowUp move roving focus and set data-focused", async () => {
    const { getAllByRole, user } = renderC(<PromptSuggestions suggestions={SUGGESTIONS} />);
    const buttons = getAllByRole("button");

    // focus first button (onFocus marks it focused)
    await user.tab();
    expect(buttons[0]).toHaveFocus();
    expect(buttons[0]).toHaveAttribute("data-focused", "");

    // ArrowDown -> second
    await user.keyboard("{ArrowDown}");
    expect(buttons[1]).toHaveFocus();
    expect(buttons[1]).toHaveAttribute("data-focused", "");
    expect(buttons[0]).not.toHaveAttribute("data-focused");

    // ArrowUp -> back to first
    await user.keyboard("{ArrowUp}");
    expect(buttons[0]).toHaveFocus();
    expect(buttons[0]).toHaveAttribute("data-focused", "");
  });

  test("ArrowUp from the first item wraps to the last (roving)", async () => {
    const { getAllByRole, user } = renderC(<PromptSuggestions suggestions={SUGGESTIONS} />);
    const buttons = getAllByRole("button");
    await user.tab();
    expect(buttons[0]).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(buttons[buttons.length - 1]).toHaveFocus();
  });

  test("showKeyboardHints renders the hint footer", () => {
    const withHints = renderC(
      <PromptSuggestions suggestions={SUGGESTIONS} showKeyboardHints />,
    );
    expect(withHints.root.querySelector(".sk-prompt-suggestions__hint")).not.toBeNull();

    const withoutHints = renderC(<PromptSuggestions suggestions={SUGGESTIONS} />);
    expect(withoutHints.root.querySelector(".sk-prompt-suggestions__hint")).toBeNull();
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(
      <PromptSuggestions suggestions={SUGGESTIONS} className="extra" />,
    );
    expect(root).toHaveClass("sk-prompt-suggestions");
    expect(root).toHaveClass("extra");
  });
});
