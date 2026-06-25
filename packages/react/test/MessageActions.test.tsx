import { describe, test, expect, mock } from "bun:test";
import { MessageActions } from "../src/components/MessageActions";
import { renderC } from "./harness";

describe("MessageActions", () => {
  test("only renders buttons for wired handlers", () => {
    const { container } = renderC(<MessageActions onRegenerate={() => {}} />);
    const btns = container.querySelectorAll(".sk-msg-actions__btn");
    expect(btns.length).toBe(1);
    expect(container.querySelector('[aria-label="Regenerate"]')).not.toBeNull();
  });

  test("content adds a Copy button", () => {
    const { container } = renderC(<MessageActions content="hello" />);
    expect(container.querySelector('[aria-label="Copy"]')).not.toBeNull();
  });

  test("toolbar role + base class", () => {
    const { root } = renderC(<MessageActions content="x" />);
    expect(root).toHaveClass("sk-msg-actions");
    expect(root.getAttribute("role")).toBe("toolbar");
  });

  test("regenerate fires its handler", async () => {
    const onRegenerate = mock(() => {});
    const { container, user } = renderC(<MessageActions onRegenerate={onRegenerate} />);
    await user.click(container.querySelector('[aria-label="Regenerate"]')!);
    expect(onRegenerate).toHaveBeenCalledTimes(1);
  });

  test("renders custom children after built-ins", () => {
    const { container } = renderC(
      <MessageActions content="x">
        <button className="mine">m</button>
      </MessageActions>,
    );
    expect(container.querySelector(".mine")).not.toBeNull();
  });
});
