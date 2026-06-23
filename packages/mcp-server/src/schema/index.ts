/**
 * skeehn MCP Schema
 *
 * Machine-readable component schemas, theme registry, prop contracts,
 * examples, patterns, and install manifest data for AI agent consumption.
 */

export const componentCategories = ["core", "ai", "layout", "dataviz", "motion"] as const;
export const themeNames = ["default", "brutal", "terminal", "print", "grain"] as const;

type ComponentCategory = (typeof componentCategories)[number];

interface ComponentDefinition {
  name: string;
  slug: string;
  category: ComponentCategory;
  description: string;
  files: string[];
  variants: string[];
  props: Record<string, any>;
  slots: Record<string, string>;
  example: string;
  primitives?: string[];
}

const components: ComponentDefinition[] = [
  {
    name: "Button",
    slug: "button",
    category: "core",
    description: "Interactive button with ASCII dither variants",
    files: ["button.css"],
    variants: ["solid", "dither", "outline", "ghost", "inverted", "ascii"],
    props: {
      variant: { type: "enum", values: ["solid", "dither", "outline", "ghost", "inverted", "ascii"], default: "solid" },
      size: { type: "enum", values: ["sm", "base", "lg", "xl"], default: "base" },
      disabled: { type: "boolean", default: false },
      loading: { type: "boolean", default: false },
      onClick: { type: "function" },
    },
    slots: { default: "Button text content" },
    example: '<button class="sk-btn" data-variant="dither" data-size="lg">Click me</button>',
  },
  {
    name: "Card",
    slug: "card",
    category: "core",
    description: "Elevated content container with texture surfaces",
    files: ["card.css"],
    variants: ["solid", "dither", "outline", "ghost", "inverted"],
    props: {
      variant: { type: "enum", values: ["solid", "dither", "outline", "ghost", "inverted"], default: "solid" },
      elevation: { type: "enum", values: ["none", "sm", "md", "lg"], default: "none" },
      bordered: { type: "boolean", default: true },
    },
    slots: { header: "Card header", body: "Card body content", footer: "Card footer" },
    example: '<div class="sk-card" data-variant="dither"><div class="sk-card__body"><p>Content</p></div></div>',
  },
  {
    name: "Input",
    slug: "input",
    category: "core",
    description: "Text input with ASCII focus states",
    files: ["input.css"],
    variants: ["default", "dither-focus", "error", "disabled"],
    props: {
      type: { type: "enum", values: ["text", "password", "email", "number", "search"], default: "text" },
      placeholder: { type: "string" },
      value: { type: "string" },
      state: { type: "enum", values: ["default", "error", "success"], default: "default" },
      dither: { type: "boolean", default: false },
      disabled: { type: "boolean", default: false },
    },
    slots: {},
    example: '<input class="sk-input" placeholder="Type here..." data-dither>',
  },
  {
    name: "Badge",
    slug: "badge",
    category: "core",
    description: "Status indicator with dither fills",
    files: ["badge.css"],
    variants: ["solid", "dither", "outline", "ghost", "inverted"],
    props: {
      variant: { type: "enum", values: ["solid", "dither", "outline", "ghost", "inverted"], default: "solid" },
      color: { type: "enum", values: ["default", "success", "warning", "destructive", "info"], default: "default" },
      size: { type: "enum", values: ["sm", "base", "lg"], default: "base" },
    },
    slots: { default: "Badge text" },
    example: '<span class="sk-badge" data-variant="dither" data-color="success">Active</span>',
  },
  {
    name: "Alert",
    slug: "alert",
    category: "core",
    description: "Contextual feedback message with dither borders",
    files: ["alert.css"],
    variants: ["info", "success", "warning", "destructive", "neutral"],
    props: {
      type: { type: "enum", values: ["info", "success", "warning", "destructive", "neutral"], default: "info" },
      dismissible: { type: "boolean", default: false },
      icon: { type: "boolean", default: true },
    },
    slots: { title: "Alert title", description: "Alert description" },
    example: '<div class="sk-alert" data-type="success"><p class="sk-alert__title">Success</p><p class="sk-alert__description">Done.</p></div>',
  },
  {
    name: "Dialog",
    slug: "dialog",
    category: "core",
    description: "Modal overlay with dither backdrop",
    files: ["dialog.css", "dialog.js"],
    variants: ["default", "modal", "drawer", "fullscreen"],
    props: {
      open: { type: "boolean", default: false },
      size: { type: "enum", values: ["sm", "md", "lg", "xl", "full"], default: "md" },
      dismissible: { type: "boolean", default: true },
    },
    slots: { header: "Dialog header", body: "Dialog body", footer: "Dialog footer" },
    example: '<dialog class="sk-dialog" open><div class="sk-dialog__body"><p>Content</p></div></dialog>',
  },
  {
    name: "Tabs",
    slug: "tabs",
    category: "core",
    description: "Tabbed navigation with texture active state",
    files: ["tabs.css", "tabs.js"],
    variants: ["pill", "underline", "bordered", "ascii"],
    props: {
      variant: { type: "enum", values: ["pill", "underline", "bordered", "ascii"], default: "pill" },
      orientation: { type: "enum", values: ["horizontal", "vertical"], default: "horizontal" },
      defaultValue: { type: "string" },
    },
    slots: { list: "Tab list", content: "Tab content panels" },
    example: '<div class="sk-tabs"><div class="sk-tabs__list"><button class="sk-tabs__trigger" aria-selected="true">Tab 1</button></div></div>',
  },
  {
    name: "Toggle",
    slug: "toggle",
    category: "core",
    description: "Two-state switch with dither states",
    files: ["toggle.css", "toggle.js"],
    variants: ["default", "small", "large"],
    props: {
      checked: { type: "boolean", default: false },
      disabled: { type: "boolean", default: false },
      label: { type: "string" },
    },
    slots: {},
    example: '<label class="sk-toggle"><input type="checkbox" class="sk-toggle__input" checked><span class="sk-toggle__thumb"></span><span class="sk-toggle__label">Enabled</span></label>',
  },
  {
    name: "Progress",
    slug: "progress",
    category: "core",
    description: "Loading indicator with ASCII fill",
    files: ["progress.css"],
    variants: ["bar", "circular", "steps", "streaming"],
    props: {
      variant: { type: "enum", values: ["bar", "circular", "steps", "streaming"], default: "bar" },
      value: { type: "number", default: 0 },
      max: { type: "number", default: 100 },
      animated: { type: "boolean", default: false },
    },
    slots: {},
    example: '<div class="sk-progress"><div class="sk-progress__track"><div class="sk-progress__indicator" style="width:60%"></div></div></div>',
  },
  {
    name: "Avatar",
    slug: "avatar",
    category: "core",
    description: "User image with ASCII placeholder",
    files: ["avatar.css"],
    variants: ["image", "initials", "ascii", "status"],
    props: {
      size: { type: "enum", values: ["xs", "sm", "md", "lg", "xl"], default: "md" },
      src: { type: "string" },
      fallback: { type: "string" },
      status: { type: "enum", values: ["online", "offline", "busy", "away"], default: "offline" },
    },
    slots: {},
    example: '<div class="sk-avatar" data-size="md"><img src="avatar.jpg" alt=""></div>',
  },
  {
    name: "Tooltip",
    slug: "tooltip",
    category: "core",
    description: "Hover info with dither body",
    files: ["tooltip.css"],
    variants: ["top", "bottom", "left", "right"],
    props: {
      position: { type: "enum", values: ["top", "bottom", "left", "right"], default: "top" },
      content: { type: "string", required: true },
      delay: { type: "number", default: 200 },
      arrow: { type: "boolean", default: true },
    },
    slots: { default: "Trigger element", content: "Tooltip content" },
    example: '<div class="sk-tooltip-wrapper"><button>Hover</button><div class="sk-tooltip">Tooltip text</div></div>',
  },
  {
    name: "Dropdown",
    slug: "dropdown",
    category: "core",
    description: "Menu with ASCII item separators",
    files: ["dropdown.css", "dropdown.js"],
    variants: ["default", "search", "multi"],
    props: {
      items: { type: "array", required: true },
      searchable: { type: "boolean", default: false },
      multiple: { type: "boolean", default: false },
    },
    slots: { trigger: "Dropdown trigger", items: "Dropdown items" },
    example: '<div class="sk-dropdown"><button data-dropdown-trigger>Options</button><div class="sk-dropdown__content"><div class="sk-dropdown__item">Item 1</div></div></div>',
  },
  {
    name: "Table",
    slug: "table",
    category: "core",
    description: "Data table with dither row separators",
    files: ["table.css"],
    variants: ["default", "striped", "bordered", "ascii"],
    props: {
      columns: { type: "array", required: true },
      rows: { type: "array", required: true },
      sortable: { type: "boolean", default: false },
    },
    slots: { header: "Table header", body: "Table body", footer: "Table footer" },
    example: '<table class="sk-table"><thead><tr><th>Name</th><th>Status</th></tr></thead><tbody><tr><td>Alice</td><td>Active</td></tr></tbody></table>',
  },
  {
    name: "Accordion",
    slug: "accordion",
    category: "core",
    description: "Collapsible sections with texture headers",
    files: ["accordion.css", "accordion.js"],
    variants: ["default", "bordered", "ghost"],
    props: {
      items: { type: "array", required: true },
      multiple: { type: "boolean", default: false },
      animated: { type: "boolean", default: true },
    },
    slots: { items: "Accordion items" },
    example: '<div class="sk-accordion"><div class="sk-accordion__item"><button class="sk-accordion__trigger" data-accordion-trigger><span>Title</span></button><div class="sk-accordion__content" hidden><p>Content</p></div></div></div>',
  },
  {
    name: "ChatBubble",
    slug: "chat-bubble",
    category: "ai",
    description: "Message bubble with ASCII dither fill and streaming states",
    files: ["chat-bubble.css", "chat-bubble.js"],
    variants: ["user", "assistant", "tool", "system"],
    props: {
      role: { type: "enum", values: ["user", "assistant", "tool", "system"], required: true },
      content: { type: "string", required: true },
      streaming: { type: "boolean", default: false },
      citations: { type: "array" },
      timestamp: { type: "string" },
    },
    slots: { default: "Message content", actions: "Action buttons", citations: "Citation list" },
    example: '<div class="sk-chat-bubble" data-role="assistant" data-streaming><p>Streaming response...</p></div>',
  },
  {
    name: "ChatInput",
    slug: "chat-input",
    category: "ai",
    description: "Prompt input with send, attach, voice, and cancel actions",
    files: ["chat-input.css"],
    variants: ["default", "compact", "expanded"],
    props: {
      placeholder: { type: "string", default: "Ask anything..." },
      attachments: { type: "boolean", default: true },
      voice: { type: "boolean", default: false },
      onCancel: { type: "function" },
      onSend: { type: "function", required: true },
    },
    slots: { prefix: "Before input", suffix: "After input", actions: "Action buttons" },
    example: '<div class="sk-chat-input"><textarea class="sk-chat-input__field sk-input" placeholder="Ask..." data-dither></textarea><button class="sk-btn" data-variant="dither">Send</button></div>',
  },
  {
    name: "ReasoningStep",
    slug: "reasoning-step",
    category: "ai",
    description: "Expandable reasoning trace with dither unfold animation",
    files: ["reasoning-step.css"],
    variants: ["collapsed", "expanded", "active", "completed"],
    props: {
      title: { type: "string", required: true },
      content: { type: "string" },
      status: { type: "enum", values: ["pending", "active", "completed", "error"], default: "pending" },
      animated: { type: "boolean", default: true },
    },
    slots: { title: "Step title", content: "Step content" },
    example: '<div class="sk-reasoning-step" data-status="active"><h4>Analyzing...</h4><p>Processing request</p></div>',
  },
  {
    name: "ToolCard",
    slug: "tool-card",
    category: "ai",
    description: "Tool execution result with box-drawing borders",
    files: ["tool-card.css"],
    variants: ["success", "error", "running", "pending"],
    props: {
      name: { type: "string", required: true },
      input: { type: "object" },
      output: { type: "object" },
      status: { type: "enum", values: ["pending", "running", "success", "error"], default: "pending" },
    },
    slots: { header: "Tool header", input: "Tool input", output: "Tool output" },
    example: '<div class="sk-tool-card" data-status="success"><h3>search_web</h3><pre>Results...</pre></div>',
  },
  {
    name: "CitationCard",
    slug: "citation-card",
    category: "ai",
    description: "Source reference with ASCII metadata display",
    files: ["citation-card.css"],
    variants: ["default", "compact", "inline"],
    props: {
      source: { type: "string", required: true },
      url: { type: "string" },
      snippet: { type: "string" },
      confidence: { type: "number" },
    },
    slots: { source: "Source name", snippet: "Quote snippet" },
    example: '<div class="sk-citation-card"><span class="sk-citation-card__source">Wikipedia</span><p class="sk-citation-card__snippet">...</p></div>',
  },
  {
    name: "StreamingText",
    slug: "streaming-text",
    category: "ai",
    description: "Text streaming animation with dither effects",
    files: ["streaming-text.css", "streaming-text.js"],
    variants: ["typewriter", "scanline", "wave", "fade"],
    props: {
      text: { type: "string", required: true },
      speed: { type: "number", default: 50 },
      effect: { type: "enum", values: ["typewriter", "scanline", "wave", "fade"], default: "typewriter" },
      cursor: { type: "boolean", default: true },
    },
    slots: {},
    example: '<div class="sk-streaming-text" data-effect="typewriter" data-speed="50">Streaming text...</div>',
  },
  {
    name: "TerminalPanel",
    slug: "terminal-panel",
    category: "ai",
    description: "Code execution panel with ASCII borders",
    files: ["terminal-panel.css"],
    variants: ["default", "interactive", "readonly"],
    props: {
      commands: { type: "array" },
      output: { type: "string" },
      theme: { type: "enum", values: [...themeNames], default: "terminal" },
    },
    slots: { header: "Panel header", body: "Terminal output", input: "Command input" },
    example: '<div class="sk-terminal-panel" data-theme="terminal"><pre><code>$ command</code></pre></div>',
  },
  {
    name: "AgentStatus",
    slug: "agent-status",
    category: "ai",
    description: "Agent state indicator with dither pulse animation",
    files: ["agent-status.css"],
    variants: ["idle", "thinking", "acting", "done", "error", "listening", "speaking"],
    props: {
      status: { type: "enum", values: ["idle", "thinking", "acting", "done", "error", "listening", "speaking"], default: "idle" },
      message: { type: "string" },
      pulse: { type: "boolean", default: true },
    },
    slots: { status: "Status indicator", message: "Status message" },
    example: '<div class="sk-agent-status" data-status="thinking"><span class="sk-agent-status__indicator"></span><span>Thinking...</span></div>',
  },
  {
    name: "CodeBlock",
    slug: "code-block",
    category: "ai",
    description: "Code display with copy affordances and line numbers",
    files: ["code-block.css", "code-block.js"],
    variants: ["default", "line-numbers", "inline"],
    props: {
      language: { type: "string" },
      copyable: { type: "boolean", default: true },
      lineNumbers: { type: "boolean", default: false },
      code: { type: "string", required: true },
    },
    slots: { header: "Block header", body: "Code content" },
    example: '<div class="sk-code-block"><div class="sk-code-block__body"><pre><code>const ok = true;</code></pre></div></div>',
  },
  {
    name: "TypingIndicator",
    slug: "typing-indicator",
    category: "ai",
    description: "Typing or generation indicator for chat and voice states",
    files: ["typing-indicator.css"],
    variants: ["default", "ascii", "dither", "compact"],
    props: {
      label: { type: "string", default: "Typing..." },
      variant: { type: "enum", values: ["default", "ascii", "dither", "compact"], default: "default" },
    },
    slots: {},
    example: '<div class="sk-typing-indicator" data-variant="ascii"><span class="sk-typing-indicator__text">Thinking...</span></div>',
  },
  {
    name: "Markdown",
    slug: "markdown",
    category: "ai",
    description: "Markdown renderer for AI output, citations, and code answers",
    files: ["markdown.css", "markdown.js"],
    variants: ["default", "article", "chat"],
    props: {
      markdown: { type: "string", required: true },
      sanitize: { type: "boolean", default: true },
    },
    slots: { default: "Rendered markdown content" },
    example: '<div class="sk-markdown" data-markdown># Hello</div>',
  },
  {
    name: "VoiceSession",
    slug: "voice-session",
    category: "ai",
    description: "Realtime voice session primitives with waveform, transcript, and timezone clock",
    files: ["voice-session.css", "voice-session.js"],
    variants: ["idle", "listening", "transcribing", "speaking", "handoff"],
    props: {
      status: { type: "enum", values: ["idle", "listening", "transcribing", "speaking", "handoff"], default: "idle" },
      city: { type: "string", default: "Tokyo" },
      timeZone: { type: "string", default: "Asia/Tokyo", required: true },
      transcript: { type: "array" },
      showClock: { type: "boolean", default: true },
      showWaveform: { type: "boolean", default: true },
      live: { type: "boolean", default: true },
    },
    slots: { header: "Session header", transcript: "Transcript turns", footer: "Realtime controls" },
    example: '<section class="sk-voice-session" data-status="speaking" data-timezone="Asia/Tokyo"><div class="sk-voice-session__clock" data-city="Tokyo"></div></section>',
  },
  {
    name: "ThinkingBlock",
    slug: "thinking-block",
    category: "ai",
    description: "AI extended thinking with pulse animation and expand/collapse",
    files: ["thinking-block.css", "thinking-block.js"],
    variants: ["thinking", "done", "error"],
    props: {
      state: { type: "enum", values: ["thinking", "done", "error"], default: "thinking" },
      label: { type: "string" },
      meta: { type: "string" },
      expanded: { type: "boolean" },
      defaultExpanded: { type: "boolean" },
      onExpandedChange: { type: "function" },
    },
    slots: { default: "Thinking content shown when expanded" },
    example: '<div class="sk-thinking-block" data-state="thinking" data-expanded="true"><div class="sk-thinking-block__content">Reasoning…</div></div>',
  },
  {
    name: "PromptSuggestions",
    slug: "prompt-suggestions",
    category: "ai",
    description: "Starter prompt suggestions for empty AI chat state",
    files: ["prompt-suggestions.css", "prompt-suggestions.js"],
    variants: ["chips"],
    props: {
      suggestions: { type: "array", required: true },
      label: { type: "string" },
      variant: { type: "enum", values: ["chips"], default: "chips" },
      onSelect: { type: "function" },
    },
    slots: {},
    example: '<div class="sk-prompt-suggestions" data-variant="chips"><button class="sk-prompt-suggestions__chip">Summarize this</button></div>',
  },
  {
    name: "FileAttachment",
    slug: "file-attachment",
    category: "ai",
    description: "File upload pill with progress and remove for chat input",
    files: ["file-attachment.css", "file-attachment.js"],
    variants: ["uploading", "done", "error"],
    props: {
      name: { type: "string", required: true },
      size: { type: "string" },
      icon: { type: "string" },
      state: { type: "enum", values: ["uploading", "done", "error"], default: "done" },
      progress: { type: "number" },
      onRemove: { type: "function" },
    },
    slots: {},
    example: '<div class="sk-file-attachment" data-state="uploading"><span class="sk-file-attachment__name">report.pdf</span></div>',
  },
  {
    name: "Layout",
    slug: "layout",
    category: "layout",
    description: "Installable layout pack for containers, grids, stacks, panels, dividers, and skeletons",
    files: ["layout.css"],
    variants: ["container", "grid", "stack", "panel", "divider", "skeleton"],
    props: {
      size: { type: "enum", values: ["narrow", "default", "wide", "full"], default: "default" },
      cols: { type: "number", default: 2 },
      gap: { type: "enum", values: ["sm", "md", "lg"], default: "md" },
    },
    slots: { default: "Layout content" },
    primitives: ["Container", "Grid", "Stack", "Panel", "Divider", "Skeleton"],
    example: '<div class="sk-grid" data-cols="3"><div class="sk-grid__cell">Cell</div></div>',
  },
  {
    name: "DataViz",
    slug: "dataviz",
    category: "dataviz",
    description: "Installable data visualization pack for ASCII charts, sparklines, meters, and heatmaps",
    files: ["dataviz.css"],
    variants: ["ascii-chart", "sparkline", "meter", "heatmap"],
    props: {
      data: { type: "array", required: true },
      label: { type: "string" },
      min: { type: "number", default: 0 },
      max: { type: "number", default: 100 },
    },
    slots: { default: "Visualization content" },
    primitives: ["AsciiChart", "Sparkline", "Meter", "Heatmap"],
    example: '<div class="sk-meter"><div class="sk-meter__track"><div class="sk-meter__fill" style="width:72%"></div></div></div>',
  },
  {
    name: "Motion",
    slug: "motion",
    category: "motion",
    description: "Installable motion pack for dither pulse, ASCII rain, glitch, and texture masks",
    files: ["motion.css"],
    variants: ["pulse", "rain", "glitch", "texture-mask"],
    props: {
      effect: { type: "enum", values: ["pulse", "morph", "scan", "flow", "rain", "glitch", "mask"], default: "pulse" },
      speed: { type: "number", default: 1 },
      reducedMotionSafe: { type: "boolean", default: true },
    },
    slots: { default: "Animated content" },
    primitives: ["DitherPulse", "AsciiRain", "Glitch", "TextureMask"],
    example: '<div class="sk-dither-pulse" data-effect="pulse">Animated panel</div>',
  },
];

