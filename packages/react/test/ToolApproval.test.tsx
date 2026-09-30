import { describe, test, expect } from "bun:test";
import { ToolApproval, ToolApprovalProvider } from "../src/components/ToolApproval";
import { renderC } from "./harness";
import userEvent from "@testing-library/user-event";

describe("ToolApproval", () => {
  test("mounts with base class and awaiting status", () => {
    const { root, getByText } = renderC(
      <ToolApproval toolCallId="t1" toolName="delete_file" input={{ path: "x.ts" }} />,
    );
    expect(root).toHaveClass("sk-tool-approval");
    expect(root).toHaveAttribute("data-status", "awaiting");
    expect(getByText("delete_file")).toHaveClass("sk-tool-approval__name");
    expect(root.querySelector(".sk-tool-approval__args")).toHaveTextContent("x.ts");
  });

  test("role + aria wiring", () => {
    const { root, getByRole } = renderC(
      <ToolApproval toolCallId="t1" toolName="delete_file" />,
    );
    expect(root).toHaveAttribute("role", "alertdialog");
    expect(getByRole("alertdialog")).toHaveAttribute("aria-label", "Approve delete_file");
  });

  test("provider submits approval with success flag", async () => {
    const calls: Array<[string, boolean]> = [];
    const { getByText } = renderC(
      <ToolApprovalProvider value={{ submitApproval: (id, ok) => void calls.push([id, ok]) }}>
        <ToolApproval toolCallId="t9" toolName="send_email" />
      </ToolApprovalProvider>,
    );
    await userEvent.click(getByText("Approve"));
    expect(calls).toEqual([["t9", true]]);
  });

  test("provider submits deny with failure flag", async () => {
    const calls: Array<[string, boolean]> = [];
    const { getByText } = renderC(
      <ToolApprovalProvider value={{ submitApproval: (id, ok) => void calls.push([id, ok]) }}>
        <ToolApproval toolCallId="t9" toolName="send_email" />
      </ToolApprovalProvider>,
    );
    await userEvent.click(getByText("Deny"));
    expect(calls).toEqual([["t9", false]]);
  });

  test("approved state hides actions and shows terminal label", () => {
    const { root, getByText, queryByText } = renderC(
      <ToolApproval toolCallId="t1" toolName="t" state="approval-approved" />,
    );
    expect(root).toHaveAttribute("data-status", "approved");
    expect(getByText("approved")).toHaveClass("sk-tool-approval__title");
    expect(queryByText("Approve")).toBeNull();
  });
});
