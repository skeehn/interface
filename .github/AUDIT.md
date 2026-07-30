# skeehn/interface — AI Frontend Architecture and Product Plan

**Status:** Proposed architecture for review
**Research date:** 2026-07-30
**Repository baseline:** branch HEAD at `62f02b8`
**Scope:** Product, architecture, code, UX, accessibility, performance, security,
API consistency, design system, themes, AI components, rendering, motion,
documentation, testing, migration, and multi-year execution.

### Deliverable map

| # | Requested deliverable | Primary sections |
| ---: | --- | --- |
| 1 | Complete architecture review | 1–4 |
| 2 | Complete code audit | 1, 4 |
| 3 | UX audit | 2, 5 |
| 4 | Accessibility audit | 6 |
| 5 | Performance audit | 7, 12.7, 16 |
| 6 | Security audit | 8 |
| 7 | API consistency audit | 3.2–3.5, 9 |
| 8 | Design system audit | 2, 4, 9–11 |
| 9 | Theme system redesign | 10 |
| 10 | AI component roadmap | 3, 5, 11, 19 |
| 11 | ASCII engine roadmap | 12 |
| 12 | Motion system roadmap | 13 |
| 13 | Documentation improvements | 14 |
| 14 | Testing strategy | 15 |
| 15 | Benchmark suite | 12.7, 16 |
| 16 | Migration plan | 17 |
| 17 | Component maturity matrix | 11 |
| 18 | Technical debt backlog | 18 |
| 19 | Multi-year roadmap | 19 |
| 20 | Highest-to-lowest ROI order | 20 |

---

## 0. Executive decision

skeehn should not become another collection of chat bubbles. It should become a
provider-neutral interaction system for software in which humans and AI models
work together over time.

The winning product has five layers:

1. **A trustworthy behavioral foundation** — accessible primitives with complete
   focus, keyboard, touch, localization, RTL, and form behavior.
2. **An AI interaction protocol** — normalized messages, tools, approvals,
   artifacts, context, tasks, citations, media, usage, and run state independent
   of any model vendor.
3. **A composable visual system** — theme dimensions that can be combined and
   nested instead of eight monolithic skins.
4. **A differentiated rendering system** — production-quality ASCII, dither,
   texture, and motion across CPU, worker, Canvas, SVG, WebGL, and WebGPU paths.
5. **A distribution and verification system** — packages, a source registry,
   CLI, MCP server, skills, executable documentation, conformance fixtures, and
   benchmarks all generated from canonical contracts.

The architectural posture is:

- **Own the AI semantics and visual language.**
- **Do not reimplement years of popup, focus, and selection edge cases without a
  compelling reason.** Use a proven headless behavior layer for React and native
  platform primitives where they are sufficient.
- **Do not couple UI state to provider wire formats.** Providers adapt into a
  skeehn protocol; components consume capabilities and normalized events.
- **Do not put experimental spectacle in the stable core.** Ship stable,
  experimental, and labs surfaces with explicit maturity.
- **Do not claim production readiness from file-count tests.** A component is
  stable only after behavioral, browser, accessibility, visual, performance,
  and documentation gates pass.

### Definition of success

skeehn is the default AI frontend when a team can build a polished chat,
copilot, research workspace, coding agent, voice assistant, multimodal editor,
or autonomous workflow without replacing the foundation as requirements grow.

Success is measured by these outcomes:

- A team can switch OpenAI, Anthropic, Google, xAI, Mistral, OpenRouter, Groq,
  Together, Fireworks, Cerebras, Ollama, or a future provider without rewriting
  presentation components.
- Every consequential agent action is attributable, permissioned, observable,
  interruptible where possible, and recoverable where feasible.
- A keyboard, screen reader, touch, voice-control, high-contrast, RTL, or
  reduced-motion user receives a first-class experience.
- The default path is beautiful and fast; full source ownership and deep visual
  customization remain possible.
- The ASCII/dither system is measurably better than competitors in quality,
  capability, and performance rather than merely having more named algorithms.

---

## 1. Audit basis and repository ground truth

This replaces the April 2026 audit, which described a pre-React 0.3.0 codebase.
The current repository contains approximately 45,000 lines across these active
surfaces:

| Surface | Current inventory | Current role |
| --- | ---: | --- |
| `engine/` | 12 files / ~3.5k lines | CPU dithering, glyph ramps, Canvas, video, worker, WebGL, motion |
| `components/` | 34 directories / ~7.4k lines | CSS, vanilla JS, and HTML examples |
| `themes/` | 8 themes / ~670 lines | Token overrides plus global decorative effects |
| `packages/react` | 36 component modules, 4 blocks, 4 GL modules, 5 hooks / ~10.5k lines | Typed React surface |
| `packages/core` | package and asset build | Engine and CSS distribution |
| `packages/wc` | 6 custom elements | Partial framework-neutral adapter |
| `packages/mcp-server` | schema and 7 tools / ~1.6k lines | Agent discovery, installation, and generation |
| `apps/docs` | 89 files / ~9.5k lines | Next.js documentation, demos, registry output |
| `cli/` | 476 lines | Init, add, theme, and doctor commands |
| Tests | 832 tests across 49 files | Predominantly unit, structural, and DOM tests |

### Audit method

The audit combined:

- full repository inventory and dependency mapping;
- full-tree searches for exported APIs, token consumption, animation guards,
  unsafe HTML, hard-coded values, global selectors, ARIA, and event behavior;
- deep reads of public package boundaries, build scripts, complex components,
  streaming hooks, AI renderers, engine algorithms, workers, shaders, CLI/MCP,
  registry generation, themes, and docs examples;
- execution of the complete Bun test suite and React TypeScript check;
- comparison with current primary documentation from standards bodies, browser
  platforms, design systems, AI component libraries, and AI products.

This is an architecture and product audit, not a formal proof that every line is
defect-free. Each implementation phase still requires a scoped source review,
tests, browser validation, and security review for the files it changes.

### Current strengths worth preserving

- A recognizable ASCII/dither identity that is not another neutral SaaS skin.
- CSS custom properties and source-copy distribution make ownership practical.
- The React layer already covers basic chat, reasoning, tools, citations, voice,
  blocks, AI SDK-shaped messages, and effects.
- Core packages have explicit exports, ESM/CJS output, declaration generation,
  and CI/publish workflows.
- Reduced-motion guards exist across most animated CSS.
- Registry, MCP, `llms.txt`, and agent-oriented documentation show strong
  instincts about AI-assisted adoption.
- A neutral default plus expressive themes is a better strategy than forcing
  every application to look retro.

### Current validation result

- `bun test`: **831 pass, 1 fail**. The failing theme-generator assertion expects
  light preview dither opacity `0`; implementation emits `0.06`.
- `bun x tsc -p packages/react/tsconfig.json --noEmit`: **passes**.
- Full root TypeScript checking was killed under the current 1.9 GiB sandbox.
- Browser capture also exceeded the current memory envelope; visual regression
  infrastructure remains an explicit roadmap requirement.

---

## 2. Product principles for AI-native interfaces

### 2.1 Human ownership

The person remains the owner of intent and outcomes. Components must surface
what the system is doing, why it needs permission, what context it is using,
what changed, and how to stop, undo, retry, or branch.

### 2.2 Capability over vendor identity

The UI should ask whether a model supports tools, vision, audio, video,
reasoning controls, structured output, citations, or resumable streaming—not
whether its provider string equals a known brand.

### 2.3 Progressive disclosure

Default views communicate outcome and current status. Details such as tool
arguments, retrieved chunks, token usage, reasoning summaries, logs, and model
metadata appear on demand. Hidden complexity remains inspectable.

### 2.4 Honest uncertainty and provenance

AI-generated content, sources, transformations, confidence where meaningful,
and human edits must be distinguishable. Provenance is data, not decoration.

### 2.5 Streaming is a state model

Streaming is not a typing animation. Components must handle submitted,
queued, connecting, streaming, paused, awaiting approval, awaiting input,
retrying, completed, cancelled, disconnected, and failed states without layout
instability or repeated screen-reader announcements.

### 2.6 Multimodality is foundational

