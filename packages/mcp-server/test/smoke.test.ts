import { test, expect } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

// Runtime smoke test: spawn the built stdio server, run the MCP handshake, and
// assert it advertises its tools. Skips if dist isn't built (CI builds first).
const CLI = join(import.meta.dir, "..", "dist", "cli.js");

test("MCP server initializes + lists its tools over stdio", async () => {
  if (!existsSync(CLI)) return;

  const proc = Bun.spawn(["node", CLI], { stdin: "pipe", stdout: "pipe", stderr: "ignore" });
  const reqs = [
    { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "smoke", version: "1.0.0" } } },
    { jsonrpc: "2.0", method: "notifications/initialized" },
    { jsonrpc: "2.0", id: 2, method: "tools/list" },
  ];
  proc.stdin.write(reqs.map((r) => JSON.stringify(r)).join("\n") + "\n");
  proc.stdin.end();

  // The stdio server stays open; kill it after a beat so stdout closes and we
  // can read the buffered responses.
  const killer = setTimeout(() => proc.kill(), 4000);
  const out = await new Response(proc.stdout).text();
  clearTimeout(killer);
  proc.kill();

  expect(out).toContain('"name":"skeehn"'); // initialize → serverInfo
  expect(out).toContain("install_component"); // tools/list
  expect(out).toContain("swap_theme");
}, 15000);
