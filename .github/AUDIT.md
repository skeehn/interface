# skeehn Deep Audit & Transformation Plan

**Date:** 2026-04-06
**Version audited:** 0.3.0
**Auditor scope:** Full codebase — architecture, components, AI UX, rendering engine, design system, performance, production readiness

---

## 1. Executive Summary

**Overall Quality Score: 5.5 / 10**

skeehn is a genuinely original concept — an ASCII/dither-first UI component system — with solid foundational work in its dither algorithms and character engine. However, it is fundamentally **not yet a production-grade system**. It positions itself against shadcn/ui, prompt-kit, and Vercel AI SDK UI, but operates in a completely different technical layer: pure CSS + vanilla JS + Bun, with zero React/Tailwind/Radix dependency.

**Biggest Strengths:**
- Unique visual identity: ASCII characters as a rendering primitive is genuinely novel
- Strong dither algorithm implementations (Floyd-Steinberg, Bayer, Atkinson, Sierra)
- 70-character perceptually calibrated palette is excellent foundational work
- MCP server integration is forward-thinking for AI agent workflows
- Clean CSS custom property token system
- Zero-dependency philosophy keeps things lean

**Biggest Weaknesses:**
- Not React/Tailwind — eliminates 90%+ of the target audience for comparison with shadcn/ui
- Components were CSS-only with no HTML examples (22/25 had none — now fixed)
- No accessibility (ARIA, keyboard nav) existed — now fixed
- No real streaming/interactivity in AI components — now fixed
- No WebGL/Canvas rendering pipeline for real-time effects — now added
- Test suite was existence-checks only, not behavioral — now expanded
- Documentation claims don't match reality (README says 25 components, MCP schema lists 22)

**Readiness:** Alpha. After our fixes: Early Beta. Needs React adapter layer + real documentation site to compete.

---

## 2. Architecture & Build System

### Monorepo Structure
```
skeehn/
├── engine/          # Core: characters, dither, canvas, shader, video, worker, animate
├── components/      # 28 components (CSS + JS + HTML examples)
├── themes/          # 5 theme presets (CSS custom property overrides)
├── packages/
│   ├── mcp-server/  # MCP protocol server (@modelcontextprotocol/sdk)
│   └── api/         # loom: custom API framework (Bun-native)
├── apps/
│   └── registry-api/ # Component registry REST API
├── cli/             # Bun CLI (init, add, theme, density, mcp, schema)
├── tests/           # 321 tests across 5 files
└── docs/            # Documentation
```

### Assessment

| Dimension | Status | Severity |
|-----------|--------|----------|
| Package manager | Bun — good but limits Node.js users | Medium |
| Workspaces | Only `packages/*` and `apps/*` — engine/components not packages | High |
| Build system | None. No tsup/rollup/esbuild. Raw .ts files only | Critical |
| Tree-shaking | N/A — CSS files are atomic, TS files not bundled | High |
| SSR compatibility | canvas.ts crashed without DOM — **fixed** with guard | High (fixed) |
| TypeScript | Was 18 errors — **fixed** to 0 | High (fixed) |
| tsconfig.json | Did not exist — **added** | Critical (fixed) |
| CLI | Functional, copies files. No npx publish story | High |
| Registry | JSON manifest, functional. Component count was inconsistent | Medium (fixed) |
| CI/CD | GitHub Actions: bun test + tsc --noEmit. Minimal | Medium |
| Dependencies | Minimal: zod, @modelcontextprotocol/sdk | Good |

### Critical Finding: No Bundled Output
The project has no build step. Components are raw CSS files. Engine is raw TypeScript. There is no `dist/` output, no `package.json` with proper `exports`, no npm publish workflow. This means:
- Cannot `npm install skeehn` and import components
- Cannot tree-shake
- Cannot use in any bundler pipeline

**Location:** Root `package.json`, all `packages/*/package.json`
**Fix:** Add tsup build config, proper package exports, npm publish workflow