Text, files, images, audio, video, screen captures, structured data, and
artifacts share attachment and provenance contracts. They are not unrelated
features bolted onto a textarea.

### 2.7 Composition before configuration sprawl

Prefer parts and slots that can be assembled over giant components with dozens
of booleans. Provide opinionated blocks as compositions of stable primitives.

### 2.8 Accessibility is behavior

ARIA attributes are only one part of accessibility. Expected keyboard models,
focus restoration, modality, announcements, input-method parity, target size,
contrast, zoom, reflow, reduced motion, forced colors, and localization are
release gates.

### 2.9 Performance is perceived control

The user should see immediate acknowledgement, stable streaming, responsive
stop/steer actions, and predictable scrolling even in long conversations.
Heavy rendering must never make agent controls unresponsive.

### 2.10 Distinctive, not compulsory

ASCII, Bayer texture, CRT, and expressive motion are powerful differentiators.
They must be tokenized dimensions that can be subtle, disabled, or replaced,
not assumptions embedded in component behavior.

---

## 3. Target architecture

### 3.1 Package boundaries

```text
Canonical schemas and registry
          │
          ├── @skeehn/core
          │     tokens · reset · component CSS · theme runtime · schemas
          │
          ├── @skeehn/ascii
          │     kernel · calibration · CPU/server · Canvas · worker · GL/GPU
          │
          ├── @skeehn/react
          │     primitives · ai · blocks · adapters · labs
          │
          ├── @skeehn/wc
          │     native/custom-element adapters over the same contracts
          │
          ├── @skeehn/cli
          │     init · add · theme · doctor · migrate · benchmark
          │
          └── @skeehn/mcp-server
                search · inspect · install · compose · validate · migrate
```

#### `@skeehn/core`

- Framework-neutral CSS, token schemas, component metadata, and theme helpers.
- No React and no rendering-engine payload in the default JavaScript entry.
- Side-effect CSS exports remain explicit and independently importable.
- Full colors replace HSL tuples in v2 tokens so consumers may use OKLCH,
  Display-P3, HSL, or system colors without wrapper-specific syntax.

#### `@skeehn/ascii`

- A separately versioned rendering engine with no DOM dependency in its default
  entry.
- Subpaths: `/server`, `/canvas`, `/worker`, `/webgl`, `/webgpu`, `/svg`.
- One kernel and fixture corpus shared by React effects, docs, CLI, and server.
- Backends declare capability and degradation behavior.

#### `@skeehn/react`

- `@skeehn/react`: stable primitives and simple AI presentation components.
- `@skeehn/react/ai`: provider-neutral AI workspace primitives and event types.
- `@skeehn/react/adapters/ai-sdk`: AI SDK adapter kept separate from contracts.
- `@skeehn/react/blocks`: stable reference compositions.
- `@skeehn/react/ascii`: React bindings for `@skeehn/ascii`.
- `@skeehn/react/labs`: explicitly unstable visual and future-platform work.

React behavior should be based on a proven unstyled primitive layer such as Base
UI or React Aria after a focused evaluation. The selection criteria are APG
conformance, assistive-technology testing, touch/pointer behavior, i18n/RTL,
controlled and uncontrolled APIs, composition, bundle cost, SSR/RSC behavior,
and long-term maintenance. CSS and `@skeehn/core` remain independent.

#### `@skeehn/wc`

- Use native `<dialog>`, `<details>`, Popover, form-associated elements, and
  customizable Select through progressive enhancement where appropriate.
- Do not promise parity until all stable components share contract tests.
- Prefer declarative DOM and safe node construction over HTML string templates.

#### CLI and MCP

- The CLI must be a publishable package, not a bin on a private root manifest.
- CLI, registry, MCP, docs, and package exports consume the same generated
  catalog.
- MCP generation should return registry-backed components and blocks rather
  than handwritten HTML templates that drift from real markup.

### 3.2 Canonical AI protocol

Provider streams are converted at the boundary into a small event vocabulary.
The event protocol is append-friendly, serializable, resumable, and versioned.

```ts
type RunStatus =
  | 'queued' | 'submitted' | 'connecting' | 'streaming'
  | 'awaiting-approval' | 'awaiting-input' | 'paused' | 'retrying'
  | 'completed' | 'cancelled' | 'disconnected' | 'failed';

type ConversationPart =
  | TextPart | ReasoningSummaryPart | SourcePart | CitationPart
  | FilePart | ImagePart | AudioPart | VideoPart
  | ToolCallPart | ToolResultPart | ApprovalPart
  | ArtifactPart | TaskPart | PlanPart | CheckpointPart
  | UsagePart | ContextPart | ErrorPart | CustomDataPart;

interface ModelCapabilities {
  input: Array<'text' | 'image' | 'audio' | 'video' | 'file'>;
  output: Array<'text' | 'image' | 'audio' | 'video' | 'structured-data'>;
  tools: boolean;
  toolApprovals?: boolean;
  reasoningControls?: boolean;
  citations?: boolean;
  structuredOutput?: boolean;
  resumableStreaming?: boolean;
  contextWindow?: number;
}
```

Core rules:

- `provider` is metadata; it never controls component structure.
- Model pickers render controls from capabilities and policy.
- Reasoning UI displays provider-approved summaries or explicit reasoning
  content. It must not assume private chain-of-thought is available.
- Tool state includes partial input, available input, approval request,
  approval response, running, partial output, output, error, and cancellation.
- All parts carry stable IDs and optional provenance, timestamps, and metadata.
- Unknown future parts remain inspectable and render through an extension slot.
- Events may be recorded and replayed to reproduce UI state deterministically.

### 3.3 Runtime interfaces

```ts
interface ConversationTransport {
  send(input: UserInput, options?: SendOptions): Promise<void>;
  stop(runId?: string): void;
  resume(runId: string): Promise<void>;
  retry(messageId?: string): Promise<void>;
  approve(requestId: string, decision: ApprovalDecision): Promise<void>;
  submitToolResult(callId: string, result: unknown): Promise<void>;
  steer(runId: string, input: UserInput): Promise<void>;
}
```

Adapters translate AI SDK, OpenAI Responses/Agents, Anthropic Messages, Google,
OpenRouter-compatible streams, local runtimes, and custom servers into this
interface. No provider SDK becomes a required dependency of stable UI packages.

### 3.4 React and server boundaries

- Stateless presentation components remain server-compatible.
- Interactive roots create the narrowest possible `'use client'` boundary.
- Types, schemas, render planning, Markdown transformation, and static artifact
  views remain usable on the server.
- Browser APIs load through explicit client subpaths.
- Package tests assert directives survive builds and server imports do not touch
  `window`, `document`, `navigator`, `ImageData`, or `customElements`.

### 3.5 Extension model

Applications register custom part renderers, tool renderers, artifact viewers,
attachment handlers, model descriptors, and theme dimensions. Extension APIs
are typed and scoped; they do not require forking the conversation renderer.

---

## 4. Architecture and code audit

### 4.1 Ranked issue register

