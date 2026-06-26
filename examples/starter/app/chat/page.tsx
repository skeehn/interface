"use client";

import { useChat } from "@ai-sdk/react";
import { ChatConsole } from "@skeehn/react/blocks";

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat();

  return (
    <main style={{ maxWidth: 780, margin: "0 auto", padding: 20, height: "calc(100dvh - 54px)" }}>
      <ChatConsole
        title="skeehn chat"
        messages={messages}
        busy={status === "streaming" || status === "submitted"}
        onSend={(text) => sendMessage({ text })}
        suggestions={[
          { value: "a", text: "Explain dithering in one paragraph" },
          { value: "b", text: "Write a haiku about ASCII art" },
          { value: "c", text: "Refactor a nested loop to O(n)" },
        ]}
        style={{ height: "100%" }}
      />
    </main>
  );
}
