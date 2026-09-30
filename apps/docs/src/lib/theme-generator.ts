/**
 * skeehn — brand → theme generator
 *
 * Derive a complete, cohesive skeehn theme (light + dark) across the full
 * `--sk-*` token contract from a single brand color + radius. Neutrals are
 * lightly tinted with the brand hue (kept near-grey); the brand color becomes
 * the accent at a readable lightness. Pure + dependency-free so it runs in the
 * browser (the generator page) or a script.
 */

export interface BrandInput {
  /** Brand color as a hex string (#rrggbb). */
  color: string;
  /** Corner radius in px. @defaultValue 8 */
  radius?: number;
}

export type TokenMap = Record<string, string>;

export interface DerivedTheme {
  light: TokenMap;
  dark: TokenMap;
  radius: number;
  hue: number;
}

/** #rrggbb → [h (0-360), s (0-100), l (0-100)]. */
export function hexToHsl(hex: string): [number, number, number] {
  const m = hex.replace('#', '').match(/.{1,2}/g);
  if (!m || m.length < 3) return [220, 16, 40];
  const [r, g, b] = m.map((x) => parseInt(x, 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

const hsl = (h: number, s: number, l: number) => `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** White text on dark/saturated accents, dark text on light ones. */
const accentFg = (l: number) => (l > 62 ? '0 0% 10%' : '0 0% 100%');

/** Derive a light + dark token set from a brand color. */
export function deriveTheme({ color, radius = 8 }: BrandInput): DerivedTheme {
  const [h, s] = hexToHsl(color);
  const accentS = clamp(s, 35, 88);
  const lAccentL = 42; // readable on a white ground
  const dAccentL = 58; // brightened for a dark ground

  const light: TokenMap = {
    background: '0 0% 100%',
    foreground: hsl(h, 16, 12),
    surface: hsl(h, 20, 98),
    primary: hsl(h, 16, 12),
    'primary-fg': '0 0% 100%',
    secondary: hsl(h, 14, 96),
    'secondary-fg': hsl(h, 16, 12),
    muted: hsl(h, 14, 96),
    'muted-foreground': hsl(h, 8, 45),
    accent: hsl(h, accentS, lAccentL),
    'accent-foreground': accentFg(lAccentL),
    'border-color': hsl(h, 13, 90),
    ring: hsl(h, accentS, lAccentL),
    success: '142 64% 34%',
    warning: '32 90% 44%',
    info: '217 84% 52%',
    destructive: '0 70% 50%',
  };

  const dark: TokenMap = {
    background: hsl(h, 16, 8),
    foreground: hsl(h, 14, 96),
    surface: hsl(h, 14, 11),
    primary: hsl(h, 14, 96),
    'primary-fg': hsl(h, 20, 9),
    secondary: hsl(h, 12, 16),
    'secondary-fg': hsl(h, 14, 96),
    muted: hsl(h, 12, 15),
    'muted-foreground': hsl(h, 8, 62),
    accent: hsl(h, accentS, dAccentL),
    'accent-foreground': accentFg(dAccentL),
    'border-color': hsl(h, 12, 20),
    ring: hsl(h, accentS, dAccentL),
    success: '150 55% 50%',
    warning: '38 90% 58%',
    info: '199 70% 60%',
    destructive: '0 72% 60%',
  };

  return { light, dark, radius, hue: h };
}

function radiusBlock(radius: number): string {
  const r = Math.max(0, radius);
  return [
    `  --sk-radius: ${r}px; --sk-radius-sm: ${Math.max(0, r - 2)}px; --sk-radius-md: ${r + 2}px; --sk-radius-lg: ${r + 6}px;`,
    `  --sk-radius-panel: ${r + 4}px; --sk-radius-control: ${Math.max(0, r - 1)}px;`,
  ].join('\n');
}

function themeBlock(selector: string, tokens: TokenMap, radius: number, scheme: 'light' | 'dark', ditherOpacity: number): string {
  const lines = Object.entries(tokens).map(([k, v]) => `  --sk-${k}: ${v};`);
  return [
    `[data-theme="${selector}"] {`,
    ...lines,
    radiusBlock(radius),
    `  --sk-border-width: 1px;`,
    `  --sk-dither-pattern: var(--sk-dither-b2);`,
    `  --sk-dither-opacity: ${ditherOpacity};`,
    `  color-scheme: ${scheme};`,
    `}`,
  ].join('\n');
}

/** Serialize a derived theme to CSS: `[data-theme="<name>"]` (light) + `<name>-dark`. */
export function toCss(name: string, theme: DerivedTheme, options?: { ditherOpacity?: number }): string {
  const ditherOpacity = options?.ditherOpacity ?? 0;
  return [
    `/* skeehn theme "${name}" — generated from a brand color. Drop into your global CSS. */`,
    themeBlock(name, theme.light, theme.radius, 'light', ditherOpacity),
    '',
    themeBlock(`${name}-dark`, theme.dark, theme.radius, 'dark', ditherOpacity),
    '',
  ].join('\n');
}

/** Inline `style` props for one token map — used to preview a theme on a wrapper element. */
export function toStyleVars(tokens: TokenMap, radius: number, options?: { ditherOpacity?: number }): Record<string, string> {
  const r = Math.max(0, radius);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(tokens)) out[`--sk-${k}`] = v;
  out['--sk-radius'] = `${r}px`;
  out['--sk-radius-sm'] = `${Math.max(0, r - 2)}px`;
  out['--sk-radius-md'] = `${r + 2}px`;
  out['--sk-radius-lg'] = `${r + 6}px`;
  out['--sk-radius-panel'] = `${r + 4}px`;
  out['--sk-radius-control'] = `${Math.max(0, r - 1)}px`;
  out['--sk-dither-opacity'] = `${options?.ditherOpacity ?? 0}`;
  return out;
}
