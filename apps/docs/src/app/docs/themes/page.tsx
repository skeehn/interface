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
}

const THEMES: ThemeInfo[] = [
  {
    name: 'default',
    label: 'Default',
    description:
      'Clean light theme with subtle dither textures. The starting point for most projects.',
    signature: 'Bayer dither overlays, neutral palette, balanced contrast',
  },
  {
    name: 'dark',
    label: 'Dark',
    description:
      'Deep dark mode with CRT scanline overlay and phosphor-green accents.',
    signature: 'Scanline pseudo-element, reduced opacity dithering, dark surfaces',
  },
  {
    name: 'terminal',
    label: 'Terminal',
    description:
      'Full green-on-black terminal aesthetic. Every element looks like it belongs in a VT100.',
    signature: 'Monospace everything, green phosphor colors, blinking cursor accents',
  },
  {
    name: 'brutal',
    label: 'Brutal',
    description:
      'High contrast black and white with thick borders and aggressive typography.',
    signature: 'No border-radius, heavy borders, stark black/white, offset shadows',
  },
  {
    name: 'print',
    label: 'Print',
    description:
      'Newspaper-inspired with halftone dot patterns and serif typography vibes.',
    signature: 'Halftone dither pattern, warm paper background, ink-black text',
  },
  {
    name: 'grain',
    label: 'Grain',
    description:
      'Film grain overlay with muted, desaturated tones. Analog photography feel.',
    signature: 'Noise texture overlay, desaturated palette, soft contrast',
  },
  {
    name: 'mardi-gras',
    label: 'Mardi Gras',
    description:
      'Vibrant purple, gold, and green inspired by New Orleans carnival culture.',
    signature: 'Rich jewel tones, gold accents, festive energy, NOLA spirit',
  },
];

/* ═══════════════════════════════════════════════════════════════
   THEME GALLERY
   ═══════════════════════════════════════════════════════════════ */