### Critical Finding: loom API Framework is Scope Creep
`packages/api/` contains a full HTTP framework called "loom" that claims to be "30x better than Elysia/Hono." This is a separate product crammed into a UI library. It adds complexity, maintenance burden, and confused positioning.

**Location:** `packages/api/src/index.ts` (515 lines)
**Recommendation:** Extract to separate repo or remove entirely. A UI component library should not ship its own HTTP framework.

---

## 3. Component Design & DX

### Props API
Components use `data-*` HTML attributes for variants/states:
```html
<button class="sk-btn" data-variant="dither" data-size="lg">Click</button>
```

This is clean and framework-agnostic but:
- No TypeScript prop validation at usage time
- No IDE autocomplete
- No compile-time error checking
- Cannot compose components programmatically

### Variant System
Variants are implemented via CSS attribute selectors: `.sk-btn[data-variant="dither"]`. This works but:
- No cva (class-variance-authority) equivalent
- No way to ensure valid variant values
- Easy to typo `data-variant="diter"` with zero feedback

### Component Inventory (28 total)

| Category | Count | Components |
|----------|-------|-----------|
| Core | 14 | Button, Card, Input, Badge, Alert, Dialog, Tabs, Toggle, Progress, Avatar, Tooltip, Dropdown, Table, Accordion |
| AI | 11 | ChatBubble, ChatInput, ReasoningStep, ToolCard, CitationCard, StreamingText, TerminalPanel, AgentStatus, CodeBlock, TypingIndicator, Markdown |
| Layout | 1 | Container, Grid, Stack, Panel, Divider, Skeleton (bundled) |
| DataViz | 1 | AsciiChart, Sparkline, Meter, Heatmap (bundled) |
| Motion | 1 | DitherPulse, AsciiRain, Glitch, TextureMask (bundled) |

### Accessibility (Post-Fix)
All interactive components now have:
- Proper ARIA roles (tablist, tab, tabpanel, menu, menuitem, switch, dialog, progressbar, alert, status, tooltip, img)
- Keyboard navigation (Arrow keys, Escape, Enter, Space, Home, End)
- Focus management (roving tabindex, focus trap in dialog)
- `prefers-reduced-motion` respect in all animated components
- Screen reader labels via aria-label, aria-describedby, aria-labelledby

### HTML Examples (Post-Fix)
All 28 components now have `.html` example files showing every variant, size, and state.

---

## 4. Performance & Bundle Analysis

### Bundle Size
- **engine/characters.ts:** ~4KB (70-char palette + 8 ramps + CharacterEngine class)
- **engine/dither.ts:** ~5KB (4 algorithms + Bayer matrices)
- **engine/canvas.ts:** ~6KB (CanvasRenderer + TextToAscii)
- **engine/shader.ts:** ~7KB (WebGL Bayer dither + ASCII overlay fragment shaders)
- **engine/video.ts:** ~4KB (VideoAsciiPipeline + ServerRenderer)
- **engine/worker.ts:** ~4KB (DitherWorkerPool with blob URL workers)
- **engine/animate.ts:** ~5KB (6 animation effects + reduced-motion fallback)
- **Total engine:** ~35KB raw TS, estimated ~18KB minified+gzipped
- **Component CSS:** ~1-3KB each, ~45KB total, estimated ~12KB minified+gzipped

### Render Performance
- **Dither algorithms:** O(width * height) per frame — fine for static images
- **Floyd-Steinberg:** Sequential scan, cannot parallelize per-row due to error diffusion
- **Bayer:** Fully parallelizable, ideal for WebGL (now implemented)
- **Video pipeline:** fps-capped requestAnimationFrame loop — good
- **CSS animations:** Hardware-accelerated (transform, opacity) — good
- **SVG patterns in CSS:** Some (feTurbulence) are expensive on low-end devices

### Risks
- **No virtualization:** Chat message lists will degrade with 100+ messages
- **No lazy loading:** All component CSS loaded upfront in demo
- **Worker pool:** Uses blob URLs which some CSPs block
- **WebGL shader:** No fallback if WebGL unavailable (now has `isAvailable` check)

---

## 5. Styling & Theming

