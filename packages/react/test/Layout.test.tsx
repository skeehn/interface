import { describe, test, expect } from "bun:test";
import {
  Container,
  Grid,
  GridCell,
  Stack,
  StackDivider,
  Panel,
  Divider,
  Skeleton,
} from "../src/components/Layout";
import { renderC } from "./harness";

describe("Container", () => {
  test("mounts as a div with base class and renders children", () => {
    const { root } = renderC(<Container>content</Container>);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-container");
    expect(root).toHaveTextContent("content");
  });

  test.each(["narrow", "wide", "full"] as const)("size=%s sets data-size", (s) => {
    const { root } = renderC(<Container size={s}>x</Container>);
    expect(root).toHaveAttribute("data-size", s);
  });

  test("omits data-size when not provided", () => {
    const { root } = renderC(<Container>x</Container>);
    expect(root).not.toHaveAttribute("data-size");
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<Container className="extra">x</Container>);
    expect(root).toHaveClass("sk-container");
    expect(root).toHaveClass("extra");
  });
});

describe("Grid", () => {
  test("mounts as a div with base class and renders children", () => {
    const { root } = renderC(<Grid>cells</Grid>);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-grid");
    expect(root).toHaveTextContent("cells");
  });

  test.each(["2", "3", "4"] as const)("cols=%s sets data-cols", (c) => {
    const { root } = renderC(<Grid cols={c}>x</Grid>);
    expect(root).toHaveAttribute("data-cols", c);
  });

  test("omits data-cols when not provided", () => {
    const { root } = renderC(<Grid>x</Grid>);
    expect(root).not.toHaveAttribute("data-cols");
  });
});

describe("GridCell", () => {
  test("mounts as a div with sk-grid__cell and renders children", () => {
    const { root } = renderC(<GridCell>cell</GridCell>);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-grid__cell");
    expect(root).toHaveTextContent("cell");
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<GridCell className="extra">x</GridCell>);
    expect(root).toHaveClass("sk-grid__cell");
    expect(root).toHaveClass("extra");
  });
});

describe("Stack", () => {
  test("mounts as a div with base class and renders children", () => {
    const { root } = renderC(<Stack>items</Stack>);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-stack");
    expect(root).toHaveTextContent("items");
  });

  test("defaults direction to vertical", () => {
    const { root } = renderC(<Stack>x</Stack>);
    expect(root).toHaveAttribute("data-direction", "vertical");
  });

  test.each(["vertical", "horizontal"] as const)("direction=%s sets data-direction", (d) => {
    const { root } = renderC(<Stack direction={d}>x</Stack>);
    expect(root).toHaveAttribute("data-direction", d);
  });

  test.each(["sm", "lg"] as const)("gap=%s sets data-gap", (g) => {
    const { root } = renderC(<Stack gap={g}>x</Stack>);
    expect(root).toHaveAttribute("data-gap", g);
  });

  test("omits data-gap when not provided", () => {
    const { root } = renderC(<Stack>x</Stack>);
    expect(root).not.toHaveAttribute("data-gap");
  });
});

describe("StackDivider", () => {
  test("mounts as a div with sk-stack__divider", () => {
    const { root } = renderC(<StackDivider />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-stack__divider");
  });
});

describe("Panel", () => {
  test("mounts as a div with base class and renders body children", () => {
    const { root } = renderC(<Panel>body</Panel>);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-panel");
    expect(root.querySelector(".sk-panel__body")).toHaveTextContent("body");
  });

  test("renders the title in an h3 header when provided", () => {
    const { root, getByText } = renderC(<Panel title="Stats">b</Panel>);
    expect(root.querySelector(".sk-panel__header")).not.toBeNull();
    const title = root.querySelector(".sk-panel__title");
    expect(title?.tagName).toBe("H3");
    expect(getByText("Stats")).toHaveClass("sk-panel__title");
  });

  test("omits the header when no title", () => {
    const { root } = renderC(<Panel>b</Panel>);
    expect(root.querySelector(".sk-panel__header")).toBeNull();
  });

  test("renders headerActions when a title is present", () => {
    const { getByText } = renderC(
      <Panel title="T" headerActions={<button>act</button>}>
        b
      </Panel>,
    );
    expect(getByText("act")).toBeInTheDocument();
  });
});

describe("Divider", () => {
  test("mounts as an hr with base class", () => {
    const { root } = renderC(<Divider />);
    expect(root.tagName).toBe("HR");
    expect(root).toHaveClass("sk-divider");
  });

  test("defaults variant to solid", () => {
    const { root } = renderC(<Divider />);
    expect(root).toHaveAttribute("data-variant", "solid");
  });

  test.each(["solid", "dashed", "dither", "ascii"] as const)("variant=%s sets data-variant", (v) => {
    const { root } = renderC(<Divider variant={v} />);
    expect(root).toHaveAttribute("data-variant", v);
  });
});

describe("Skeleton", () => {
  test("mounts as a div with base class", () => {
    const { root } = renderC(<Skeleton />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-skeleton");
  });

  test.each(["circle", "text", "rect", "avatar"] as const)("shape=%s sets data-shape", (s) => {
    const { root } = renderC(<Skeleton shape={s} />);
    expect(root).toHaveAttribute("data-shape", s);
  });

  test.each(["shimmer", "wave", "pulse"] as const)("animate=%s sets data-animate", (a) => {
    const { root } = renderC(<Skeleton animate={a} />);
    expect(root).toHaveAttribute("data-animate", a);
  });

  test("applies explicit width and height via inline style", () => {
    const { root } = renderC(<Skeleton width="120px" height={40} />);
    expect(root.style.width).toBe("120px");
    expect(root.style.height).toBe("40px");
  });

  test("omits data-shape and data-animate when not provided", () => {
    const { root } = renderC(<Skeleton />);
    expect(root).not.toHaveAttribute("data-shape");
    expect(root).not.toHaveAttribute("data-animate");
  });
});
