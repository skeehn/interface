import { describe, test, expect, mock } from "bun:test";
import { ScrollToBottomButton } from "../src/components/ScrollToBottom";
import { renderC } from "./harness";

describe("ScrollToBottomButton", () => {
  test("renders a button with default label + base class", () => {
    const { root } = renderC(<ScrollToBottomButton />);
    expect(root.tagName).toBe("BUTTON");
    expect(root).toHaveClass("sk-scroll-to-bottom");
    expect(root.getAttribute("aria-label")).toBe("Scroll to latest");
  });

  test("custom label", () => {
    const { root } = renderC(<ScrollToBottomButton label="Jump down" />);
    expect(root.getAttribute("aria-label")).toBe("Jump down");
  });

  test("fires onClick", async () => {
    const onClick = mock(() => {});
    const { root, user } = renderC(<ScrollToBottomButton onClick={onClick} />);
    await user.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
