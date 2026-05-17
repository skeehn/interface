#!/usr/bin/env bun
/**
 * skeehn CLI — ASCII native AI component library
 *
 * Commands:
 *   init          Set up skeehn in a Next.js/React project
 *   add <name>    Copy component source into your project (shadcn-style)
 *   theme <name>  Switch theme
 *   doctor        Validate setup
 *   --help        Show usage
 *
 * @packageDocumentation
 */

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const VERSION = "1.0.0";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENGINE = join(ROOT, "engine");
const THEMES = join(ROOT, "themes");
const COMPONENTS = join(ROOT, "components");
const REACT_COMPONENTS = join(ROOT, "packages", "react", "src", "components");
const REGISTRY_PATH = join(ROOT, "registry.json");

const ALL_THEMES = [
  "default",
  "dark",
  "brutal",
  "terminal",
  "print",
  "grain",
  "mardi-gras",
  "phosphor",
  "amber",
  "risograph",
  "newsprint",
];

// ─── Logging ───────────────────────────────────────────────
const log = (m: string) => console.log(`  ${m}`);
const ok = (m: string) => console.log(`  ✓ ${m}`);
const warn = (m: string) => console.log(`  ⚠ ${m}`);
const err = (m: string) => { console.error(`  ✗ ${m}`); process.exit(1); };

// ─── Registry ──────────────────────────────────────────────
interface RegistryComponent {
  name: string;
  description: string;
  files: string[];
  category: string;
}

interface Registry {
  name: string;
  version: string;
  themes: string[];
  components: RegistryComponent[];
}

function loadRegistry(): Registry {
  return JSON.parse(readFileSync(REGISTRY_PATH, "utf-8"));
}

// ─── Flag Parser ───────────────────────────────────────────
function parseFlags(args: string[]): Record<string, string> {
  const f: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === "-p" || arg === "--path") && args[i + 1]) f.path = args[++i];
    else if ((arg === "-t" || arg === "--theme") && args[i + 1]) f.theme = args[++i];
    else if (arg === "--template" && args[i + 1]) f.template = args[++i];
    else if (arg === "--css-dir" && args[i + 1]) f.cssDir = args[++i];
    else if (arg === "--component-dir" && args[i + 1]) f.componentDir = args[++i];
    else if (arg === "--json") f.json = "true";
    else if (arg === "--no-css") f.noCss = "true";
    else if (arg === "--css-only") f.cssOnly = "true";
  }
  return f;
}

// ─── Framework Detection ───────────────────────────────────
type Framework = "next" | "react" | "vue" | "svelte" | "html";

function detectFramework(target: string): Framework {
  const pkgPath = join(target, "package.json");
  if (!existsSync(pkgPath)) return "html";
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps["next"]) return "next";
    if (deps["react"]) return "react";
    if (deps["vue"]) return "vue";
    if (deps["svelte"]) return "svelte";
  } catch {}
  return "html";
}

