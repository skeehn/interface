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
    <div
      className="min-h-screen"
      style={{ fontFamily: 'var(--sk-font-mono)' }}
    >
      {/* Header */}
      <h1
        className="text-3xl font-bold tracking-tight mb-2"
        style={{ fontFamily: 'var(--sk-font-sans)' }}
      >
        Getting Started
      </h1>
      <p
        className="text-sm mb-10"
        style={{ color: 'hsl(var(--sk-muted-foreground))' }}
      >
        Get skeehn running in your project in under 2 minutes.
      </p>

      {/* Step 1: Install */}
      <Step number={1} title="Install">
        <p className="mb-4" style={{ color: 'hsl(var(--sk-muted-foreground))', fontSize: 'var(--sk-font-size-sm)' }}>
          The CLI is the fastest way to get started. It scaffolds config, imports
          your theme, and sets up CSS.
        </p>
        <InstallTabs />
      </Step>

      {/* Step 2: Add components */}
      <Step number={2} title="Add Components">
        <p className="mb-4" style={{ color: 'hsl(var(--sk-muted-foreground))', fontSize: 'var(--sk-font-size-sm)' }}>
          Pick the components you need. Each one is a standalone CSS file with
          optional React wrappers.
        </p>
        <CodeBlock code={ADD_COMPONENTS} />
      </Step>

      {/* Step 3: Import CSS */}
      <Step number={3} title="Import CSS">
        <p className="mb-4" style={{ color: 'hsl(var(--sk-muted-foreground))', fontSize: 'var(--sk-font-size-sm)' }}>
          Import the engine foundation and component styles in your global
          stylesheet.
        </p>
        <CodeBlock code={CSS_SETUP} />
      </Step>

      {/* Step 4: Use */}
      <Step number={4} title="Use Components">
        <p className="mb-4" style={{ color: 'hsl(var(--sk-muted-foreground))', fontSize: 'var(--sk-font-size-sm)' }}>
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
        <p className="mb-4" style={{ color: 'hsl(var(--sk-muted-foreground))', fontSize: 'var(--sk-font-size-sm)' }}>
          Swap the entire visual identity with a single CSS import or data
          attribute.
        </p>
        <CodeBlock code={THEME_USAGE} />
      </Step>

      {/* Next steps */}
      <div
        className="mt-12 pt-8"
        style={{ borderTop: '1px solid hsl(var(--sk-border-color))' }}
      >
        <h2
          className="text-lg font-bold mb-4"
          style={{ fontFamily: 'var(--sk-font-sans)' }}
        >
          Next Steps
        </h2>
        <div className="space-y-2">
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
        paddingLeft: 'var(--sk-space-8)',
        paddingBottom: isLast ? 0 : 'var(--sk-space-8)',
        borderLeft: isLast ? 'none' : '1px solid hsl(var(--sk-border-color))',
        marginLeft: '0.75rem',
      }}
    >
      {/* Step number circle */}
      <div
        style={{
          position: 'absolute',
          left: '-0.85rem',
          top: 0,
          width: '1.5rem',
          height: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'var(--sk-border)',
          background: 'hsl(var(--sk-background))',
          fontFamily: 'var(--sk-font-mono)',
          fontSize: 'var(--sk-font-size-xs)',
          fontWeight: 700,
          color: 'hsl(var(--sk-foreground))',
        }}
      >
        {number}
      </div>

      <h2
        className="text-lg font-bold mb-3"
        style={{
          fontFamily: 'var(--sk-font-sans)',
          marginTop: '-2px',
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
      <div style={{ display: 'flex', gap: 0, marginBottom: '-1px' }}>
        <TabButton active={tab === 'cli'} onClick={() => setTab('cli')}>
          CLI (Recommended)
        </TabButton>
        <TabButton active={tab === 'manual'} onClick={() => setTab('manual')}>
          Manual
        </TabButton>
      </div>
      <CodeBlock code={tab === 'cli' ? INSTALL_CLI : INSTALL_MANUAL} />
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
      <div style={{ display: 'flex', gap: 0, marginBottom: '-1px' }}>
        {tabs.map((t, i) => (
          <TabButton key={i} active={active === i} onClick={() => setActive(i)}>
            {t.label}
          </TabButton>
        ))}
      </div>
      {tabs[active].content}
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
      style={{
        padding: 'var(--sk-space-2) var(--sk-space-4)',
        border: 'var(--sk-border)',
        borderBottom: active ? '1px solid hsl(var(--sk-background))' : 'var(--sk-border)',
        background: active ? 'hsl(var(--sk-background))' : 'hsl(var(--sk-muted) / 0.3)',
        color: active ? 'hsl(var(--sk-foreground))' : 'hsl(var(--sk-muted-foreground))',
        fontFamily: 'var(--sk-font-mono)',
        fontSize: 'var(--sk-font-size-xs)',
        cursor: 'pointer',
        position: 'relative',
        zIndex: active ? 1 : 0,
      }}
    >
      {children}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'relative' }}>
      <pre
        style={{
          background: 'hsl(var(--sk-muted) / 0.3)',
          border: 'var(--sk-border)',
          borderRadius: 'var(--sk-radius)',
          padding: 'var(--sk-space-4)',
          overflow: 'auto',
          fontFamily: 'var(--sk-font-mono)',
          fontSize: 'var(--sk-font-size-xs)',
          lineHeight: 1.6,
          color: 'hsl(var(--sk-foreground))',
        }}
      >
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        style={{
          position: 'absolute',
          top: 'var(--sk-space-2)',
          right: 'var(--sk-space-2)',
          padding: '2px var(--sk-space-2)',
          border: 'var(--sk-border)',
          background: 'hsl(var(--sk-background))',
          fontFamily: 'var(--sk-font-mono)',
          fontSize: '0.6rem',
          cursor: 'pointer',
          color: copied ? 'hsl(var(--sk-success))' : 'hsl(var(--sk-muted-foreground))',
        }}
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
      style={{
        display: 'block',
        padding: 'var(--sk-space-3) var(--sk-space-4)',
        border: 'var(--sk-border)',
        borderRadius: 'var(--sk-radius)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'hsl(var(--sk-foreground))';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = '';
      }}
    >
      <div
        style={{
          fontFamily: 'var(--sk-font-sans)',
          fontSize: 'var(--sk-font-size-sm)',
          fontWeight: 600,
          marginBottom: '2px',
        }}
      >
        {label} &rarr;
      </div>
      <div
        style={{
          fontFamily: 'var(--sk-font-mono)',
          fontSize: 'var(--sk-font-size-xs)',
          color: 'hsl(var(--sk-muted-foreground))',
        }}
      >
        {description}
      </div>
    </a>
  );
}