| ID | Severity | Finding | Required action |
| --- | --- | --- | --- |
| A-01 | P0 | README quick start imports root `useChat`, which is not exported there. | Compile every documentation snippet against packed packages. |
| A-02 | P0 | README references `@skeehn/core/bundles/agent.css`, which is not exported. | Generate docs from package exports and add export conformance tests. |
| A-03 | P0 | Getting-started docs teach unsupported CSS subpaths and compound Card APIs. | Delete duplicate onboarding and keep one executable quick start. |
| A-04 | P0 | `npx skeehn` is advertised, but the bin belongs to the private monorepo package. | Publish `@skeehn/cli` plus an optional `skeehn` shim. |
| A-05 | P0 | Registry, packages, docs, CLI, and MCP use unrelated versions. | Adopt one release manifest and Changesets or equivalent release orchestration. |
| A-06 | P0 | MCP claims eight themes but exposes a 0.3.0 schema containing five. | Generate MCP resources from the canonical catalog. |
| A-07 | P0 | MCP code generation emits stale/noncanonical markup. | Generate from registry examples and validate generated output in DOM tests. |
| A-08 | P0 | Vanilla Markdown interpolates unvalidated URLs into `innerHTML`. | Use a real parser, safe React/node output, URL policy, sanitization, and Trusted Types tests. |
| A-09 | P0 | Web components interpolate content and attributes into HTML strings. | Construct DOM nodes safely and define trusted-content policy. |
| A-10 | P0 | React Dropdown is pointer-only in practice: clickable span trigger, unfocusable div items, no menu keyboard model. | Replace with a proven menu primitive and APG interaction tests. |
| A-11 | P0 | React Tabs omit roving focus, arrow navigation, IDs, and tab/panel relationships. | Implement the complete APG Tabs contract. |
| A-12 | P0 | `InputGroup` labels and hints are not associated with their control. | Introduce Field/Label/Description/Error primitives using generated IDs. |
| A-13 | P0 | The custom chat hook has no behavioral tests and mishandles arbitrary text chunks, whitespace, `[DONE]`, races, aborts, and failed placeholders. | Retire compatibility claims or rebuild as a tested generic transport. |
| A-14 | P0 | Theme test suite is red. | Resolve the neutral-light dither contract before other theme work. |
| A-15 | P1 | `--sk-density` means both numeric UI density and a dither percentage. | Introduce namespaced dimension tokens and a compatibility alias. |
| A-16 | P1 | Global `body::before/after` theme effects prevent clean nested themes and sit over product overlays. | Render texture on a scoped theme surface with isolation. |
| A-17 | P1 | Pattern SVGs encode black ink, so texture behavior varies unpredictably on dark surfaces. | Use masks/currentColor plus explicit texture ink and blend tokens. |
| A-18 | P1 | Theme generator exposes only brand color and radius and uses a lightness heuristic instead of measured contrast. | Build the Theme v2 compiler and contrast validator. |
| A-19 | P1 | The 70-character “calibrated” palette is disconnected from actual ramp mapping. | Make runtime/static glyph metrics the source of mapping order. |
| A-20 | P1 | Glyph calibration names SF Mono while shipped and demo fonts differ. | Calibrate the actual resolved font, weight, size, and DPR; cache by font signature. |
| A-21 | P1 | WebGL ASCII mode declares but never creates/binds a glyph atlas. | Rebuild behind renderer conformance fixtures; keep experimental until parity passes. |
| A-22 | P1 | Worker serialization omits Bayer constants and uses `navigator` in its default parameter before environment checks. | Ship a real module worker entry and SSR-safe pool factory. |
| A-23 | P1 | Core, React GL, and docs contain independent dither implementations. | Move all algorithms into `@skeehn/ascii`; demos consume public APIs. |
| A-24 | P1 | `@skeehn/core` does not export many engine types/classes already presented as capabilities. | Split the renderer, then define intentional public subpaths. |
| A-25 | P1 | `AsciiAnimation` leaks ResizeObservers on restart and its rain state does not model per-cell trails correctly. | Rebuild lifecycle and deterministic effect kernels with tests. |
| A-26 | P1 | Video processing uses display `requestAnimationFrame`, reads full-resolution frames, and allocates repeatedly. | Use `requestVideoFrameCallback`, downsample early, reuse buffers, and adapt quality. |
| A-27 | P1 | `Progress` and data-viz components do not robustly handle zero/invalid ranges or supply accessible descriptions by default. | Validate numeric contracts and create accessible chart summaries. |
| A-28 | P1 | Physical left/right CSS greatly outnumbers logical properties; RTL is unverified. | Migrate layout tokens/selectors to logical properties and add RTL visual/behavior suites. |
| A-29 | P1 | Registry contains 32 items, React exposes 36 component modules plus blocks and GL, and WC exposes six. | Publish a generated surface matrix with maturity and parity status. |
| A-30 | P2 | Bundle budgets skip silently when dist is absent and measure raw aggregate JS, not consumer subpaths. | Require built artifacts and track minified/gzip/brotli per entry and scenario. |
| A-31 | P2 | CSS animation definitions are duplicated and global keyframe names may collide. | Generate namespaced motion primitives from Motion v2 tokens. |
| A-32 | P2 | Theme definitions mix semantic tokens with bespoke component overrides and body effects. | Compile themes from structured dimension data and lint forbidden selectors. |
| A-33 | P2 | Dialog callback refs are not handled correctly and controlled native-close semantics are underspecified. | Standardize ref composition and controlled/uncontrolled behavior. |
| A-34 | P2 | AI SDK support is described as v5 while the ecosystem has advanced to v6 states and approval flows. | Version the adapter separately and run upstream compatibility fixtures. |
| A-35 | P2 | Generated registry output is committed alongside sources without a mandatory drift check. | Regenerate in CI and fail on diffs. |

Evidence locations for the issue register:

- A-01–A-04: `README.md`, `apps/docs/src/app/docs/getting-started/page.tsx`,
  `apps/docs/src/app/docs/installation/page.tsx`, and root `package.json`.
- A-05–A-07: package manifests, `registry.json`,
  `packages/mcp-server/src/schema/index.ts`, and
  `packages/mcp-server/src/index.ts`.
- A-08–A-09: `components/markdown/markdown.js` and
  `packages/wc/src/index.ts`.
- A-10–A-13: React `Dropdown`, `Tabs`, `Input`, and `useChat` sources and their
  current tests under `packages/react`.
- A-14–A-18: `tests/theme-generator.test.ts`, `engine/tokens.css`,
  `engine/dither.css`, all `themes/*.css`, and
  `apps/docs/src/lib/theme-generator.ts`.
- A-19–A-26: `engine/characters.ts`, `canvas.ts`, `shader.ts`, `worker.ts`,
  `dither.ts`, `animate.ts`, and `video.ts`, plus `packages/react/src/gl` and
  `apps/docs/src/components/DitherCanvas.tsx`.
- A-27–A-29: React `Progress`, `Dataviz`, and public indexes; `registry.json`;
  component CSS; and `packages/wc/src/index.ts`.
- A-30–A-35: `tests/bundle-size.test.ts`, motion/component CSS, theme files,
  React `Dialog`, React/docs package manifests, `apps/docs/registry.json`, and
  `apps/docs/scripts/build-registry.ts`.

### 4.2 Dependency review

| Workspace | Runtime/peer dependency boundary | Assessment |
| --- | --- | --- |
| root | no runtime dependencies; `tsdown` and Bun types for development | appropriately orchestration-only, but should not own the published CLI bin |
| `@skeehn/core` | no runtime dependencies | preserve for CSS, schemas, and framework-neutral assets |
| `@skeehn/react` | React and React DOM peers only | lean, but difficult composite behavior is reimplemented incompletely |
| `@skeehn/wc` | no runtime dependencies | appropriate if native behavior and safe DOM construction are used |
| `@skeehn/mcp-server` | MCP SDK and Zod | appropriate protocol and validation dependencies |
| docs | React, Next, Anthropic SDK, workspace React | Anthropic is acceptable for one demo backend, not for public contracts |
| starter | React, Next, AI SDK, workspace core/React | useful adapter fixture; it must not define canonical AI message types |

Build and test dependencies are limited to `tsdown`, TypeScript types,
Testing Library, happy-dom, axe-core, Next ESLint/Tailwind tooling, and the
framework runtimes used by fixtures. Optional Three packages are described in
React `peerDependenciesMeta` without corresponding peer dependencies and are
not used by current GL sources; remove those entries or introduce a real,
separately measured adapter.

The target should optimize total product risk, not dependency count as a vanity
metric. A maintained behavior primitive is preferable to inaccessible zero-dep
code. Keep dependency-free guarantees scoped to core CSS, schemas, and the
renderer kernel where they create real value.

---

## 5. UX audit and target interaction model

### Current UX gaps

- The product demonstrates components rather than a coherent long-running AI
  workspace.
- Chat state is simplified to loading/not-loading; approval, intervention,
  disconnection, resumption, and partial failure are not designed.
- Context, memory, retrieval, token use, permissions, and model capabilities are
  mostly invisible.
- Tools are output cards, not a lifecycle that includes intent, arguments,
  permission, progress, result, error, undo, and provenance.
- Artifacts, diffs, terminals, and file structures are isolated demonstrations
  rather than coordinated workspace panes.
- Mobile, touch, RTL, forced-color, and dense professional workflows have no
  proven end-to-end reference experience.

