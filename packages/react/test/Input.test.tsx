import { describe, test, expect, mock } from "bun:test";
import { Input, InputGroup } from "../src/components/Input";
import { renderC } from "./harness";

describe("Input", () => {
  test("mounts with base class on an input element", () => {
    const { root } = renderC(<Input />);
    expect(root.tagName).toBe("INPUT");
    expect(root).toHaveClass("sk-input");
  });

  test("dither sets empty data-dither attribute", () => {
    const { root } = renderC(<Input dither />);
    expect(root).toHaveAttribute("data-dither", "");
  });

  test("omits data-dither when not set", () => {
    const { root } = renderC(<Input />);
    expect(root).not.toHaveAttribute("data-dither");
  });

  test("state=error sets data-state", () => {
    const { root } = renderC(<Input state="error" />);
    expect(root).toHaveAttribute("data-state", "error");
  });

  test("omits data-state when not set", () => {
    const { root } = renderC(<Input />);
    expect(root).not.toHaveAttribute("data-state");
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<Input className="extra" />);
    expect(root).toHaveClass("sk-input");
    expect(root).toHaveClass("extra");
  });

  test("forwards native input attributes", () => {
    const { root } = renderC(<Input placeholder="name" type="email" disabled />);
    expect(root).toHaveAttribute("placeholder", "name");
    expect(root).toHaveAttribute("type", "email");
    expect(root).toBeDisabled();
  });

  test("fires onChange and reflects typed value", async () => {
    const onChange = mock();
    const { root, user } = renderC(<Input onChange={onChange} />);
    await user.click(root);
    await user.keyboard("hi");
    expect(onChange).toHaveBeenCalled();
    expect(root).toHaveValue("hi");
  });

  test("is focusable via tab", async () => {
    const { root, user } = renderC(<Input />);
    await user.tab();
    expect(root).toHaveFocus();
  });
});

describe("InputGroup", () => {
  test("mounts with sk-input-group on a div", () => {
    const { root } = renderC(<InputGroup />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-input-group");
  });

  test("renders label text in a sk-input-label element", () => {
    const { root, getByText } = renderC(<InputGroup label="Email" />);
    const label = root.querySelector(".sk-input-label");
    expect(label).not.toBeNull();
    expect(getByText("Email")).toHaveClass("sk-input-label");
  });

  test("renders hint text in a sk-input-hint element", () => {
    const { root, getByText } = renderC(<InputGroup hint="required" />);
    expect(root.querySelector(".sk-input-hint")).not.toBeNull();
    expect(getByText("required")).toHaveClass("sk-input-hint");
  });

  test("omits label and hint elements when not provided", () => {
    const { root } = renderC(<InputGroup />);
    expect(root.querySelector(".sk-input-label")).toBeNull();
    expect(root.querySelector(".sk-input-hint")).toBeNull();
  });

  test("renders children (the input) between label and hint", () => {
    const { root } = renderC(
      <InputGroup label="Name" hint="help">
        <Input />
      </InputGroup>,
    );
    expect(root.querySelector(".sk-input")).not.toBeNull();
    expect(root.querySelector(".sk-input-label")).not.toBeNull();
    expect(root.querySelector(".sk-input-hint")).not.toBeNull();
  });
});
