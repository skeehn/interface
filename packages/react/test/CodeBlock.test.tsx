import { describe, test, expect, mock } from "bun:test";
import { CodeBlock } from "../src/components/CodeBlock";
import { renderC } from "./harness";

describe("CodeBlock", () => {
  test("mounts as a div with base class and renders the code", () => {
    const { root } = renderC(<CodeBlock code="const a = 1;" />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-code-block");
    expect(root.querySelector("pre code")).toHaveTextContent("const a = 1;");
  });

  test("renders the language label when provided", () => {
    const { root, getByText } = renderC(<CodeBlock code="x" language="typescript" />);
    expect(getByText("typescript")).toHaveClass("sk-code-block__lang");
  });

  test("omits the language label when not provided", () => {
    const { root } = renderC(<CodeBlock code="x" />);
    expect(root.querySelector(".sk-code-block__lang")).toBeNull();
  });

  test("meta shows pluralized line count", () => {
    const single = renderC(<CodeBlock code="one" />);
    expect(single.root.querySelector(".sk-code-block__meta")).toHaveTextContent("1 line");

    const multi = renderC(<CodeBlock code={"a\nb\nc"} />);
    expect(multi.root.querySelector(".sk-code-block__meta")).toHaveTextContent("3 lines");
  });

  test("lineNumbers renders the lines column with one entry per line + sets data-line-numbers", () => {
    const { root } = renderC(<CodeBlock code={"a\nb\nc"} lineNumbers />);
    expect(root).toHaveAttribute("data-line-numbers", "");
    const linesCol = root.querySelector(".sk-code-block__lines");
    expect(linesCol).not.toBeNull();
    expect(linesCol!.children.length).toBe(3);
    expect(linesCol!.children[0]).toHaveTextContent("1");
    expect(linesCol!.children[2]).toHaveTextContent("3");
  });

  test("omits the lines column and data-line-numbers by default", () => {
    const { root } = renderC(<CodeBlock code={"a\nb"} />);
    expect(root).not.toHaveAttribute("data-line-numbers");
    expect(root.querySelector(".sk-code-block__lines")).toBeNull();
  });

  test("copy button defaults: label, content, no data-copied, has aria-live", () => {
    const { getByRole } = renderC(<CodeBlock code="x" />);
    const btn = getByRole("button", { name: "Copy code" });
    expect(btn).toHaveClass("sk-code-block__copy");
    expect(btn).toHaveTextContent("⧉ Copy");
    expect(btn).not.toHaveAttribute("data-copied");
    expect(btn).not.toHaveClass("sk-done-pulse");
    expect(btn).toHaveAttribute("aria-live", "polite");
  });

  test("clicking copy calls onCopy(code) and flips to the copied state immediately", async () => {
    const onCopy = mock();
    const { getByRole, user } = renderC(<CodeBlock code="payload-123" onCopy={onCopy} />);
    const btn = getByRole("button", { name: "Copy code" });
    await user.click(btn);

    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(onCopy).toHaveBeenCalledWith("payload-123");

    // immediate copied state (do not wait for the 2s reset)
    const copiedBtn = getByRole("button", { name: "Copied to clipboard" });
    expect(copiedBtn).toHaveAttribute("data-copied", "true");
    expect(copiedBtn).toHaveClass("sk-done-pulse");
    expect(copiedBtn).toHaveTextContent("✓ Copied");
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<CodeBlock code="x" className="extra" />);
    expect(root).toHaveClass("sk-code-block");
    expect(root).toHaveClass("extra");
  });
});