### Target workspace model

The reference AI workspace has five adaptable regions:

1. **Navigation:** projects, conversation history, saved agents, workflows.
2. **Conversation:** human and model turns, plans, tools, approvals, citations.
3. **Work surface:** artifact, code, preview, diff, terminal, data, media.
4. **Context inspector:** active files, memories, retrieved sources, token budget,
   policies, model/provider capabilities.
5. **Composer:** multimodal input, mode/agent/model selection, tools, context,
   permission profile, send/queue/steer/stop.

Regions collapse into sheets, tabs, or stacked navigation on small screens.
Conversation remains a coordination timeline; durable work lives in explicit
artifacts rather than being trapped in message bubbles.

### Essential interaction patterns

- **Plan then act:** reviewable plans with edit, approve, reject, or skip.
- **Steer while running:** queue a follow-up or interrupt current work with an
  explicit mode.
- **Approval with scope:** allow once, allow for run, allow tool, or deny with
  rationale; show exact impact and arguments.
- **Undo and checkpoint:** reversible changes and clear boundaries between app
  snapshots, model suggestions, and source control.
- **Branch and compare:** edit an earlier prompt, branch a conversation, compare
  models or answers, and preserve the original path.
- **Inspect provenance:** show sources, retrieved chunks, tool outputs, model,
  cost/usage, generated-vs-human state, and timestamps.
- **Recover gracefully:** retry only the failed part, resume streams, preserve
  typed input, and never destroy artifacts on transport failure.
- **Quick-to-deep continuity:** a compact one-shot surface can promote into a
  full workspace without losing context.

---

## 6. Accessibility audit and standard

### Required standard

- WCAG 2.2 AA is the baseline; AAA motion guidance is followed where practical.
- WAI-ARIA Authoring Practices define composite keyboard models.
- Forced Colors, 200%/400% zoom, text spacing, reflow, reduced motion,
  increased contrast, RTL, and localization are tested system states.
- Minimum pointer target and spacing rules apply to dense AI toolbars as well as
  marketing components.

### Current gaps

- Structural axe coverage exists, but color contrast is disabled and interaction
  behavior is not comprehensively tested.
- Dropdown, Tabs, Field labeling, Tooltip relationships, Dialog ref/focus edge
  cases, data visualization, and long-lived live regions are incomplete.
- Static HTML, React, and WC implementations do not share behavioral fixtures.
- Global ASCII/CRT effects may reduce legibility and do not have a product-level
  accessibility profile beyond reduced-motion CSS.
- RTL and touch behavior are effectively unverified.

### Accessibility release matrix

Every stable interactive component must pass:

| Dimension | Gate |
| --- | --- |
| Semantics | Correct native element or complete role/state/value contract |
| Keyboard | APG keys, focus entry/exit, roving focus, Escape, Home/End where applicable |
| Screen readers | VoiceOver/Safari, NVDA/Firefox or Chrome, and TalkBack/Chrome smoke matrix |
| Pointer/touch | Mouse, touch, pen, cancellation, outside press, target size |
| Visual | AA contrast, visible focus, forced colors, zoom/reflow, text spacing |
| Motion | reduced and no-motion profiles with no information loss |
| Language | RTL, long translations, pluralization, locale-sensitive values |
| Dynamic content | non-duplicative announcements and inspectable status history |

Streaming text should not mark an entire rapidly changing transcript as a live
region. Announce concise state transitions separately and allow the user to
read the stable message at their own pace.

---

## 7. Performance audit and budgets

### Current risks

- Image/video conversion reads and processes full-resolution frames before
  reducing to character cells.
- React GL and docs duplicate CPU algorithms and allocate large arrays per frame.
- ASCII output as large DOM text/span grids can become expensive without backend
  selection or virtualization.
- Conversation rendering has no demonstrated long-thread virtualization or
  content-visibility strategy.
- Streaming hooks may render for every small delta instead of scheduling paints.
- Global SVG turbulence, large overlays, shadows, and paint-heavy theme effects
  are not benchmarked on low-power mobile hardware.

### Product budgets

| Metric | Stable target |
| --- | --- |
| Core CSS + one theme + five primitives | ≤ 25 KiB gzip |
| React primitive entry overhead | ≤ 5 KiB gzip excluding chosen behavior peer |
| AI conversation baseline | ≤ 35 KiB gzip excluding Markdown highlighter |
| Time to acknowledge send/stop | next paint, p95 < 100 ms on reference low-end device |
| Streaming paint cadence | coalesced to display frames; no more than one React commit per frame |
| 1,000-message transcript | bounded DOM through virtualization/content visibility; smooth keyboard/search |
| Static 1 MP ASCII conversion | benchmarked CPU and worker p50/p95, no main-thread task > 50 ms |
| Video ASCII | adaptive 30 fps target desktop, 15 fps low-power, controls remain responsive |
| Motion | 60 fps baseline, 120 fps where supported; no unbounded observers or animation loops |
| Memory | stable after repeated start/stop, theme switch, route change, and media replacement |

Measure minified, gzip, and brotli by public subpath. Budgets must fail when
artifacts are missing rather than silently skipping.

---

## 8. Security and trust audit

### Trust boundaries

| Input | Primary risks | Required controls |
| --- | --- | --- |
| Model Markdown/HTML | XSS, unsafe URLs, DOM clobbering | Safe AST renderer, protocol allowlist, sanitization, Trusted Types |
| Tool names/arguments/results | secret exposure, deceptive UI, huge payloads | schema validation, redaction hooks, truncation, inspectable raw view |
| Artifacts/code previews | code execution, network/data exfiltration | sandboxed origin/iframe, CSP, explicit network permissions, reset controls |
| Attachments | spoofed types, decompression bombs, malicious SVG/PDF | size/type/magic-byte policy, isolated preview, server scanning hooks |
| Citations and remote media | tracking, phishing, mixed trust | URL display, safe linking, proxy policy, provenance metadata |
| Provider metadata | capability spoofing | application-controlled model registry and server validation |
| MCP/registry content | arbitrary writes or dependency confusion | schema validation, path containment, preview/diff, integrity metadata |
| Theme import/export | CSS injection and remote assets | parsed token schema, value validation, no arbitrary rules in safe mode |

### Agent safety UX

- Destructive, costly, privileged, external-communication, purchase, deploy, and
  data-sharing actions carry explicit risk metadata.
- Approval cards state the action, target, scope, reversibility, data leaving the
  system, and remembered permission duration.
- Tool output is visually distinct from assistant narration.
- AI-generated and human-authored changes retain provenance after editing.
- Stop, deny, revoke, undo, and audit history remain reachable by keyboard.
- Applications can configure policies without forking components.

---

## 9. API consistency standard

All stable components follow these conventions:

- `value` / `defaultValue` / `onValueChange` for value state.
- `open` / `defaultOpen` / `onOpenChange` for disclosure state.
- `status` for finite lifecycle state; avoid overlapping booleans.
- `disabled`, `readOnly`, `required`, and native form semantics are preserved.
- Parts-based composition (`Root`, `Trigger`, `Content`, `Item`) for composite
  controls; convenience wrappers live in blocks.
- `render` or slot composition follows the selected behavior foundation rather
  than inventing incompatible `asChild` patterns.
- Data attributes use positive states: `data-open`, `data-disabled`,
  `data-streaming`, `data-side`, `data-motion`.
- Every component forwards refs correctly and composes consumer event handlers.
- IDs and ARIA relationships are generated but overridable.
- Unknown DOM props are not swallowed; internal props never leak as invalid HTML.
- Components work controlled and uncontrolled unless the domain requires one.
- All string labels have override/localization paths.
- Stable exports never change via undocumented barrel behavior.

Provider adapters follow semantic versioning independently so an AI SDK upgrade
does not force a major version of visual primitives.

---

## 10. Theme System v2

### 10.1 Independent dimensions

Themes become compositions of orthogonal dimensions:

