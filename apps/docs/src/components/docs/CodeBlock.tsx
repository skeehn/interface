"use client";

import { useState, useCallback } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
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
    <div className="relative border border-border bg-background overflow-hidden my-4">
      {/* Header */}
      {(filename || language) && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface">
          <div className="flex items-center gap-3">
            {filename && (
              <span className="text-xs text-muted-fg font-mono">{filename}</span>
            )}
            {!filename && language && (
              <span className="text-xs text-muted-fg font-mono">{language}</span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="text-xs text-muted-fg hover:text-foreground transition-colors font-mono cursor-pointer"
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
                  <span className="inline-block w-8 text-right mr-4 text-muted-fg/30 select-none">
                    {i + 1}
                  </span>
                )}
                <span className="text-foreground">{line}</span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
