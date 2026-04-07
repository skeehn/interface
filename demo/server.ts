#!/usr/bin/env bun
// skeehn demo server
import { resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MIME: Record<string, string> = { ".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"application/javascript; charset=utf-8",".json":"application/json; charset=utf-8" };

Bun.serve({ port: 3000, fetch(req) {
  const url = new URL(req.url);
  const path = url.pathname === "/" ? "/demo/index.html" : url.pathname;
  const full = ROOT + path;
  if (!existsSync(full)) return new Response("404", { status: 404 });
  return new Response(Bun.file(full), { headers: { "Content-Type": MIME[extname(full)] || "application/octet-stream" } });
}});
console.log("\n  skeehn demo → http://localhost:3000\n");