| Dimension | Examples |
| --- | --- |
| Scheme | light, dark, auto, dim, high-contrast, forced-colors |
| Color | neutral, brand, warm, cool, monochrome, custom palette |
| Typography | interface, editorial, developer, terminal, accessible, custom |
| Density | comfortable, compact, dense, touch |
| Geometry | square, soft, round, mixed |
| Border | none, hairline, standard, heavy, pixel |
| Elevation | flat, subtle, layered, glass |
| Texture | none, Bayer, grain, paper, noise, scanline, crosshatch, ASCII |
| Motion | none, reduced, functional, expressive, terminal, cinematic |
| Personality | neutral, editorial, brutalist, terminal, nature, retro, cyberpunk |

Personality presets select dimension defaults but never prevent overrides.

```html
<html
  data-sk-scheme="dark"
  data-sk-personality="editorial"
  data-sk-density="compact"
  data-sk-texture="bayer"
  data-sk-motion="functional"
>
```

Any subtree can override dimensions without relying on `body` selectors.

### 10.2 Token layers

1. **Reference tokens:** raw color scales, sizes, durations, springs, type steps.
2. **Semantic tokens:** background/foreground pairs, surfaces, borders, focus,
   status, selection, overlays, charts, AI provenance.
3. **Dimension tokens:** density, texture ink/scale/opacity/blend, motion profile,
   elevation, glass, paper.
4. **Component tokens:** intentionally supported local tuning points.

Fluent's global/alias layering and shadcn's semantic background/foreground pairs
are strong precedents. V2 colors use complete CSS values such as
`oklch(...)`, allowing modern color spaces and avoiding the current mandatory
`hsl(var(...))` wrapper.

### 10.3 Runtime and compiler

A typed theme document is canonical:

```ts
interface SkeehnTheme {
  schemaVersion: 2;
  name: string;
  extends?: string[];
  dimensions: ThemeDimensions;
  tokens?: Partial<SemanticTokens>;
  modes?: Record<string, ThemeOverride>;
}
```

The compiler outputs:

- scoped CSS variables;
- JSON tokens compatible with Design Tokens Community Group formats where
  practical;
- shadcn registry theme items;
- Tailwind v4 `@theme` bridges;
- Figma Tokens/Variables import data;
- registry items and preview metadata;
- a contrast and unsupported-value report.

### 10.4 Theme Studio

The current brand generator becomes a full studio with:

- perceptual palette generation and measured foreground contrast;
- typography, scale, density, radius, border, elevation, and motion controls;
- texture type, matrix, ink, size, opacity, blend, and surface targeting;
- nested-theme and light/dark/high-contrast previews;
- all-component state matrix, not a handful of cards;
- mobile, desktop, RTL, forced-color, and reduced-motion previews;
- CSS, JSON, shadcn, Tailwind, Figma, and shareable preset exports;
- migration warnings for v1 tokens.

### 10.5 Texture implementation

Texture uses masks or generated paint assets so ink is token-controlled. A
scoped `.sk-theme-surface` owns decorative layers and creates an isolation
context. It never renders over dialogs/tooltips through arbitrary `z-index:
9999`, and nested surfaces work naturally.

---

## 11. Component maturity model and matrix

### Maturity levels

| Level | Meaning | Required evidence |
| --- | --- | --- |
| 0 Missing | No supported implementation | roadmap only |
| 1 Prototype | Demonstrates an idea | story/demo; no compatibility promise |
| 2 Alpha | Typed API under active design | unit tests and documented limitations |
| 3 Beta | Feature-complete candidate | browser, keyboard, axe, visual, SSR, RTL tests |
| 4 Stable | Production-supported | manual AT matrix, performance/bundle budget, migration policy |
| 5 Reference | Best-in-class implementation | comparative benchmark, advanced examples, sustained field evidence |

No current component is classified Stable under this stricter definition
because browser/AT/RTL/visual and packed-package gates do not yet exist.

### Current component matrix

| Current surface | Level | Principal work before Stable |
| --- | ---: | --- |
| Button | 3 | default form behavior decision, touch/forced-color matrix, loading announcement |
| Card, Badge | 3 | semantic guidance, state matrix, nested-theme visual tests |
| Alert | 3 | live vs static alert semantics and dismissible composition |
| Avatar | 3 | image failure lifecycle, status/stack compositions |
| Table | 3 | responsive patterns, sortable/interactive separation, RTL |
| Input, InputGroup | 2 | Field/Label/Description/Error association and validation lifecycle |
| Toggle | 2 | clarify Switch vs Toggle semantics, form integration, high contrast |
| Progress | 2 | indeterminate state, invalid range handling, announcement policy |
| Dialog | 2 | controlled semantics, ref composition, nested dialogs, focus return |
| Tabs | 2 | APG keyboard model, IDs, activation modes, orientation/RTL |
| Dropdown | 1 | replace pointer-only React implementation with full Menu primitive |
| Accordion | 2 | heading/region semantics, IDs, keyboard parity, animation lifecycle |
| Tooltip | 2 | trigger relationship, delay group, touch behavior, interactive-content boundary |
| ChatBubble / Message alias | 2 | normalize naming, part composition, branches/actions/provenance |
| ChatInput | 2 | IME safety, auto-resize, files, drag/drop, voice, tool/context controls |
| StreamingText | 2 | paint scheduling, stable append, selection, announcements, disconnect state |
| AgentStatus | 2 | richer run-state machine and history, not only a pulsing label |
| ReasoningStep, ThinkingBlock | 2 | summary policy, provider semantics, accessibility, nested steps |
| ToolCard | 2 | typed lifecycle, approvals, progress, partial output, retry, redaction |
| CitationCard, Sources | 2 | inline references, grouped provenance, verification and unsafe-link policy |
| TerminalPanel | 2 | terminal semantics, copy/search/wrap, streaming buffer, virtualization |
| CodeBlock | 2 | safe highlighting, diff/annotations, wrapping, large-file virtualization |
| Markdown | 1 | real safe streaming parser, GFM, code, math opt-in, sanitization |
| TypingIndicator | 2 | use only for actual waiting state; reduced-motion and announcement policy |
| VoiceSession | 2 | permission/device/error states, captions, interruption, audio controls |
| PromptSuggestions | 2 | keyboard model, personalization/provenance, responsive overflow |
| FileAttachment(s) | 2 | previews, validation, upload lifecycle, retry, security hooks |
| MessageActions | 2 | persistent mobile access, feedback state, undo, tooltips |
| ModelPicker | 2 | capability-driven searchable picker, providers, cost/context metadata |
| ScrollToBottom | 2 | unseen-count, keyboard, scroll anchoring, virtualized transcript integration |
| Layout bundle | 2 | split public primitives, container queries, logical properties |
| DataViz bundle | 1 | accessible summaries, scales, labels, keyboard exploration, real chart contract |
| Motion bundle | 1 | lifecycle, purpose, performance, no-motion equivalents |
| ChatConsole block | 2 | production composer, errors, branching, persistence, responsive workspace |
| AgentConsole block | 2 | plans, approvals, tasks, steering, checkpoints, permission state |
| VoiceConsole block | 1 | complete voice lifecycle and device/accessibility matrix |
| HeroSection block | 2 | generic block quality; not central to AI differentiation |
| AsciiImage | 1 | canonical engine, color, calibration, object fit, worker/backend selection |
| AsciiVideo | 1 | frame callback, adaptive quality, lifecycle, webcam/screen capture |
| DitherBackground | 1 | canonical algorithms, GPU path, visibility/performance policy |
| AsciiAnimation | 1 | deterministic kernels, observer cleanup, motion profiles |
| Web components | 1 | only six elements; safe DOM construction and parity program required |

### Target component families

#### Stable foundation

Field, Label, Description, ErrorMessage, Button, IconButton, Link, Input,
Textarea, Checkbox, RadioGroup, Switch, ToggleGroup, Select, Combobox,
Autocomplete, Slider, NumberField, Form, Card, Badge, Alert, Progress, Meter,
Avatar, Separator, Skeleton, Spinner, Tabs, Accordion, Disclosure, Dialog,
AlertDialog, Drawer, Popover, Tooltip, Menu, ContextMenu, Toast, CommandPalette,
Toolbar, Breadcrumb, Pagination, ScrollArea, SplitPane, Tree, DataGrid.

#### AI conversation

