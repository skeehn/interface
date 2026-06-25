import { describe, test, expect } from "bun:test";
import { Tooltip } from "../src/components/Tooltip";
import { renderC } from "./harness";

describe("Tooltip", () => {
  test("mounts with wrapper base class on a div", () => {
    const { root } = renderC(
      <Tooltip text="hello">
        <button>Hover</button>
      </Tooltip>,
    );
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-tooltip-wrapper");
  });

  test("renders the trigger child", () => {
    const { root, getByText } = renderC(
      <Tooltip text="hello">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(root.querySelector("button")).not.toBeNull();
    expect(getByText("Hover me")).toBeInTheDocument();
  });

  test("renders the tooltip text in a sk-tooltip span with role=tooltip", () => {
    const { root, getByRole } = renderC(
      <Tooltip text="info text">
        <button>x</button>
      </Tooltip>,
    );
    const tip = root.querySelector(".sk-tooltip");
    expect(tip).not.toBeNull();
    expect(tip?.tagName).toBe("SPAN");
    expect(tip).toHaveTextContent("info text");
    expect(getByRole("tooltip")).toHaveTextContent("info text");
  });

  test("merges custom className on the wrapper while keeping base class", () => {
    const { root } = renderC(
      <Tooltip text="t" className="extra">
        <button>x</button>
      </Tooltip>,
    );
    expect(root).toHaveClass("sk-tooltip-wrapper");
    expect(root).toHaveClass("extra");
  });

  test("forwards arbitrary HTML attributes to the wrapper", () => {
    const { root } = renderC(
      <Tooltip text="t" data-testid="tt">
        <button>x</button>
      </Tooltip>,
    );
    expect(root).toHaveAttribute("data-testid", "tt");
  });
});