### Token System
Well-structured CSS custom properties with `--sk-` namespace:
- Colors: HSL values (composable with opacity)
- Typography: Monospace-first font stack, 6 size steps
- Spacing: 4px grid (--sk-space-1 through --sk-space-16)
- Radius: Square by default (0), configurable
- Borders: Shorthand + color separation (**fixed** circular reference bug)
- Shadows: 3 levels
- Transitions: 3 speeds with cubic-bezier
- Z-index: 5 layers

### Themes (5 presets)
| Theme | Aesthetic | Dither Pattern | Unique Feel |
|-------|-----------|---------------|-------------|
| default | Technical minimalist | Floyd noise | Clean, neutral |
| brutal | Heavy ASCII blocks | Block 75% | Aggressive, high contrast |
| terminal | Green phosphor CRT | Scanlines | Retro terminal |
| print | Newsprint halftone | Bayer matrix | Editorial, warm |
| grain | Film grain | Noise | Organic, subtle |

### Dual-Axis Theming
Themes control both **color** and **texture** — this is genuinely innovative. Every theme sets both `--sk-background` (color) and `--sk-dither-pattern` (texture), creating a 2D design space that competitors don't have.

### Dark Mode
Supported via `prefers-color-scheme` media query and `.dark` class. **Issue:** No JavaScript toggle component for explicit dark mode switching (only system preference).

### Critical Bug Fixed
`--sk-border` was both a color HSL value and a shorthand property, creating a circular reference. **Fixed** by renaming the color to `--sk-border-color`.

---

## 6. AI-Specific Features

### Chat UI
- **ChatBubble:** 4 roles (user, assistant, tool, system) with distinct styling
- **ChatInput:** Textarea with send/attach/cancel actions, streaming state
- **StreamingText:** Now has real JS engine with character-by-character reveal, AbortController cancellation, and async token iterator support
- **ReasoningStep:** Expandable trace with 4 status indicators (pending, active, completed, error)
- **ToolCard:** Tool execution display with running progress animation
- **CitationCard:** 3 variants (default, compact, inline)
- **AgentStatus:** 5 states with pulse animation
- **TerminalPanel:** Code execution display with CRT scanline overlay
- **CodeBlock:** Code display with copy button and line numbers (NEW)
- **TypingIndicator:** 3 variants (dots, ASCII blocks, dither pulse) (NEW)
- **Markdown:** Zero-dependency renderer for AI content (NEW)

### What's Missing vs Competitors
| Feature | shadcn/ui | prompt-kit | AI SDK UI | skeehn |
|---------|-----------|------------|-----------|--------|
| React components | Yes | Yes | Yes | **No** |
| useChat hook | N/A | Yes | Yes | **No** |
| Server streaming | N/A | Yes | Yes | **CSS only** |
| Markdown/LaTeX | Via MDX | Yes | Yes | **Basic** |
| Code highlighting | Via Shiki | Yes | N/A | **No syntax colors** |
| Multi-model | N/A | N/A | Yes | **No** |
| Generative UI | N/A | N/A | Yes | **No** |
| Voice input | N/A | No | Partial | **No** |
| File upload UI | Yes | Yes | N/A | **Markup only** |

### Integration Gap
The biggest gap: **no React hooks or SDK integration**. Without `useChat`, `useCompletion`, or any streaming state management, developers must build all AI logic themselves. prompt-kit and AI SDK UI provide this out of the box.

---

## 7. Current Artistic/Visual Capabilities

### ASCII Character System (Excellent Foundation)
- 70-character perceptually calibrated palette across 5 categories
- 8 curated ramps (blocks, extended, letters, minimal, artistic, technical, ultra, halftone)
- Rec. 709 luminance calculation with alpha blending
- Custom ramp creation API

### Dither Algorithms (Strong)
- **Floyd-Steinberg:** Classic error diffusion, 7/16/3/16/5/16/1/16 weights
- **Bayer:** Ordered dithering with 2x2, 4x4, 8x8 matrices
- **Atkinson:** Cleaner highlights, 6-neighbor diffusion
- **Sierra:** Sierra-3 (12-tap) for smooth gradients

