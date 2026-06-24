'use client';

import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════════
   CODE SNIPPETS
   ═══════════════════════════════════════════════════════════════ */

const INSTALL_CLI = `npx skeehn init`;

const INSTALL_MANUAL = `# Install core engine + React wrappers
bun add @skeehn/core @skeehn/react

# or with npm
npm install @skeehn/core @skeehn/react`;

const ADD_COMPONENTS = `# Add individual components
npx skeehn add button chat-bubble card

# Add all AI components
npx skeehn add --preset ai-chat`;

const CSS_SETUP = `/* globals.css */

/* Engine foundation */
@import "@skeehn/core/reset.css";
@import "@skeehn/core/tokens.css";
@import "@skeehn/core/dither.css";
@import "@skeehn/core/animation.css";

/* Theme (pick one) */
@import "@skeehn/core/themes/default.css";

/* Components you're using */
@import "@skeehn/core/button.css";
@import "@skeehn/core/chat-bubble.css";
@import "@skeehn/core/card.css";`;

const USAGE_EXAMPLE = `import { Button, ChatBubble, Card } from '@skeehn/react';

export function MyApp() {
  return (
    <div>
      <Card>
        <Card.Header>
          <Card.Title>Hello skeehn</Card.Title>
        </Card.Header>
        <Card.Content>
          <ChatBubble role="assistant">
            Welcome to the ASCII-first component library.
          </ChatBubble>
          <Button>Get Started</Button>
        </Card.Content>
      </Card>
    </div>
  );
}`;

const THEME_USAGE = `<!-- Static: import a theme CSS file -->
@import "@skeehn/core/themes/terminal.css";

<!-- Dynamic: set data attribute on root -->
<html data-theme="terminal">

<!-- Available themes -->
default | dark | terminal | brutal | print | grain | mardi-gras`;

const VANILLA_EXAMPLE = `<!-- No JavaScript required for basic components -->
<button class="sk-button" data-variant="primary">
  Click me
</button>

<div class="sk-chat-bubble" data-role="assistant">
  Pure CSS components with data-attribute state.
</div>

<div class="sk-badge" data-variant="accent">
  New
</div>`;

