import { describe, test, expect } from "bun:test";
import { AgentStatus } from "../src/components/AgentStatus";
import { renderC } from "./harness";

const STATUSES = ["idle", "thinking", "acting", "done", "error"] as const;

describe("AgentStatus", () => {
  test("mounts as a div with base class", () => {
    const { root } = renderC(<AgentStatus status="idle" />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-agent-status");
  });

  test("root has role=status and aria-live=polite", () => {
    const { root, getByRole } = renderC(<AgentStatus status="thinking" />);
    expect(root).toHaveAttribute("role", "status");
    expect(root).toHaveAttribute("aria-live", "polite");
    // queried by role too
    expect(getByRole("status")).toBe(root);
  });

  test("renders a dot element", () => {
    const { root } = renderC(<AgentStatus status="idle" />);
    expect(root.querySelector(".sk-agent-status__dot")).not.toBeNull();
  });

  test.each(STATUSES)("status=%s sets data-status and default label", (s) => {
    const { root } = renderC(<AgentStatus status={s} />);
    expect(root).toHaveAttribute("data-status", s);
    expect(root.querySelector(".sk-agent-status__label")).toHaveTextContent(s);
  });

  test("label overrides the default status text", () => {
    const { root } = renderC(<AgentStatus status="acting" label="Running tools" />);
    expect(root.querySelector(".sk-agent-status__label")).toHaveTextContent("Running tools");
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<AgentStatus status="idle" className="extra" />);
    expect(root).toHaveClass("sk-agent-status");
    expect(root).toHaveClass("extra");
  });
});
