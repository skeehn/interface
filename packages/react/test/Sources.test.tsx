import { describe, test, expect } from "bun:test";
import { Sources } from "../src/components/Sources";
import { renderC } from "./harness";

const SOURCES = [
  { source: "Paper A", href: "https://a.example.com", snippet: "abc" },
  { source: "Paper B", href: "https://b.example.com" },
];

describe("Sources", () => {
  test("renders a <details> with label + count", () => {
    const { root, container } = renderC(<Sources sources={SOURCES} />);
    expect(root.tagName).toBe("DETAILS");
    expect(root).toHaveClass("sk-sources");
    expect(container.querySelector(".sk-sources__label")).toHaveTextContent("Sources");
    expect(container.querySelector(".sk-sources__count")).toHaveTextContent("2");
  });

  test("renders a CitationCard per source", () => {
    const { container } = renderC(<Sources sources={SOURCES} />);
    expect(container.querySelectorAll(".sk-citation-card").length).toBe(2);
    expect(container).toHaveTextContent("Paper A");
    expect(container).toHaveTextContent("Paper B");
  });

  test("defaultOpen controls the open attribute", () => {
    const { root } = renderC(<Sources sources={SOURCES} defaultOpen />);
    expect((root as HTMLDetailsElement).open).toBe(true);
  });

  test("custom label + composed children", () => {
    const { container } = renderC(
      <Sources label="References">
        <div className="sk-citation-card">x</div>
      </Sources>,
    );
    expect(container.querySelector(".sk-sources__label")).toHaveTextContent("References");
    expect(container.querySelector(".sk-sources__count")).toHaveTextContent("1");
  });
});
