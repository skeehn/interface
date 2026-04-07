#!/usr/bin/env bun
// skeehn CLI — AI-native. Zero deps. Pure Bun.

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENGINE = join(ROOT, "engine");
const THEMES = join(ROOT, "themes");
const COMPONENTS = join(ROOT, "components");
const VALID_THEMES = ["default", "dark", "brutal", "terminal", "print", "grain"];
const VALID_DENSITIES = ["sparse", "normal", "dense", "solid"];
const VALID_TEMPLATES = ["hello-world", "dashboard", "gradient"];

const log = (m: string) => console.log(`\n  ${m}`);
const ok = (m: string) => console.log(`  ✓ ${m}`);
const err = (m: string) => { console.error(`\n  ✗ ${m}\n`); process.exit(1); };

function parseFlags(args: string[]): Record<string, string> {
  const f: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "-p" || args[i] === "--path") && args[i+1]) f.path = args[++i];
    if ((args[i] === "-t" || args[i] === "--theme") && args[i+1]) f.theme = args[++i];
    if (args[i] === "--template" && args[i+1]) f.template = args[++i];
    if (args[i] === "--json") f.json = "true";
  }
  return f;
}

function detectFramework(target: string): 'next' | 'react' | 'vue' | 'svelte' | 'html' {
  const pkgPath = join(target, 'package.json');
  if (!existsSync(pkgPath)) return 'html';
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps['next']) return 'next';
    if (deps['react']) return 'react';
    if (deps['vue']) return 'vue';
    if (deps['svelte']) return 'svelte';
  } catch {}
  return 'html';
}

