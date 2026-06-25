'use client';

import { useState } from 'react';
import {
  Button,
  Card, CardHeader, CardTitle, CardBody, CardFooter,
  Badge,
  Input, InputGroup,
  ChatBubble,
  ThinkingBlock,
  ReasoningStep,
  AgentStatus,
  Progress,
  TypingIndicator,
  PromptSuggestions,
  Alert,
  Toggle,
  Avatar,
  CodeBlock,
  ToolCard,
  CitationCard,
  Accordion,
  Tabs,
  Tooltip,
  Dropdown,
  StreamingText,
  TerminalPanel,
  FileAttachment,
  FileAttachments,
  ChatInput, VoiceSession, Markdown,
  DialogContent, DialogHeader, DialogBody, DialogFooter,
  Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell,
  Container, Grid, GridCell, Stack, Divider, Skeleton,
  AsciiChart, Sparkline, Meter, Heatmap,
  DitherPulse, Glitch, AsciiRain,
} from '@skeehn/react';

export const PREVIEWS: Record<string, () => React.ReactNode> = {
  button: () => (
    <div className="flex gap-3 flex-wrap items-center">
      <Button variant="solid">Solid</Button>
      <Button variant="dither">Dither</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="inverted">Inverted</Button>
      <Button variant="ascii">ASCII</Button>
      <Button variant="pixel">Pixel</Button>
      <Button variant="dither" loading>Loading</Button>
      <Button variant="dither" size="sm">Small</Button>
      <Button variant="dither" size="lg">Large</Button>
      <Button variant="dither" disabled>Disabled</Button>
    </div>
  ),

  card: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Default Card</CardTitle>
        </CardHeader>
        <CardBody>Card content with dither surface texture. Supports header, body, and footer sections.</CardBody>
        <CardFooter>
          <Button variant="outline" size="sm">Action</Button>
        </CardFooter>
      </Card>
      <Card variant="dither">
        <CardHeader>
          <CardTitle>Dither Variant</CardTitle>
        </CardHeader>
        <CardBody>The dither variant adds a textured background pattern to the card surface.</CardBody>
      </Card>
    </div>
  ),

  badge: () => (
    <div className="flex gap-3 flex-wrap items-center">
      <Badge variant="solid">Solid</Badge>
      <Badge variant="dither">Dither</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="inverted">Inverted</Badge>
      <Badge variant="pixel">Pixel</Badge>
      <Badge color="success">Success</Badge>
      <Badge color="warning">Warning</Badge>
      <Badge color="destructive">Error</Badge>
      <Badge color="info">Info</Badge>
      <Badge color="success" pulsing>Live</Badge>
    </div>
  ),

  input: () => (
    <div className="flex flex-col gap-4 max-w-sm">
      <InputGroup label="Default" hint="Standard text input">
        <Input placeholder="Type something..." />
      </InputGroup>
      <InputGroup label="With dither focus" hint="Applies dither on focus">
        <Input dither placeholder="Focus me..." />
      </InputGroup>
      <InputGroup label="Error state" hint="This field has an error">
        <Input state="error" defaultValue="Invalid input" />
      </InputGroup>
      <InputGroup label="Disabled">
        <Input disabled placeholder="Cannot edit" />
      </InputGroup>
    </div>
  ),

  'chat-bubble': () => (
    <div className="flex flex-col gap-3 max-w-lg">
      <ChatBubble role="user">
        Can you explain how dither rendering works in CSS?
      </ChatBubble>
      <ChatBubble role="assistant">
        Dither rendering in CSS uses repeating gradient patterns and SVG filters to
        simulate the halftone effect. The key is layering multiple gradient stops at
        sub-pixel intervals.
      </ChatBubble>
      <ChatBubble role="tool">
        <code>search_docs(&quot;dither CSS pattern&quot;) = 3 results</code>
      </ChatBubble>
      <ChatBubble role="assistant" streaming>
        Based on the search results, I can see that...
      </ChatBubble>
    </div>
  ),

  'thinking-block': () => (
    <div className="flex flex-col gap-4 max-w-lg">
      <ThinkingBlock state="thinking" label="Thinking...">
        Analyzing the user&apos;s request to understand the optimal approach for implementing a dither shader in CSS...
      </ThinkingBlock>
      <ThinkingBlock state="done" label="Thought for 3.2s" meta="3.2s" defaultExpanded={false}>
        I determined that using CSS gradients with repeating-linear-gradient provides the best performance for dither effects without requiring WebGL.
      </ThinkingBlock>
    </div>
  ),

  'reasoning-step': () => (
    <div className="flex flex-col gap-2 max-w-lg">
      <ReasoningStep status="completed" title="Parse user query" defaultExpanded>
        Identified intent: component documentation request. Extracted target: dither shader.
      </ReasoningStep>
      <ReasoningStep status="completed" title="Search knowledge base">
        Found 3 relevant articles on CSS dither patterns.
      </ReasoningStep>
      <ReasoningStep status="active" title="Generate response">
        Composing explanation with code examples...
      </ReasoningStep>
      <ReasoningStep status="pending" title="Validate output">
        Awaiting generated content for validation.
      </ReasoningStep>
    </div>
  ),

  'agent-status': () => (
    <div className="flex gap-4 flex-wrap items-center">
      <AgentStatus status="idle" />
      <AgentStatus status="thinking" />
      <AgentStatus status="acting" />
      <AgentStatus status="done" />
      <AgentStatus status="error" />
      <AgentStatus status="thinking" label="Analyzing code..." />
    </div>
  ),

  progress: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <Progress value={25} label="25%" />
      <Progress value={60} variant="dither" label="60%" />
      <Progress value={90} label="90%" />
      <Progress state="loading" label="Loading..." />
    </div>
  ),

  'typing-indicator': () => (
    <div className="flex flex-col gap-4 items-start">
      <TypingIndicator />
      <TypingIndicator variant="ascii" />
      <TypingIndicator variant="dither" text="AI is typing..." />
      <TypingIndicator size="compact" />
    </div>
  ),

  'prompt-suggestions': () => (
    <PromptSuggestions
      label="How can I help you?"
      suggestions={[
        { value: 'explain', text: 'Explain how dither rendering works', icon: '?' },
        { value: 'build', text: 'Build a chat interface component', icon: '>' },
        { value: 'debug', text: 'Debug my CSS animation issue', icon: '!' },
        { value: 'review', text: 'Review my React component code', icon: '#' },
      ]}
      onSelect={(v) => console.log('Selected:', v)}
    />
  ),

  alert: () => (
    <div className="flex flex-col gap-3">
      <Alert type="info">This is an informational alert message.</Alert>
      <Alert type="success">Operation completed successfully.</Alert>
      <Alert type="warning">Please review before proceeding.</Alert>
      <Alert type="destructive">An error occurred during processing.</Alert>
    </div>
  ),

  toggle: () => (
    <div className="flex gap-6 items-center">
      <Toggle />
      <Toggle defaultChecked />
    </div>
  ),

  avatar: () => (
    <div className="flex gap-3 items-center">
      <Avatar fallback="SK" size="sm" />
      <Avatar fallback="AI" />
      <Avatar fallback="LG" size="lg" />
      <Avatar fallback="XL" size="xl" />
    </div>
  ),

  'code-block': () => (
    <CodeBlock
      code={`import { Button } from '@skeehn/react';\n\nexport function App() {\n  return (\n    <Button variant="dither">\n      Click me\n    </Button>\n  );\n}`}
      language="tsx"
      lineNumbers
    />
  ),

  'tool-card': () => (
    <div className="flex flex-col gap-3 max-w-md">
      <ToolCard name="search_docs" status="running">
        Searching for &quot;dither CSS patterns&quot;...
      </ToolCard>
      <ToolCard name="search_docs" status="success">
        Found 3 results matching your query.
      </ToolCard>
      <ToolCard name="execute_code" status="error">
        TypeError: Cannot read property of undefined
      </ToolCard>
    </div>
  ),

  'citation-card': () => (
    <div className="flex flex-col gap-3 max-w-md">
      <CitationCard index={1} source="CSS Dither Patterns" href="https://example.com/dither" snippet="An overview of halftone dither techniques using modern CSS." />
      <CitationCard index={2} source="MDN: Gradients" href="https://developer.mozilla.org" variant="compact" snippet="Mozilla Developer Network reference." />
    </div>
  ),

  accordion: () => (
    <Accordion
      items={[
        { value: 'what', label: 'What is skeehn?', content: 'An ASCII/dither component library for building AI interfaces.' },
        { value: 'install', label: 'How do I install it?', content: 'Run npx skeehn add <component> to add individual components.' },
        { value: 'dark', label: 'Does it support dark mode?', content: 'Yes, all components support light and dark themes out of the box.' },
      ]}
    />
  ),

  tabs: () => (
    <Tabs
      tabs={[
        { label: 'Preview', value: 'preview', content: <p>Live preview of the component appears here.</p> },
        { label: 'Code', value: 'code', content: <pre className="text-sm font-mono">{'<Button variant="dither">Click</Button>'}</pre> },
        { label: 'API', value: 'api', content: <p>Props table and usage docs.</p> },
      ]}
      defaultValue="preview"
    />
  ),

  tooltip: () => (
    <div className="flex gap-6 items-center py-8">
      <Tooltip text="Top tooltip">
        <Button variant="outline">Hover me (top)</Button>
      </Tooltip>
      <Tooltip text="Bottom tooltip">
        <Button variant="outline">Hover me (bottom)</Button>
      </Tooltip>
    </div>
  ),

  dropdown: () => (
    <Dropdown
      trigger={<Button variant="outline">Open Menu</Button>}
      items={[
        { label: 'Edit', value: 'edit' },
        { label: 'Duplicate', value: 'duplicate' },
        { label: 'Delete', value: 'delete' },
      ]}
    />
  ),

  'streaming-text': () => (
    <div className="max-w-lg">
      <StreamingText effect="scanline">
        This text streams in character by character, simulating real-time AI output with a scanline effect.
      </StreamingText>
    </div>
  ),

  'terminal-panel': () => (
    <TerminalPanel title="Terminal">
      <pre className="text-sm">
{`$ npx skeehn add button
> Added button.css to components/
> Done in 0.3s

$ npx skeehn add card
> Added card.css to components/
> Done in 0.2s`}
      </pre>
    </TerminalPanel>
  ),

  'voice-session': () => (
    <div className="w-full max-w-md">
      <VoiceSession status="listening" onMute={() => {}} onEnd={() => {}} />
    </div>
  ),

  markdown: () => (
    <div className="max-w-lg">
      <Markdown>
        <h2>Dithering</h2>
        <p>Thresholds pixels against a <strong>Bayer matrix</strong> to fake more shades with fewer colors.</p>
        <ul>
          <li>Ordered (Bayer)</li>
          <li>Floyd&ndash;Steinberg</li>
          <li>Atkinson</li>
        </ul>
        <pre><code><span className="sk-md-tok-keyword">const</span> <span className="sk-md-tok-function">dither</span> = <span className="sk-md-tok-string">&apos;bayer&apos;</span>;</code></pre>
      </Markdown>
    </div>
  ),

  'file-attachment': () => (
    <FileAttachments>
      <FileAttachment name="report.pdf" size="2.4 MB" state="done" />
      <FileAttachment name="data.csv" size="800 KB" state="uploading" progress={65} />
      <FileAttachment name="image.png" size="1.1 MB" state="error" />
    </FileAttachments>
  ),

  layout: () => (
    <div className="flex flex-col gap-4">
      <Grid cols="3">
        <GridCell><div className="p-4 border border-border text-center text-sm">1</div></GridCell>
        <GridCell><div className="p-4 border border-border text-center text-sm">2</div></GridCell>
        <GridCell><div className="p-4 border border-border text-center text-sm">3</div></GridCell>
      </Grid>
      <Stack direction="horizontal" gap="sm">
        <div className="p-3 border border-border text-sm">Stack item</div>
        <div className="p-3 border border-border text-sm">Stack item</div>
        <div className="p-3 border border-border text-sm">Stack item</div>
      </Stack>
      <Divider />
      <div className="flex gap-3">
        <Skeleton shape="circle" style={{ width: 40, height: 40 }} />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton style={{ height: 16, width: '60%' }} />
          <Skeleton style={{ height: 12, width: '80%' }} />
        </div>
      </div>
    </div>
  ),

  dataviz: () => (
    <div className="flex flex-col gap-4">
      <Sparkline data={[2, 5, 3, 8, 4, 7, 6, 9, 3, 5]} />
      <Meter value={72} />
    </div>
  ),

  motion: () => (
    <div className="flex gap-6 items-center">
      <DitherPulse effect="pulse" style={{ width: 80, height: 80 }} />
      <Glitch intensity="subtle">
        <span className="text-lg font-mono">GLITCH</span>
      </Glitch>
    </div>
  ),

  dialog: () => (
    <DialogContent style={{ maxWidth: '24rem' }}>
      <DialogHeader title="Delete file?" onClose={() => {}} />
      <DialogBody>This action cannot be undone. The file will be permanently removed from your project.</DialogBody>
      <DialogFooter>
        <Button variant="ghost" size="sm">Cancel</Button>
        <Button variant="solid" size="sm">Delete</Button>
      </DialogFooter>
    </DialogContent>
  ),

  'chat-input': () => (
    <div className="w-full max-w-lg">
      <ChatInput
        placeholder="Message skeehn…"
        onSubmit={() => {}}
        onMicToggle={() => {}}
        maxLength={2000}
        hint="Enter to send · Shift+Enter for newline"
      />
    </div>
  ),

  table: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Tool</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Duration</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow><TableCell>search_docs</TableCell><TableCell>success</TableCell><TableCell>0.4s</TableCell></TableRow>
        <TableRow><TableCell>execute_code</TableCell><TableCell>error</TableCell><TableCell>1.2s</TableCell></TableRow>
        <TableRow><TableCell>fetch_url</TableCell><TableCell>success</TableCell><TableCell>0.8s</TableCell></TableRow>
      </TableBody>
    </Table>
  ),
};

const PREVIEW_THEMES = ['light', 'dark', 'default', 'terminal', 'brutal', 'grain', 'print', 'mardi-gras'] as const;

export function ComponentPreview({ slug }: { slug: string }) {
  const [theme, setTheme] = useState<string>('light');
  const render = PREVIEWS[slug];

  if (!render) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-fg text-sm rounded-xl border border-dashed border-border">
        Preview not yet available for this component.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Theme switcher — previews render in their OWN theme */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-surface flex-wrap">
        <span className="text-[0.7rem] uppercase tracking-[0.12em] text-muted-fg mr-1.5 font-medium">Theme</span>
        {PREVIEW_THEMES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            className={`text-[0.72rem] capitalize px-2.5 py-1 rounded-md transition-colors ${
              theme === t
                ? 'bg-foreground text-background'
                : 'text-muted-fg hover:text-foreground hover:bg-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div
        data-theme={theme}
        className="p-8 flex items-center justify-center min-h-[10rem]"
        style={{ background: 'hsl(var(--sk-background))', color: 'hsl(var(--sk-foreground))' }}
      >
        <div className="w-full">{render()}</div>
      </div>
    </div>
  );
}
