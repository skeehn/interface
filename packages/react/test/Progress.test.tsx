import { describe, test, expect } from "bun:test";
import { Progress } from "../src/components/Progress";
import { renderC } from "./harness";

describe("Progress", () => {
  test("mounts with base class on a div and progressbar role", () => {
    const { root } = renderC(<Progress value={50} />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-progress");
    expect(root).toHaveAttribute("role", "progressbar");
  });

  test("sets aria value attributes from value and max", () => {
    const { root } = renderC(<Progress value={30} max={60} />);
    expect(root).toHaveAttribute("aria-valuenow", "30");
    expect(root).toHaveAttribute("aria-valuemin", "0");
    expect(root).toHaveAttribute("aria-valuemax", "60");
  });

  test("defaults value to 0 and max to 100", () => {
    const { root } = renderC(<Progress />);
    expect(root).toHaveAttribute("aria-valuenow", "0");
    expect(root).toHaveAttribute("aria-valuemax", "100");
  });

  test("variant=dither sets data-variant", () => {
    const { root } = renderC(<Progress variant="dither" />);
    expect(root).toHaveAttribute("data-variant", "dither");
  });

  test("state=loading sets data-state", () => {
    const { root } = renderC(<Progress state="loading" />);
    expect(root).toHaveAttribute("data-state", "loading");
  });

  test("omits data-variant and data-state when not set", () => {
    const { root } = renderC(<Progress value={10} />);
    expect(root).not.toHaveAttribute("data-variant");
    expect(root).not.toHaveAttribute("data-state");
  });

  test("renders track and indicator", () => {
    const { root } = renderC(<Progress value={40} />);
    expect(root.querySelector(".sk-progress__track")).not.toBeNull();
    expect(root.querySelector(".sk-progress__indicator")).not.toBeNull();
  });

  test("indicator width reflects percentage of max", () => {
    const { root } = renderC(<Progress value={25} max={50} />);
    const indicator = root.querySelector(".sk-progress__indicator") as HTMLElement;
    expect(indicator.style.width).toBe("50%");
  });

  test("clamps indicator width to 100% when value exceeds max", () => {
    const { root } = renderC(<Progress value={150} max={100} />);
    const indicator = root.querySelector(".sk-progress__indicator") as HTMLElement;
    expect(indicator.style.width).toBe("100%");
  });

  test("clamps indicator width to 0% for negative value", () => {
    const { root } = renderC(<Progress value={-20} max={100} />);
    const indicator = root.querySelector(".sk-progress__indicator") as HTMLElement;
    expect(indicator.style.width).toBe("0%");
  });

  test("renders label in sk-progress__label when provided", () => {
    const { root, getByText } = renderC(<Progress value={75} label="75%" />);
    expect(root.querySelector(".sk-progress__label")).not.toBeNull();
    expect(getByText("75%")).toHaveClass("sk-progress__label");
  });

  test("omits label element when not provided", () => {
    const { root } = renderC(<Progress value={10} />);
    expect(root.querySelector(".sk-progress__label")).toBeNull();
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<Progress className="extra" />);
    expect(root).toHaveClass("sk-progress");
    expect(root).toHaveClass("extra");
  });
});