// ─── Pascal Case ───────────────────────────────────────────
function toPascalCase(name: string): string {
  return name
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

// ═══════════════════════════════════════════════════════════
// INIT — Set up skeehn in a project
// ═══════════════════════════════════════════════════════════
async function init(args: string[]) {
  const f = parseFlags(args);
  const target = resolve(f.path || process.cwd());
  const theme = f.theme || "default";
  const framework = detectFramework(target);

  console.log("\n  ▦ skeehn init\n");

  if (!ALL_THEMES.includes(theme)) {
    err(`Theme "${theme}" not found. Available: ${ALL_THEMES.join(", ")}`);
  }

  // 1. Create directories
  const stylesDir = join(target, "styles", "skeehn");
  const componentsDir = join(target, f.componentDir || "components", "ui");
  mkdirSync(stylesDir, { recursive: true });
  mkdirSync(componentsDir, { recursive: true });

  // 2. Copy engine CSS
  for (const file of ["reset.css", "tokens.css", "dither.css", "animation.css"]) {
    const src = join(ENGINE, file);
    if (existsSync(src)) {
      copyFileSync(src, join(stylesDir, file));
      ok(`styles/skeehn/${file}`);
    }
  }

  // 3. Copy theme
  const themeSrc = join(THEMES, `${theme}.css`);
  if (existsSync(themeSrc)) {
    copyFileSync(themeSrc, join(stylesDir, "theme.css"));
    ok(`styles/skeehn/theme.css (${theme})`);
  }

  // 4. Framework-specific setup
  if (framework === "next") {
    // Add CSS imports to globals.css if it exists
    const globalsPath = join(target, "src", "app", "globals.css");
    const altGlobalsPath = join(target, "app", "globals.css");
    const gp = existsSync(globalsPath) ? globalsPath : existsSync(altGlobalsPath) ? altGlobalsPath : null;

    if (gp) {
      const existing = readFileSync(gp, "utf-8");
      if (!existing.includes("skeehn")) {
        const imports = [
          "",
          "/* skeehn engine CSS */",
          '@import "./../../styles/skeehn/reset.css";',
          '@import "./../../styles/skeehn/tokens.css";',
          '@import "./../../styles/skeehn/dither.css";',
          '@import "./../../styles/skeehn/animation.css";',
          '@import "./../../styles/skeehn/theme.css";',
          "",
        ].join("\n");
        writeFileSync(gp, existing + imports);
        ok(`Updated globals.css with skeehn imports`);
      }
    }

    // Check if @skeehn/react is installed
    const pkgPath = join(target, "package.json");
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (!deps["@skeehn/react"]) {
        log(`\n  Run: bun add @skeehn/react`);
      }
    }
  }

  // 5. Summary
  console.log(`
  ✓ skeehn initialized!

  Framework: ${framework}
  Theme:     ${theme}
  Styles:    styles/skeehn/
  Components: ${componentsDir.replace(target + "/", "")}

  Next steps:
    npx skeehn add button              Add a component
    npx skeehn add chat-bubble         Add AI chat bubble
    npx skeehn add --all               Add all 32 components
    npx skeehn doctor                  Validate setup
`);
}

// ═══════════════════════════════════════════════════════════
// ADD — Copy component source into project (shadcn-style)
// ═══════════════════════════════════════════════════════════
async function add(args: string[]) {
  const comp = args[0];
  const f = parseFlags(args.slice(1));
  const target = resolve(f.path || process.cwd());
  const reg = loadRegistry();
  const framework = detectFramework(target);

  const cssDir = join(target, f.cssDir || "styles", "skeehn", "components");
  const componentDir = join(target, f.componentDir || "components", "ui");

  if (!comp) {
    const names = reg.components.map((c) => c.name).join(", ");
    err(`Component name required.\n\n  Available: ${names}\n\n  Usage: npx skeehn add button`);
  }

  // Handle --all
  if (comp === "all" || comp === "--all") {
    console.log("\n  ▦ skeehn add --all\n");
    let count = 0;
    for (const c of reg.components) {
      addSingleComponent(c, { target, cssDir, componentDir, framework, noCss: f.noCss === "true", cssOnly: f.cssOnly === "true" });
      count++;
    }
    console.log(`\n  ✓ Added all ${count} components\n`);
    return;
  }

  // Find component
  const c = reg.components.find((x) => x.name === comp);
  if (!c) {
    const names = reg.components.map((x) => x.name).join(", ");
    err(`"${comp}" not found.\n\n  Available: ${names}`);
    return; // unreachable but TS needs it
  }

  console.log(`\n  ▦ skeehn add ${comp}\n`);
  addSingleComponent(c, { target, cssDir, componentDir, framework, noCss: f.noCss === "true", cssOnly: f.cssOnly === "true" });

  // Show next steps
  const pascal = toPascalCase(c.name);
  const cssFile = c.files.find((f) => f.endsWith(".css"));

  console.log(`
  Next steps:`);
  if (cssFile && f.cssOnly !== "true") {
    log(`  Import CSS in globals.css:`);
    log(`    @import "./../../styles/skeehn/components/${cssFile}";`);
  }
  if (framework === "next" || framework === "react") {
    log(`  Import component:`);
    log(`    import { ${pascal} } from '@/components/ui/${pascal}';`);
  }
  console.log();
}

