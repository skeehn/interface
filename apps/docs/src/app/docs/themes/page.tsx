'use client';

import { useState, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   THEME DATA
   ═══════════════════════════════════════════════════════════════ */

interface ThemeInfo {
  name: string;
  label: string;
  description: string;
  signature: string;
  accent: string;     // CSS color for signature stripe
  bgPreview: string;  // background for card preview area
  fgPreview: string;  // foreground text in preview
}

const THEMES: ThemeInfo[] = [
  // ── Neutral default (Light + Dark) ──
  {
    name: 'light',
    label: 'Light',
    description:
      'The clean, neutral default — what ships out of the box. Restrained greys, one tasteful teal accent, soft rounding, no dither.',
    signature: 'Neutral palette, hairline borders, no dither',
    accent: '#1c8a7c',
    bgPreview: '#ffffff',
    fgPreview: '#1a1f29',
  },
  {
    name: 'dark',
    label: 'Dark',
    description:
      'The neutral default in dark mode. Cool greys, the same teal accent — clean and quiet, no glow or scanlines.',
    signature: 'Neutral cool-dark, hairline borders, no dither',
    accent: '#34c9b6',
    bgPreview: '#11141a',
    fgPreview: '#eef1f5',
  },
  // ── Flagship themes (opt-in personalities) ──
  {
    name: 'default',
    label: 'Editorial',
    description:
      'The signature flagship: warm near-black, refined teal, tasteful Bayer dither. Premium and opinionated.',
    signature: 'Warm dark, dual-font sans/mono, committed dither',
    accent: '#5ec8b4',
    bgPreview: '#0f0f12',
    fgPreview: '#e9e7e3',
  },
  {
    name: 'terminal',
    label: 'Terminal',
    description:
      'Full green-on-black CRT. Every element looks like it belongs in a VT220 — scanlines and all.',
    signature: 'Monospace everything, green phosphor, scanline overlay',
    accent: '#22c55e',
    bgPreview: '#000',
    fgPreview: '#22c55e',
  },
  {
    name: 'brutal',
    label: 'Brutal',
    description:
      'Loud and high-contrast: hard 2px borders, gold accent, aggressive type, offset shadows.',
    signature: 'No border-radius, heavy borders, gold on black',
    accent: '#ffd23f',
    bgPreview: '#0a0a0a',
    fgPreview: '#fff',
  },
  {
    name: 'print',
    label: 'Print',
    description:
      'Newsprint-inspired: halftone dot patterns on warm paper, ink-black text. Optimized for print.',
    signature: 'Halftone dither, warm paper background, ink-black text',
    accent: '#b8860b',
    bgPreview: '#f5f0e8',
    fgPreview: '#1a1a1a',
  },
  {
    name: 'grain',
    label: 'Grain',
    description:
      'Analog film: warm cream paper, desaturated tones, a fine grain overlay. Soft and tactile.',
    signature: 'Noise texture, warm desaturated palette, soft contrast',
    accent: '#9a8b73',
    bgPreview: '#ece5d8',
    fgPreview: '#33302a',
  },
  {
    name: 'mardi-gras',
    label: 'Mardi Gras',
    description:
      'Vibrant purple, gold, and green inspired by New Orleans carnival culture.',
    signature: 'Rich jewel tones, gold accents, festive energy',
    accent: '#fbbf24',
    bgPreview: '#1a0a2e',
    fgPreview: '#fbbf24',
  },
];

/* ═══════════════════════════════════════════════════════════════
   THEME GALLERY
   ═══════════════════════════════════════════════════════════════ */

export default function ThemesPage() {
  const [activeTheme, setActiveTheme] = useState('light');

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [activeTheme]);

  return (
    <div
      className="min-h-screen w-full relative"
    >
      {/* Header */}
      <div className="px-8 py-8 border-b border-border">
        <h1 className="docs-heading text-3xl tracking-tight mb-2"
          style={{ fontFamily: 'var(--sk-font-sans)' }}>
          Theme Gallery
        </h1>
        <p className="text-sm text-muted-fg max-w-lg">
          A clean, neutral <strong className="text-foreground font-medium">Light</strong> and{' '}
          <strong className="text-foreground font-medium">Dark</strong> default — plus six opt-in
          flagship themes, each a distinct personality. Click any card to apply it site-wide and
          watch the whole page transform.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-surface">
          <span className="text-[10px] uppercase tracking-widest text-muted-fg">Active</span>
          <span className="text-sm font-bold text-foreground">{activeTheme}</span>
        </div>
      </div>

      {/* Theme grid */}
      <div className="p-8">
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
          {THEMES.map((theme) => (
            <ThemeCard
              key={theme.name}
              theme={theme}
              isActive={activeTheme === theme.name}
              onSelect={() => setActiveTheme(theme.name)}
            />
          ))}
        </div>
      </div>

      {/* Usage section */}
      <div className="px-8 py-10 border-t border-border">
        <h2 className="docs-heading text-lg mb-6"
          style={{ fontFamily: 'var(--sk-font-sans)' }}>
          Usage
        </h2>
        <div className="bg-background border border-border p-5 font-mono text-sm max-w-2xl">
          <div className="text-muted-fg mb-2">// Import a theme CSS file:</div>
          <div className="text-foreground">@import &quot;@skeehn/core/themes/terminal.css&quot;;</div>
          <br />
          <div className="text-muted-fg mb-2">// Or apply dynamically with a data attribute:</div>
          <div className="text-foreground">&lt;html data-theme=&quot;terminal&quot;&gt;</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   THEME CARD — visually distinct per theme
   ═══════════════════════════════════════════════════════════════ */

function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: ThemeInfo;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer transition-all overflow-hidden group ${
        isActive
          ? 'ring-2 ring-accent ring-offset-2 ring-offset-background'
          : 'hover:-translate-y-0.5'
      }`}
      style={{ border: '1px solid hsl(var(--sk-border-color))', borderRadius: '12px' }}
    >
      {/* Accent stripe at top */}
      <div className="h-1" style={{ background: theme.accent }} />

      {/* Preview area — uses theme's signature colors */}
      <div
        className="p-5"
        style={{ background: theme.bgPreview, color: theme.fgPreview }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-bold font-mono tracking-tight">
            {theme.label}
          </span>
          {isActive ? (
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold"
              style={{ color: theme.accent }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke={theme.accent} strokeWidth="1.5" />
                <path d="M3.5 6L5.5 8L8.5 4.5" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Active
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-60 transition-opacity">
              Click to apply
            </span>
          )}
        </div>

        {/* Sample components row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Button preview */}
          <span
            className="inline-block px-3 py-1 text-[11px] font-mono font-bold"
            style={{
              background: theme.accent,
              color: theme.bgPreview,
            }}
          >
            Button
          </span>

          {/* Badge preview */}
          <span
            className="inline-block px-2 py-0.5 text-[11px] font-mono rounded-full"
            style={{
              border: `1px solid ${theme.fgPreview}40`,
              color: theme.fgPreview,
              opacity: 0.7,
            }}
          >
            badge
          </span>

          {/* Accent chip */}
          <span
            className="inline-block px-2 py-0.5 text-[11px] font-mono"
            style={{
              background: `${theme.accent}20`,
              color: theme.accent,
            }}
          >
            accent
          </span>
        </div>

        {/* Card preview */}
        <div
          className="p-3 mb-3 text-xs font-mono"
          style={{
            border: `1px solid ${theme.fgPreview}20`,
            color: `${theme.fgPreview}80`,
          }}
        >
          {'>'} sample card content
        </div>

        {/* Input preview */}
        <div
          className="px-3 py-2 text-xs font-mono"
          style={{
            border: `1px solid ${theme.fgPreview}15`,
            color: `${theme.fgPreview}40`,
            background: `${theme.bgPreview}`,
          }}
        >
          placeholder text...
        </div>
      </div>

      {/* Description footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: 'hsl(var(--sk-border-color))', background: 'hsl(var(--sk-surface))' }}>
        <p className="text-sm leading-relaxed text-foreground mb-2"
          style={{ fontFamily: 'var(--sk-font-sans)' }}>
          {theme.description}
        </p>
        <p className="text-[11px] text-muted-fg font-mono">
          {theme.signature}
        </p>
      </div>
    </div>
  );
}
