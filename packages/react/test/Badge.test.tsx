import { describe, test, expect } from "bun:test";
import { Badge } from "../src/components/Badge";
import { renderC } from "./harness";

const VARIANTS = ["solid", "dither", "outline", "ghost", "inverted", "pixel"] as const;
const COLORS = ["success", "warning", "destructive", "info"] as const;

describe("Badge", () => {
  test("mounts with base class on a span and renders children", () => {
    const { root } = renderC(<Badge>NEW</Badge>);
    expect(root.tagName).toBe("SPAN");
    expect(root).toHaveClass("sk-badge");
    expect(root).toHaveTextContent("NEW");
  });

  test.each(VARIANTS)("variant=%s sets data-variant", (v) => {
    const { root } = renderC(<Badge variant={v}>x</Badge>);
    expect(root).toHaveAttribute("data-variant", v);
  });

  test.each(COLORS)("color=%s sets data-color", (c) => {
    const { root } = renderC(<Badge color={c}>x</Badge>);
    expect(root).toHaveAttribute("data-color", c);
  });

  test("pulsing sets empty data-pulsing attribute", () => {
    const { root } = renderC(<Badge pulsing>x</Badge>);
    expect(root).toHaveAttribute("data-pulsing", "");
  });

  test("omits optional data attributes when not set", () => {
    const { root } = renderC(<Badge>x</Badge>);
    expect(root).not.toHaveAttribute("data-variant");
    expect(root).not.toHaveAttribute("data-color");
    expect(root).not.toHaveAttribute("data-pulsing");
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<Badge className="extra">x</Badge>);
    expect(root).toHaveClass("sk-badge");
    expect(root).toHaveClass("extra");
  });

  test("forwards arbitrary HTML attributes", () => {
    const { root } = renderC(<Badge title="status">x</Badge>);
    expect(root).toHaveAttribute("title", "status");
  });
});