export default function ThemesPage() {
  const [activeTheme, setActiveTheme] = useState('default');

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [activeTheme]);

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: 'var(--sk-font-mono)',
        /* Break out of the max-w-3xl prose container */
        width: '100vw',
        maxWidth: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-6 border-b"
        style={{ borderColor: 'hsl(var(--sk-border-color))' }}
      >
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--sk-font-sans)' }}
        >
          Theme Gallery
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: 'hsl(var(--sk-muted-foreground))' }}
        >
          7 themes, each with a distinct personality. Click any card to apply it
          site-wide.
        </p>
        <div
          className="mt-3 text-xs"
          style={{ color: 'hsl(var(--sk-muted-foreground))' }}
        >
          Active:{' '}
          <span style={{ color: 'hsl(var(--sk-foreground))', fontWeight: 700 }}>
            {activeTheme}
          </span>
        </div>
      </div>

      {/* Theme grid */}
      <div className="p-6">
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          }}
        >
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
      <div
        className="px-6 py-8 border-t"
        style={{ borderColor: 'hsl(var(--sk-border-color))' }}
      >
        <h2
          className="text-lg font-bold mb-4"
          style={{ fontFamily: 'var(--sk-font-sans)' }}
        >
          Usage
        </h2>
        <div
          style={{
            background: 'hsl(var(--sk-muted) / 0.3)',
            border: 'var(--sk-border)',
            borderRadius: 'var(--sk-radius)',
            padding: 'var(--sk-space-4)',
            fontFamily: 'var(--sk-font-mono)',
            fontSize: 'var(--sk-font-size-sm)',
          }}
        >
          <div style={{ color: 'hsl(var(--sk-muted-foreground))', marginBottom: '0.5rem' }}>
            {'//'} Import a theme CSS file:
          </div>
          <div>@import &quot;@skeehn/core/themes/terminal.css&quot;;</div>
          <br />
          <div style={{ color: 'hsl(var(--sk-muted-foreground))', marginBottom: '0.5rem' }}>
            {'//'} Or apply dynamically with a data attribute:
          </div>
          <div>&lt;html data-theme=&quot;terminal&quot;&gt;</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   THEME CARD — isolated preview with data-theme scope
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
      data-theme={theme.name}
      onClick={onSelect}
      style={{
        border: isActive
          ? '2px solid hsl(var(--sk-primary))'
          : '2px solid hsl(var(--sk-border-color))',
        borderRadius: 'var(--sk-radius)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
        background: 'hsl(var(--sk-background))',
        color: 'hsl(var(--sk-foreground))',
      }}
    >
      {/* Preview area */}
      <div style={{ padding: 'var(--sk-space-4)' }}>
        {/* Theme name badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--sk-space-3)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--sk-font-mono)',
              fontSize: 'var(--sk-font-size-sm)',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            {theme.label}
          </span>
          {isActive && (
            <span
              style={{
                fontSize: '0.6rem',
                padding: '0.1em 0.5em',
                background: 'hsl(var(--sk-primary))',
                color: 'hsl(var(--sk-primary-fg))',
                borderRadius: 'var(--sk-radius)',
                fontFamily: 'var(--sk-font-mono)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Active
            </span>
          )}
        </div>

        {/* Sample components */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--sk-space-2)',
            marginBottom: 'var(--sk-space-3)',
          }}
        >
          {/* Button */}
          <span
            className="sk-button"
            style={{
              display: 'inline-block',
              padding: 'var(--sk-space-1) var(--sk-space-3)',
              border: 'var(--sk-border)',
              fontFamily: 'var(--sk-font-mono)',
              fontSize: 'var(--sk-font-size-xs)',
              background: 'hsl(var(--sk-primary))',
              color: 'hsl(var(--sk-primary-fg))',
              borderRadius: 'var(--sk-radius)',
            }}
          >
            Button
          </span>

          {/* Badge */}
          <span
            style={{
              display: 'inline-block',
              padding: '0.1em var(--sk-space-2)',
              border: 'var(--sk-border)',
              fontFamily: 'var(--sk-font-mono)',
              fontSize: 'var(--sk-font-size-xs)',
              borderRadius: 'var(--sk-radius-full)',
              background: 'hsl(var(--sk-muted) / 0.5)',
              color: 'hsl(var(--sk-muted-foreground))',
            }}
          >
            badge
          </span>

          {/* Accent badge */}
          <span
            style={{
              display: 'inline-block',
              padding: '0.1em var(--sk-space-2)',
              fontFamily: 'var(--sk-font-mono)',
              fontSize: 'var(--sk-font-size-xs)',
              borderRadius: 'var(--sk-radius-full)',
              background: 'hsl(var(--sk-accent))',
              color: 'hsl(var(--sk-accent-foreground))',
            }}
          >
            accent
          </span>
        </div>

        {/* Card sample */}
        <div
          style={{
            border: 'var(--sk-border)',
            borderRadius: 'var(--sk-radius)',
            padding: 'var(--sk-space-3)',
            background: 'hsl(var(--sk-surface))',
            marginBottom: 'var(--sk-space-3)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--sk-font-mono)',
              fontSize: 'var(--sk-font-size-xs)',
              color: 'hsl(var(--sk-muted-foreground))',
            }}
          >
            {'>'} sample card content
          </div>
        </div>

        {/* Input sample */}
        <div
          style={{
            border: 'var(--sk-border)',
            borderRadius: 'var(--sk-radius)',
            padding: 'var(--sk-space-2) var(--sk-space-3)',
            fontFamily: 'var(--sk-font-mono)',
            fontSize: 'var(--sk-font-size-xs)',
            color: 'hsl(var(--sk-muted-foreground))',
            background: 'hsl(var(--sk-background))',
          }}
        >
          placeholder text...
        </div>
      </div>

      {/* Description */}
      <div
        style={{
          padding: 'var(--sk-space-3) var(--sk-space-4)',
          borderTop: '1px solid hsl(var(--sk-border-color))',
          background: 'hsl(var(--sk-muted) / 0.2)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--sk-font-sans)',
            fontSize: 'var(--sk-font-size-sm)',
            lineHeight: 1.5,
            marginBottom: 'var(--sk-space-2)',
          }}
        >
          {theme.description}
        </p>
        <p
          style={{
            fontFamily: 'var(--sk-font-mono)',
            fontSize: '0.65rem',
            color: 'hsl(var(--sk-muted-foreground))',
            letterSpacing: '0.02em',
          }}
        >
          {theme.signature}
        </p>
      </div>
    </div>
  );
}
