/**
 * skeehn MCP Server
 *
 * Model Context Protocol server for AI agents.
 * Exposes component schemas, theme registry, prop contracts, and tools
 * for installing components, generating UI code, and managing projects.
 *
 * Usage:
 *   npx skeehn mcp          # Start local MCP server
 *   # Connect Cursor/Claude Code to stdio transport
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { componentSchema, themeRegistry, propContracts, examples, patterns } from "./schema/index.js";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
const execFile = promisify(execFileCallback);

// ─── Input Allowlist Validators ──────────────────────────────────────────────

const VALID_COMPONENT_SLUG = /^[a-z][a-z0-9-]{0,48}$/;
const VALID_THEME = new Set(["default", "brutal", "terminal", "print", "grain"]);
const VALID_PATH = /^[a-zA-Z0-9._/~-]{1,256}$/;

function assertSafeComponentName(name: string): void {
  if (!VALID_COMPONENT_SLUG.test(name)) throw new Error(`Invalid component name: ${JSON.stringify(name)}`);
}
function assertSafeTheme(theme: string): void {
  if (!VALID_THEME.has(theme)) throw new Error(`Invalid theme: ${JSON.stringify(theme)}`);
}
function assertSafePath(p: string): void {
  if (p.includes("..")) throw new Error(`Path traversal not allowed: ${JSON.stringify(p)}`);
  if (!VALID_PATH.test(p)) throw new Error(`Invalid path: ${JSON.stringify(p)}`);
}

// ─── MCP Server Configuration ───────────────────────────────────────────────

const server = new McpServer({
  name: "skeehn",
  version: "0.3.0",
  description: "ASCII-native UI framework with texture-based rendering. Provides component schemas, themes, and tools for building AI-native interfaces.",
});

// ─── RESOURCES (Read-only data for AI agents) ───────────────────────────────

// Full component schema
server.resource(
  "component-schema",
  "skeehn://components/schema",
  { mimeType: "application/json" },
  async () => ({
    contents: [{
      uri: "skeehn://components/schema",
      mimeType: "application/json",
      text: JSON.stringify(componentSchema, null, 2),
    }],
  })
);

// Theme registry
server.resource(
  "theme-registry",
  "skeehn://themes/registry",
  { mimeType: "application/json" },
  async () => ({
    contents: [{
      uri: "skeehn://themes/registry",
      mimeType: "application/json",
      text: JSON.stringify(themeRegistry, null, 2),
    }],
  })
);

// Prop contracts (Zod schemas as JSON)
server.resource(
  "prop-contracts",
  "skeehn://contracts/props",
  { mimeType: "application/json" },
  async () => ({
    contents: [{
      uri: "skeehn://contracts/props",
      mimeType: "application/json",
      text: JSON.stringify(propContracts, null, 2),
    }],
  })
);

// Agent docs
server.resource(
  "agent-docs",
  "skeehn://docs/agents",
  { mimeType: "text/markdown" },
  async () => ({
    contents: [{
      uri: "skeehn://docs/agents",
      mimeType: "text/markdown",
      text: `# skeehn Agent Documentation

## Overview
skeehn is an ASCII-native UI framework where texture (ASCII characters, dither patterns, box-drawing elements) is a first-class primitive alongside color.

## Installation
\`\`\`bash
npx skeehn init          # Setup in project
npx skeehn add button    # Add component
npx skeehn theme terminal # Swap theme
\`\`\`

## Component Categories
- **Core UI** (14): button, card, input, badge, alert, dialog, tabs, toggle, progress, avatar, tooltip, dropdown, table, accordion
- **AI-Native** (8): ChatBubble, ChatInput, ReasoningStep, ToolCard, CitationCard, StreamingText, TerminalPanel, AgentStatus
- **Layout** (6): Container, Grid, Stack, Panel, Divider, Skeleton
- **Data Viz** (4): AsciiChart, Sparkline, Meter, Heatmap
- **Motion** (4): DitherPulse, AsciiRain, Glitch, TextureMask

## Theming
5 presets: default, brutal, terminal, print, grain
Dual-axis: color + texture palette

## Dither Algorithms
Floyd-Steinberg, Bayer (2/4/8), Atkinson, Sierra

## AI Integration
All components have machine-readable schemas. AI agents can read schemas, validate props, and generate correct code.
`,
    }],
  })
);

// Examples resource
server.resource(
  "examples",
  "skeehn://examples/{component}",
  { mimeType: "application/json" },
  async (uri, extra: any) => {
    const component = extra?.component || uri.pathname?.split('/').pop() || '';
    return {
      contents: [{
        uri: `skeehn://examples/${component}`,
        mimeType: "application/json",
        text: JSON.stringify(examples[component as string] || { error: "Component not found" }, null, 2),
      }],
    };
  }
);

// Patterns resource
server.resource(
  "patterns",
  "skeehn://patterns",
  { mimeType: "application/json" },
  async () => ({
    contents: [{
      uri: "skeehn://patterns",
      mimeType: "application/json",
      text: JSON.stringify(patterns, null, 2),
    }],
  })
);

// ─── TOOLS (Actions AI agents can execute) ──────────────────────────────────

// Install component
server.tool(
  "install_component",
  "Install a skeehn component into a user's project",
  {
    name: z.string().describe("Component name (e.g., 'button', 'chat-bubble', 'all')"),
    target: z.string().default("./components").describe("Target directory"),
  },
  async ({ name, target }) => {
    try {
      assertSafeComponentName(name);
      assertSafePath(target);
      const { stdout, stderr } = await execFile("npx", ["skeehn", "add", name, "-p", target]);
      return {
        content: [
          { type: "text", text: stdout || `Installed ${name} in ${target}` },
        ],
        isError: false,
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message || error.stderr || 'Unknown error'}` }],
        isError: true,
      };
    }
  }
);

// Generate UI code
server.tool(
  "generate_ui_code",
  "Generate complete skeehn UI code from a natural language description",
  {
    description: z.string().describe("Description of the UI to generate (e.g., 'AI chat interface with streaming and tool cards')"),
    theme: z.enum(["default", "brutal", "terminal", "print", "grain"]).default("default").describe("Theme preset"),
    components: z.array(z.string()).optional().describe("Specific components to include"),
  },
  async ({ description, theme, components }) => {
    // Generate skeehn UI code based on description
    const generatedCode = generateSkeehnCode(description, theme, components);
    return {
      content: [{ type: "text", text: generatedCode }],
      isError: false,
    };
  }
);

// Swap theme
server.tool(
  "swap_theme",
  "Change the skeehn theme in a project",
  {
    theme: z.enum(["default", "brutal", "terminal", "print", "grain"]).describe("Theme preset name"),
    target: z.string().default(".").describe("Project directory"),
  },
  async ({ theme, target }) => {
    try {
      assertSafeTheme(theme);
      assertSafePath(target);
      const { stdout } = await execFile("npx", ["skeehn", "theme", theme, "-p", target]);
      return {
        content: [{ type: "text", text: stdout || `Theme swapped to ${theme}` }],
        isError: false,
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Validate props
server.tool(
  "validate_props",
  "Validate component props against the schema before code generation",
  {
    component: z.string().describe("Component name"),
    props: z.record(z.any()).describe("Props object to validate"),
  },
  async ({ component, props }) => {
    const contract = propContracts[component];
    if (!contract) {
      return {
        content: [{ type: "text", text: `Component "${component}" not found in schema` }],
        isError: true,
      };
    }

    // Simple validation (in production, use full Zod validation)
    const required = Object.entries(contract.properties || {})
      .filter(([_, v]: [string, any]) => v.required)
      .map(([k]) => k);

    const missing = required.filter((key: string) => !(key in props));

    if (missing.length > 0) {
      return {
        content: [{ type: "text", text: `Missing required props: ${missing.join(", ")}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: `Props valid for ${component}` }],
      isError: false,
    };
  }
);

// List components
server.tool(
  "list_components",
  "List available skeehn components by category",
  {
    category: z.enum(["core", "ai", "layout", "dataviz", "motion", "all"]).default("all").describe("Component category"),
  },
  async ({ category }) => {
    const comps = category === "all"
      ? componentSchema.components
      : componentSchema.components.filter((c: any) => c.category === category);

    return {
      content: [{
        type: "text",
        text: comps.map((c: any) => `${c.name}: ${c.description}`).join("\n"),
      }],
      isError: false,
    };
  }
);

// Add to project (full initialization)
server.tool(
  "add_to_project",
  "Initialize skeehn in a project with theme and components",
  {
    path: z.string().default(".").describe("Project directory"),
    theme: z.enum(["default", "brutal", "terminal", "print", "grain"]).default("default").describe("Initial theme"),
    components: z.array(z.string()).default(["all"]).describe("Components to install"),
  },
  async ({ path, theme, components }) => {
    try {
      assertSafePath(path);
      assertSafeTheme(theme);
      await execFile("npx", ["skeehn", "init", "-p", path, "-t", theme]);
      for (const comp of components) {
        assertSafeComponentName(comp);
        // path already validated before loop
        await execFile("npx", ["skeehn", "add", comp, "-p", path]);
      }
      return {
        content: [{ type: "text", text: `skeehn initialized in ${path} with theme ${theme}` }],
        isError: false,
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ─── PROMPTS (Reusable workflows for AI agents) ─────────────────────────────

server.prompt(
  "build_chat_interface",
  "Build a complete AI chat interface with skeehn components",
  {
    theme: z.enum(["default", "brutal", "terminal", "print", "grain"]).default("terminal"),
    features: z.array(z.enum(["streaming", "tool-cards", "reasoning", "citations", "terminal"])).default(["streaming", "tool-cards"]),
  },
  ({ theme, features }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Build a complete AI chat interface using skeehn components.

Theme: ${theme}
Features: ${features.join(", ")}

Required components:
- ChatBubble (for messages)
- ChatInput (for prompt input)
${features.includes("streaming") ? "- StreamingText (for streaming responses)" : ""}
${features.includes("tool-cards") ? "- ToolCard (for tool execution results)" : ""}
${features.includes("reasoning") ? "- ReasoningStep (for reasoning traces)" : ""}
${features.includes("citations") ? "- CitationCard (for source references)" : ""}
${features.includes("terminal") ? "- TerminalPanel (for code execution)" : ""}

Generate complete working code with proper imports and layout.`,
      },
    }],
  })
);

server.prompt(
  "build_agent_dashboard",
  "Build an agent dashboard with tool cards and reasoning traces",
  {
    theme: z.enum(["default", "brutal", "terminal", "print", "grain"]).default("default"),
  },
  ({ theme }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Build an agent dashboard using skeehn components.

Theme: ${theme}

Required components:
- AgentStatus (agent state indicator)
- ToolCard (tool execution results)
- ReasoningStep (reasoning traces)
- TerminalPanel (code execution)
- Card (for dashboard sections)
- Tabs (for switching views)

Generate complete working code with proper layout and styling.`,
      },
    }],
  })
);

server.prompt(
  "convert_to_skeehn",
  "Convert an existing UI to skeehn components and theme",
  {
    description: z.string().describe("Description of the existing UI to convert"),
    theme: z.enum(["default", "brutal", "terminal", "print", "grain"]).default("default"),
  },
  ({ description, theme }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Convert the following UI to use skeehn components and theme.

Existing UI: ${description}
Target theme: ${theme}

Replace all standard components with skeehn equivalents:
- Buttons → sk-btn with appropriate variant
- Cards → sk-card with dither variant
- Inputs → sk-input with dither-focus
- etc.

Generate the converted code with skeehn imports and theme setup.`,
      },
    }],
  })
);

// ─── Code Generation Helper ─────────────────────────────────────────────────

function generateSkeehnCode(description: string, theme: string, components?: string[]): string {
  const desc = description.toLowerCase();

  // Detect what kind of UI to generate
  if (desc.includes("chat")) {
    return generateChatCode(theme);
  } else if (desc.includes("dashboard")) {
    return generateDashboardCode(theme);
  } else if (desc.includes("terminal")) {
    return generateTerminalCode(theme);
  } else {
    return generateGenericCode(description, theme, components);
  }
}

function generateChatCode(theme: string): string {
  return `<!-- skeehn AI Chat Interface -->
<!-- Theme: ${theme} -->

<div class="skeehn-chat" data-theme="${theme}">
  <!-- Chat Messages -->
  <div class="sk-chat-messages">
    <div class="sk-chat-bubble" data-role="user">
      <p>Hello! Can you help me with skeehn?</p>
    </div>
    <div class="sk-chat-bubble" data-role="assistant" data-streaming>
      <p>Absolutely! skeehn is the ASCII-native UI framework...</p>
    </div>
  </div>

  <!-- Chat Input -->
  <div class="sk-chat-input">
    <input class="sk-input" placeholder="Ask anything..." data-dither>
    <button class="sk-btn" data-variant="dither">Send</button>
  </div>
</div>

<link rel="stylesheet" href="styles/theme.css">
<link rel="stylesheet" href="components/chat-bubble/chat-bubble.css">
<link rel="stylesheet" href="components/chat-input/chat-input.css">
`;
}

function generateDashboardCode(theme: string): string {
  return `<!-- skeehn Agent Dashboard -->
<!-- Theme: ${theme} -->

<div class="skeehn-dashboard" data-theme="${theme}">
  <!-- Agent Status -->
  <div class="sk-agent-status" data-status="thinking">
    <span class="sk-agent-status__indicator"></span>
    <span class="sk-agent-status__text">Thinking...</span>
  </div>

  <!-- Tool Cards -->
  <div class="sk-tool-card" data-status="success">
    <h3>search_web</h3>
    <pre>Query: "skeehn UI framework"</pre>
  </div>

  <!-- Reasoning Steps -->
  <div class="sk-reasoning-step" data-status="completed">
    <h4>Analyzing user request</h4>
    <p>Need to provide information about skeehn...</p>
  </div>
</div>
`;
}

function generateTerminalCode(theme: string): string {
  return `<!-- skeehn Terminal Panel -->
<!-- Theme: ${theme} -->

<div class="sk-terminal-panel" data-theme="${theme}">
  <div class="sk-terminal-header">
    <span>Terminal</span>
  </div>
  <div class="sk-terminal-body">
    <pre><code>$ npx skeehn init
✓ styles/dither.css
✓ styles/tokens.css
✓ components/button.css
Done.</code></pre>
  </div>
</div>
`;
}

function generateGenericCode(description: string, theme: string, components?: string[]): string {
  return `<!-- skeehn UI: ${description} -->
<!-- Theme: ${theme} -->

<div class="skeehn-app" data-theme="${theme}">
  <!-- Generated based on description -->
  <div class="sk-card" data-variant="dither">
    <div class="sk-card__header">
      <h3 class="sk-card__title">${description}</h3>
    </div>
    <div class="sk-card__body">
      <p>Content goes here</p>
    </div>
  </div>
</div>

<!-- Components: ${components?.join(", ") || "auto-detected"} -->
`;
}

// ─── Server Transport ───────────────────────────────────────────────────────

export async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("skeehn MCP server running on stdio");
}

main().catch((error: Error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
