import type { Metadata } from "next";
import { CodeBlock } from "@skeehn/react";

export const metadata: Metadata = {
  title: "Use with AI agents",
  description:
    "Wire skeehn into Claude Code, Cursor, and v0 — the MCP server, the shadcn registry, llms.txt, the AI SDK layer, and blocks. Agents discover, install, compose, theme, and extend skeehn.",
};

const MCP_JSON = `{
  "mcpServers": {
    "skeehn": {
      "command": "npx",
      "args": ["-y", "@skeehn/mcp-server"]
    }
  }
}`;

const CLAUDE_ADD = `# Claude Code — add the skeehn MCP server
claude mcp add skeehn -- npx -y @skeehn/mcp-server

# …or drop the JSON above into .mcp.json (project) / ~/.claude.json (global)`;

const REGISTRY = `# Any component, copied into the user's project (they own the code):
npx shadcn@latest add https://ui.skeehn.com/r/chat-bubble.json
npx shadcn@latest add https://ui.skeehn.com/r/button.json
# the engine + tokens + default theme:
npx shadcn@latest add https://ui.skeehn.com/r/skeehn-engine.json`;

const AISDK = `import { useChat } from '@ai-sdk/react';
import { Conversation } from '@skeehn/react/ai';
import { ChatConsole } from '@skeehn/react/blocks';
import '@skeehn/core/styles.css';

export function Chat() {
  const { messages, sendMessage, status } = useChat();
  // drop-in: render AI SDK messages, or a whole console
  return <ChatConsole messages={messages} busy={status === 'streaming'}
    onSend={(text) => sendMessage({ text })} />;
}`;

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <p className="docs-label mb-2">{label}</p>
      <h2 className="docs-heading text-xl sm:text-2xl tracking-tight mb-3">{title}</h2>
      <div className="text-[0.95rem] text-muted-fg leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function AgentsPage() {
  return (
    <div className="max-w-3xl">
      <p className="docs-label mb-3">For AI agents</p>
      <h1 className="docs-heading text-3xl sm:text-4xl tracking-tight mb-4">Build with skeehn from an AI agent</h1>
      <p className="text-lg text-muted-fg leading-relaxed mb-10">
        skeehn is built to be driven by coding agents — Claude Code, Cursor, v0. An agent can{" "}
        <strong className="text-foreground font-medium">discover</strong> the catalog,{" "}
        <strong className="text-foreground font-medium">install</strong> components,{" "}
        <strong className="text-foreground font-medium">compose</strong> whole interfaces from blocks,{" "}
        <strong className="text-foreground font-medium">theme</strong> them to a brand, and{" "}
        <strong className="text-foreground font-medium">extend</strong> the foundation — producing
        bespoke UI, not generic output.
      </p>

      <Section label="Recommended" title="MCP server">
        <p>
          The <code className="sk-code-inline">@skeehn/mcp-server</code> exposes the catalog and tools
          over the Model Context Protocol. Add it to Claude Code or Cursor:
        </p>
        <div data-theme="default"><CodeBlock language="json" code={MCP_JSON} /></div>
        <div data-theme="default"><CodeBlock language="bash" code={CLAUDE_ADD} /></div>
        <p>
          It serves <strong className="text-foreground font-medium">resources</strong> (component
          schema, theme registry, prop contracts, agent docs, examples, patterns) and{" "}
          <strong className="text-foreground font-medium">tools</strong>:{" "}
          <code className="sk-code-inline">list_components</code>,{" "}
          <code className="sk-code-inline">install_component</code>,{" "}
          <code className="sk-code-inline">generate_ui_code</code>,{" "}
          <code className="sk-code-inline">validate_props</code>,{" "}
          <code className="sk-code-inline">swap_theme</code>,{" "}
          <code className="sk-code-inline">add_to_project</code> — so an agent can go from{" "}
          “build a voice-agent console with skeehn” to installed, composed, and themed code.
        </p>
      </Section>

      <Section label="Distribution" title="Install from the registry">
        <p>
          Every component is a shadcn-compatible registry item with inline file content, so it
          installs into any project — the user owns the code:
        </p>
        <div data-theme="default"><CodeBlock language="bash" code={REGISTRY} /></div>
      </Section>

      <Section label="Context" title="llms.txt">
        <p>
          A machine-readable index of the whole library — install paths, the token contract,
          components, themes, the AI SDK layer, and blocks — lives at{" "}
          <a className="text-accent hover:underline" href="https://ui.skeehn.com/llms.txt">
            ui.skeehn.com/llms.txt
          </a>
          . Point an agent at it for grounding.
        </p>
      </Section>

      <Section label="Compose" title="AI SDK v5 + blocks">
        <p>
          skeehn is a drop-in for the Vercel AI SDK. Render <code className="sk-code-inline">useChat</code>{" "}
          messages directly, or drop in a whole console from <code className="sk-code-inline">@skeehn/react/blocks</code>:
        </p>
        <div data-theme="default"><CodeBlock language="tsx" code={AISDK} /></div>
        <p>
          See <a className="text-accent hover:underline" href="/docs/ai-sdk">AI SDK</a>,{" "}
          <a className="text-accent hover:underline" href="/docs/blocks">Blocks</a>, and the{" "}
          <a className="text-accent hover:underline" href="/docs/theme-generator">brand theme generator</a>{" "}
          (derive a full theme from one color — perfect for “make it match our brand”).
        </p>
      </Section>
    </div>
  );
}