export const componentSchema = {
  version: "0.3.0",
  description: "skeehn installable component and primitive definitions for AI agent code generation",
  components,
};

export const registryManifest = {
  name: "skeehn",
  version: "0.3.0",
  description: "ASCII as native rendering. The dither UI system.",
  homepage: "https://skeehn.dev",
  license: "MIT",
  themes: [...themeNames],
  components: componentSchema.components.map(({ slug, description, files, category }) => ({
    name: slug,
    description,
    files,
    category,
  })),
};

export const componentCountsByCategory = componentCategories.reduce<Record<string, number>>((counts, category) => {
  counts[category] = componentSchema.components.filter((component) => component.category === category).length;
  return counts;
}, {});

export const themeRegistry = {
  version: "0.3.0",
  themes: [
    {
      name: "default",
      description: "Technical minimalist — square, precise, monospace",
      colors: {
        background: "0 0% 100%",
        foreground: "0 0% 3.9%",
        primary: "0 0% 9%",
      },
      dither: {
        pattern: "var(--sk-dither-floyd)",
        opacity: 0.12,
      },
    },
    {
      name: "brutal",
      description: "Heavy ASCII blocks — high contrast, aggressive",
      colors: {
        background: "0 0% 98%",
        foreground: "0 0% 5%",
        primary: "0 0% 5%",
      },
      dither: {
        pattern: "var(--sk-dither-blocks-75)",
        opacity: 0.25,
      },
    },
    {
      name: "terminal",
      description: "Green phosphor CRT — terminal aesthetic",
      colors: {
        background: "140 100% 2%",
        foreground: "140 100% 80%",
        primary: "140 100% 70%",
      },
      dither: {
        pattern: "var(--sk-dither-scanlines)",
        opacity: 0.15,
      },
    },
    {
      name: "print",
      description: "Newsprint halftone — editorial, warm",
      colors: {
        background: "40 50% 96%",
        foreground: "30 20% 12%",
        primary: "30 25% 15%",
      },
      dither: {
        pattern: "var(--sk-dither-bayer)",
        opacity: 0.08,
      },
    },
    {
      name: "grain",
      description: "Film grain — organic, subtle texture",
      colors: {
        background: "30 10% 96%",
        foreground: "30 15% 15%",
        primary: "30 20% 18%",
      },
      dither: {
        pattern: "var(--sk-dither-noise)",
        opacity: 0.12,
      },
    },
  ],
};