### CSS Dither Patterns (Adequate)
8 patterns as SVG data URIs: Bayer, Floyd (feTurbulence), crosshatch, diagonal, dots, noise, scanlines, checker. These work but are static — no animation or parameter control.

### WebGL Shader Engine (NEW)
- Bayer dither fragment shader with configurable cell size, matrix size, threshold
- ASCII overlay shader with glyph atlas UV mapping
- Real-time source from image/video/canvas
- requestAnimationFrame render loop

### Video-to-ASCII Pipeline (NEW)
- Real-time video frame capture via Canvas2D
- Configurable FPS cap (default 15)
- All 4 dither algorithms available
- Contrast/brightness/invert controls

### Animation Engine (NEW)
- 6 procedural effects: rain, flow, pulse, noise, wave, matrix
- Configurable density, FPS, color, opacity
- ResizeObserver for responsive sizing
- prefers-reduced-motion fallback to static frame
- aria-hidden on animation canvas

### What's Missing for World-Class
1. **No shader-driven dither gradients** (Bayer → Floyd transition across a surface)
2. **No image-to-ASCII with color preservation** (only grayscale luminance mapping)
3. **No temporal flicker/CRT phosphor persistence** simulation
4. **No flow field / vector field distortion** of ASCII grids
5. **No hybrid Canvas+DOM compositing** for layered ASCII over UI
6. **No glyph atlas generation** from custom fonts
7. **No WebGPU path** for next-gen performance

---

## 8. Production Readiness Checklist

| Requirement | Status | Priority |
|-------------|--------|----------|
| All tests passing | 321/321 pass | Done |
| TypeScript strict mode | 0 errors | Done |
| HTML examples for all components | 28/28 | Done |
| ARIA accessibility | All interactive components | Done |
| Keyboard navigation | Tabs, dropdown, accordion, dialog | Done |
| prefers-reduced-motion | All animated components | Done |
| Error boundaries | None (not React) | N/A |
| i18n / RTL | None | High |
| Security review | CLI uses exec() — injection risk | Critical |
| Bundle/publish pipeline | None | Critical |
| Storybook / docs site | None (only index.md) | Critical |
| Visual regression tests | None | High |
| Browser support matrix | Unknown / untested | High |
| Performance budgets | None defined | Medium |
| Error monitoring | None | Medium |
| Telemetry | None | Low |
| Licensing | MIT | Done |

### Security Issue
`packages/mcp-server/src/index.ts` line 158: `execAsync(\`npx skeehn add ${name} -p ${target}\`)` — the `name` and `target` parameters are user-supplied via MCP tool input with no sanitization. This is a **command injection vulnerability**.

**Fix:** Validate `name` against the component registry allowlist. Sanitize `target` path. Use `spawn` with array args instead of shell string.

---

## 9. Comparison Matrix

Scores: 1 (absent) to 5 (best-in-class)

| Dimension | shadcn/ui | prompt-kit | AI SDK UI | skeehn |
|-----------|-----------|------------|-----------|--------|
| **Component polish** | 5 | 4 | 4 | 3 |
| **DX (TypeScript/IDE)** | 5 | 4 | 5 | 2 |
| **React integration** | 5 | 5 | 5 | 1 |
| **Accessibility** | 5 | 3 | 3 | 3 |
| **AI chat UX** | 2 | 5 | 5 | 3 |
| **Streaming support** | 1 | 5 | 5 | 2 |
| **Extensibility** | 5 | 3 | 4 | 3 |
| **Visual identity** | 3 | 3 | 3 | 5 |
| **ASCII/dither art** | 1 | 1 | 1 | 5 |
| **Animation quality** | 3 | 2 | 2 | 4 |
| **Documentation** | 5 | 4 | 5 | 1 |
| **Testing** | 4 | 3 | 4 | 3 |
| **Bundle size** | 4 | 4 | 3 | 5 |
| **Framework agnostic** | 2 | 1 | 1 | 5 |

