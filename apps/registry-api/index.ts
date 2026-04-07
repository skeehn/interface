#!/usr/bin/env bun
/**
 * skeehn Registry API
 * 
 * Built with loom — schema-first, MCP-native API for the component registry.
 * Serves components, themes, schemas, and search endpoints.
 */

import { Loom, z } from "../../packages/api/src/index.js";
import { componentSchema, themeRegistry, propContracts, examples, patterns } from "../../packages/mcp-server/src/schema/index.js";

const app = new Loom({ port: 3001, cors: true });

// ─── Component Endpoints ─────────────────────────────────────────────────────

app.get("/api/components", {
  input: z.object({ category: z.enum(["core", "ai", "all"]).default("all") }),
  output: z.object({ components: z.array(z.any()) }),
  mcp: { name: "list_components", description: "List available skeehn components" },
  handler: async ({ query }) => {
    const comps = query.category === "all"
      ? componentSchema.components
      : componentSchema.components.filter((c) => c.category === query.category);
    return { components: comps };
  },
});

app.get("/api/components/:name", {
  mcp: { name: "get_component", description: "Get a specific component definition" },
  handler: async (ctx) => {
    const name = (ctx.params as Record<string, string>).name;
    if (!name || typeof name !== "string") {
      return new Response(JSON.stringify({ error: "name required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const component = componentSchema.components.find(
      (c) => c.slug === name || c.name.toLowerCase() === name.toLowerCase()
    );
    if (!component) {
      return new Response(JSON.stringify({ error: "component not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(component), {
      headers: { "Content-Type": "application/json" },
    });
  },
});

// ─── Theme Endpoints ─────────────────────────────────────────────────────────

app.get("/api/themes", {
  output: z.object({ themes: z.array(z.any()) }),
  handler: async () => ({ themes: themeRegistry.themes }),
});

app.get("/api/themes/:name", {
  output: z.object({ theme: z.any() }),
  handler: async ({ params }) => {
    const theme = themeRegistry.themes.find((t) => t.name === params.name);
    if (!theme) return { error: "Theme not found" };
    return { theme };
  },
});

// ─── Schema Endpoints ────────────────────────────────────────────────────────

app.get("/api/schema/components", {
  output: z.object({ schema: z.any() }),
  handler: async () => ({ schema: componentSchema }),
});

app.get("/api/schema/props", {
  output: z.object({ contracts: z.any() }),
  handler: async () => ({ contracts: propContracts }),
});

// ─── Search Endpoint ─────────────────────────────────────────────────────────

app.get("/api/search", {
  input: z.object({ q: z.string() }),
  output: z.object({ results: z.array(z.any()) }),
  mcp: { name: "search_components", description: "Search components by name or description" },
  handler: async ({ query }) => {
    const q = query.q.toLowerCase();
    const results = componentSchema.components.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
    return { results };
  },
});

// ─── Examples Endpoint ───────────────────────────────────────────────────────

app.get("/api/examples/:component", {
  output: z.object({ examples: z.any() }),
  handler: async ({ params }) => ({
    examples: examples[params.component] || { error: "No examples found" },
  }),
});

// ─── Patterns Endpoint ───────────────────────────────────────────────────────

app.get("/api/patterns", {
  output: z.object({ patterns: z.any() }),
  handler: async () => ({ patterns }),
});

// ─── Health ──────────────────────────────────────────────────────────────────

app.get("/api/health", {
  output: z.object({ status: z.string(), version: z.string() }),
  handler: async () => ({ status: "ok", version: "0.3.0" }),
});

// ─── OpenAPI ─────────────────────────────────────────────────────────────────

app.get("/api/openapi.json", {
  output: z.object({ openapi: z.string(), info: z.any(), paths: z.any() }),
  handler: async () => app.openapi(),
});

// ─── MCP Tools ───────────────────────────────────────────────────────────────

app.get("/api/mcp/tools", {
  output: z.object({ tools: z.array(z.any()) }),
  handler: async () => ({ tools: app.mcpTools() }),
});

// ─── Start Server ────────────────────────────────────────────────────────────

app.listen(3001);
console.log("skeehn Registry API running on http://localhost:3001");