async function init(args: string[]) {
  const f = parseFlags(args);
  const target = resolve(f.path || process.cwd());
  const theme = f.theme || "default";
  log("skeehn — ASCII dither UI system\n");
  if (!VALID_THEMES.includes(theme)) err(`Theme "${theme}" invalid. Choose: ${VALID_THEMES.join(", ")}`);

  mkdirSync(join(target, "styles"), { recursive: true });
  mkdirSync(join(target, "components"), { recursive: true });

  for (const file of ["dither.css", "tokens.css", "reset.css"]) {
    const src = join(ENGINE, file);
    if (existsSync(src)) { copyFileSync(src, join(target, "styles", file)); ok(`styles/${file}`); }
  }
  for (const file of ["characters.ts", "dither.ts", "canvas.ts"]) {
    const src = join(ENGINE, file);
    if (existsSync(src)) { mkdirSync(join(target, "engine"), { recursive: true }); copyFileSync(src, join(target, "engine", file)); ok(`engine/${file}`); }
  }
  const tSrc = join(THEMES, `${theme}.css`);
  if (existsSync(tSrc)) { copyFileSync(tSrc, join(target, "styles", "theme.css")); ok(`styles/theme.css (${theme})`); }

  // Template support
  const template = f.template || "hello-world";
  if (f.template && !VALID_TEMPLATES.includes(template)) {
    err(`Template "${template}" not found. Choose: ${VALID_TEMPLATES.join(", ")}`);
  }

  const idx = join(target, "index.html");
  if (!existsSync(idx)) {
    const tplSrc = join(ROOT, "templates", template, "index.html");
    if (existsSync(tplSrc)) {
      let html = readFileSync(tplSrc, "utf-8");
      // Rewrite relative paths for target location
      html = html.replace(/\.\.\/\.\.\/engine\//g, "styles/");
      html = html.replace(/\.\.\/\.\.\/themes\//g, "styles/themes/");
      html = html.replace(/\.\.\/\.\.\/components\//g, "components/");
      writeFileSync(idx, html);
    } else {
      writeFileSync(idx, `<!DOCTYPE html><html lang="en" data-theme="${theme}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>skeehn</title><link rel="stylesheet" href="styles/reset.css"><link rel="stylesheet" href="styles/tokens.css"><link rel="stylesheet" href="styles/dither.css"><link rel="stylesheet" href="styles/theme.css"></head><body><h1>skeehn</h1><p>Run <code>npx skeehn add button</code></p></body></html>`);
    }
    ok(`index.html (template: ${template})`);
  }

  // Framework detection
  const framework = detectFramework(target);
  const nextSteps: Record<string, string> = {
    next:   'Import CSS in app/globals.css. Use @skeehn/react for typed wrappers.',
    react:  'Import CSS in your entry file. Use @skeehn/react for typed wrappers.',
    vue:    'Import CSS in main.ts. skeehn custom elements work natively in Vue.',
    svelte: 'Import CSS in +layout.svelte. skeehn custom elements work natively in Svelte.',
    html:   'Link CSS files in <head>. Load component JS via <script type="module">.',
  };

  log(`Done in ${target}\nTheme: ${theme} · Template: ${template}\nFramework: ${framework} → ${nextSteps[framework]}\nNext: npx skeehn add button\n      npx skeehn theme brutal\n`);
}

async function add(args: string[]) {
  const comp = args[0];
  const f = parseFlags(args.slice(1));
  const target = resolve(f.path || process.cwd());
  const reg = JSON.parse(readFileSync(join(ROOT, "registry.json"), "utf-8"));

  if (comp === "all") {
    let n = 0;
    for (const c of reg.components) {
      const dir = join(target, "components", c.name);
      mkdirSync(dir, { recursive: true });
      for (const file of c.files) {
        const src = join(COMPONENTS, c.name, file);
        if (existsSync(src)) { copyFileSync(src, join(dir, file)); ok(`components/${c.name}/${file}`); n++; }
      }
    }
    log(`Added all ${reg.components.length} components (${n} files)\n`);
    return;
  }
  if (!comp) { const names = reg.components.map((c: {name:string})=>c.name).join(", "); err(`Component required. Available: ${names}`); }
  const c = reg.components.find((x: {name:string})=>x.name === comp);
  if (!c) { const names = reg.components.map((x: {name:string})=>x.name).join(", "); err(`"${comp}" not found. Available: ${names}`); }

  const dir = join(target, "components", c.name);
  mkdirSync(dir, { recursive: true });
  let n = 0;
  for (const file of c.files) {
    const src = join(COMPONENTS, c.name, file);
    if (existsSync(src)) { copyFileSync(src, join(dir, file)); ok(`components/${c.name}/${file}`); n++; }
  }
  log(`Added ${c.name} (${n} files)\n<link rel="stylesheet" href="components/${c.name}/${c.name}.css">\n`);
}

async function theme(args: string[]) {
  const name = args[0];
  const f = parseFlags(args.slice(1));
  const target = resolve(f.path || process.cwd());
  if (!VALID_THEMES.includes(name)) err(`Theme "${name}" invalid. Choose: ${VALID_THEMES.join(", ")}`);
  const src = join(THEMES, `${name}.css`);
  const dest = join(target, "styles", "theme.css");
  if (!existsSync(src)) err(`Theme not found`);
  mkdirSync(join(target, "styles"), { recursive: true });
  copyFileSync(src, dest);
  const idx = join(target, "index.html");
  if (existsSync(idx)) { let h = readFileSync(idx, "utf-8"); h = h.replace(/data-theme="[^"]*"/g, `data-theme="${name}"`); writeFileSync(idx, h); ok(`index.html → data-theme="${name}"`); }
  log(`Theme: "${name}"\nPresets: default | brutal | terminal | print | grain\n`);
}

async function density(args: string[]) {
  const level = args[0];
  const f = parseFlags(args.slice(1));
  const target = resolve(f.path || process.cwd());
  if (!VALID_DENSITIES.includes(level)) err(`Density "${level}" invalid. Choose: ${VALID_DENSITIES.join(", ")}`);

  const densityMap: Record<string, string> = { sparse: "25%", normal: "50%", dense: "75%", solid: "100%" };
  const opacityMap: Record<string, string> = { sparse: "0.06", normal: "0.15", dense: "0.3", solid: "0.5" };

  const idx = join(target, "index.html");
  if (existsSync(idx)) {
    let h = readFileSync(idx, "utf-8");
    h = h.replace(/data-density="[^"]*"/g, `data-density="${level}"`);
    writeFileSync(idx, h);
    ok(`index.html → data-density="${level}"`);
  }

  const path = join(target, "styles", "dither.css");
  if (existsSync(path)) {
    let c = readFileSync(path, "utf-8");
    c = c.replace(/--sk-density:\s*[^;]+;/, `--sk-density: ${densityMap[level]};`);
    c = c.replace(/--sk-dither-opacity:\s*[^;]+;/, `--sk-dither-opacity: ${opacityMap[level]};`);
    writeFileSync(path, c);
  }

  log(`Density: "${level}" (${densityMap[level]})\nLevels: sparse | normal | dense | solid\n`);
}

async function mcp(args: string[]) {
  const f = parseFlags(args);
  const target = resolve(f.path || process.cwd());
  log("skeehn MCP Server\n");
  
  // Copy MCP server to target
  const mcpSrc = join(ROOT, "packages", "mcp-server");
  const mcpDest = join(target, "skeehn-mcp");
  if (!existsSync(mcpDest)) {
    mkdirSync(mcpDest, { recursive: true });
    // Copy essential files
    const srcDir = join(mcpSrc, "src");
    const destDir = join(mcpDest, "src");
    mkdirSync(destDir, { recursive: true });
    if (existsSync(join(srcDir, "index.ts"))) {
      copyFileSync(join(srcDir, "index.ts"), join(destDir, "index.ts"));
      ok("skeehn-mcp/src/index.ts");
    }
    if (existsSync(join(srcDir, "schema/index.ts"))) {
      mkdirSync(join(destDir, "schema"), { recursive: true });
      copyFileSync(join(srcDir, "schema/index.ts"), join(destDir, "schema/index.ts"));
      ok("skeehn-mcp/src/schema/index.ts");
    }
    // Copy package.json
    if (existsSync(join(mcpSrc, "package.json"))) {
      copyFileSync(join(mcpSrc, "package.json"), join(mcpDest, "package.json"));
      ok("skeehn-mcp/package.json");
    }
  }
  
  log(`MCP server ready in ${mcpDest}`);
  log(`Start: cd ${mcpDest} && bun install && bun run src/index.ts`);
  log(`Connect Cursor/Claude Code to stdio transport\n`);
}

async function generate(args: string[]) {
  const f = parseFlags(args);
  const type = args[0];
  
  if (type === "image") {
    log("Image-to-ASCII: Use the demo site at http://localhost:3000");
    log("Upload an image and select algorithm (Floyd-Steinberg, Bayer, Threshold)\n");
  } else if (type === "text") {
    const text = args.slice(1).join(" ") || "HELLO";
    log(`Text-to-ASCII: "${text}"\n`);
    const FONT: Record<string, string[]> = {
      'H':['█   █','█   █','█████','█   █','█   █'],'E':['█████','█    ','████ ','█    ','█████'],
      'L':['█    ','█    ','█    ','█    ','█████'],'O':[' ███ ','█   █','█   █','█   █',' ███ '],
      ' ':['     ','     ','     ','     ','     '],'A':[' ███ ','█   █','█████','█   █','█   █'],
    };
    const lines: string[][] = [[],[],[],[],[]];
    for (const c of text.toUpperCase()) {
      const g = FONT[c] || FONT[' '] || FONT[' '];
      for (let i = 0; i < 5; i++) lines[i].push(g[i]);
    }
    console.log(lines.map(l => l.join(' ')).join('\n') + '\n');
  } else {
    err(`Generate type required: image | text`);
  }
}

async function schema(args: string[]) {
  const f = parseFlags(args);
  const target = resolve(f.path || process.cwd());
  log("skeehn Schema Generation\n");
  
  const reg = JSON.parse(readFileSync(join(ROOT, "registry.json"), "utf-8"));
  const schemaDir = join(target, "skeehn-schema");
  mkdirSync(schemaDir, { recursive: true });
  
  // Generate component schema
  const componentSchema = {
    version: "0.3.0",
    components: reg.components.map((c: any) => ({
      name: c.name,
      category: c.category,
      description: c.description,
      files: c.files,
    })),
  };
  writeFileSync(join(schemaDir, "components.json"), JSON.stringify(componentSchema, null, 2));
  ok("skeehn-schema/components.json");
  
  // Generate theme schema
  const themeSchema = { version: "0.3.0", themes: VALID_THEMES };
  writeFileSync(join(schemaDir, "themes.json"), JSON.stringify(themeSchema, null, 2));
  ok("skeehn-schema/themes.json");
  
  // Generate MCP tool definitions
  const mcpTools = reg.components.map((c: any) => ({
    name: `add_${c.name.replace(/-/g, '_')}`,
    description: `Add ${c.name} component`,
    input: { component: c.name, category: c.category },
  }));
  writeFileSync(join(schemaDir, "mcp-tools.json"), JSON.stringify(mcpTools, null, 2));
  ok("skeehn-schema/mcp-tools.json");
  
  log(`Schema generated in ${schemaDir}`);
  log(`Use with AI agents: Cursor, Claude Code, Copilot\n`);
}

// ─── Router ───
const [cmd, ...rest] = Bun.argv.slice(2);
switch (cmd) {
  case "init": await init(rest); break;
  case "add": await add(rest); break;
  case "theme": await theme(rest); break;
  case "density": await density(rest); break;
  case "mcp": await mcp(rest); break;
  case "generate": await generate(rest); break;
  case "schema": await schema(rest); break;
  case "--version": case "-v": console.log("0.3.0"); break;
  case "--help": case "-h": case undefined:
    console.log(`
  skeehn — ASCII native AI component library

  Usage:
    npx skeehn@latest init                          Set up in current directory
    npx skeehn@latest init --template dashboard     Use dashboard template
    npx skeehn@latest init --template gradient      Use gradient/hero template
    npx skeehn@latest add <component>               Add component
    npx skeehn@latest add all                       Add all 29 components
    npx skeehn@latest theme <name>                  Swap theme
    npx skeehn@latest density <level>               Change density
    npx skeehn@latest mcp                           Set up MCP server for AI agents
    npx skeehn@latest generate <type>               Generate ASCII art (image|text)
    npx skeehn@latest schema                        Generate machine-readable schemas

  Templates: hello-world, dashboard, gradient
  Themes: default, dark, brutal, terminal, print, grain
  Density: sparse, normal, dense, solid

  Components: 29 total (14 core + 11 AI + layout + dataviz + motion)
`); break;
  default: err(`Unknown: ${cmd}. Run: npx skeehn --help`);
}
