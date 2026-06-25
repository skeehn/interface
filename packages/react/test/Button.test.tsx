import { describe, test, expect, mock } from "bun:test";
import { Button } from "../src/components/Button";
import { renderC } from "./harness";

const VARIANTS = ["solid", "dither", "outline", "ghost", "inverted", "ascii", "pixel"] as const;
const SIZES = ["sm", "lg", "xl"] as const;

describe("Button", () => {
  test("mounts with base class and renders children", () => {
    const { root } = renderC(<Button>Click</Button>);
    expect(root.tagName).toBe("BUTTON");
    expect(root).toHaveClass("sk-btn");
    expect(root).toHaveTextContent("Click");
  });

  test.each(VARIANTS)("variant=%s sets data-variant", (v) => {
    const { root } = renderC(<Button variant={v}>x</Button>);
    expect(root).toHaveAttribute("data-variant", v);
  });

  test.each(SIZES)("size=%s sets data-size", (s) => {
    const { root } = renderC(<Button size={s}>x</Button>);
    expect(root).toHaveAttribute("data-size", s);
  });

  test("loading disables and sets data-loading", () => {
    const { root } = renderC(<Button loading>x</Button>);
    expect(root).toBeDisabled();
    expect(root).toHaveAttribute("data-loading", "");
  });

  test("fires onClick when enabled, not when disabled", async () => {
    const onClick = mock();
    const { root, user } = renderC(<Button onClick={onClick}>x</Button>);
    await user.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);

    const onClick2 = mock();
    const { root: r2, user: u2 } = renderC(
      <Button disabled onClick={onClick2}>
        x
      </Button>,
    );
    await u2.click(r2);
    expect(onClick2).not.toHaveBeenCalled();
  });

  test("keyboard-activates on Enter and Space", async () => {
    const onClick = mock();
    const { root, user } = renderC(<Button onClick={onClick}>x</Button>);
    await user.tab();
    expect(root).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
