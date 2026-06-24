# skeehn — Agent Instructions

This file tells AI coding agents (Claude, Cursor, Copilot, Gemini, etc.) how to install, configure, and use skeehn components.

## Quick Start for Agents

When a user asks to "set up skeehn" or "add skeehn to my project":

1. Check if skeehn engine files exist: look for `engine/tokens.css` or `styles/tokens.css`
2. If not installed, copy engine + theme files from this repo to the user's project
3. Pick a theme based on user intent (`default` | `dark` | `terminal` | `brutal` | `print` | `grain` | `mardi-gras`)
4. Add requested components from `components/{name}/` (or via `npx skeehn add <name>`)

## Installing via CLI (preferred)

```bash
# Basic setup (engine CSS + default theme)
npx skeehn init

# Initialize with a specific theme
npx skeehn init --theme terminal

# Add individual components
npx skeehn add chat-bubble
npx skeehn add chat-input
npx skeehn add reasoning-step
npx skeehn add all   # all 32 components

# Switch theme
npx skeehn theme dark
npx skeehn theme terminal
```

## File Paths

```
engine/reset.css            CSS reset
engine/tokens.css           Design tokens
engine/dither.css           Dither patterns
themes/{name}.css           Theme files
components/{name}/{name}.css    Component styles
components/{name}/{name}.js     Component JS (optional, for interactive)
components/{name}/{name}.html   Component usage example
```

## Required CSS Load Order

Always load in this order in `<head>`:

```html
<link rel="stylesheet" href="engine/reset.css">
<link rel="stylesheet" href="engine/tokens.css">
<link rel="stylesheet" href="engine/dither.css">
<!-- component CSS files -->
<link rel="stylesheet" href="components/button/button.css">
<link rel="stylesheet" href="themes/default.css">  <!-- theme last -->
```

## Component HTML Patterns

### Chat bubble
```html
<div class="sk-chat-bubble" data-role="user|assistant|tool|system">
  <div class="sk-chat-bubble__content">Message text</div>
</div>
```

### Agent status
```html
<div class="sk-agent-status" data-status="idle|thinking|acting|done|error">
  <span class="sk-agent-status__dot"></span>
  <span class="sk-agent-status__label">thinking</span>
</div>
```

### Button variants
```html
<button class="sk-btn" data-variant="dither">Primary action</button>
<button class="sk-btn" data-variant="outline">Secondary</button>
<button class="sk-btn" data-variant="ghost">Subtle</button>
<button class="sk-btn" data-variant="solid">Solid fill</button>
<!-- Sizes: data-size="sm|md|lg" -->
```

### Chat input (requires JS — load chat-input.js)
```html
<sk-chat-input class="sk-chat-input" data-state="idle">
  <div class="sk-chat-input__wrapper">
    <textarea class="sk-chat-input__field" placeholder="Ask..." rows="1" aria-label="Chat input"></textarea>
    <div class="sk-chat-input__actions">
      <button class="sk-chat-input__mic sk-btn" data-variant="ghost" data-size="sm" data-mic-state="idle">
        <span class="sk-chat-input__mic-icon">◎</span>
      </button>
      <button class="sk-chat-input__send sk-btn" data-variant="dither" data-size="sm">↑</button>
    </div>
  </div>
  <div class="sk-chat-input__hint">Enter to send · Shift+Enter for new line</div>
</sk-chat-input>
<script type="module" src="components/chat-input/chat-input.js"></script>
```

Events:
- `sk:submit` → `{ detail: { value: string } }` — user sent a message
- `sk:cancel` → user cancelled generation
- `sk:voice-start` / `sk:voice-stop` — voice recording state

### Reasoning step (requires JS — load reasoning-step.js)
```html
<div class="sk-reasoning-step" data-status="pending|active|completed|error" data-expanded="false">
  <button class="sk-reasoning-step__header">
    <span class="sk-reasoning-step__indicator">○</span>
    <span class="sk-reasoning-step__title">Step title here</span>
    <span class="sk-reasoning-step__chevron">▸</span>
  </button>
  <div class="sk-reasoning-step__content">
    Step details / nested content goes here.
  </div>
</div>
<script type="module" src="components/reasoning-step/reasoning-step.js"></script>
```

Status indicators: `○` pending · `▸` active · `✓` completed · `✗` error

### Voice session (requires JS — load voice-session.js)
```html
<sk-voice-session class="sk-voice-session" data-status="idle" data-timezone="America/New_York" data-city="New York">
  <div class="sk-voice-session__clock"></div>
  <div class="sk-voice-session__waveform">
    <div class="sk-voice-session__waveform-bar"></div>
    <div class="sk-voice-session__waveform-bar"></div>
    <!-- 8-12 bars -->
  </div>
  <div class="sk-voice-session__transcript"></div>
  <div class="sk-voice-session__controls">
    <button class="sk-btn" data-variant="ghost" data-size="sm" data-action="mute">Mute</button>
    <button class="sk-btn" data-variant="outline" data-size="sm" data-action="end">End</button>
  </div>
</sk-voice-session>
```