Conversation, Message, MessagePart, Response, Composer, ComposerAttachment,
MessageActions, BranchNavigator, Regenerate, Stop, Retry, FollowUpQueue,
ModelPicker, ProviderPicker, AgentPicker, PromptSuggestions, VoiceComposer,
ConversationHistory, ConversationSearch, EmptyConversation, ErrorRecovery.

#### Agent operations

AgentRun, RunStatus, Plan, PlanStep, Task, TaskGroup, ToolCall, ToolOutput,
ApprovalRequest, PermissionScope, Checkpoint, Handoff, Intervention,
ActivityTimeline, BackgroundRun, CostSummary, UsageMeter, Notification.

#### Context and provenance

ContextInspector, ContextItem, ContextBudget, TokenMeter, MemoryList,
MemoryDetail, RetrievalInspector, RetrievalQuery, ChunkViewer, Citation,
SourceGroup, ProvenanceLabel, ContextGraph, PromptTrace, ModelMetadata.

#### Work surfaces

Artifact, ArtifactTabs, ArtifactPreview, CodeViewer, DiffViewer, Terminal,
FileTree, SearchResults, DataTable, Chart, JSONViewer, SchemaViewer,
ImageViewer, ImageGeneration, AudioPlayer, AudioRecorder, VideoPlayer,
DocumentViewer, SandboxPreview, Console, NetworkLog.

#### Workflow and evaluation

WorkflowCanvas, WorkflowNode, Edge, RunGraph, PromptEditor, VariableEditor,
ToolSchemaEditor, StructuredOutputViewer, Dataset, EvalCase, EvalResult,
ModelComparison, ResponseComparison, TraceWaterfall.

#### Collaboration

Presence, Selection, CommentThread, Suggestion, AcceptReject, ChangeHistory,
SharedCursor, Assignment, HumanHandoff, ReviewQueue, ShareDialog.

Only broadly reusable, proven primitives graduate to stable packages. Vertical
products and visually experimental components begin in blocks or labs.

---

## 12. ASCII and dither engine roadmap

### 12.1 One rendering pipeline

```text
Source
  → decode/orient/crop
  → color-space conversion and alpha composition
  → sampling/downscale
  → feature extraction (luminance, color, edges, motion)
  → quantization/dither
  → glyph selection and styling
  → backend (text, spans, Canvas, SVG, server, GL/GPU)
  → export/animation
```

Every stage has typed inputs, deterministic options, reusable buffers, and
fixtures. Backend-specific acceleration cannot change the semantic result beyond
documented tolerance.

### 12.2 Glyph system

- Measure actual rendered glyph coverage for the resolved font, weight, size,
  line height, letter spacing, DPR, and rendering backend.
- Cache calibration by font signature and expose serialized calibration profiles.
- Use grapheme clusters rather than UTF-16 code units.
- Support curated presets: standard, blocks, binary, dots, minimal, dense,
  arrows, stars, hash, pipes, braille, circles, squares, hearts, math, custom.
- Add orientation/edge-aware glyph sets for line art and technical imagery.
- Provide block and Braille subcell renderers for higher effective resolution.
- Make fallback behavior explicit when a font lacks a requested glyph.

### 12.3 Color and perception

- Distinguish luma from physically linear luminance in API names.
- Offer sRGB-aware and fast luma modes with documented tradeoffs.
- Configure alpha composition background rather than always blending to white.
- Preserve per-cell source color, duotone, semantic theme color, or quantized
  custom palettes.
- Add perceptual palette mapping and optional contrast/gamma controls.
- Evaluate edge-aware and local-contrast mapping against pure luminance.

### 12.4 Algorithms

Stable candidates:

- threshold / no dither;
- Bayer 2×2, 4×4, 8×8, and generated/custom matrices;
- Floyd–Steinberg with optional serpentine traversal;
- Atkinson;
- Sierra variants with accurate names;
- halftone;
- deterministic blue-noise masks.

Experimental candidates:

- temporal blue noise;
- edge-aware glyph orientation;
- hybrid diffusion plus glyph-density quantization;
- motion-compensated video dithering;
- content-aware adaptive cells;
- color error diffusion in perceptual spaces.

Algorithms graduate based on visual fixtures and performance, not name count.

### 12.5 Backends

| Backend | Primary use | Requirement |
| --- | --- | --- |
| Text string | terminals, copy/export, SSR | deterministic Unicode and dimensions |
| Styled spans | selectable colored ASCII | virtualization/chunking for large grids |
| Canvas2D | broad compatibility, images | early downscale and reused buffers |
| SVG | scalable export and print | bounded output size and safe serialization |
| Server | emails, social images, CLI | no DOM globals; Node/Bun/Deno-compatible core |
| Worker + OffscreenCanvas | responsive large transforms | module worker, CSP-safe, cancellation/progress |
| WebGL2 | real-time image/video | generated glyph atlas, context recovery, parity fixtures |
| WebGPU | compute-heavy and future effects | capability detection and fallback; labs until broad proof |

### 12.6 Media and interaction

- Image URL, Blob/File, ImageBitmap, Canvas, raw pixels, video, webcam, and
  screen capture sources.
- `cover`, `contain`, `fill`, `none`, focal position, orientation, and responsive
  sizing.
- `requestVideoFrameCallback` for video; visibility pausing and adaptive quality.
- Interactive pointer, audio, scroll, and data fields as optional animation
  inputs with deterministic seeds for replay.
- Export plain text, ANSI, HTML, SVG, PNG, animated WebM/GIF where supported,
  calibration JSON, and shareable presets.

### 12.7 Renderer benchmark suite

Fixtures include portraits, gradients, line art, transparency, low contrast,
high-frequency texture, saturated color, text, animation, and video motion.

Measure:

- conversion time p50/p95 by megapixel and output cell count;
- main-thread blocking, worker transfer, allocations, peak/resident memory;
- sustained and worst-frame FPS for image/video/effects;
- CPU/GPU utilization and battery/thermal behavior on reference devices;
- output dimensions and deterministic hashes;
- SSIM/edge preservation, perceptual color difference, and expert visual rating;
- parity tolerance between server, CPU, worker, Canvas, WebGL, and WebGPU;
- startup, resize, source swap, cancellation, context loss, and cleanup.

Competitor fixtures should compare Aceternity ASCII Art/Dither Shader and other
open implementations using equivalent source, dimensions, palette, and device.

---

## 13. Motion System v2

Motion is a semantic system, not a collection of keyframes.

### Motion profiles

| Profile | Behavior |
| --- | --- |
| none | immediate state changes; progress remains perceivable |
| reduced | opacity/color emphasis, minimal displacement, no autoplay spectacle |
| functional | short transitions that explain hierarchy, status, and continuity |
| expressive | branded entrances and transformations within strict budgets |
| terminal | stepped cursor/scan behavior with safe frequency and pause controls |
| cinematic | labs/marketing only; never the default application profile |

### Token model

- durations by purpose: instant, feedback, enter, exit, layout, ambient;
- easing and spring tokens by intent: standard, emphasized, productive, playful;
- distance, scale, blur, stagger, and interruption behavior;
- reduced/no-motion replacements for each semantic transition;
- animation ownership and lifecycle: start, pause, resume, finish, cancel, destroy.

### Signature AI motion

- streaming reveal that preserves selection and layout;
- tool progress and handoff transitions;
- artifact creation and patch visualization;
- diff morphing and accepted/rejected change transitions;
- context-flow and retrieval trace animation;
- deterministic ASCII flow fields, glyph morphing, phosphor persistence, and
  temporal dither in labs.

### Gates

- Prefer transform and opacity; benchmark paint-heavy texture/shadow animation.
- Pause offscreen and background ambient work.
- No information may exist only in motion.
- No infinite animation without purpose, reduced-motion behavior, and cleanup.
- Test interruption, rapid toggling, navigation during animation, and low-power
  devices.

---

## 14. Documentation and developer experience

### Documentation information architecture

1. Start: package install, registry install, first chat, first agent, theming.
2. Foundations: tokens, themes, accessibility, motion, provider neutrality.
3. Primitives: anatomy, composition, states, keyboard, form behavior.
4. AI: protocol, transports, adapters, conversation, tools, artifacts, context.
5. Renderer: concepts, backends, calibration, playground, benchmarks.
6. Blocks: complete applications with production architecture.
7. Recipes: persistence, approvals, files, voice, RAG, MCP, collaboration.
8. Reference: exports, types, schemas, compatibility, migration, changelog.

