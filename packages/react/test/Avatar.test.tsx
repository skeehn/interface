import { describe, test, expect } from "bun:test";
import { Avatar } from "../src/components/Avatar";
import { renderC } from "./harness";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

describe("Avatar", () => {
  test("mounts with base class on a div", () => {
    const { root } = renderC(<Avatar fallback="KK" />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-avatar");
  });

  test.each(SIZES)("size=%s sets data-size", (s) => {
    const { root } = renderC(<Avatar size={s} fallback="x" />);
    expect(root).toHaveAttribute("data-size", s);
  });

  test("defaults data-size to md", () => {
    const { root } = renderC(<Avatar fallback="x" />);
    expect(root).toHaveAttribute("data-size", "md");
  });

  test("renders an img with src and alt when src is provided", () => {
    const { root } = renderC(<Avatar src="/pic.png" alt="Kyle" />);
    const img = root.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", "/pic.png");
    expect(img).toHaveAttribute("alt", "Kyle");
  });

  test("img alt defaults to empty string when not provided", () => {
    const { root } = renderC(<Avatar src="/pic.png" />);
    const img = root.querySelector("img");
    expect(img).toHaveAttribute("alt", "");
  });

  test("does not render fallback when src is present", () => {
    const { root } = renderC(<Avatar src="/pic.png" fallback="KK" />);
    expect(root.querySelector("img")).not.toBeNull();
    expect(root.querySelector(".sk-avatar__fallback")).toBeNull();
  });

  test("renders fallback text in sk-avatar__fallback when no src", () => {
    const { root, getByText } = renderC(<Avatar fallback="KK" />);
    expect(root.querySelector("img")).toBeNull();
    const fb = root.querySelector(".sk-avatar__fallback");
    expect(fb).not.toBeNull();
    expect(getByText("KK")).toHaveClass("sk-avatar__fallback");
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<Avatar className="extra" fallback="x" />);
    expect(root).toHaveClass("sk-avatar");
    expect(root).toHaveClass("extra");
  });

  test("forwards arbitrary HTML attributes", () => {
    const { root } = renderC(<Avatar title="user" fallback="x" />);
    expect(root).toHaveAttribute("title", "user");
  });
});
