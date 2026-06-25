import { describe, test, expect } from "bun:test";
import { Markdown } from "../src/components/Markdown";
import { renderC } from "./harness";

describe("Markdown", () => {
  test("mounts as a div with base class", () => {
    const { root } = renderC(<Markdown />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-markdown");
  });

  test("renders pre-rendered HTML children with their tags and text", () => {
    const { root } = renderC(
      <Markdown>
        <h1>Heading</h1>
        <p>
          a <strong>bold</strong> word
        </p>
        <ul>
          <li>one</li>
          <li>two</li>
        </ul>
      </Markdown>,
    );
    expect(root.querySelector("h1")).toHaveTextContent("Heading");
    expect(root.querySelector("p")).not.toBeNull();
    expect(root.querySelector("strong")).toHaveTextContent("bold");
    expect(root.querySelectorAll("ul > li").length).toBe(2);
    expect(root).toHaveTextContent("a bold word");
  });

  test("renders raw HTML passed via dangerouslySetInnerHTML", () => {
    const html = "<h2>Title</h2><p>Some <em>emphasis</em> here</p>";
    const { root } = renderC(<Markdown dangerouslySetInnerHTML={{ __html: html }} />);
    expect(root.querySelector("h2")).toHaveTextContent("Title");
    expect(root.querySelector("em")).toHaveTextContent("emphasis");
    expect(root).toHaveTextContent("Some emphasis here");
  });

  test("renders a code block structure", () => {
    const { root } = renderC(
      <Markdown>
        <pre>
          <code>const x = 1;</code>
        </pre>
      </Markdown>,
    );
    expect(root.querySelector("pre > code")).toHaveTextContent("const x = 1;");
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<Markdown className="extra">x</Markdown>);
    expect(root).toHaveClass("sk-markdown");
    expect(root).toHaveClass("extra");
  });

  test("forwards arbitrary HTML attributes", () => {
    const { root } = renderC(<Markdown id="md" data-testid="m">x</Markdown>);
    expect(root).toHaveAttribute("id", "md");
    expect(root).toHaveAttribute("data-testid", "m");
  });
});
