# skeehn Documentation

## Quickstart

```bash
npx skeehn init          # Setup engine + themes
npx skeehn add all       # Add all 25 components
npx skeehn theme terminal # Pick a theme
```

## Architecture

```
skeehn/
├── engine/              # Core: characters, dither, canvas
├── components/          # 25 components (CSS + HTML examples)
├── themes/              # 5 presets
├── packages/
│   ├── mcp-server/      # MCP server for AI agents
│   └── api/             # loom: custom API framework
├── apps/
│   ├── demo/            # Live showcase
│   └── registry-api/    # Component registry
├── cli/                 # Bun CLI
└── tests/               # 152 tests
```

## Engine

### Character Palette
70 perceptually calibrated characters across 5 categories: blocks, symbols, letters, punctuation, box-drawing.

### Dither Algorithms
- **Floyd-Steinberg**: Error diffusion (7/16, 3/16, 5/16, 1/16)
- **Bayer**: Ordered dithering (2×2, 4×4, 8×8)
- **Atkinson**: Cleaner error diffusion
- **Sierra**: 5-tap filter for smooth gradients

### Rendering
- **Canvas 2D**: Image-to-ASCII conversion
- **CSS**: SVG data URI patterns for UI components
- **WebGL**: GPU-accelerated (future)

## Components

### Core (14)
Button, Card, Input, Badge, Alert, Dialog, Tabs, Toggle, Progress, Avatar, Tooltip, Dropdown, Table, Accordion

### AI-Native (8)
ChatBubble, ChatInput, ReasoningStep, ToolCard, CitationCard, StreamingText, TerminalPanel, AgentStatus

### Layout
Container, Grid, Stack, Panel, Divider, Skeleton

### Data Viz
AsciiChart, Sparkline, Meter, Heatmap

### Motion
DitherPulse, AsciiRain, Glitch, TextureMask

## Themes

| Theme | Aesthetic |
|-------|-----------|
| default | Technical minimalist |
| brutal | Heavy ASCII blocks |
| terminal | Green phosphor CRT |
| print | Newsprint halftone |
| grain | Film grain |

## CLI

```bash
npx skeehn init              # Setup
npx skeehn add <component>   # Add component
npx skeehn add all           # Add all 25
npx skeehn theme <name>      # Swap theme
npx skeehn density <level>   # Change density
npx skeehn mcp               # MCP server for AI agents
npx skeehn generate text     # Text-to-ASCII
npx skeehn schema            # Generate schemas
```

## AI Integration

skeehn is the only UI framework with machine-readable schemas and MCP tools. AI agents can:
1. Read component schemas
2. Validate props
3. Install components
4. Generate complete UIs

```bash
npx skeehn mcp    # Start MCP server
npx skeehn schema # Generate schemas
```