### Where skeehn Wins
- **Visual uniqueness:** No competitor has ASCII/dither as a design primitive
- **Dual-axis theming:** Color + texture is a novel design space
- **Zero dependencies:** Smallest possible footprint
- **Framework agnostic:** Works with anything that renders HTML/CSS
- **MCP integration:** First UI library with machine-readable schemas for AI agents

### Where skeehn Loses
- **No React:** Eliminates the primary audience
- **No streaming hooks:** Must build all AI state management manually
- **No docs site:** Cannot evaluate without reading source
- **No npm package:** Cannot install from registry

---

## 10. Prioritized Roadmap

### Phase 0: Immediate Fixes (DONE)
- [x] Add tsconfig.json
- [x] Fix --sk-border circular reference
- [x] Fix invalid CSS repeat() in content property
- [x] Fix CLI density command writing invalid values
- [x] Fix empty string in technical character ramp
- [x] Fix tabs.js selector bug
- [x] Update .gitignore for .DS_Store
- [x] Fix all 18 TypeScript errors

### Phase 1: Component Completeness (DONE)
- [x] Add HTML examples for all 28 components
- [x] Add ARIA attributes to all interactive components
- [x] Add keyboard navigation (tabs, dropdown, accordion, dialog)
- [x] Add prefers-reduced-motion to all animated components

### Phase 2: AI UX (DONE)
- [x] Real streaming text JS engine (SkStreamingText)
- [x] Markdown renderer (SkMarkdown)
- [x] Code block with copy button
- [x] Typing indicator (3 variants)
- [x] Chat bubble actions (retry, edit, copy)

### Phase 3: Rendering Engine (DONE)
- [x] WebGL Bayer dither shader
- [x] Video-to-ASCII pipeline
- [x] Web Worker pool for non-blocking dithering
- [x] Animation engine (6 effects)
- [x] SSR guard on Canvas renderer
- [x] ServerRenderer for SSR-safe ASCII generation

### Phase 4: Testing (DONE)
- [x] 321 tests across 5 files
- [x] Real algorithmic tests (known-input/known-output for all dither algorithms)
- [x] Component existence + ARIA + keyboard nav tests
- [x] Token consistency tests
- [x] Engine feature tests

### Phase 5: React Adapter (NEXT)
- [ ] Create `@skeehn/react` package
- [ ] Wrap each CSS component as a typed React component
- [ ] Add cva for variant management
- [ ] Add Tailwind plugin for sk-* utilities
- [ ] Add `useSkeehnTheme` hook
- [ ] Add `useAsciiStream` hook for real-time ASCII rendering

**Effort:** 2-3 weeks for core team

### Phase 6: Build & Publish
- [ ] Add tsup build config for all packages
- [ ] Add proper package.json exports
- [ ] Publish `skeehn`, `@skeehn/react`, `@skeehn/engine` to npm
- [ ] Add changeset workflow for versioning
- [ ] Add size-limit budget checks

**Effort:** 1 week

### Phase 7: Documentation Site
- [ ] Build docs site (Astro/Next.js with live component previews)
- [ ] Interactive playground for dither algorithms
- [ ] Theme builder
- [ ] Component API reference (auto-generated from schema)
- [ ] Getting started guide for React/Next.js/Vite

**Effort:** 2-3 weeks

### Phase 8: Advanced Rendering
- [ ] Dither gradient transitions (Bayer → Floyd morph)
- [ ] Color ASCII (preserve source hue in character rendering)
- [ ] Flow field distortion of ASCII grids
- [ ] Temporal flicker / CRT phosphor simulation
- [ ] Glyph atlas generator from custom fonts
- [ ] WebGPU compute shader path
- [ ] Hybrid Canvas+DOM compositing layer

**Effort:** 4-6 weeks

---

## 11. Artistic Engine Recommendations

### Vision
skeehn's visual engine should be the undisputed best ASCII/dither rendering system on the web. It should support real-time rendering from code, images, and video, with smooth animation, adaptive quality, and production-safe performance.

