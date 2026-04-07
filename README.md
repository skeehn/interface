# skeehn

**ASCII as native rendering.** The dither UI system.

<p align="center">
  <img src="https://img.shields.io/badge/version-0.3.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/tests-123%20passing-brightgreen" alt="Tests">
  <img src="https://img.shields.io/badge/components-25-orange" alt="Components">
</p>

## Why This Exists

Every UI framework uses flat colors. skeehn replaces flat color with **ASCII characters as the native rendering medium**. Borders are drawn with `┌─┐│└┘`, fills use `░▒▓█`, and textures come from perceptually calibrated dither algorithms.

It's not ASCII art for art's sake — it's a **production-grade component system** where texture is a first-class primitive alongside color and space.

## Quickstart (3 Commands)

```bash
npx skeehn init          # Setup engine + themes
npx skeehn add all       # Add all 25 components
npx skeehn theme terminal # Pick a theme
```

## What You Get

- **25 components** across 4 categories: core (14), AI (8), layout (1), dataviz (1), motion (1)
- **5 theme presets**: default, brutal, terminal, print, grain
- **8 dither patterns**: Bayer, Floyd-Steinberg, crosshatch, diagonal, dots, noise, scanlines, checker
- **4 dither algorithms**: Floyd-Steinberg, Bayer (2/4/8), Atkinson, Sierra
- **70-character palette**: perceptually calibrated brightness values
- **MCP server**: AI agents can read schemas and generate code
- **loom API framework**: schema-first, MCP-native, Bun-native backend
- **Zero dependencies**: pure CSS + TypeScript + Bun

## AI Agent Integration

skeehn is the only UI framework with **machine-readable schemas** and **installable MCP tools**. AI coding agents (Cursor, Claude Code, Copilot) can:

```
1. Read component schemas → know every prop, variant, and slot
2. Validate props before generating code → zero hallucination
3. Execute install commands → add components to projects
4. Generate complete UIs → from natural language descriptions
```

```bash
npx skeehn mcp    # Start local MCP server for AI agents
npx skeehn schema # Generate machine-readable schemas
```

## Components

| Category | Components |
|----------|-----------|
| **Core** | Button, Card, Input, Badge, Alert, Dialog, Tabs, Toggle, Progress, Avatar, Tooltip, Dropdown, Table, Accordion |
| **AI** | ChatBubble, ChatInput, ReasoningStep, ToolCard, CitationCard, StreamingText, TerminalPanel, AgentStatus |
| **Layout** | Container, Grid, Stack, Panel, Divider, Skeleton |
| **Data Viz** | AsciiChart, Sparkline, Meter, Heatmap |
| **Motion** | DitherPulse, AsciiRain, Glitch, TextureMask |

## Architecture

```
skeehn/
├── engine/          # Core: characters, dither algorithms, canvas rendering
├── components/      # 25 components (CSS + HTML examples)
├── themes/          # 5 theme presets
├── packages/
│   ├── mcp-server/  # MCP server for AI agents
│   └── api/         # loom: custom API framework
├── apps/
│   ├── demo/        # Live showcase
│   └── registry-api/# Component registry (built with loom)
├── cli/             # Bun CLI (init, add, theme, mcp, schema)
├── tests/           # 123+ tests
└── docs/            # Documentation
```

## License

MIT. Use it anywhere.
