import { describe, test, expect, mock } from "bun:test";
import { Toggle } from "../src/components/Toggle";
import { renderC } from "./harness";

describe("Toggle", () => {
  test("mounts as a label wrapping a checkbox input with base classes", () => {
    const { root, getByRole } = renderC(<Toggle />);
    expect(root.tagName).toBe("LABEL");
    expect(root).toHaveClass("sk-toggle");

    const input = getByRole("checkbox");
    expect(input).toHaveClass("sk-toggle__input");
    expect(input).toHaveAttribute("type", "checkbox");

    // thumb is always rendered
    expect(root.querySelector(".sk-toggle__thumb")).not.toBeNull();
  });

  test("merges extra className on the wrapper", () => {
    const { root } = renderC(<Toggle className="extra" />);
    expect(root).toHaveClass("sk-toggle");
    expect(root).toHaveClass("extra");
  });

  test("renders label text when provided", () => {
    const { root } = renderC(<Toggle label="Dark mode" />);
    const labelSpan = root.querySelector(".sk-toggle__label");
    expect(labelSpan).not.toBeNull();
    expect(labelSpan).toHaveTextContent("Dark mode");
  });

  test("no label span when label prop absent", () => {
    const { root } = renderC(<Toggle />);
    expect(root.querySelector(".sk-toggle__label")).toBeNull();
  });

  test("uncontrolled: toggles checked state on click", async () => {
    const { user, getByRole } = renderC(<Toggle defaultChecked={false} />);
    const input = getByRole("checkbox") as HTMLInputElement;
    expect(input.checked).toBe(false);
    await user.click(input);
    expect(input.checked).toBe(true);
    await user.click(input);
    expect(input.checked).toBe(false);
  });

  test("defaultChecked sets the initial checked state", () => {
    const { getByRole } = renderC(<Toggle defaultChecked />);
    expect((getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
  });

  test("fires onCheckedChange with the new boolean and onChange with the event", async () => {
    const onCheckedChange = mock();
    const onChange = mock();
    const { user, getByRole } = renderC(
      <Toggle onCheckedChange={onCheckedChange} onChange={onChange} />,
    );
    const input = getByRole("checkbox");

    await user.click(input);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    // onChange receives a real change event whose target is the checkbox
    const evt = onChange.mock.calls[0]![0] as { target: HTMLInputElement };
    expect(evt.target).toBe(input);
  });

  test("controlled: checked prop pins state; click reports intended value", async () => {
    const onCheckedChange = mock();
    const { user, rerender, getByRole } = renderC(
      <Toggle checked={false} onCheckedChange={onCheckedChange} />,
    );
    const input = getByRole("checkbox") as HTMLInputElement;
    expect(input.checked).toBe(false);

    await user.click(input);
    // change handler reports the value the DOM tried to move to
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    // Parent applies the change.
    rerender(<Toggle checked={true} onCheckedChange={onCheckedChange} />);
    expect(input.checked).toBe(true);
  });

  test("forwards arbitrary input props (disabled)", () => {
    const { getByRole } = renderC(<Toggle disabled />);
    expect(getByRole("checkbox")).toBeDisabled();
  });
});
