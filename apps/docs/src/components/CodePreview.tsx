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

/*
 * Basic syntax highlighting via regex.
 * - keywords  -> purple
 * - strings   -> green
 * - functions -> yellow
 * - comments  -> gray
 * - jsx tags  -> blue
 */
function highlightLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  const patterns: Array<{
    regex: RegExp;
    className: string;
  }> = [
    // single-line comments
    { regex: /^(\/\/.*)/, className: "text-foreground/30" },
    // strings (single or double quoted)
    { regex: /^('[^']*'|"[^"]*"|`[^`]*`)/, className: "text-green-400" },
    // JSX tags like <ChatBubble, </div>, />
    { regex: /^(<\/?[A-Za-z][A-Za-z0-9.]*|\/?>)/, className: "text-sky-400" },
    // keywords
    {
      regex:
        /^(import|from|export|function|const|let|var|return|if|else|new|typeof|instanceof|class|extends|default)\b/,
      className: "text-purple-400",
    },
    // function calls like useChat(, .map(
    { regex: /^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/, className: "text-yellow-300" },
    // property/key before colon
    { regex: /^([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*:)/, className: "text-sky-300" },
    // JSX attributes like key=, role=
    { regex: /^([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*=)/, className: "text-sky-300" },
    // regular identifiers
    { regex: /^([a-zA-Z_$][a-zA-Z0-9_$]*)/, className: "text-foreground/80" },
    // braces, parens, operators, punctuation
    { regex: /^([{}()[\];,=>.!?:&|+\-*/%]+)/, className: "text-foreground/40" },
    // whitespace
    { regex: /^(\s+)/, className: "" },
    // anything else (single char fallback)
    { regex: /^(.)/, className: "text-foreground/60" },
  ];

  while (remaining.length > 0) {
    let matched = false;
    for (const { regex, className } of patterns) {
      const match = remaining.match(regex);
      if (match) {
        const text = match[0];
        tokens.push(
          className ? (
            <span key={key++} className={className}>
              {text}
            </span>
          ) : (
            <span key={key++}>{text}</span>
          )
        );
        remaining = remaining.slice(text.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

export function CodePreview() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const lines = CODE.split("\n");

  return (
    <div className="bg-background/60 border border-white/10 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <span className="text-xs text-foreground/40 font-mono">chat.tsx</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-foreground/40 hover:text-foreground transition-colors font-mono cursor-pointer px-2 py-1 hover:bg-white/10"
          aria-label="Copy code"
        >
          {copied ? "copied!" : "copy"}
        </button>
      </div>

      {/* Code block */}
      <div className="overflow-x-auto">
        <pre className="p-6 text-xs sm:text-sm leading-relaxed font-mono">
          <code>
            {lines.map((line, i) => (
              <span key={i} className="block">
                <span className="inline-block w-8 text-right mr-6 text-foreground/20 select-none text-xs">
                  {i + 1}
                </span>
                {highlightLine(line)}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
