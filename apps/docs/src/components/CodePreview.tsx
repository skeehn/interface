"use client";

import { useState, useCallback } from "react";

const CODE = `import { ChatBubble, useChat } from '@skeehn/react';

export function Chat() {
  const { messages, input, setInput, append } = useChat({
    api: '/api/chat',
  });

  return (
    <div>
      {messages.map(m => (
        <ChatBubble key={m.id} role={m.role}>
          {m.content}
        </ChatBubble>
      ))}
    </div>
  );
}`;

export function CodePreview() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <div className="relative border border-border bg-background overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-fg font-mono">chat.tsx</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-muted-fg hover:text-foreground transition-colors font-mono cursor-pointer"
          aria-label="Copy code"
        >
          {copied ? "copied!" : "copy"}
        </button>
      </div>

      {/* Code block */}
      <div className="overflow-x-auto">
        <pre className="p-6 text-xs sm:text-sm leading-relaxed font-mono">
          <code>
            {CODE.split("\n").map((line, i) => (
              <span key={i} className="block">
                <span className="inline-block w-8 text-right mr-4 text-muted-fg/40 select-none">
                  {i + 1}
                </span>
                <span className="text-foreground">{line}</span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
