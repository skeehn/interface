# skeehn — Roadmap

Living plan. Order is roughly priority; items inside a pass can ship in
any order. Anything marked **deferred** is on this list specifically so
it doesn't get forgotten when a single PR can't carry it.

---

## Status — what's already shipped

- [x] Foundation: tokens, dither engine, 32 components, 11 themes
- [x] Phase 1: SkState convention, ThemeProvider, single-import bundle, 4 new themes (phosphor / amber / risograph / newsprint)
- [x] Pass 2 (editorial brutalist): IconRail sidebar, monumental hero, DitherWebGL `mask`/`maskFade`/`maskAngle` props, pixel-art "s" favicon + nav mark
- [x] Pass 3 (in progress): motion foundation, bento component dock, cinematic scroll motion

---

## Now — Pass 3 (in progress)

- [ ] **Motion foundation** — `--sk-spring-*` tokens, `useReveal` hook (IntersectionObserver), `<RevealOnScroll>` and `<StaggerText>` primitives. Tiny custom spring helper, no framer-motion dep.
- [ ] **Bento hero on /** — 8-cell grid below the headline showing live skeehn components in real states (ChatBubble streaming, ToolCard running → success, Button hover cycle, DitherWebGL in a card with the new mask, etc.). The library finally sells itself.
- [ ] **Cinematic page motion** — character stagger on the hero wordmark, scroll-driven fade/slide on sections, subtle parallax on the dither panel, 150ms route-change fade.

---

## Next — Pass 4 (queued)

- [ ] **C · Surface texture pass** — 1px white top-highlight on dark cards, subtle gradient sheen on buttons, optional grain layer. Tactile detail that brutalist references depend on. Pure CSS via tokens. Fast win.
- [ ] **D1 · Live data in the nav** — GitHub stars badge (cached server-side), npm downloads count, current commit hash. Makes the site feel alive instead of static.
- [ ] **D2 · Theme switcher pinned to the nav** — segmented control of all 11 themes visible on every page so theme variety is on display without going to /docs/themes.
- [ ] **D3 · Cmd+K palette** — full search across docs + components + themes. Recent items, fuzzy match, arrow-key nav. Probably 200-300 LOC of work but no library dep.
- [ ] **D4 · FPS / GPU readout on the dither panel** — tiny overlay in the FIG.01 frame showing real perf data so the engine's performance is provable.

---

## Pass 5 — Component page rebuilds (E)

- [ ] **One editorial spread per component** (32 pages). Template: monumental component name, all variants in a live grid below, sticky props panel on right, code at bottom, related components row. The current template is dense but generic — every page looks the same.
- [ ] **Live state controls** in the preview frame (toggle disabled / loading / error / streaming) so visitors can see every `SkState` without scrolling code.
- [ ] **Copy-paste code with active framework selector** (React / Vue / Svelte adaptations are a future port).

---

## Pass 6 — Engine deepening

- [ ] **OKLCH migration of the 7 legacy themes** — currently only the 4 new presets are perceptually-tuned; the old themes still ship HSL tuples. Migration requires touching every `hsl(var(--sk-*))` callsite in component CSS. High blast radius, low marginal value for neutral palettes, but worth it for consistency.
- [ ] **DitherWebGL: text source** — render arbitrary text to an offscreen canvas and dither it, so DitheredGlyph in the nav can be live not static.
- [ ] **DitherWebGL: video source benchmarks** — verify 60fps holds on 1080p video on mid-range mobile; document the perf envelope.
- [ ] **DitherWebGL: WebGL2 path with instancing** for chunkier patterns at higher resolutions.

---

## Pass 7 — Distribution

- [ ] **Live Stackblitz / CodeSandbox embeds** in every component doc page — click "open in sandbox" to fork a working setup.
- [ ] **Vue + Svelte ports** — currently React-only. Convert the engine + 10 most-used components.
- [ ] **Figma library mirror** — Code Connect mapping so designers can drag the same components in Figma and they auto-generate code.
- [ ] **AI-native preset packs** — one-line installs for "Claude-style chat", "OpenAI playground", "Anthropic console" etc. Pre-wired component combos.

---

## Pass 8 — Brand / showcase

- [ ] **Hero video** — 5-second screen-cap of the bento hero in motion, looped, autoplayed muted. Replaces the static og:image.
- [ ] **`/built-with` page** — gallery of real products using skeehn (start with 3-4 hand-curated, open submissions later).
- [ ] **Tweet / blog launch** — short demo video + a "why skeehn exists" essay.
- [ ] **`skeehn-cli init`** — scaffold a fresh project preconfigured with Tailwind + the engine + a starter chat surface.

---

## Future / unsorted ideas

- ASCII-as-data: `<TextureSurface>` that consumes a 2D array of glyph weights and renders as a procedural ASCII texture
- `<DitheredGlyph>` live nav mark (currently static SVG; live version blocked on the text-source DitherWebGL feature in Pass 6)
- Sound design pack — optional click ticks, hover whoosh, error buzz; honoring `prefers-reduced-motion` and a `<MutedProvider>`
- Theme builder UI — pick base hue + chroma + dither pattern, get a generated theme file
- MCP server bundled — `npx skeehn mcp` exposes the component registry to Claude / agents directly
- Per-component perf budgets enforced in CI — bundle size + render-time budgets, fail PR if breached
- a11y suite — every component has a Playwright accessibility test, axe-core CI gate

---

## How to update this file

Move items between sections as they ship; don't delete shipped items
from the **Status** list. New ideas land in **Future / unsorted** and
graduate to a numbered pass once they're concrete enough to scope.
