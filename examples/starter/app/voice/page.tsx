"use client";

import { useState } from "react";
import { VoiceConsole } from "@skeehn/react/blocks";
import { Button } from "@skeehn/react";
import type { VoiceSessionStatus } from "@skeehn/react";

const STATES: VoiceSessionStatus[] = ["idle", "listening", "transcribing", "speaking"];

export default function VoicePage() {
  const [status, setStatus] = useState<VoiceSessionStatus>("listening");

  return (
    <main style={{ maxWidth: 560, margin: "40px auto", padding: 20 }}>
      <VoiceConsole
        title="skeehn voice"
        status={status}
        clock="00:12"
        transcript={[
          { role: "user", text: "What's the weather looking like today?" },
          { role: "assistant", text: "Clear skies, 72°F, light breeze from the west." },
        ]}
        hint="Demo — wire onMute / onEnd to your voice runtime (LiveKit, OpenAI Realtime, …)."
        onMute={() => {}}
        onEnd={() => setStatus("idle")}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        {STATES.map((s) => (
          <Button key={s} variant={status === s ? "solid" : "outline"} size="sm" onClick={() => setStatus(s)}>
            {s}
          </Button>
        ))}
      </div>
    </main>
  );
}