### Rendering Pipeline Architecture
```
Source (image/video/canvas/procedural)
  → Luminance extraction (Rec. 709)
  → Optional: contrast/brightness/color adjustment
  → Dither algorithm (Floyd-Steinberg | Bayer | Atkinson | Sierra)
  → Character mapping (70-char palette, 8 ramp presets)
  → Output (text string | DOM pre element | Canvas2D | WebGL texture)
```

### When to Use Each Renderer

| Renderer | Use Case | FPS Target | Fallback |
|----------|----------|-----------|----------|
| **CSS patterns** | Static UI backgrounds, hover effects | N/A | Always works |
| **Canvas2D** | Image-to-ASCII, moderate animation | 15-30 | Always works |
| **WebGL** | Real-time video, complex shaders | 30-60 | Canvas2D |
| **Web Worker** | Large images, batch processing | N/A | Main thread |
| **ServerRenderer** | SSR, static generation | N/A | Always works |

### Key Technical Paths

**1. Dither Gradient Transitions**
Interpolate between dither algorithms across a surface. The Bayer matrix threshold can be smoothly modulated by a gradient function:
```glsl
float threshold = mix(bayerThreshold, noiseThreshold, gradient(uv));
```

**2. Color ASCII**
Preserve source color by rendering ASCII characters in the source hue:
```css
.ascii-char { color: var(--source-color); }
```
In WebGL, sample source color and apply to glyph alpha.

**3. Flow Field Distortion**
Use Perlin/Simplex noise to offset UV coordinates before character lookup:
```glsl
vec2 distorted = uv + vec2(snoise(uv * 3.0 + time), snoise(uv * 3.0 + time + 100.0)) * 0.02;
```

**4. Temporal Flicker**
Modulate character selection with a time-varying random offset:
```typescript
const flicker = Math.random() < flickerRate ? randomChar() : normalChar();
```

**5. Adaptive Density**
Detect device capability and reduce ASCII resolution:
```typescript
const resolution = navigator.hardwareConcurrency > 4 ? 120 : 60;
const fps = 'gpu' in navigator ? 30 : 12;
```

### Performance Safeguards
1. **FPS cap:** Never exceed 30fps for ASCII animation (visual character doesn't benefit from 60)
2. **Resolution cap:** Max 200 columns for Canvas2D, 400 for WebGL
3. **Worker offload:** Any image >1MP goes through DitherWorkerPool
4. **Reduced motion:** All animations have static fallback
5. **Memory:** Reuse canvas/context objects, never allocate per-frame
6. **GPU:** Check WebGL availability before attempting shader path

### Mobile Strategy
- Default to CSS patterns (zero JS cost)
- Reduce ASCII resolution to 40 columns on <768px viewport
- Disable video pipeline on mobile (battery drain)
- Use `will-change: contents` sparingly (triggers paint)
- Test on Safari WebKit (WebGL limitations)

---

## Final Verdict

**Can skeehn become category-defining?**

**Yes, but only if it commits to a React adapter layer.** The pure CSS/vanilla JS approach is admirable for framework independence, but the reality is that the target audience (developers building AI interfaces) overwhelmingly uses React. Without `@skeehn/react`, this library will remain a curiosity.

The visual engine is skeehn's genuine competitive advantage. No other UI library has:
- A 70-character perceptually calibrated ASCII palette
- 4 professional dither algorithms
- WebGL shader-based real-time dithering
- Video-to-ASCII pipeline
- 6 procedural animation effects
- Dual-axis (color + texture) theming

If skeehn ships a React adapter with typed components, streaming hooks, and a documentation site with live demos, it has a real path to becoming the go-to library for developers who want **AI interfaces that don't look like every other chatbot.** The ASCII/dither aesthetic is distinctive, technically grounded, and impossible to replicate with a few CSS classes.

**The path forward:**
1. Ship `@skeehn/react` (2-3 weeks)
2. Ship to npm with proper build (1 week)
3. Build docs site with live playground (2-3 weeks)
4. Launch on Product Hunt / Hacker News with a video-to-ASCII demo

**Bottom line:** The foundation is solid, the vision is clear, the artistic engine is unique. Execution is what separates a side project from a category-defining tool.