/* ═══════════════════════════════════════════════════════════════
   GETTING STARTED PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen py-2" style={{ fontFamily: 'var(--sk-font-mono)' }}>
      {/* Header */}
      <h1 className="docs-heading text-3xl tracking-tight mb-3"
        style={{ fontFamily: 'var(--sk-font-sans)' }}>
        Getting Started
      </h1>
      <p className="text-sm text-muted-fg mb-16 max-w-lg">
        Get skeehn running in your project in under 2 minutes.
      </p>

      {/* Step 1: Install */}
      <Step number={1} title="Install">
        <p className="text-sm text-muted-fg mb-5 leading-relaxed">
          The CLI is the fastest way to get started. It scaffolds config, imports
          your theme, and sets up CSS.
        </p>
        <InstallTabs />
      </Step>

      {/* Step 2: Add components */}
      <Step number={2} title="Add Components">
        <p className="text-sm text-muted-fg mb-5 leading-relaxed">
          Pick the components you need. Each one is a standalone CSS file with
          optional React wrappers.
        </p>
        <CodeBlock code={ADD_COMPONENTS} />
      </Step>

      {/* Step 3: Import CSS */}
      <Step number={3} title="Import CSS">
        <p className="text-sm text-muted-fg mb-5 leading-relaxed">
          Import the engine foundation and component styles in your global
          stylesheet.
        </p>
        <CodeBlock code={CSS_SETUP} />
      </Step>

      {/* Step 4: Use */}
      <Step number={4} title="Use Components">
        <p className="text-sm text-muted-fg mb-5 leading-relaxed">
          Import React wrappers or use the CSS classes directly. Every component
          works with or without JavaScript.
        </p>
        <SubTabs
          tabs={[
            { label: 'React', content: <CodeBlock code={USAGE_EXAMPLE} /> },
            { label: 'Vanilla HTML', content: <CodeBlock code={VANILLA_EXAMPLE} /> },
          ]}
        />
      </Step>

      {/* Step 5: Themes */}
      <Step number={5} title="Switch Themes" isLast>
        <p className="text-sm text-muted-fg mb-5 leading-relaxed">
          Swap the entire visual identity with a single CSS import or data
          attribute.
        </p>
        <CodeBlock code={THEME_USAGE} />
      </Step>

      {/* Next steps */}
      <div className="mt-20 pt-10 border-t border-border">
        <h2 className="docs-heading text-lg mb-6"
          style={{ fontFamily: 'var(--sk-font-sans)' }}>
          Next Steps
        </h2>
        <div className="space-y-3">
          <NextLink href="/docs/engine" label="Engine Playground" description="See the ASCII dithering engine in action" />
          <NextLink href="/docs/ai-chat" label="AI Chat Demo" description="Full chat interface with streaming and tool calls" />
          <NextLink href="/docs/themes" label="Theme Gallery" description="Preview all 7 themes with live switching" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HELPER COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function Step({
  number,
  title,
  children,
  isLast = false,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className="relative"
      style={{
        paddingLeft: '4.5rem',
        paddingBottom: isLast ? 0 : '4rem',
        borderLeft: isLast ? 'none' : '1px solid #333',
        marginLeft: '1.25rem',
      }}
    >
      {/* Step number — large circle */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: '-1.25rem',
          top: '-4px',
          width: '2.5rem',
          height: '2.5rem',
          border: '2px solid #555',
          borderRadius: '50%',
          background: '#111',
          fontFamily: 'var(--sk-font-mono)',
          fontSize: '1rem',
          fontWeight: 800,
          color: '#fff',
        }}
      >
        {number}
      </div>

      <h2
        className="docs-heading text-xl mb-4"
        style={{
          fontFamily: 'var(--sk-font-sans)',
          marginTop: '0',
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function InstallTabs() {
  const [tab, setTab] = useState<'cli' | 'manual'>('cli');

  return (
    <div>
      <div className="flex">
        <TabButton active={tab === 'cli'} onClick={() => setTab('cli')}>
          CLI (Recommended)
        </TabButton>
        <TabButton active={tab === 'manual'} onClick={() => setTab('manual')}>
          Manual
        </TabButton>
      </div>
      <CodeBlock code={tab === 'cli' ? INSTALL_CLI : INSTALL_MANUAL} connected />
    </div>
  );
}

function SubTabs({
  tabs,
}: {
  tabs: { label: string; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="flex">
        {tabs.map((t, i) => (
          <TabButton key={i} active={active === i} onClick={() => setActive(i)}>
            {t.label}
          </TabButton>
        ))}
      </div>
      <div className="[&>div>pre]:rounded-tl-none">
        {tabs[active].content}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-t border-l border-r cursor-pointer transition-colors ${
        active
          ? 'bg-surface text-foreground border-border relative z-10'
          : 'bg-muted/50 text-muted-fg border-border hover:text-foreground'
      }`}
      style={{
        borderBottom: active ? '1px solid #111' : '1px solid #333',
        marginBottom: '-1px',
      }}
    >
      {children}
    </button>
  );
}

function CodeBlock({ code, connected }: { code: string; connected?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre
        className={`bg-background border border-border p-5 overflow-auto font-mono text-xs leading-relaxed text-foreground ${
          connected ? 'rounded-tl-none' : ''
        }`}
      >
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-mono border cursor-pointer transition-colors ${
          copied
            ? 'border-green-800 text-green-400 bg-green-900/20'
            : 'border-border text-muted-fg hover:text-foreground bg-background'
        }`}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

function NextLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="block p-4 border border-border no-underline text-inherit hover:border-border hover:bg-surface/50 transition-all group"
    >
      <div className="text-sm font-semibold mb-1 group-hover:text-foreground transition-colors"
        style={{ fontFamily: 'var(--sk-font-sans)' }}>
        {label} &rarr;
      </div>
      <div className="text-xs text-muted-fg font-mono">
        {description}
      </div>
    </a>
  );
}