function addSingleComponent(
  c: RegistryComponent,
  opts: { target: string; cssDir: string; componentDir: string; framework: Framework; noCss: boolean; cssOnly: boolean }
) {
  // 1. Copy CSS files
  if (!opts.noCss) {
    mkdirSync(opts.cssDir, { recursive: true });
    for (const file of c.files.filter((f) => f.endsWith(".css"))) {
      const src = join(COMPONENTS, c.name, file);
      if (existsSync(src)) {
        copyFileSync(src, join(opts.cssDir, file));
        ok(`styles/skeehn/components/${file}`);
      }
    }
  }

  // 2. Copy React wrapper (.tsx) if framework is React/Next
  if (!opts.cssOnly && (opts.framework === "next" || opts.framework === "react")) {
    const pascal = toPascalCase(c.name);
    const tsxSrc = join(REACT_COMPONENTS, `${pascal}.tsx`);

    if (existsSync(tsxSrc)) {
      mkdirSync(opts.componentDir, { recursive: true });
      copyFileSync(tsxSrc, join(opts.componentDir, `${pascal}.tsx`));
      ok(`components/ui/${pascal}.tsx`);
    }
  }

  // 3. Copy JS files (for vanilla components with behavior)
  if (!opts.cssOnly) {
    for (const file of c.files.filter((f) => f.endsWith(".js"))) {
      const src = join(COMPONENTS, c.name, file);
      if (existsSync(src)) {
        mkdirSync(opts.cssDir, { recursive: true });
        copyFileSync(src, join(opts.cssDir, file));
        ok(`styles/skeehn/components/${file}`);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// THEME — Switch theme
// ═══════════════════════════════════════════════════════════
async function theme(args: string[]) {
  const name = args[0];
  const f = parseFlags(args.slice(1));
  const target = resolve(f.path || process.cwd());

  if (!name) err(`Theme name required. Available: ${ALL_THEMES.join(", ")}`);
  if (!ALL_THEMES.includes(name)) err(`"${name}" not found. Available: ${ALL_THEMES.join(", ")}`);

  console.log(`\n  ▦ skeehn theme ${name}\n`);

  const src = join(THEMES, `${name}.css`);
  const dest = join(target, "styles", "skeehn", "theme.css");
  if (existsSync(src)) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    ok(`styles/skeehn/theme.css → ${name}`);
  }

  log(`\n  Set data-theme="${name}" on your <html> element.`);
  log(`  Available: ${ALL_THEMES.join(", ")}\n`);
}

// ═══════════════════════════════════════════════════════════
// DOCTOR — Validate setup
// ═══════════════════════════════════════════════════════════
async function doctor(args: string[]) {
  const f = parseFlags(args);
  const target = resolve(f.path || process.cwd());
  let issues = 0;

  console.log("\n  ▦ skeehn doctor\n");

  // Check engine CSS files
  const stylesDir = join(target, "styles", "skeehn");
  const required = ["reset.css", "tokens.css", "dither.css"];
  for (const file of required) {
    if (existsSync(join(stylesDir, file))) {
      ok(`styles/skeehn/${file}`);
    } else {
      warn(`Missing: styles/skeehn/${file}`);
      issues++;
    }
  }

  // Check theme
  if (existsSync(join(stylesDir, "theme.css"))) {
    ok(`styles/skeehn/theme.css`);
  } else {
    warn(`Missing: styles/skeehn/theme.css — run: npx skeehn theme default`);
    issues++;
  }

  // Check globals.css for imports
  const framework = detectFramework(target);
  if (framework === "next") {
    const globalsPath = join(target, "src", "app", "globals.css");
    const altGlobalsPath = join(target, "app", "globals.css");
    const gp = existsSync(globalsPath) ? globalsPath : existsSync(altGlobalsPath) ? altGlobalsPath : null;

    if (gp) {
      const content = readFileSync(gp, "utf-8");
      if (content.includes("skeehn") || content.includes("tokens.css")) {
        ok(`globals.css has skeehn imports`);
      } else {
        warn(`globals.css missing skeehn imports — run: npx skeehn init`);
        issues++;
      }
    }

    // Check package.json for @skeehn/react
    const pkgPath = join(target, "package.json");
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps["@skeehn/react"]) {
        ok(`@skeehn/react installed`);
      } else {
        warn(`@skeehn/react not installed — run: bun add @skeehn/react`);
        issues++;
      }
    }
  }

  // Check component files
  const componentDir = join(target, "components", "ui");
  if (existsSync(componentDir)) {
    const files = readdirSync(componentDir).filter((f) => f.endsWith(".tsx"));
    ok(`${files.length} component(s) in components/ui/`);
  } else {
    warn(`No components found — run: npx skeehn add button`);
    issues++;
  }

  // Summary
  if (issues === 0) {
    console.log("\n  ✓ All checks passed!\n");
  } else {
    console.log(`\n  ${issues} issue(s) found. Fix them with the commands above.\n`);
  }
}

// ═══════════════════════════════════════════════════════════
// DENSITY — Set --sk-density attribute on consumer's :root
// ═══════════════════════════════════════════════════════════
const DENSITY_LEVELS = ["sparse", "normal", "dense", "solid"];

async function density(args: string[]) {
  const name = args[0];
  const f = parseFlags(args.slice(1));
  const target = resolve(f.path || process.cwd());

  if (!name) err(`Density level required. One of: ${DENSITY_LEVELS.join(", ")}`);
  if (!DENSITY_LEVELS.includes(name)) err(`"${name}" not a density. One of: ${DENSITY_LEVELS.join(", ")}`);

  console.log(`\n  ▦ skeehn density ${name}\n`);

  const dest = join(target, "styles", "skeehn", "density.css");
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(
    dest,
    `/* Auto-generated by \`npx skeehn density ${name}\` */\n` +
      `:root { --sk-density-level: "${name}"; }\n` +
      `html, :root { /* applied via data-density attribute too */ }\n`,
  );
  ok(`styles/skeehn/density.css → ${name}`);

  log(`\n  Set data-density="${name}" on your <html> element to apply.\n`);
}

// ═══════════════════════════════════════════════════════════
// MCP — Print the @skeehn/mcp-server connection snippet
// ═══════════════════════════════════════════════════════════
async function mcp(args: string[]) {
  const f = parseFlags(args);
  const format = f.format || "claude";

  console.log(`\n  ▦ skeehn mcp\n`);

  const snippet = {
    mcpServers: {
      skeehn: {
        command: "bunx",
        args: ["@skeehn/mcp-server"],
      },
    },
  };

  if (format === "json") {
    console.log(JSON.stringify(snippet, null, 2));
  } else {
    log("Add the following to your Claude Desktop config:");
    log("(macOS: ~/Library/Application Support/Claude/claude_desktop_config.json)\n");
    console.log(JSON.stringify(snippet, null, 2));
    log("\n  Then restart Claude Desktop to load the @skeehn/mcp-server.\n");
  }
}

// ═══════════════════════════════════════════════════════════
// GENERATE — Scaffold a new component from the existing pattern
// ═══════════════════════════════════════════════════════════
async function generate(args: string[]) {
  const name = args[0];
  const f = parseFlags(args.slice(1));
  const target = resolve(f.path || process.cwd());

  if (!name) err(`Component name required. Example: npx skeehn generate my-card`);

  console.log(`\n  ▦ skeehn generate ${name}\n`);

  const slug = name.replace(/[^a-z0-9-]/g, "-").toLowerCase();
  const className = `sk-${slug}`;
  const pascal = toPascalCase(slug);
  const dir = join(target, "components", "skeehn", slug);
  mkdirSync(dir, { recursive: true });

  const css = `/* ${pascal} — generated by \`npx skeehn generate ${slug}\` */
.${className} {
  display: block;
  padding: var(--sk-space-4);
  background: hsl(var(--sk-surface));
  color: hsl(var(--sk-foreground));
  border: var(--sk-border);
  font-family: var(--sk-font-mono);
  font-size: var(--sk-font-size-sm);
  transition: var(--sk-transition);
}

.${className}[data-state="loading"]::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: var(--sk-dither-pattern);
  background-repeat: repeat;
  opacity: 0.12;
  animation: sk-dither-pulse 1.5s ease-in-out infinite;
  pointer-events: none;
}

.${className}[data-state="disabled"] { opacity: 0.5; pointer-events: none; }
.${className}:focus-visible { outline: 2px solid hsl(var(--sk-ring)); outline-offset: 2px; }
`;

  const tsx = `import React from 'react';

export interface ${pascal}Props extends React.HTMLAttributes<HTMLDivElement> {
  state?: 'idle' | 'loading' | 'disabled' | 'error' | 'success';
  children?: React.ReactNode;
}

export const ${pascal} = React.forwardRef<HTMLDivElement, ${pascal}Props>(
  ({ state = 'idle', className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={\`${className} \${className ?? ''}\`.trim()}
      data-state={state}
      aria-busy={state === 'loading'}
      aria-disabled={state === 'disabled'}
      {...rest}
    >
      {children}
    </div>
  ),
);
${pascal}.displayName = '${pascal}';
`;

  writeFileSync(join(dir, `${slug}.css`), css);
  writeFileSync(join(dir, `${pascal}.tsx`), tsx);
  ok(`components/skeehn/${slug}/${slug}.css`);
  ok(`components/skeehn/${slug}/${pascal}.tsx`);
  log(`\n  Edit the files above and import them where needed.\n`);
}

// ═══════════════════════════════════════════════════════════
// SCHEMA — Print the registry schema as JSON
// ═══════════════════════════════════════════════════════════
async function schema(args: string[]) {
  const f = parseFlags(args);
  const reg = loadRegistry();

  if (f.shape === "json-schema") {
    const shape = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "skeehn registry",
      type: "object",
      properties: {
        name: { type: "string" },
        version: { type: "string" },
        themes: { type: "array", items: { type: "string" } },
        components: {
          type: "array",
          items: {
            type: "object",
            required: ["name", "category", "files"],
            properties: {
              name: { type: "string" },
              category: { enum: ["core", "ai", "layout", "dataviz", "motion", "gl"] },
              description: { type: "string" },
              files: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    };
    console.log(JSON.stringify(shape, null, 2));
  } else {
    console.log(JSON.stringify(reg, null, 2));
  }
}

// ═══════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════
const [cmd, ...rest] = Bun.argv.slice(2);

switch (cmd) {
  case "init":
    await init(rest);
    break;
  case "add":
    await add(rest);
    break;
  case "theme":
    await theme(rest);
    break;
  case "density":
    await density(rest);
    break;
  case "mcp":
    await mcp(rest);
    break;
  case "generate":
    await generate(rest);
    break;
  case "schema":
    await schema(rest);
    break;
  case "doctor":
    await doctor(rest);
    break;
  case "--version":
  case "-v":
    console.log(VERSION);
    break;
  case "--help":
  case "-h":
  case undefined:
    console.log(`
  ▦ skeehn v${VERSION} — ASCII native AI component library

  Usage:
    npx skeehn init                    Set up in current directory
    npx skeehn init --theme terminal   Use terminal theme
    npx skeehn add <component>         Copy component into your project
    npx skeehn add --all               Copy all 32 components
    npx skeehn theme <name>            Switch theme
    npx skeehn density <level>         sparse | normal | dense | solid
    npx skeehn generate <name>         Scaffold a new component
    npx skeehn mcp                     Print Claude Desktop MCP config
    npx skeehn schema                  Print registry.json (or --shape=json-schema)
    npx skeehn doctor                  Validate setup

  Components: 32 total (14 core + 13 AI + 3 bundles)

  Themes: ${ALL_THEMES.join(", ")}

  Flags:
    -p, --path <dir>          Target directory
    -t, --theme <name>        Theme for init
    --component-dir <dir>     Custom component output directory
    --css-dir <dir>           Custom CSS output directory
    --no-css                  Skip CSS files (React wrapper only)
    --css-only                Skip React wrapper (CSS only)

  Examples:
    npx skeehn init
    npx skeehn add button
    npx skeehn add chat-bubble
    npx skeehn add --all
    npx skeehn theme mardi-gras
    npx skeehn doctor

  Docs: https://ui.skeehn.com
`);
    break;
  default:
    err(`Unknown command: "${cmd}". Run: npx skeehn --help`);
}
