import { describe, test, expect } from "bun:test";
import { ReasoningStep } from "../src/components/ReasoningStep";
import { renderC } from "./harness";

const STATUSES = ["pending", "active", "completed", "error"] as const;

// icon glyph per status (from the source)
const ICONS: Record<(typeof STATUSES)[number], string> = {
  pending: "○",
  active: "▸",
  completed: "✓",
  error: "✗",
};

describe("ReasoningStep", () => {
  test("mounts as a div with base class and renders the title", () => {
    const { root, getByText } = renderC(<ReasoningStep status="pending" title="Plan" />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-reasoning-step");
    expect(getByText("Plan")).toHaveClass("sk-reasoning-step__title");
  });

  test.each(STATUSES)("status=%s sets data-status", (s) => {
    const { root } = renderC(<ReasoningStep status={s} title="t" />);
    expect(root).toHaveAttribute("data-status", s);
  });

  test.each(STATUSES)("status=%s renders the matching indicator icon", (s) => {
    const { root } = renderC(<ReasoningStep status={s} title="t" />);
    expect(root.querySelector(".sk-reasoning-step__indicator")).toHaveTextContent(ICONS[s]);
  });

  test("collapsed by default: aria-expanded=false, data-expanded=false, no content", () => {
    const { root, getByRole } = renderC(
      <ReasoningStep status="active" title="t">
        details
      </ReasoningStep>,
    );
    expect(getByRole("button")).toHaveAttribute("aria-expanded", "false");
    expect(root).toHaveAttribute("data-expanded", "false");
    expect(root.querySelector(".sk-reasoning-step__content")).toBeNull();
  });

  test("defaultExpanded shows content immediately", () => {
    const { root, getByRole } = renderC(
      <ReasoningStep status="active" title="t" defaultExpanded>
        details
      </ReasoningStep>,
    );
    expect(getByRole("button")).toHaveAttribute("aria-expanded", "true");
    expect(root).toHaveAttribute("data-expanded", "true");
    expect(root.querySelector(".sk-reasoning-step__content")).toHaveTextContent("details");
  });

  test("clicking the header toggles aria-expanded + content visibility", async () => {
    const { root, getByRole, user } = renderC(
      <ReasoningStep status="active" title="t">
        details
      </ReasoningStep>,
    );
    const header = getByRole("button");
    expect(header).toHaveAttribute("aria-expanded", "false");

    await user.click(header);
    expect(header).toHaveAttribute("aria-expanded", "true");
    expect(root).toHaveAttribute("data-expanded", "true");
    expect(root.querySelector(".sk-reasoning-step__content")).toHaveTextContent("details");

    await user.click(header);
    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(root).toHaveAttribute("data-expanded", "false");
    expect(root.querySelector(".sk-reasoning-step__content")).toBeNull();
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(
      <ReasoningStep status="pending" title="t" className="extra" />,
    );
    expect(root).toHaveClass("sk-reasoning-step");
    expect(root).toHaveClass("extra");
  });
});