### Every component page contains

- status/maturity and version introduced;
- purpose and when not to use;
- anatomy and parts;
- all states and variants;
- controlled/uncontrolled examples;
- keyboard and screen-reader behavior;
- RTL, touch, responsive, reduced-motion, and forced-color notes;
- server/client boundary and bundle contribution;
- tokens and data attributes;
- executable examples and tests;
- known limitations and migration notes.

### Product labs

- Component state explorer across all themes and accessibility modes.
- Theme Studio.
- ASCII calibration and benchmark lab.
- AI event-stream simulator with latency, disconnect, approval, and error cases.
- Provider capability simulator.
- Agent workspace reference application.
- Security playground for Markdown, URLs, attachments, and artifacts.

### Agent-first documentation

- Generated `llms.txt` and `llms-full.txt` from canonical docs.
- Versioned skills for installation, component composition, themes, and migration.
- MCP search/inspect returns exact versioned APIs and executable examples.
- Registry items declare dependencies, files, tokens, docs, and integrity.
- Documentation snippets compile in CI against packed tarballs.

---

## 15. Testing strategy

### Test pyramid

1. **Schemas and pure units:** tokens, event reducers, stream parsers, algorithms,
   calibration, serialization, security policies.
2. **Behavior contracts:** controlled state, keyboard, focus, forms, pointer,
   touch, IME, RTL, announcements.
3. **Browser components:** Playwright in Chromium, Firefox, and WebKit at desktop
   and mobile viewports.
4. **Visual matrix:** representative component states across scheme,
   personality, density, texture, contrast, RTL, and reduced motion.
5. **Integration:** AI adapters, disconnect/resume, persistence, tools,
   approvals, artifacts, large conversations.
6. **Packaging:** packed consumer fixtures for Next RSC, Vite, Remix, plain React,
   vanilla HTML, and web components.
7. **Manual quality:** assistive technology and reference-device matrix.

### Required specialized suites

- Provider-neutral recorded streams and adapter conformance.
- Property-based/fuzz tests for chunk boundaries and invalid event sequences.
- Markdown/URL/HTML/attachment security corpus.
- Registry/CLI filesystem isolation and migration fixtures.
- Theme token completeness, contrast, nested scope, and forbidden selector lint.
- Renderer golden outputs, backend parity, performance, memory, and cleanup.
- Long-thread transcript, search, branching, and virtualization tests.
- RSC import graph tests ensuring client code does not infect static surfaces.

### CI lanes

- Fast PR: lint, types, units, behavior, schema drift, packed smoke tests.
- Browser PR: Playwright and selected visual matrix.
- Main/nightly: full visual themes, AT automation where possible, renderer and
  long-thread benchmarks, memory/leak tests.
- Release: clean install, all builds, publint, Are the Types Wrong, package size,
  examples, CLI/MCP, changelog, provenance, and canary consumer installs.

---

## 16. Benchmark program

Publish benchmark definitions and reference hardware so results are reproducible.

### Library/DX

- install time and dependency graph;
- packed size and bundle cost by scenario;
- TypeScript completion and build time;
- component source lines installed by registry;
- time/steps from empty app to provider-swappable production chat;
- upgrade and migration success rate.

### AI UX/runtime

- time from send to local acknowledgement and first token paint;
- streaming commit count, dropped frames, scroll stability, and selection safety;
- stop/steer latency;
- 100, 1,000, and 10,000-message memory/interaction behavior;
- tool/result payload scaling;
- reconnect/resume and partial-failure recovery;
- screen-reader announcement volume and task completion.

### Component quality

- automated APG interaction conformance;
- WCAG/axe and manual AT coverage;
- browser/viewport/theme state coverage;
- visual change rate and unresolved regressions;
- interaction latency on reference low-power mobile and desktop.

### Competitive comparisons

Compare equivalent workflows—not marketing component counts—against shadcn,
Base UI, Radix, React Aria, Prompt Kit, AI Elements, Carbon AI Chat,
Aceternity, and selected product interfaces. Track where skeehn intentionally
depends on a foundation rather than pretending to outperform it.

---

## 17. Migration plan

### Phase M0 — inventory and freeze

- Publish the generated API/export/token/component matrix.
- Mark current experimental GL, motion, hooks, and WC surfaces explicitly.
- Freeze new v1 variants except security/accessibility fixes.

### Phase M1 — compatibility release

- Add v2 tokens alongside v1 aliases.
- Introduce canonical parts APIs while keeping simple wrappers.
- Ship deprecation diagnostics in development and a `skeehn doctor` report.
- Create adapter packages without removing current AI SDK-shaped rendering.

### Phase M2 — codemods and automated migration

- `skeehn migrate tokens-v2`
- `skeehn migrate components-v2`
- `skeehn migrate ai-protocol-v1`
- Rewrite imports, data attributes, compound APIs, and theme selectors.
- Produce a diff and never overwrite unsupported customizations silently.

### Phase M3 — v2 default

- New installs use dimensional themes, stable primitives, and provider-neutral
  AI events.
- V1 aliases remain in a compatibility stylesheet with warnings and a published
  removal date.

### Phase M4 — v3 cleanup

- Remove aliases only after telemetry-free ecosystem signals, registry scans,
  GitHub usage samples, and migration issue volume show readiness.
- Maintain a long-term v1 compatibility package if adoption warrants it.

---

## 18. Technical debt backlog

### P0 — trust and correctness

1. Fix the failing test and decide neutral theme texture behavior.
2. Create a canonical catalog and generate registry, MCP, docs navigation, and
   counts from it.
3. Make every README/docs import compile against packed packages.
4. Publish the CLI correctly and add end-to-end init/add/theme/doctor fixtures.
5. Remove unsafe Markdown and WC HTML interpolation.
6. Replace/fix Dropdown, Tabs, Field labeling, and Dialog behavior.
7. Resolve versions and automate releases.
8. Replace MCP handwritten code generation with canonical registry compositions.

### P1 — architectural foundations

9. Select and adopt the React behavior foundation.
10. Define provider-neutral event, capability, transport, and extension contracts.
11. Split `@skeehn/ascii` and eliminate duplicated algorithms.
12. Implement Theme v2 token schema/compiler with v1 aliases.
13. Build browser/visual/RTL/forced-color/accessibility CI.
14. Rebuild safe streaming Markdown and event scheduling.
15. Add packed Next RSC/Vite/plain HTML consumer fixtures.

### P2 — differentiated product

16. Build production Conversation, Composer, Tool, Approval, Plan, Task, Source,
    and Artifact primitives.
17. Build the reference AI workspace and long-thread architecture.
18. Add context, memory, retrieval, token, provenance, and usage inspectors.
19. Rebuild glyph calibration, color ASCII, workers, WebGL atlas, and video path.
20. Build Theme Studio and renderer benchmark lab.
21. Add provider/model capability registry and AI SDK 6 adapter.

### P3 — ecosystem and advanced workflows

22. Artifact viewers, file tree, diff, terminal, search, structured data, media.
23. Workflow builder, prompt/schema editor, traces, evals, model comparison.
24. Collaboration, comments, suggestions, presence, and human handoff.
25. Mature WC coverage and evaluate Vue/Svelte/Solid adapters based on demand.
26. WebGPU, temporal dither, and advanced motion graduate only from labs evidence.

---

## 19. Multi-year roadmap

Dates depend on team size; gates and order are more important than calendar
promises.

### Horizon 0 — regain trust (0–2 months)

- Canonical catalog, export/docs/version correctness, safe rendering, green CI.
- Accessible behavior foundation decision and first repaired composites.
- Public maturity labels and deprecation policy.

**Exit:** every advertised install/import works; P0 security issues are closed;
tests are green; Dropdown/Tabs/Field/Dialog meet behavior contracts.

### Horizon 1 — foundation v2 (2–6 months)

- Stable foundation primitives.
- Theme v2 compiler, nested dimensions, compatibility layer, Theme Studio beta.
- Provider-neutral event/capability contracts and AI SDK adapter.
- Browser, visual, RSC, RTL, forced-color, and performance gates.

