#!/usr/bin/env node
/**
 * skeehn MCP CLI
 * 
 * Start the local MCP server for AI coding agents.
 * 
 * Usage:
 *   npx skeehn mcp              # Start MCP server on stdio
 *   npx skeehn mcp --port 3001  # Start MCP server on HTTP (future)
 */

import { main } from "./index.js";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
skeehn MCP Server — AI agent component schema and tools

Usage:
  npx skeehn mcp              Start MCP server on stdio (for Cursor/Claude Code)
  npx skeehn mcp --help       Show this help

The MCP server exposes:
  Resources: component-schema, theme-registry, prop-contracts, agent-docs, examples, patterns
  Tools: install_component, generate_ui_code, swap_theme, validate_props, list_components, add_to_project
  Prompts: build_chat_interface, build_agent_dashboard, convert_to_skeehn

Connect your AI coding agent (Cursor, Claude Code, Copilot) to this server
to enable skeehn-aware code generation.
`);
  process.exit(0);
}

main().catch((error: Error) => {
  console.error("MCP server error:", error);
  process.exit(1);
});
