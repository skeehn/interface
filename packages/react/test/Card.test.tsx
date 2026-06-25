import { describe, test, expect } from "bun:test";
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from "../src/components/Card";
import { renderC } from "./harness";

const VARIANTS = ["solid", "dither", "outline", "ghost", "inverted", "pixel"] as const;

describe("Card", () => {
  test("mounts with base class and renders children", () => {
    const { root } = renderC(<Card>content</Card>);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-card");
    expect(root).toHaveTextContent("content");
  });

  test.each(VARIANTS)("variant=%s sets data-variant", (v) => {
    const { root } = renderC(<Card variant={v}>x</Card>);
    expect(root).toHaveAttribute("data-variant", v);
  });

  test("omits data-variant when not provided", () => {
    const { root } = renderC(<Card>x</Card>);
    expect(root).not.toHaveAttribute("data-variant");
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<Card className="extra">x</Card>);
    expect(root).toHaveClass("sk-card");
    expect(root).toHaveClass("extra");
  });

  test("forwards arbitrary HTML attributes", () => {
    const { root } = renderC(<Card data-testid="c" id="my-card">x</Card>);
    expect(root).toHaveAttribute("id", "my-card");
    expect(root).toHaveAttribute("data-testid", "c");
  });

  describe("sub-components", () => {
    test("CardHeader renders with sk-card__header on a div", () => {
      const { root } = renderC(<CardHeader>h</CardHeader>);
      expect(root.tagName).toBe("DIV");
      expect(root).toHaveClass("sk-card__header");
      expect(root).toHaveTextContent("h");
    });

    test("CardTitle renders as an h3 with sk-card__title", () => {
      const { root } = renderC(<CardTitle>t</CardTitle>);
      expect(root.tagName).toBe("H3");
      expect(root).toHaveClass("sk-card__title");
      expect(root).toHaveTextContent("t");
    });

    test("CardBody renders with sk-card__body on a div", () => {
      const { root } = renderC(<CardBody>b</CardBody>);
      expect(root.tagName).toBe("DIV");
      expect(root).toHaveClass("sk-card__body");
      expect(root).toHaveTextContent("b");
    });

    test("CardFooter renders with sk-card__footer on a div", () => {
      const { root } = renderC(<CardFooter>f</CardFooter>);
      expect(root.tagName).toBe("DIV");
      expect(root).toHaveClass("sk-card__footer");
      expect(root).toHaveTextContent("f");
    });

    test("compose into a full card structure", () => {
      const { root, getByText } = renderC(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardBody>Body</CardBody>
          <CardFooter>Footer</CardFooter>
        </Card>,
      );
      expect(root).toHaveClass("sk-card");
      expect(root.querySelector(".sk-card__header")).not.toBeNull();
      expect(root.querySelector(".sk-card__title")?.tagName).toBe("H3");
      expect(root.querySelector(".sk-card__body")).not.toBeNull();
      expect(root.querySelector(".sk-card__footer")).not.toBeNull();
      expect(getByText("Title")).toBeInTheDocument();
    });
  });
});
