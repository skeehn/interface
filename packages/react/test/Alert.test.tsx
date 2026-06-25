import { describe, test, expect } from "bun:test";
import { Alert } from "../src/components/Alert";
import { renderC } from "./harness";

const TYPES = ["info", "success", "warning", "destructive"] as const;
const DEFAULT_ICONS: Record<(typeof TYPES)[number], string> = {
  info: "i",
  success: "✓",
  warning: "!",
  destructive: "✗",
};

describe("Alert", () => {
  test("mounts with base class on a div", () => {
    const { root } = renderC(<Alert />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-alert");
  });

  test.each(TYPES)("type=%s sets data-type", (t) => {
    const { root } = renderC(<Alert type={t} />);
    expect(root).toHaveAttribute("data-type", t);
  });

  test("omits data-type when not provided", () => {
    const { root } = renderC(<Alert title="t" />);
    expect(root).not.toHaveAttribute("data-type");
  });

  test.each(TYPES)("type=%s renders its default icon in sk-alert__icon", (t) => {
    const { root } = renderC(<Alert type={t} />);
    const iconEl = root.querySelector(".sk-alert__icon");
    expect(iconEl).not.toBeNull();
    expect(iconEl).toHaveTextContent(DEFAULT_ICONS[t]);
  });

  test("custom icon overrides the default icon", () => {
    const { root } = renderC(<Alert type="info" icon={<span data-testid="custom">*</span>} />);
    const iconEl = root.querySelector(".sk-alert__icon");
    expect(iconEl).not.toBeNull();
    expect(iconEl?.querySelector('[data-testid="custom"]')).not.toBeNull();
  });

  test("renders custom icon even without a type", () => {
    const { root } = renderC(<Alert icon={<span>!</span>} />);
    expect(root.querySelector(".sk-alert__icon")).not.toBeNull();
  });

  test("omits the icon element when neither icon nor type is set", () => {
    const { root } = renderC(<Alert title="t" />);
    expect(root.querySelector(".sk-alert__icon")).toBeNull();
  });

  test("renders title in sk-alert__title", () => {
    const { root, getByText } = renderC(<Alert title="Heads up" />);
    expect(root.querySelector(".sk-alert__title")).not.toBeNull();
    expect(getByText("Heads up")).toHaveClass("sk-alert__title");
  });

  test("renders description in sk-alert__description", () => {
    const { root, getByText } = renderC(<Alert description="details here" />);
    expect(root.querySelector(".sk-alert__description")).not.toBeNull();
    expect(getByText("details here")).toHaveClass("sk-alert__description");
  });

  test("renders children inside the content area", () => {
    const { root } = renderC(<Alert><button>Undo</button></Alert>);
    const content = root.querySelector(".sk-alert__content");
    expect(content).not.toBeNull();
    expect(content?.querySelector("button")).not.toBeNull();
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<Alert className="extra" />);
    expect(root).toHaveClass("sk-alert");
    expect(root).toHaveClass("extra");
  });
});
