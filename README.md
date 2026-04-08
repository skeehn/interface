<p align="center">
  <strong>▦ skeehn</strong>
</p>

<h1 align="center">ASCII Native AI Components</h1>

<p align="center">
  Build AI interfaces that mean it.<br />
  32 components. 7 themes. Zero dependencies. Every surface a canvas for dither texture.
</p>

<p align="center">
  <a href="https://ui.skeehn.com">Documentation</a> ·
  <a href="https://ui.skeehn.com/docs/components">Components</a> ·
  <a href="https://ui.skeehn.com/docs/engine">Engine Playground</a> ·
  <a href="https://ui.skeehn.com/docs/themes">Themes</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/components-32-orange" alt="Components">
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="Zero Dependencies">
</p>

---

## Quickstart

```bash
npx skeehn init
npx skeehn add chat-bubble button
bun run dev
```

Or install as a package:

```bash
bun add @skeehn/core @skeehn/react
```

```tsx
import { ChatBubble, useChat } from '@skeehn/react';
import '@skeehn/core/css';

export function Chat() {
  const { messages, input, setInput, append } = useChat({ api: '/api/chat' });

  return (
    <div>
      {messages.map(m => (
        <ChatBubble key={m.id} role={m.role}>{m.content}</ChatBubble>
      ))}
    </div>
  );
}
```

## Why skeehn?

Every UI library uses flat colors and gradients. skeehn uses **ASCII characters and dither algorithms as native rendering primitives** — Floyd-Steinberg, Bayer ordered dithering, Atkinson, all running in real-time on Canvas2D and WebGL.

It's not retro for retro's sake. It's a **production-grade component system** where texture is a first-class design token alongside color and space.

## What's Inside

### 32 Components

| Category | Components |
|----------|-----------|
| **Core** (14) | Button, Card, Input, Badge, Alert, Dialog, Tabs, Toggle, Progress, Avatar, Tooltip, Dropdown, Table, Accordion |
| **AI** (13) | ChatBubble, ChatInput, ThinkingBlock, ReasoningStep, ToolCard, StreamingText, CodeBlock, AgentStatus, TypingIndicator, Markdown, VoiceSession, PromptSuggestions, FileAttachment |
| **Bundles** (3) | Layout, DataViz, Motion |
| **GL** (4) | DitherBackground, AsciiImage, AsciiVideo, AsciiAnimation |

### Streaming Hooks

```tsx
import { useChat, useCompletion, useAsciiStream } from '@skeehn/react/hooks';

// Multi-turn chat with SSE streaming
const { messages, append, isLoading } = useChat({ api: '/api/chat' });

// Single-turn completion
const { completion, complete } = useCompletion({ api: '/api/completion' });

// Dither-animated token reveal (skeehn-only)
const { text, isStreaming } = useAsciiStream({ stream, ditherFade: true });
```

### WebGL Effects

```tsx
import { DitherBackground, AsciiImage, AsciiVideo } from '@skeehn/react/gl';

<DitherBackground algorithm="bayer" colorA="#1a0533" colorB="#0a2e3a" animate />
<AsciiImage src="/photo.jpg" algorithm="floyd" palette="blocks" />
<AsciiVideo src="webcam" resolution={80} fps={30} />
```

### 7 Themes

| Theme | Signature |
|-------|-----------|
| `default` | Swiss minimal, paper grain texture |
| `dark` | Phosphor text glow, vignette |
| `terminal` | CRT scanlines, green phosphor glow |
| `brutal` | 2px borders, hard pixel shadows |
| `print` | Halftone dots, warm newsprint |
| `grain` | Animated film grain, analog feel |
| `mardi-gras` | Purple/gold/green, crosshatch overlay |

### CLI (shadcn-style)

```bash
npx skeehn init                    # Set up in your project
npx skeehn add button              # Copy component source (you own it)
npx skeehn add chat-bubble         # Add AI components
npx skeehn add --all               # Add everything
npx skeehn theme terminal          # Switch themes
npx skeehn doctor                  # Validate setup
```

## Architecture

```
@skeehn/core                       # CSS + engine (30KB JS, 35KB CSS)
├── engine/                         # Dither algorithms, WebGL shaders, Canvas2D
├── components/                     # 32 component CSS files
└── themes/                         # 7 theme presets

@skeehn/react                       # React 19 wrappers (50KB)
├── components/                     # 32 typed React components
├── hooks/                          # useChat, useCompletion, useAsciiStream
└── gl/                             # DitherBackground, AsciiImage, AsciiVideo
```

## Stack

- **Runtime:** TypeScript + React 19 + Next.js 15
- **Build:** Bun
- **Styling:** CSS custom properties (no Tailwind required)
- **Rendering:** Canvas2D + WebGL (optional Three.js for premium effects)
- **Streaming:** fetch + ReadableStream (Vercel AI SDK compatible)

## Development

```bash
git clone https://github.com/skeehn/skeehn
cd skeehn
bun install
bun run dev          # Start docs demo (localhost:3000)
bun run build        # Build @skeehn/core + @skeehn/react
bun test             # Run tests
```

## License

MIT

---

<p align="center">
  Built by <a href="https://skeehn.com">skeehn</a>. Every pixel deliberate.
</p>
