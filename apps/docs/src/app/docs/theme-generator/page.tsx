"use client";

import { useState, useMemo, useCallback, type CSSProperties } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  ChatBubble,
  Badge,
  Input,
  ToolCard,
  CodeBlock,
} from "@skeehn/react";
import { deriveTheme, toCss, toStyleVars } from "@/lib/theme-generator";

const PRESETS: [string, string][] = [
  ["#7c3aed", "Violet"],
  ["#0ea5e9", "Sky"],
  ["#f97316", "Orange"],
  ["#10b981", "Emerald"],
  ["#e11d48", "Rose"],
  ["#eab308", "Gold"],
];

export default function ThemeGeneratorPage() {
  const [color, setColor] = useState("#7c3aed");
  const [radius, setRadius] = useState(8);
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [copied, setCopied] = useState(false);

  const theme = useMemo(() => deriveTheme({ color, radius }), [color, radius]);
  const css = useMemo(() => toCss("brand", theme), [theme]);
  const previewVars = useMemo(
    () => toStyleVars(mode === "light" ? theme.light : theme.dark, radius),
    [theme, mode, radius],
  );

  const copy = useCallback(() => {
    try {
      void navigator.clipboard?.writeText(css);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }, [css]);

  return (
    <div className="max-w-3xl">
      <p className="docs-label mb-3">Customize</p>
      <h1 className="docs-heading text-3xl sm:text-4xl tracking-tight mb-4">Brand theme generator</h1>
      <p className="text-lg text-muted-fg leading-relaxed mb-8">
        Feed a brand color and a corner radius — get a complete skeehn theme (light{" "}
        <em>and</em> dark) derived across the whole <code className="sk-code-inline">--sk-*</code>{" "}
        token contract. Copy the CSS, drop it in your global stylesheet, and set{" "}
        <code className="sk-code-inline">data-theme=&quot;brand&quot;</code>. Every component
        re-skins — no rewrites.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 mb-6 p-4 rounded-xl border border-border bg-surface">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-fg">Brand</span>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-9 h-9 rounded-md border border-border bg-transparent cursor-pointer p-0"
            aria-label="Brand color"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-24 font-mono text-sm bg-background border border-border rounded-md px-2 py-1"
            aria-label="Brand color hex"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-fg">Radius</span>
          <input
            type="range"
            min={0}
            max={20}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            aria-label="Corner radius"
          />
          <span className="font-mono text-xs text-muted-fg w-10">{radius}px</span>
        </label>

        <div className="flex items-center gap-1.5">
          {PRESETS.map(([hex, name]) => (
            <button
              key={hex}
              onClick={() => setColor(hex)}
              title={name}
              aria-label={name}
              className="w-6 h-6 rounded-full border border-border transition-transform hover:scale-110"
              style={{ background: hex }}
            />
          ))}
        </div>

        <div className="ml-auto inline-flex rounded-md border border-border overflow-hidden text-xs font-mono">
          {(["light", "dark"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 transition-colors ${
                mode === m ? "bg-foreground text-background" : "text-muted-fg hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Live preview — components inherit the derived tokens via CSS vars */}
      <p className="docs-label mb-3">Live preview — {mode}</p>
      <div
        className="rounded-xl border border-border p-6 mb-8"
        style={{
          ...(previewVars as CSSProperties),
          background: "hsl(var(--sk-background))",
          color: "hsl(var(--sk-foreground))",
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="solid">Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Badge color="success">success</Badge>
            <Badge variant="outline">v1.0</Badge>
          </div>
          <Card>
            <CardHeader><CardTitle>Brand card</CardTitle></CardHeader>
            <CardBody>
              <div className="flex flex-col gap-2.5">
                <ChatBubble role="user">Make it match our brand.</ChatBubble>
                <ChatBubble role="assistant">Done — every surface picks up your accent and radius.</ChatBubble>
                <ToolCard name="apply_theme" status="success">data-theme=&quot;brand&quot; applied</ToolCard>
                <Input placeholder="Type a message…" />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Generated CSS */}
      <div className="flex items-center justify-between mb-3">
        <p className="docs-label">Generated theme CSS</p>
        <button
          onClick={copy}
          className="text-xs font-mono px-3 py-1.5 rounded-md border border-border text-muted-fg hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          {copied ? "✓ Copied" : "⧉ Copy CSS"}
        </button>
      </div>
      <div data-theme="default"><CodeBlock language="css" code={css} /></div>

      <p className="text-sm text-muted-fg mt-6">
        Paste into your global CSS (after the skeehn engine), then set{" "}
        <code className="sk-code-inline">&lt;html data-theme=&quot;brand&quot;&gt;</code> (or{" "}
        <code className="sk-code-inline">brand-dark</code>). Neutrals are lightly tinted with your
        hue; the brand color becomes the accent at a readable lightness in both modes.
      </p>
    </div>
  );
}
