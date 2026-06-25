import { describe, test, expect, mock } from "bun:test";
import { TerminalPanel } from "../src/components/TerminalPanel";
import { renderC } from "./harness";

const THEMES = ["terminal", "brutal"] as const;

describe("TerminalPanel", () => {
  test("mounts as a div with base class", () => {
    const { root } = renderC(<TerminalPanel />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-terminal-panel");
  });

  test("renders the default title", () => {
    const { root } = renderC(<TerminalPanel />);
    expect(root.querySelector(".sk-terminal-panel__title")).toHaveTextContent("terminal");
  });

  test("renders a custom title", () => {
    const { root, getByText } = renderC(<TerminalPanel title="bash" />);
    expect(getByText("bash")).toHaveClass("sk-terminal-panel__title");
  });

  test("renders children in the body", () => {
    const { root } = renderC(<TerminalPanel>$ echo hi</TerminalPanel>);
    const body = root.querySelector(".sk-terminal-panel__body");
    expect(body).not.toBeNull();
    expect(body).toHaveTextContent("$ echo hi");
  });

  test.each(THEMES)("theme=%s sets data-theme", (t) => {
    const { root } = renderC(<TerminalPanel theme={t} />);
    expect(root).toHaveAttribute("data-theme", t);
  });

  test("omits data-theme when not provided", () => {
    const { root } = renderC(<TerminalPanel />);
    expect(root).not.toHaveAttribute("data-theme");
  });

  test("shows traffic-light action buttons by default with aria-labels", () => {
    const { root, getByLabelText } = renderC(<TerminalPanel />);
    expect(root.querySelector(".sk-terminal-panel__actions")).not.toBeNull();
    expect(getByLabelText("Close")).toBeInTheDocument();
    expect(getByLabelText("Minimize")).toBeInTheDocument();
    expect(getByLabelText("Maximize")).toBeInTheDocument();
  });

  test("hides actions when showActions is false", () => {
    const { root } = renderC(<TerminalPanel showActions={false} />);
    expect(root.querySelector(".sk-terminal-panel__actions")).toBeNull();
  });

  test("fires onClose / onMinimize / onMaximize from their buttons", async () => {
    const onClose = mock();
    const onMinimize = mock();
    const onMaximize = mock();
    const { getByLabelText, user } = renderC(
      <TerminalPanel onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} />,
    );
    await user.click(getByLabelText("Close"));
    await user.click(getByLabelText("Minimize"));
    await user.click(getByLabelText("Maximize"));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onMinimize).toHaveBeenCalledTimes(1);
    expect(onMaximize).toHaveBeenCalledTimes(1);
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<TerminalPanel className="extra" />);
    expect(root).toHaveClass("sk-terminal-panel");
    expect(root).toHaveClass("extra");
  });

  test("forwards arbitrary HTML attributes", () => {
    const { root } = renderC(<TerminalPanel id="term-1" data-testid="t" />);
    expect(root).toHaveAttribute("id", "term-1");
    expect(root).toHaveAttribute("data-testid", "t");
  });
});
