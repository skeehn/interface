import { describe, test, expect } from "bun:test";
import { DitherPulse, AsciiRain, Glitch, TextureMask } from "../src/components/Motion";
import { renderC } from "./harness";

describe("DitherPulse", () => {
  test("mounts as a div with base class and renders children", () => {
    const { root } = renderC(<DitherPulse>inner</DitherPulse>);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-dither-pulse");
    expect(root).toHaveTextContent("inner");
  });

  test("defaults effect to pulse", () => {
    const { root } = renderC(<DitherPulse>x</DitherPulse>);
    expect(root).toHaveAttribute("data-effect", "pulse");
  });

  test.each(["pulse", "morph", "scan", "flow"] as const)("effect=%s sets data-effect", (e) => {
    const { root } = renderC(<DitherPulse effect={e}>x</DitherPulse>);
    expect(root).toHaveAttribute("data-effect", e);
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<DitherPulse className="extra">x</DitherPulse>);
    expect(root).toHaveClass("sk-dither-pulse");
    expect(root).toHaveClass("extra");
  });
});

describe("AsciiRain", () => {
  test("mounts as a div with base class and renders children", () => {
    const { root } = renderC(<AsciiRain>inner</AsciiRain>);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-ascii-rain");
    expect(root).toHaveTextContent("inner");
  });

  test("defaults density to normal", () => {
    const { root } = renderC(<AsciiRain>x</AsciiRain>);
    expect(root).toHaveAttribute("data-density", "normal");
  });

  test.each(["sparse", "normal", "dense"] as const)("density=%s sets data-density", (d) => {
    const { root } = renderC(<AsciiRain density={d}>x</AsciiRain>);
    expect(root).toHaveAttribute("data-density", d);
  });
});

describe("Glitch", () => {
  test("mounts as a div with base class and renders children", () => {
    const { root } = renderC(<Glitch>inner</Glitch>);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-glitch");
    expect(root).toHaveTextContent("inner");
  });

  test("sets data-active to 'true' when active", () => {
    const { root } = renderC(<Glitch active>x</Glitch>);
    expect(root).toHaveAttribute("data-active", "true");
  });

  test("omits data-active when not active", () => {
    const { root } = renderC(<Glitch>x</Glitch>);
    expect(root).not.toHaveAttribute("data-active");
  });

  test("sets data-text from the text prop", () => {
    const { root } = renderC(<Glitch text="ERROR">x</Glitch>);
    expect(root).toHaveAttribute("data-text", "ERROR");
  });

  test.each(["subtle", "severe"] as const)("intensity=%s sets data-intensity", (i) => {
    const { root } = renderC(<Glitch intensity={i}>x</Glitch>);
    expect(root).toHaveAttribute("data-intensity", i);
  });

  test("omits data-intensity when not provided", () => {
    const { root } = renderC(<Glitch>x</Glitch>);
    expect(root).not.toHaveAttribute("data-intensity");
  });
});

describe("TextureMask", () => {
  test("mounts as a div with base class and renders children", () => {
    const { root } = renderC(<TextureMask>inner</TextureMask>);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-texture-mask");
    expect(root).toHaveTextContent("inner");
  });

  test("renders the reveal overlay layer", () => {
    const { root } = renderC(<TextureMask>x</TextureMask>);
    expect(root.querySelector(".sk-texture-mask__reveal")).not.toBeNull();
  });

  test("defaults trigger to hover", () => {
    const { root } = renderC(<TextureMask>x</TextureMask>);
    expect(root).toHaveAttribute("data-trigger", "hover");
  });

  test.each(["hover", "focus", "active"] as const)("trigger=%s sets data-trigger", (t) => {
    const { root } = renderC(<TextureMask trigger={t}>x</TextureMask>);
    expect(root).toHaveAttribute("data-trigger", t);
  });

  test.each(["fade", "wipe", "dissolve"] as const)("direction=%s sets data-direction", (d) => {
    const { root } = renderC(<TextureMask direction={d}>x</TextureMask>);
    expect(root).toHaveAttribute("data-direction", d);
  });

  test("omits data-direction when not provided", () => {
    const { root } = renderC(<TextureMask>x</TextureMask>);
    expect(root).not.toHaveAttribute("data-direction");
  });
});
