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
  Alert,
  ToolCard,
  CodeBlock,
  Toggle,
} from "@skeehn/react";
import { deriveTheme, toCss, toStyleVars } from "@/lib/theme-generator";

const PRESETS: [string, string][] = [
  ["#7c3aed", "Violet"],
  ["#0ea5e9", "Sky"],
  ["#f97316", "Flame"],
  ["#10b981", "Emerald"],
  ["#e11d48", "Rose"],
  ["#eab308", "Gold"],
  ["#64748b", "Slate"],
  ["#000000", "Ink"],
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
    } catch { /* clipboard unavailable */ }
  }, [css]);

  return (
    <div className="max-w-3xl">
      {/* ── Header ────────────────────────────────────────────────── */}
      <p className="docs-label mb-3">Customize</p>
      <h1 className="docs-heading text-3xl sm:text-4xl tracking-tight mb-4">
        Brand theme generator
      </h1>
      <p className="text-base text-muted-fg leading-relaxed mb-8 max-w-prose">
        One brand color. One radius. A complete{" "}
        <code className="sk-code-inline">--sk-*</code> token set — light{" "}
        <em>and</em> dark — ready to drop into any skeehn project.
      </p>

      {/* ── Controls ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-surface mb-8 overflow-hidden">
        {/* Color + radius row */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 p-4 border-b border-border">
          {/* Color swatch picker */}
          <label className="flex items-center gap-3">
            <span
              className="relative w-10 h-10 rounded-lg border-2 border-border cursor-pointer overflow-hidden shrink-0"
              style={{ background: color }}
              title="Pick brand color"
            >
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                aria-label="Brand color picker"
              />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-fg font-mono uppercase tracking-wider">Brand</span>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-24 font-mono text-sm bg-transparent border-b border-border focus:border-foreground outline-none pb-0.5 transition-colors"
                spellCheck={false}
                aria-label="Brand color hex"
              />
            </div>
          </label>

          {/* Radius slider */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-fg font-mono uppercase tracking-wider">Radius</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-28"
                  aria-label="Corner radius"
                />
                <span className="font-mono text-xs text-muted-fg w-10 tabular-nums">{radius}px</span>
              </div>
            </div>
          </div>

          {/* Light/dark mode toggle */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-mono text-muted-fg">Light</span>
            <Toggle
              checked={mode === "dark"}
              onChange={(e) => setMode(e.target.checked ? "dark" : "light")}
              aria-label="Toggle dark mode preview"
            />
            <span className="text-xs font-mono text-muted-fg">Dark</span>
          </div>
        </div>

        {/* Preset swatches */}
        <div className="flex flex-wrap items-center gap-2 p-4">
          <span className="text-xs font-mono text-muted-fg uppercase tracking-wider mr-1">Presets</span>
          {PRESETS.map(([hex, name]) => (
            <button
              key={hex}
              onClick={() => setColor(hex)}
              title={name}
              aria-label={`Set brand to ${name}`}
              className="group flex items-center gap-1.5 px-2 py-1 rounded-md border border-transparent hover:border-border transition-all"
            >
              <span
                className="w-4 h-4 rounded-full border border-black/10 shrink-0 transition-transform group-hover:scale-110"
                style={{ background: hex }}
              />
              <span className="text-xs font-mono text-muted-fg group-hover:text-foreground transition-colors">
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Live preview ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <p className="docs-label">Live preview — {mode}</p>
        <Badge variant="outline" data-variant="outline">
          hue {theme.hue}° · r{radius}
        </Badge>
      </div>

      <div
        className="rounded-xl border border-border p-5 mb-8"
        style={{
          ...(previewVars as CSSProperties),
          background: "hsl(var(--sk-background))",
          color: "hsl(var(--sk-foreground))",
        }}
      >
        <div className="flex flex-col gap-5">
          {/* Buttons + badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="solid">Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Badge variant="solid">solid</Badge>
            <Badge color="success">success</Badge>
            <Badge color="warning">warning</Badge>
            <Badge color="destructive">error</Badge>
          </div>

          {/* Alert */}
          <Alert
            type="info"
            title="Theme applied"
            description="All components inherit these tokens — no rewrites needed."
          />

          {/* Card with chat */}
          <Card>
            <CardHeader><CardTitle>Brand card</CardTitle></CardHeader>
            <CardBody>
              <div className="flex flex-col gap-2.5">
                <ChatBubble role="user">Make it match our brand.</ChatBubble>
                <ChatBubble role="assistant">
                  Done — every surface picks up your accent and radius.
                </ChatBubble>
                <ToolCard name="apply_theme" status="success">
                  data-theme=&quot;brand&quot; applied
                </ToolCard>
                <Input placeholder="Type a message…" />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* ── Generated CSS ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <p className="docs-label">Generated CSS</p>
        <button
          onClick={copy}
          className="text-xs font-mono px-3 py-1.5 rounded-md border border-border text-muted-fg hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          {copied ? "✓ Copied" : "⧉ Copy CSS"}
        </button>
      </div>
      <div data-theme="default">
        <CodeBlock language="css" code={css} />
      </div>

      <p className="text-sm text-muted-fg mt-6">
        Paste after the skeehn engine CSS, then set{" "}
        <code className="sk-code-inline">&lt;html data-theme=&quot;brand&quot;&gt;</code> for light
        or <code className="sk-code-inline">brand-dark</code> for dark. Neutrals are lightly
        tinted with your hue; the brand color becomes the accent at a readable lightness in both modes.
      </p>
    </div>
  );
}
