"use client";

import { useState, useCallback } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

// Basic syntax coloring for TSX/JSX
function tokenizeLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  const patterns: [RegExp, string][] = [
    // Comments
    [/^(\/\/.*)/, 'text-neutral-500 italic'],
    // Strings (double-quoted)
    [/^("[^"]*")/, 'text-amber-300'],
    // Strings (single-quoted)
    [/^('[^']*')/, 'text-amber-300'],
    // Template strings
    [/^(`[^`]*`)/, 'text-amber-300'],
    // JSX tags and angle brackets
    [/^(<\/?[\w.-]+)/, 'text-red-400'],
    // Closing >
    [/^(\/>|>)/, 'text-red-400'],
    // Keywords
    [/^(import|export|from|const|let|var|function|return|if|else|default|async|await|new|typeof|class|extends|implements|interface|type)\b/, 'text-violet-400'],
    // Built-in values
    [/^(true|false|null|undefined|this)\b/, 'text-orange-400'],
    // Numbers
    [/^(\d+\.?\d*)/, 'text-cyan-400'],
    // Braces and parens
    [/^([{}()\[\]])/, 'text-neutral-400'],
    // Operators and punctuation
    [/^([=+\-*/<>!&|?:;,.]+)/, 'text-neutral-500'],
    // Identifiers (prop names before =)
    [/^(\w+)(?==)/, 'text-cyan-300'],
    // Regular identifiers
    [/^(\w+)/, 'text-neutral-200'],
    // Whitespace
    [/^(\s+)/, ''],
  ];

  while (remaining.length > 0) {
    let matched = false;
    for (const [pattern, className] of patterns) {
      const match = remaining.match(pattern);
      if (match) {
        const text = match[1] || match[0];
        if (className) {
          tokens.push(<span key={key++} className={className}>{text}</span>);
        } else {
          tokens.push(<span key={key++}>{text}</span>);
        }
        remaining = remaining.slice(text.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push(<span key={key++} className="text-neutral-200">{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

export function CodeBlock({
  code,
  language = "tsx",
  filename,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const lines = code.split("\n");

  return (
    <div className="bg-neutral-950 border border-neutral-800 overflow-hidden">
      {/* Header */}
      {(filename || language) && (
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            {filename && (
              <span className="text-xs text-neutral-400 font-mono">{filename}</span>
            )}
            {!filename && language && (
              <span className="text-xs text-neutral-500 font-mono">{language}</span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="text-xs text-neutral-500 hover:text-white transition-colors font-mono cursor-pointer"
            aria-label="Copy code to clipboard"
          >
            {copied ? "copied!" : "copy"}
          </button>
        </div>
      )}

      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-xs sm:text-sm leading-relaxed font-mono">
          <code>
            {lines.map((line, i) => (
              <span key={i} className="block">
                {showLineNumbers && (
                  <span className="inline-block w-8 text-right mr-4 text-neutral-700 select-none">
                    {i + 1}
                  </span>
                )}
                {tokenizeLine(line)}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