**Exit:** a production chat can ship with verified accessibility, theming,
provider switching, and recovery behavior.

### Horizon 2 — AI workspace (6–12 months)

- Conversation/composer v2, plans, tools, approvals, tasks, checkpoints,
  artifacts, context/provenance inspectors, files, voice, and history.
- Reference chat, research, and coding-agent applications.
- Persistence/resume and collaboration contract foundations.

**Exit:** teams can build ChatGPT/Claude-style workspaces and Cursor-style agent
flows without inventing missing interaction primitives.

### Horizon 3 — renderer leadership (9–18 months, overlaps Horizon 2)

- `@skeehn/ascii`, runtime glyph calibration, color and subcell modes, workers,
  Canvas/SVG/server parity, repaired WebGL, adaptive video.
- Published benchmark suite and competitive reports.
- Motion v2 and signature artifact/context transitions.

**Exit:** skeehn leads comparable open renderers on a published balance of visual
quality, capability, responsiveness, and accessibility.

### Horizon 4 — agent operating system (12–24 months)

- Workflow canvas, traces, prompts, schemas, evaluation, model comparison,
  memory/context graphs, permission policy surfaces, collaboration and review.
- Stable web-component coverage and demand-led framework adapters.
- Registry ecosystem, third-party viewers/tool renderers/themes, certification.

**Exit:** skeehn supports full agent products, not only assistant panels.

### Horizon 5 — platform and ecosystem (24–36 months)

- Figma plugin and bidirectional token workflows.
- Provider and framework adapter ecosystem with conformance certification.
- WebGPU/advanced media graduation where platform support and evidence justify it.
- Native/spatial interaction research without compromising web fundamentals.
- Governance for stable contracts, accessibility, security, and community themes.

**Exit:** skeehn is a dependable platform other libraries and products build on,
with a healthy extension ecosystem and multi-year compatibility record.

---

## 20. Ranked implementation order by ROI

1. **Canonical contract and executable docs** — fixes user trust, releases, MCP,
   registry, and agent adoption simultaneously.
2. **Security fixes for model output and web components** — non-negotiable for
   AI-generated content.
3. **Accessible composite foundation** — prevents repeated fragile menu/dialog/
   select/tab work and raises every future component.
4. **Provider-neutral event and capability protocol** — unlocks all providers and
   prevents AI SDK/provider churn from infecting UI.
5. **Green cross-browser/RSC/visual quality gates** — makes “production ready” a
   testable claim.
6. **Conversation, Composer, Tool, Approval, Plan, and Artifact v2** — the minimum
   complete AI product loop.
7. **Theme v2 compiler and nested dimensions** — converts the strongest design
   idea into a scalable system.
8. **Reference AI workspace** — proves composition and reveals missing contracts.
9. **ASCII engine consolidation and correctness** — removes false claims and
   duplication before advanced effects.
10. **Context/provenance/memory/retrieval inspectors** — differentiates skeehn
    from chat component kits.
11. **Files, voice, image/audio/video, and durable artifacts** — completes
    multimodal workflows.
12. **Renderer acceleration and video** — worker, Canvas, server, WebGL parity,
    then WebGPU labs.
13. **Workflow/evaluation/model comparison surfaces** — expands into agent
    platforms and AI operations.
14. **Collaboration and human handoff** — enables team-scale AI work.
15. **Framework and ecosystem expansion** — only after stable contracts exist.
16. **Spectacular labs motion/effects** — valuable differentiation, lowest ROI
    until trust, behavior, and core workflows are excellent.

### Recommended first implementation program

Run three tightly connected workstreams:

1. **Truth:** canonical catalog, exports, docs, versions, CLI/MCP, package tests.
2. **Behavior:** foundation selection plus Field, Dropdown/Menu, Tabs, Dialog.
3. **Protocol:** event/capability RFC plus recorded provider fixtures.

Do not begin a repo-wide visual refactor until these contracts land. Then use a
single vertical reference slice—Conversation + Composer + Tool Approval +
Artifact + Theme v2—to validate the complete architecture before multiplying
components.

---

## 21. Research synthesis

The plan intentionally combines ideas rather than cloning one library:

- [shadcn/ui registry](https://ui.shadcn.com/docs/registry) demonstrates source
  ownership, registry distribution, namespaces, themes, hooks, and agent tooling.
- [shadcn theming](https://ui.shadcn.com/docs/theming) demonstrates semantic
  background/foreground pairs and visual preset generation.
- [Base UI](https://base-ui.com/react/overview/about),
  [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction),
  and [React Aria](https://react-spectrum.adobe.com/react-aria/) establish the
  bar for headless composition, focus, keyboard, devices, and assistive tech.
- [Open UI](https://open-ui.org/) and the browser
  [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
  show where native behavior can replace custom JavaScript progressively.
- [AI SDK `useChat`](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) and
  [AI Elements](https://elements.ai-sdk.dev/) establish current structured
  message, tool, approval, prompt-input, and agent component expectations.
- [Prompt Kit](https://www.prompt-kit.com/docs) demonstrates source-copy AI
  primitives and streaming Markdown concerns.
- [Aceternity ASCII Art](https://ui.aceternity.com/components/ascii-art) and
  [Dither Shader](https://ui.aceternity.com/components/dither-shader) establish
  the current open visual feature floor: color, many charsets, object fit,
  animation, pattern modes, palettes, and viewport awareness.
- [Fancy Components](https://www.fancycomponents.dev/docs/introduction) and
  [Motion](https://motion.dev/docs/performance) provide inspiration and concrete
  performance guidance for expressive interaction.
- [Carbon for AI](https://carbondesignsystem.com/guidelines/carbon-for-ai/)
  makes AI presence, provenance, and explainability part of the design system.
- [Fluent design tokens](https://fluent2.microsoft.design/design-tokens) support
  reference/alias token layering and high-contrast adaptation.
- [Material 3](https://m3.material.io/) shows how expressive color, type, shape,
  and motion can remain token-driven and adaptive.
- [Apple HIG design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles)
  emphasize hierarchy, consistency, feedback, recovery, input diversity, and
  preserving context; its
  [generative AI guidance](https://developer.apple.com/design/human-interface-guidelines/generative-ai)
  emphasizes trust and appropriate mental models.
- ChatGPT [Canvas](https://help.openai.com/en/articles/9930697-what-is-the-canvas-feature-in-chatgpt)
  and [Deep Research](https://help.openai.com/en/articles/10500283-deep-research-in-chatgpt)
  demonstrate artifacts, inline edits, versions, plan review, source selection,
  visible progress, interruption, and cited reports.
- Claude [Artifacts](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)
  and Projects demonstrate durable work and project-scoped knowledge alongside
  conversation.
- [Cursor checkpoints](https://docs.cursor.com/en/agent/chat/checkpoints),
  Lovable plan/agent modes,
  [Linear agent delegation](https://linear.app/docs/agents-in-linear), and
  [Raycast AI extensions](https://manual.raycast.com/ai/ai-extensions) reinforce
  visible work, permissions, persistent agent configuration, human ownership,
  and reversible action.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and
  [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/) are normative quality
  foundations, not optional inspiration.

---

## 22. Architecture review decisions still requiring an RFC

These questions should be answered with prototypes and evidence before locking
v2 APIs:

1. Base UI vs React Aria as the primary React behavior foundation.
2. Exact relationship between canonical `@skeehn/react/ai` events and AI SDK 6
   `UIMessage` parts.
3. Full-color token format and compatibility strategy for HSL tuple consumers.
4. Whether `@skeehn/ascii` is one package with subpaths or separate optional GPU
   packages after real bundle measurements.
5. Virtualization ownership: built-in transcript/tree primitives vs adapter to a
   focused virtualization package.
6. Safe Markdown baseline and optional math/highlighting dependencies.
7. Artifact sandbox origin, CSP, networking, and host communication protocol.
8. Figma output format and whether bidirectional sync belongs in core roadmap or
   an official plugin.

The next RFC should address items 1–3 together because behavior composition,
client boundaries, tokens, and registry output all affect the first stable v2
component slice.
