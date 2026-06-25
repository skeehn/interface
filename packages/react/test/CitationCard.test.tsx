import { describe, test, expect } from "bun:test";
import { CitationCard } from "../src/components/CitationCard";
import { renderC } from "./harness";

const VARIANTS = ["compact", "inline"] as const;

describe("CitationCard", () => {
  test("mounts as a div with base class when no href", () => {
    const { root } = renderC(<CitationCard source="MDN" />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-citation-card");
  });

  test("renders the source text", () => {
    const { root, getByText } = renderC(<CitationCard source="Wikipedia" />);
    expect(root.querySelector(".sk-citation-card__source")).not.toBeNull();
    expect(getByText("Wikipedia")).toHaveClass("sk-citation-card__source");
  });

  test("renders index in the icon badge", () => {
    const { root } = renderC(<CitationCard source="src" index={3} />);
    const icon = root.querySelector(".sk-citation-card__icon");
    expect(icon).not.toBeNull();
    expect(icon).toHaveTextContent("3");
  });

  test("falls back to # in the icon badge when no index", () => {
    const { root } = renderC(<CitationCard source="src" />);
    expect(root.querySelector(".sk-citation-card__icon")).toHaveTextContent("#");
  });

  test("renders as an anchor with href when href is provided", () => {
    const { root } = renderC(<CitationCard source="src" href="https://example.com" />);
    expect(root.tagName).toBe("A");
    expect(root).toHaveClass("sk-citation-card");
    expect(root).toHaveAttribute("href", "https://example.com");
    expect(root).toHaveAttribute("target", "_blank");
    expect(root).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("renders the snippet in a paragraph when provided", () => {
    const { root, getByText } = renderC(<CitationCard source="src" snippet="an excerpt" />);
    const snip = root.querySelector(".sk-citation-card__snippet");
    expect(snip).not.toBeNull();
    expect(snip?.tagName).toBe("P");
    expect(getByText("an excerpt")).toHaveClass("sk-citation-card__snippet");
  });

  test("omits the snippet element when not provided", () => {
    const { root } = renderC(<CitationCard source="src" />);
    expect(root.querySelector(".sk-citation-card__snippet")).toBeNull();
  });

  test("renders each meta string in the meta container", () => {
    const { root } = renderC(<CitationCard source="src" meta={["2024", "p.12"]} />);
    const meta = root.querySelector(".sk-citation-card__meta");
    expect(meta).not.toBeNull();
    expect(meta?.children.length).toBe(2);
    expect(meta).toHaveTextContent("2024");
    expect(meta).toHaveTextContent("p.12");
  });

  test("omits the meta container when meta is empty", () => {
    const { root } = renderC(<CitationCard source="src" meta={[]} />);
    expect(root.querySelector(".sk-citation-card__meta")).toBeNull();
  });

  test.each(VARIANTS)("variant=%s sets data-variant", (v) => {
    const { root } = renderC(<CitationCard source="src" variant={v} />);
    expect(root).toHaveAttribute("data-variant", v);
  });

  test("omits data-variant when not provided", () => {
    const { root } = renderC(<CitationCard source="src" />);
    expect(root).not.toHaveAttribute("data-variant");
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<CitationCard source="src" className="extra" />);
    expect(root).toHaveClass("sk-citation-card");
    expect(root).toHaveClass("extra");
  });

  test("forwards arbitrary HTML attributes", () => {
    const { root } = renderC(<CitationCard source="src" id="cite-1" data-testid="c" />);
    expect(root).toHaveAttribute("id", "cite-1");
    expect(root).toHaveAttribute("data-testid", "c");
  });
});
