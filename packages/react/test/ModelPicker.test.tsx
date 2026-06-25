import { describe, test, expect, mock } from "bun:test";
import { fireEvent } from "@testing-library/react";
import { ModelPicker } from "../src/components/ModelPicker";
import { renderC } from "./harness";

const MODELS = [
  { id: "anthropic/claude-opus-4-8", label: "Opus 4.8", group: "Anthropic" },
  { id: "anthropic/claude-sonnet-4-6", label: "Sonnet 4.6", group: "Anthropic" },
];

describe("ModelPicker", () => {
  test("renders a select with options", () => {
    const { root, container } = renderC(<ModelPicker models={MODELS} value={MODELS[0].id} />);
    expect(root.tagName).toBe("SELECT");
    expect(root).toHaveClass("sk-model-picker");
    expect(container.querySelectorAll("option").length).toBe(2);
  });

  test("string models normalize to {id}", () => {
    const { container } = renderC(<ModelPicker models={["gpt-4o", "o3"]} value="gpt-4o" />);
    const opts = container.querySelectorAll("option");
    expect(opts.length).toBe(2);
    expect(opts[0].textContent).toBe("gpt-4o");
  });

  test("groups render as optgroups", () => {
    const { container } = renderC(<ModelPicker models={MODELS} value={MODELS[0].id} />);
    const groups = container.querySelectorAll("optgroup");
    expect(groups.length).toBe(1);
    expect(groups[0].getAttribute("label")).toBe("Anthropic");
  });

  test("onChange fires with the selected id", () => {
    const onChange = mock((_id: string) => {});
    const { root } = renderC(
      <ModelPicker models={MODELS} value={MODELS[0].id} onChange={onChange} />,
    );
    fireEvent.change(root, { target: { value: MODELS[1].id } });
    expect(onChange).toHaveBeenCalledWith(MODELS[1].id);
  });

  test("accessible label", () => {
    const { root } = renderC(<ModelPicker models={["a"]} label="Pick model" />);
    expect(root.getAttribute("aria-label")).toBe("Pick model");
  });
});
