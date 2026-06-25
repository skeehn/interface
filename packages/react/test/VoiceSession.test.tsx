import { describe, test, expect, mock } from "bun:test";
import { VoiceSession } from "../src/components/VoiceSession";
import { renderC } from "./harness";

const STATUSES = ["idle", "listening", "transcribing", "speaking", "handoff"] as const;

describe("VoiceSession", () => {
  test("mounts as a div with base class", () => {
    const { root } = renderC(<VoiceSession />);
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("sk-voice-session");
  });

  test("root is a region with an accessible label (default)", () => {
    const { root, getByRole } = renderC(<VoiceSession />);
    expect(root).toHaveAttribute("role", "region");
    expect(root).toHaveAttribute("aria-label", "Voice session");
    expect(getByRole("region")).toBe(root);
  });

  test("label prop overrides the region aria-label", () => {
    const { root } = renderC(<VoiceSession label="Live call" />);
    expect(root).toHaveAttribute("aria-label", "Live call");
  });

  test("defaults to idle status", () => {
    const { root } = renderC(<VoiceSession />);
    expect(root).toHaveAttribute("data-status", "idle");
  });

  test.each(STATUSES)("status=%s sets data-status", (s) => {
    const { root } = renderC(<VoiceSession status={s} />);
    expect(root).toHaveAttribute("data-status", s);
  });

  test("renders 8 default waveform bars when no waveform prop", () => {
    const { root } = renderC(<VoiceSession />);
    expect(root.querySelectorAll(".sk-voice-session__waveform-bar").length).toBe(8);
  });

  test("renders one bar per supplied waveform value", () => {
    const { root } = renderC(<VoiceSession waveform={[0.1, 0.5, 0.9]} />);
    expect(root.querySelectorAll(".sk-voice-session__waveform-bar").length).toBe(3);
  });

  test("renders the clock when provided", () => {
    const { root } = renderC(<VoiceSession clock="00:42" />);
    expect(root.querySelector(".sk-voice-session__clock")).toHaveTextContent("00:42");
  });

  test("transcript container is a polite live region and shows turns by role", () => {
    const { root } = renderC(
      <VoiceSession
        transcript={[
          { role: "user", text: "hello" },
          { role: "assistant", text: "hi there" },
        ]}
      />,
    );
    const transcript = root.querySelector(".sk-voice-session__transcript");
    expect(transcript).not.toBeNull();
    expect(transcript).toHaveAttribute("aria-live", "polite");
    const turns = transcript!.querySelectorAll(".sk-voice-session__turn");
    expect(turns.length).toBe(2);
    expect(turns[0]).toHaveAttribute("data-role", "user");
    expect(turns[0]).toHaveTextContent("hello");
    expect(turns[1]).toHaveAttribute("data-role", "assistant");
  });

  test("omits the transcript container when no transcript", () => {
    const { root } = renderC(<VoiceSession />);
    expect(root.querySelector(".sk-voice-session__transcript")).toBeNull();
  });

  test("no controls bar when neither onMute/onEnd/children supplied", () => {
    const { root } = renderC(<VoiceSession />);
    expect(root.querySelector(".sk-voice-session__controls")).toBeNull();
  });

  test("onMute renders the Mute button and fires on click", async () => {
    const onMute = mock();
    const { getByRole, user } = renderC(
      <VoiceSession onMute={onMute} muteLabel="Mute" />,
    );
    const btn = getByRole("button", { name: "Mute microphone" });
    expect(btn).toHaveAttribute("data-action", "mute");
    expect(btn).toHaveTextContent("Mute");
    await user.click(btn);
    expect(onMute).toHaveBeenCalledTimes(1);
  });

  test("onEnd renders the End button and fires on click", async () => {
    const onEnd = mock();
    const { getByRole, user } = renderC(<VoiceSession onEnd={onEnd} endLabel="End" />);
    const btn = getByRole("button", { name: "End session" });
    expect(btn).toHaveAttribute("data-action", "end");
    expect(btn).toHaveTextContent("End");
    await user.click(btn);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  test("merges custom className while keeping base class", () => {
    const { root } = renderC(<VoiceSession className="extra" />);
    expect(root).toHaveClass("sk-voice-session");
    expect(root).toHaveClass("extra");
  });
});
