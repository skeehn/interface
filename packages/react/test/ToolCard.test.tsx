import { describe, test, expect } from "bun:test";
import { ToolCard } from "../src/components/ToolCard";
import { renderC } from "./harness";

const STATUSES = ["pending", "running", "success", "error"] as const;

describe("ToolCard", () => {
  test("mounts as a div with base class and renders the name", () => {
    const { root, getByText } = renderC(<ToolCard name="search_web" />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-tool-card");
    expect(getByText("search_web")).toHaveClass("sk-tool-card__name");
  });

  test("renders body children", () => {
    const { root } = renderC(<ToolCard name="t">{"query: hi"}</ToolCard>);
    expect(root.querySelector(".sk-tool-card__body")).toHaveTextContent("query: hi");
  });

  test("defaults to pending status", () => {
    const { root } = renderC(<ToolCard name="t" />);
    expect(root).toHaveAttribute("data-status", "pending");
  });

  test.each(STATUSES)("status=%s sets data-status and default status label", (s) => {
    const { root, getByRole } = renderC(<ToolCard name="t" status={s} />);
    expect(root).toHaveAttribute("data-status", s);
    const statusEl = getByRole("status");
    expect(statusEl).toHaveClass("sk-tool-card__status");
    expect(statusEl).toHaveTextContent(s);
  });

  test("status span has role=status and aria-live=polite", () => {
    const { getByRole } = renderC(<ToolCard name="t" status="running" />);
    const statusEl = getByRole("status");
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  test("statusLabel overrides the default label", () => {
    const { getByRole } = renderC(
      <ToolCard name="t" status="running" statusLabel="working…" />,
    );
    expect(getByRole("status")).toHaveTextContent("working…");
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<ToolCard name="t" className="extra" />);
    expect(root).toHaveClass("sk-tool-card");
    expect(root).toHaveClass("extra");
  });
});
