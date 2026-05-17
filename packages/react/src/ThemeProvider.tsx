'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * skeehn ThemeProvider
 * --------------------
 * Drop this near the root of your tree to enable runtime theme + density
 * switching. It writes `data-theme="..."` and `data-density="..."` to
 * `<html>` (or a custom element via `target`), honours system color-scheme
 * by default, and exposes `useTheme()` for the rest of the app.
 *
 * SSR-safe: never reads `document` during render. The initial server pass
 * emits children unchanged; the first client effect synchronises the DOM.
 */

export type SkeehnTheme =
  | 'default'
  | 'dark'
  | 'terminal'
  | 'brutal'
  | 'grain'
  | 'print'
  | 'mardi-gras'
  | (string & {});

export type SkeehnDensity = 'sparse' | 'normal' | 'dense' | 'solid';

/** Pseudo-theme value: track the user's system color-scheme preference. */
export type SkeehnThemePreference = SkeehnTheme | 'system';

export interface ThemeProviderProps {
  /** Initial theme. Defaults to 'system' (follows prefers-color-scheme). */
  theme?: SkeehnThemePreference;
  /** Initial density. Defaults to 'normal'. */
  density?: SkeehnDensity;
  /**
   * Storage key for persisting the resolved choices across reloads. Pass
   * `null` (explicit) to disable persistence. Default: 'skeehn-theme'.
   */
  storageKey?: string | null;
  /**
   * Element to write `data-theme` / `data-density` onto. Defaults to
   * `document.documentElement` (<html>). Useful in embedded contexts.
   */
  target?: HTMLElement | null;
  children?: React.ReactNode;
}

interface ThemeContextValue {
  theme: SkeehnThemePreference;
  resolvedTheme: SkeehnTheme;
  density: SkeehnDensity;
  setTheme(theme: SkeehnThemePreference): void;
  setDensity(density: SkeehnDensity): void;
  /** Cycle through the registered themes — useful for keyboard shortcuts. */
  cycleTheme(themes?: SkeehnThemePreference[]): void;
}

const DEFAULT_THEMES: SkeehnThemePreference[] = [
  'default',
  'dark',
  'terminal',
  'brutal',
  'grain',
  'print',
  'mardi-gras',
];

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStorage(key: string | null): { theme?: SkeehnThemePreference; density?: SkeehnDensity } {
  if (!key || typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as { theme?: SkeehnThemePreference; density?: SkeehnDensity }) : {};
  } catch {
    return {};
  }
}

function writeStorage(
  key: string | null,
  value: { theme: SkeehnThemePreference; density: SkeehnDensity },
) {
  if (!key || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage can throw in private-mode or storage-quota scenarios.
  }
}

function systemTheme(): SkeehnTheme {
  if (typeof window === 'undefined') return 'default';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default';
}

export function ThemeProvider({
  theme: themeProp = 'system',
  density: densityProp = 'normal',
  storageKey = 'skeehn-theme',
  target,
  children,
}: ThemeProviderProps) {
  // Render with the prop values on the server; reconcile on the client.
  const [theme, setThemeState] = useState<SkeehnThemePreference>(themeProp);
  const [density, setDensityState] = useState<SkeehnDensity>(densityProp);
  const [systemResolved, setSystemResolved] = useState<SkeehnTheme>('default');

  // First mount: hydrate from storage and read the system preference.
  useEffect(() => {
    const stored = readStorage(storageKey);
    if (stored.theme) setThemeState(stored.theme);
    if (stored.density) setDensityState(stored.density);
    setSystemResolved(systemTheme());

    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemResolved(mq.matches ? 'dark' : 'default');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [storageKey]);

  const resolvedTheme: SkeehnTheme = theme === 'system' ? systemResolved : theme;

  // Sync DOM attributes on every change.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const el = target ?? document.documentElement;
    el.setAttribute('data-theme', resolvedTheme);
    el.setAttribute('data-density', density);
    el.style.colorScheme = resolvedTheme === 'dark' ? 'dark' : 'light';
  }, [resolvedTheme, density, target]);

  // Persist whenever the user-facing values change.
  useEffect(() => {
    writeStorage(storageKey, { theme, density });
  }, [storageKey, theme, density]);

  const setTheme = useCallback((next: SkeehnThemePreference) => setThemeState(next), []);
  const setDensity = useCallback((next: SkeehnDensity) => setDensityState(next), []);
  const cycleTheme = useCallback(
    (themes: SkeehnThemePreference[] = DEFAULT_THEMES) => {
      const idx = themes.indexOf(theme);
      const next = themes[(idx + 1) % themes.length];
      setThemeState(next);
    },
    [theme],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, density, setTheme, setDensity, cycleTheme }),
    [theme, resolvedTheme, density, setTheme, setDensity, cycleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // No-op fallback so call sites work without a provider; useful for
    // isolated component tests and Storybook stories.
    return {
      theme: 'system',
      resolvedTheme: 'default',
      density: 'normal',
      setTheme() {},
      setDensity() {},
      cycleTheme() {},
    };
  }
  return ctx;
}
