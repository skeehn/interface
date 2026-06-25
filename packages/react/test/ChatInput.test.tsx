import { describe, test, expect, mock } from "bun:test";
import { ChatInput } from "../src/components/ChatInput";
import { renderC } from "./harness";

describe("ChatInput", () => {
  test("mounts as a div with base class and a textarea field", () => {
    const { root } = renderC(<ChatInput />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-chat-input");
    const field = root.querySelector("textarea.sk-chat-input__field");
    expect(field).not.toBeNull();
  });

  test("field aria-label equals the placeholder (default)", () => {
    const { getByRole } = renderC(<ChatInput />);
    const field = getByRole("textbox");
    expect(field).toHaveAttribute("placeholder", "Type a message...");
    expect(field).toHaveAttribute("aria-label", "Type a message...");
  });

  test("field aria-label equals a custom placeholder", () => {
    const { getByRole } = renderC(<ChatInput placeholder="Ask anything" />);
    const field = getByRole("textbox");
    expect(field).toHaveAttribute("placeholder", "Ask anything");
    expect(field).toHaveAttribute("aria-label", "Ask anything");
  });

  test("state -> data-state and variant -> data-variant", () => {
    const { root } = renderC(<ChatInput state="recording" variant="compact" />);
    expect(root).toHaveAttribute("data-state", "recording");
    expect(root).toHaveAttribute("data-variant", "compact");
  });

  test("uncontrolled: typing updates the field value", async () => {
    const { getByRole, user } = renderC(<ChatInput />);
    const field = getByRole("textbox") as HTMLTextAreaElement;
    await user.type(field, "hi");
    expect(field.value).toBe("hi");
  });

  test("controlled: value prop drives the field and onValueChange fires", async () => {
    const onValueChange = mock();
    const { getByRole, user } = renderC(
      <ChatInput value="locked" onValueChange={onValueChange} />,
    );
    const field = getByRole("textbox") as HTMLTextAreaElement;
    expect(field.value).toBe("locked");
    await user.type(field, "x");
    // value stays controlled, but change handler is notified
    expect(field.value).toBe("locked");
    expect(onValueChange).toHaveBeenCalled();
  });

  test("Enter without Shift submits with the text", async () => {
    const onSubmit = mock();
    const { getByRole, user } = renderC(<ChatInput onSubmit={onSubmit} />);
    const field = getByRole("textbox") as HTMLTextAreaElement;
    await user.type(field, "hello");
    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("hello");
  });

  test("Shift+Enter does not submit", async () => {
    const onSubmit = mock();
    const { getByRole, user } = renderC(<ChatInput onSubmit={onSubmit} />);
    const field = getByRole("textbox") as HTMLTextAreaElement;
    await user.type(field, "hello");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("send button: renders only when onSubmit set", () => {
    const without = renderC(<ChatInput />);
    expect(without.root.querySelector(".sk-chat-input__send")).toBeNull();

    const withSubmit = renderC(<ChatInput onSubmit={() => {}} />);
    expect(withSubmit.root.querySelector(".sk-chat-input__send")).not.toBeNull();
  });

  test("send button hidden when showSend=false even with onSubmit", () => {
    const { root } = renderC(<ChatInput onSubmit={() => {}} showSend={false} />);
    expect(root.querySelector(".sk-chat-input__send")).toBeNull();
  });

  test("send button is disabled when empty and enabled with text", async () => {
    const { getByRole, user } = renderC(<ChatInput onSubmit={() => {}} />);
    const send = getByRole("button", { name: "Send message" });
    expect(send).toBeDisabled();
    await user.type(getByRole("textbox"), "hey");
    expect(send).not.toBeDisabled();
  });

  test("clicking send fires onSubmit and clears the field (uncontrolled)", async () => {
    const onSubmit = mock();
    const { getByRole, user } = renderC(<ChatInput onSubmit={onSubmit} />);
    const field = getByRole("textbox") as HTMLTextAreaElement;
    await user.type(field, "send me");
    await user.click(getByRole("button", { name: "Send message" }));
    expect(onSubmit).toHaveBeenCalledWith("send me");
    expect(field.value).toBe("");
  });

  test("mic button renders only when onMicToggle set, fires it, and has aria attrs", async () => {
    const without = renderC(<ChatInput />);
    expect(without.root.querySelector(".sk-chat-input__mic")).toBeNull();

    const onMicToggle = mock();
    const { getByRole, user } = renderC(<ChatInput onMicToggle={onMicToggle} />);
    const mic = getByRole("button", { name: "Start voice input" });
    expect(mic).toHaveClass("sk-chat-input__mic");
    expect(mic).toHaveAttribute("aria-pressed", "false");
    await user.click(mic);
    expect(onMicToggle).toHaveBeenCalledTimes(1);
  });

  test("mic reflects recording state via aria-label/aria-pressed/data-mic-state", () => {
    const { getByRole } = renderC(<ChatInput onMicToggle={() => {}} state="recording" />);
    const mic = getByRole("button", { name: "Stop recording" });
    expect(mic).toHaveAttribute("aria-pressed", "true");
    expect(mic).toHaveAttribute("data-mic-state", "recording");
  });

  test("maxLength renders a char count that gains data-over-limit when exceeded", async () => {
    const { root, getByRole, user } = renderC(<ChatInput maxLength={5} />);
    const count = root.querySelector(".sk-chat-input__char-count")!;
    expect(count).not.toBeNull();
    expect(count).toHaveTextContent("0/5");
    expect(count).not.toHaveAttribute("data-over-limit");

    await user.type(getByRole("textbox"), "abcdef"); // 6 > 5
    expect(count).toHaveTextContent("6/5");
    expect(count).toHaveAttribute("data-over-limit", "");
  });

  test("renders the hint when provided", () => {
    const { root } = renderC(<ChatInput hint="Press Enter to send" />);
    expect(root.querySelector(".sk-chat-input__hint")).toHaveTextContent("Press Enter to send");
  });

  test("state=streaming locks (disables) the field", () => {
    const { getByRole } = renderC(<ChatInput state="streaming" />);
    expect(getByRole("textbox")).toBeDisabled();
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<ChatInput className="extra" />);
    expect(root).toHaveClass("sk-chat-input");
    expect(root).toHaveClass("extra");
  });
});
