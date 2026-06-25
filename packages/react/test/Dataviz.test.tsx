import { describe, test, expect } from "bun:test";
import { AsciiChart, Sparkline, Meter, Heatmap } from "../src/components/Dataviz";
import { renderC } from "./harness";

describe("AsciiChart", () => {
  test("mounts as a div with base class", () => {
    const { root } = renderC(<AsciiChart data={[{ value: 1 }, { value: 2 }]} />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-ascii-chart");
  });

  test("renders one bar per data point", () => {
    const { root } = renderC(<AsciiChart data={[{ value: 1 }, { value: 2 }, { value: 3 }]} />);
    expect(root.querySelectorAll(".sk-ascii-chart__bar").length).toBe(3);
  });

  test("renders the configured number of cell rows per bar", () => {
    const { root } = renderC(<AsciiChart data={[{ value: 4 }]} rows={5} />);
    expect(root.querySelectorAll(".sk-ascii-chart__bar-cell").length).toBe(5);
  });

  test("fills cells proportional to value vs max", () => {
    // value 5 of max 10 over 10 rows => 5 filled
    const { root } = renderC(<AsciiChart data={[{ value: 5 }]} max={10} rows={10} />);
    expect(root.querySelectorAll(".sk-ascii-chart__bar-cell--filled").length).toBe(5);
  });

  test("uses dither cells when dither is set", () => {
    const { root } = renderC(<AsciiChart data={[{ value: 1 }]} max={1} rows={4} dither />);
    expect(root.querySelectorAll(".sk-ascii-chart__bar-cell--dither").length).toBe(4);
    expect(root.querySelectorAll(".sk-ascii-chart__bar-cell--filled").length).toBe(0);
  });

  test("renders labels for each data point", () => {
    const { root, getByText } = renderC(
      <AsciiChart data={[{ value: 1, label: "Mon" }, { value: 2, label: "Tue" }]} />,
    );
    expect(root.querySelectorAll(".sk-ascii-chart__label-cell").length).toBe(2);
    expect(getByText("Mon")).toBeInTheDocument();
    expect(getByText("Tue")).toBeInTheDocument();
  });

  test("forwards role and aria-label", () => {
    const { root } = renderC(
      <AsciiChart data={[{ value: 1 }]} role="img" aria-label="weekly visits" />,
    );
    expect(root).toHaveAttribute("role", "img");
    expect(root).toHaveAttribute("aria-label", "weekly visits");
  });
});

describe("Sparkline", () => {
  test("mounts as a div with base class", () => {
    const { root } = renderC(<Sparkline data={[1, 2, 3]} />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-sparkline");
  });

  test("renders one bar per value", () => {
    const { root } = renderC(<Sparkline data={[1, 2, 3, 4]} />);
    expect(root.querySelectorAll(".sk-sparkline__bar").length).toBe(4);
  });

  test("sets bar height proportional to the max value", () => {
    const { root } = renderC(<Sparkline data={[5, 10]} />);
    const bars = root.querySelectorAll<HTMLElement>(".sk-sparkline__bar");
    expect(bars[0].style.height).toBe("50%");
    expect(bars[1].style.height).toBe("100%");
  });

  test("adds the dither modifier class when dither is set", () => {
    const { root } = renderC(<Sparkline data={[1, 2]} dither />);
    expect(root.querySelectorAll(".sk-sparkline__bar--dither").length).toBe(2);
  });

  test("forwards role and aria-label", () => {
    const { root } = renderC(<Sparkline data={[1, 2]} role="img" aria-label="trend" />);
    expect(root).toHaveAttribute("role", "img");
    expect(root).toHaveAttribute("aria-label", "trend");
  });
});

describe("Meter", () => {
  test("mounts as a div with base class and a track + fill", () => {
    const { root } = renderC(<Meter value={50} />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-meter");
    expect(root.querySelector(".sk-meter__track")).not.toBeNull();
    expect(root.querySelector(".sk-meter__fill")).not.toBeNull();
  });

  test("sets fill width from value over the default max of 100", () => {
    const { root } = renderC(<Meter value={75} />);
    const fill = root.querySelector<HTMLElement>(".sk-meter__fill");
    expect(fill?.style.width).toBe("75%");
  });

  test("scales fill width against a custom max", () => {
    const { root } = renderC(<Meter value={1} max={4} />);
    const fill = root.querySelector<HTMLElement>(".sk-meter__fill");
    expect(fill?.style.width).toBe("25%");
  });

  test("clamps fill width to 100% when value exceeds max", () => {
    const { root } = renderC(<Meter value={150} max={100} />);
    const fill = root.querySelector<HTMLElement>(".sk-meter__fill");
    expect(fill?.style.width).toBe("100%");
  });

  test("renders the label when provided", () => {
    const { root, getByText } = renderC(<Meter value={75} label="75%" />);
    expect(root.querySelector(".sk-meter__label")).not.toBeNull();
    expect(getByText("75%")).toHaveClass("sk-meter__label");
  });

  test("omits the label element when not provided", () => {
    const { root } = renderC(<Meter value={50} />);
    expect(root.querySelector(".sk-meter__label")).toBeNull();
  });

  test("adds the dither modifier on the fill when dither is set", () => {
    const { root } = renderC(<Meter value={50} dither />);
    expect(root.querySelector(".sk-meter__fill--dither")).not.toBeNull();
  });

  test("forwards role and aria-label", () => {
    const { root } = renderC(<Meter value={50} role="img" aria-label="cpu" />);
    expect(root).toHaveAttribute("role", "img");
    expect(root).toHaveAttribute("aria-label", "cpu");
  });
});

describe("Heatmap", () => {
  test("mounts as a div with base class", () => {
    const { root } = renderC(<Heatmap data={[[0, 1], [2, 3]]} cols={2} />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-heatmap");
  });

  test("renders one cell per flattened data value", () => {
    const { root } = renderC(<Heatmap data={[[0, 1, 2], [3, 4, 0]]} cols={3} />);
    expect(root.querySelectorAll(".sk-heatmap__cell").length).toBe(6);
  });

  test("assigns a level modifier class clamped to 0-4", () => {
    const { root } = renderC(<Heatmap data={[[0, 2, 4, 9]]} cols={4} />);
    expect(root.querySelector(".sk-heatmap__cell--0")).not.toBeNull();
    expect(root.querySelector(".sk-heatmap__cell--2")).not.toBeNull();
    // 4 and the out-of-range 9 both clamp to level 4
    expect(root.querySelectorAll(".sk-heatmap__cell--4").length).toBe(2);
  });

  test("sets gridTemplateColumns from the cols prop", () => {
    const { root } = renderC(<Heatmap data={[[0, 1, 2]]} cols={3} />);
    expect(root.style.gridTemplateColumns).toBe("repeat(3, 1ch)");
  });

  test("adds the dither modifier on cells when dither is set", () => {
    const { root } = renderC(<Heatmap data={[[1, 2]]} cols={2} dither />);
    expect(root.querySelectorAll(".sk-heatmap__cell--dither").length).toBe(2);
  });

  test("forwards role and aria-label", () => {
    const { root } = renderC(<Heatmap data={[[1]]} cols={1} role="img" aria-label="activity" />);
    expect(root).toHaveAttribute("role", "img");
    expect(root).toHaveAttribute("aria-label", "activity");
  });
});