export const propContracts: Record<string, any> = {
  Button: {
    type: "object",
    properties: {
      variant: { type: "string", enum: ["solid", "dither", "outline", "ghost", "inverted", "ascii"], default: "solid" },
      size: { type: "string", enum: ["sm", "base", "lg", "xl"], default: "base" },
      disabled: { type: "boolean", default: false },
      loading: { type: "boolean", default: false },
    },
    required: [],
  },
  ChatBubble: {
    type: "object",
    properties: {
      role: { type: "string", enum: ["user", "assistant", "tool", "system"] },
      content: { type: "string" },
      streaming: { type: "boolean", default: false },
      citations: { type: "array" },
      timestamp: { type: "string" },
    },
    required: ["role", "content"],
  },
  ChatInput: {
    type: "object",
    properties: {
      placeholder: { type: "string", default: "Ask anything..." },
      attachments: { type: "boolean", default: true },
      voice: { type: "boolean", default: false },
      onCancel: { type: "function" },
      onSend: { type: "function" },
    },
    required: ["onSend"],
  },
  ToolCard: {
    type: "object",
    properties: {
      name: { type: "string" },
      status: { type: "string", enum: ["pending", "running", "success", "error"], default: "pending" },
      input: { type: "object" },
      output: { type: "object" },
    },
    required: ["name"],
  },
  VoiceSession: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["idle", "listening", "transcribing", "speaking", "handoff"], default: "idle" },
      city: { type: "string", default: "Tokyo" },
      timeZone: { type: "string", default: "Asia/Tokyo" },
      transcript: { type: "array" },
      showClock: { type: "boolean", default: true },
      showWaveform: { type: "boolean", default: true },
      live: { type: "boolean", default: true },
    },
    required: ["timeZone"],
  },
};

