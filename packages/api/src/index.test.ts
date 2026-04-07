import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { Loom, z } from "./index.js";

describe("loom API Framework", () => {
  let app: Loom;

  beforeEach(() => {
    app = new Loom({ port: 0 });
  });

  afterEach(() => {
    app.stop();
  });

  describe("endpoint registration", () => {
    test("registers GET endpoint", () => {
      app.get("/api/test", {
        handler: async () => ({ ok: true }),
      });
      expect(app["endpoints"].length).toBe(1);
      expect(app["endpoints"][0].method).toBe("GET");
      expect(app["endpoints"][0].path).toBe("/api/test");
    });

    test("registers POST endpoint", () => {
      app.post("/api/test", {
        handler: async () => ({ ok: true }),
      });
      expect(app["endpoints"].length).toBe(1);
      expect(app["endpoints"][0].method).toBe("POST");
    });

    test("registers multiple endpoints", () => {
      app.get("/api/a", { handler: async () => ({}) })
         .post("/api/b", { handler: async () => ({}) })
         .get("/api/c", { handler: async () => ({}) });
      expect(app["endpoints"].length).toBe(3);
    });
  });

  describe("schema validation", () => {
    test("validates input schema", () => {
      app.post("/api/validate", {
        input: z.object({
          name: z.string(),
          age: z.number(),
        }),
        handler: async ({ body }) => ({ received: body }),
      });
      expect(app["endpoints"][0].config.input).toBeTruthy();
    });

    test("validates output schema", () => {
      app.get("/api/output", {
        output: z.object({
          status: z.string(),
          count: z.number(),
        }),
        handler: async () => ({ status: "ok", count: 42 }),
      });
      expect(app["endpoints"][0].config.output).toBeTruthy();
    });

    test("generates MCP tool from config", () => {
      app.post("/api/install", {
        input: z.object({ name: z.string() }),
        mcp: {
          name: "install_component",
          description: "Install a component",
        },
        handler: async () => ({ ok: true }),
      });
      expect(app["endpoints"][0].mcpTool).toBeTruthy();
      expect(app["endpoints"][0].mcpTool!.name).toBe("install_component");
      expect(app["endpoints"][0].mcpTool!.description).toBe("Install a component");
    });
  });

  describe("OpenAPI generation", () => {
    test("generates OpenAPI spec", () => {
      app.get("/api/test", {
        mcp: { name: "test", description: "Test endpoint" },
        handler: async () => ({ ok: true }),
      });
      const spec = app.openapi();
      expect(spec.openapi).toBe("3.0.0");
      expect(spec.paths["/api/test"]).toBeTruthy();
      expect(spec.paths["/api/test"].get).toBeTruthy();
    });

    test("includes request body in OpenAPI", () => {
      app.post("/api/create", {
        input: z.object({ name: z.string(), value: z.number() }),
        output: z.object({ id: z.string() }),
        handler: async () => ({ id: "123" }),
      });
      const spec = app.openapi();
      expect(spec.paths["/api/create"].post.requestBody).toBeTruthy();
    });
  });

  describe("MCP tools", () => {
    test("returns MCP tools array", () => {
      app.post("/api/a", {
        mcp: { name: "tool_a", description: "Tool A" },
        input: z.object({ x: z.string() }),
        handler: async () => ({}),
      });
      app.post("/api/b", {
        mcp: { name: "tool_b", description: "Tool B" },
        handler: async () => ({}),
      });
      app.get("/api/c", {
        handler: async () => ({}),
      });

      const tools = app.mcpTools();
      expect(tools.length).toBe(2);
      expect(tools[0].name).toBe("tool_a");
      expect(tools[1].name).toBe("tool_b");
    });
  });

  describe("path matching", () => {
    test("matches exact paths", () => {
      app.get("/api/test", { handler: async () => ({}) });
      app.get("/api/other", { handler: async () => ({}) });
      expect(app["endpoints"].length).toBe(2);
    });

    test("supports path params", () => {
      app.get("/api/components/:name", { handler: async () => ({}) });
      const params = app["extractParams"]("/api/components/:name", "/api/components/button");
      expect(params.name).toBe("button");
    });

    test("extracts multiple path params", () => {
      app.get("/api/:category/:name", { handler: async () => ({}) });
      const params = app["extractParams"]("/api/:category/:name", "/api/core/button");
      expect(params.category).toBe("core");
      expect(params.name).toBe("button");
    });
  });

  describe("Zod to JSON Schema", () => {
    test("converts string", () => {
      const schema = app["zodToJsonSchema"](z.string());
      expect(schema.type).toBe("string");
    });

    test("converts number", () => {
      const schema = app["zodToJsonSchema"](z.number());
      expect(schema.type).toBe("number");
    });

    test("converts boolean", () => {
      const schema = app["zodToJsonSchema"](z.boolean());
      expect(schema.type).toBe("boolean");
    });

    test("converts enum", () => {
      const schema = app["zodToJsonSchema"](z.enum(["a", "b", "c"]));
      expect(schema.type).toBe("string");
      expect(schema.enum).toEqual(["a", "b", "c"]);
    });

    test("converts object", () => {
      const schema = app["zodToJsonSchema"](z.object({
        name: z.string(),
        age: z.number(),
        active: z.boolean(),
      }));
      expect(schema.type).toBe("object");
      expect(schema.properties.name.type).toBe("string");
      expect(schema.properties.age.type).toBe("number");
      expect(schema.required).toContain("name");
    });

    test("converts array", () => {
      const schema = app["zodToJsonSchema"](z.array(z.string()));
      expect(schema.type).toBe("array");
      expect(schema.items.type).toBe("string");
    });

    test("converts optional fields", () => {
      const schema = app["zodToJsonSchema"](z.object({
        name: z.string(),
        optional: z.string().optional(),
      }));
      expect(schema.required).toEqual(["name"]);
    });
  });

  describe("server", () => {
    test("starts server on specified port", async () => {
      const testApp = new Loom({ port: 3999 });
      testApp.get("/api/health", {
        handler: async () => ({ status: "ok" }),
      });
      const server = testApp.listen();
      expect(server).toBeTruthy();
      expect(server.port).toBe(3999);
      testApp.stop();
    });

    test("handles GET request", async () => {
      const testApp = new Loom({ port: 3998 });
      testApp.get("/api/health", {
        handler: async () => ({ status: "ok" }),
      });
      const server = testApp.listen();

      const res = await fetch("http://localhost:3998/api/health");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("ok");

      testApp.stop();
    });

    test("handles POST with JSON body", async () => {
      const testApp = new Loom({ port: 3997 });
      testApp.post("/api/echo", {
        input: z.object({ message: z.string() }),
        handler: async ({ body }) => ({ echoed: body.message }),
      });
      const server = testApp.listen();

      const res = await fetch("http://localhost:3997/api/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "hello" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.echoed).toBe("hello");

      testApp.stop();
    });

    test("returns 400 on validation error", async () => {
      const testApp = new Loom({ port: 3996 });
      testApp.post("/api/strict", {
        input: z.object({ name: z.string() }),
        handler: async () => ({}),
      });
      const server = testApp.listen();

      const res = await fetch("http://localhost:3996/api/strict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Validation Error");

      testApp.stop();
    });

    test("returns 404 for unknown routes", async () => {
      const testApp = new Loom({ port: 3995 });
      testApp.get("/api/existing", { handler: async () => ({}) });
      const server = testApp.listen();

      const res = await fetch("http://localhost:3995/api/nonexistent");
      expect(res.status).toBe(404);

      testApp.stop();
    });

    test("handles path params in requests", async () => {
      const testApp = new Loom({ port: 3994 });
      testApp.get("/api/components/:name", {
        handler: async ({ params }) => ({ component: params.name }),
      });
      const server = testApp.listen();

      const res = await fetch("http://localhost:3994/api/components/button");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.component).toBe("button");

      testApp.stop();
    });

    test("handles query params", async () => {
      const testApp = new Loom({ port: 3993 });
      testApp.get("/api/search", {
        input: z.object({ q: z.string() }),
        handler: async ({ query }) => ({ query: query.q }),
      });
      const server = testApp.listen();

      const res = await fetch("http://localhost:3993/api/search?q=test");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.query).toBe("test");

      testApp.stop();
    });
  });
});