Statuses: `idle` · `listening` · `transcribing` · `speaking` · `handoff`

### Badge
```html
<span class="sk-badge" data-variant="default|primary|outline|destructive">Label</span>
```

### Code block
```html
<div class="sk-code-block">
  <div class="sk-code-block__header">
    <span class="sk-code-block__lang">typescript</span>
    <button class="sk-code-block__copy sk-btn" data-variant="ghost" data-size="sm">copy</button>
  </div>
  <pre class="sk-code-block__pre"><code class="sk-code-block__code">const x = 1;</code></pre>
</div>
```

### Tool card
```html
<div class="sk-tool-card" data-status="pending|running|done|error">
  <div class="sk-tool-card__header">
    <span class="sk-tool-card__name">read_file</span>
    <span class="sk-tool-card__status">running</span>
  </div>
  <div class="sk-tool-card__args">{"path": "src/index.ts"}</div>
  <div class="sk-tool-card__result">File contents here</div>
</div>
```

## Theme Switching

```javascript
// Apply theme programmatically
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('theme-link').href = `themes/${theme}.css`;
}

// Available: default | dark | terminal | brutal | print | grain | mardi-gras
applyTheme('dark');
```

## Design System Notes

**Colors — always use HSL wrapper:**
```css
/* CORRECT */
color: hsl(var(--sk-foreground));
background: hsl(var(--sk-background));
border-color: hsl(var(--sk-border-color));

/* WRONG — tokens are tuples, not full color values */
color: var(--sk-foreground);
```

**Border shorthand vs border-color:**
```css
border: var(--sk-border);              /* full: 1px solid hsl(...) */
border-color: hsl(var(--sk-border-color));  /* just the color */
```

**Typography:**
- `var(--sk-font-sans)` — Geist — for UI labels, headings, body
- `var(--sk-font-mono)` — Geist Mono — for code, data, terminal content
- Swiss style: use thin weights (`--sk-font-weight-thin: 200`) for large headings

**Dither patterns:**
```css
/* Apply as background texture */
background-image: var(--sk-dither-bayer);
background-size: 32px 32px;
opacity: 0.04;  /* keep subtle — 3-6% opacity */
```

**8px spacing grid:**
```css
gap: var(--sk-space-4);    /* 16px */
padding: var(--sk-space-6); /* 24px */
margin: var(--sk-space-8);  /* 32px */
```

## React Usage

```tsx
import { ChatBubble, AgentStatus, ReasoningStep } from '@skeehn/react';
// Also import Message (alias for ChatBubble)

<AgentStatus status="thinking" />
<ChatBubble role="assistant" streaming={true}>Generating...</ChatBubble>
<ReasoningStep status="completed" title="Retrieved context" defaultExpanded>
  Found 3 relevant documents.
</ReasoningStep>
```

## MCP Server

```bash
bun run packages/mcp-server/src/index.ts
```

Available MCP tools:
- `add_component` — copy a component to the user's project
- `set_theme` — switch active theme
- `init_project` — full project setup
- `list_components` — get all available components

## Common Patterns

### 3-panel AI app shell
```html
<body style="display:grid; grid-template-rows:auto 1fr; height:100dvh">
  <header><!-- topbar --></header>
  <div style="display:grid; grid-template-columns:200px 1fr">
    <aside><!-- sidebar: agent status, nav --></aside>
    <main style="display:flex; flex-direction:column">
      <div style="flex:1; overflow-y:auto"><!-- thread --></div>
      <div><!-- chat-input --></div>
    </main>
  </div>
</body>
```

### Streaming chat message
```javascript
// Add user message immediately
const userBubble = document.createElement('div');
userBubble.className = 'sk-chat-bubble';
userBubble.setAttribute('data-role', 'user');
userBubble.innerHTML = `<div class="sk-chat-bubble__content">${text}</div>`;
thread.appendChild(userBubble);

// Add assistant streaming message
const assistantBubble = document.createElement('div');
assistantBubble.className = 'sk-chat-bubble';
assistantBubble.setAttribute('data-role', 'assistant');
assistantBubble.setAttribute('data-streaming', 'true');
assistantBubble.innerHTML = `<div class="sk-chat-bubble__content"></div>`;
thread.appendChild(assistantBubble);

// Stream into it
const content = assistantBubble.querySelector('.sk-chat-bubble__content');
for await (const chunk of stream) {
  content.textContent += chunk;
}
assistantBubble.removeAttribute('data-streaming');
```