export const examples: Record<string, any> = {
  button: {
    variants: [
      { name: "solid", code: '<button class="sk-btn" data-variant="solid">Solid</button>' },
      { name: "dither", code: '<button class="sk-btn" data-variant="dither">Dither</button>' },
      { name: "outline", code: '<button class="sk-btn" data-variant="outline">Outline</button>' },
      { name: "ghost", code: '<button class="sk-btn" data-variant="ghost">Ghost</button>' },
      { name: "inverted", code: '<button class="sk-btn" data-variant="inverted">Inverted</button>' },
    ],
    sizes: [
      { name: "sm", code: '<button class="sk-btn" data-variant="dither" data-size="sm">Small</button>' },
      { name: "base", code: '<button class="sk-btn" data-variant="dither">Base</button>' },
      { name: "lg", code: '<button class="sk-btn" data-variant="dither" data-size="lg">Large</button>' },
    ],
  },
  card: {
    variants: [
      { name: "solid", code: '<div class="sk-card" data-variant="solid"><div class="sk-card__body"><p>Content</p></div></div>' },
      { name: "dither", code: '<div class="sk-card" data-variant="dither"><div class="sk-card__body"><p>Content</p></div></div>' },
    ],
  },
  "chat-bubble": {
    variants: [
      { name: "user", code: '<div class="sk-chat-bubble" data-role="user"><p>Hello!</p></div>' },
      { name: "assistant", code: '<div class="sk-chat-bubble" data-role="assistant"><p>Hi there!</p></div>' },
      { name: "streaming", code: '<div class="sk-chat-bubble" data-role="assistant" data-streaming><p>Streaming...</p></div>' },
    ],
  },
  "voice-session": {
    variants: [
      { name: "idle", code: '<section class="sk-voice-session" data-status="idle" data-timezone="Asia/Tokyo"></section>' },
      { name: "listening", code: '<section class="sk-voice-session" data-status="listening" data-timezone="Asia/Tokyo"></section>' },
      { name: "speaking", code: '<section class="sk-voice-session" data-status="speaking" data-timezone="Asia/Tokyo"></section>' },
    ],
  },
};

export const patterns = {
  "ai-chat": {
    name: "AI Chat Interface",
    description: "Complete AI chat with streaming, citations, and reasoning traces",
    components: ["ChatBubble", "ChatInput", "StreamingText", "ToolCard", "ReasoningStep", "Markdown", "TypingIndicator"],
    layout: "vertical-stack",
    theme: "terminal",
  },
  "agent-dashboard": {
    name: "Agent Dashboard",
    description: "Agent status, tool cards, reasoning traces, and terminal output",
    components: ["AgentStatus", "ToolCard", "ReasoningStep", "TerminalPanel", "Card", "Tabs", "Layout"],
    layout: "grid",
    theme: "default",
  },
  "voice-room": {
    name: "Realtime Voice Room",
    description: "Voice agent surface with a live clock, transcript, and realtime state changes",
    components: ["VoiceSession", "ChatBubble", "AgentStatus", "TypingIndicator", "ToolCard"],
    layout: "dual-pane",
    theme: "terminal",
  },
  "creative-portfolio": {
    name: "Creative Portfolio",
    description: "Portfolio with textured layout primitives and ASCII charts",
    components: ["Card", "Button", "Avatar", "Layout", "DataViz", "Motion"],
    layout: "masonry",
    theme: "grain",
  },
};
