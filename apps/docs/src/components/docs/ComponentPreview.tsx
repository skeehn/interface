'use client';

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
  Container, Grid, GridCell, Stack, Divider, Skeleton,
  AsciiChart, Sparkline, Meter, Heatmap,
  DitherPulse, Glitch, AsciiRain,
} from '@skeehn/react';

const PREVIEWS: Record<string, () => React.ReactNode> = {
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
      showLineNumbers
      copyable
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
      <CitationCard title="CSS Dither Patterns" url="https://example.com/dither">
        An overview of halftone dither techniques using modern CSS.
      </CitationCard>
      <CitationCard title="MDN: Gradients" url="https://developer.mozilla.org" variant="compact">
        Mozilla Developer Network reference.
      </CitationCard>
    </div>
  ),

  accordion: () => (
    <Accordion
      items={[
        { title: 'What is skeehn?', content: 'An ASCII/dither component library for building AI interfaces.', defaultOpen: true },
        { title: 'How do I install it?', content: 'Run npx skeehn add <component> to add individual components.' },
        { title: 'Does it support dark mode?', content: 'Yes, all components support light and dark themes out of the box.' },
      ]}
    />
  ),

  tabs: () => (
    <Tabs
      items={[
        { label: 'Preview', value: 'preview', content: <p>Live preview of the component appears here.</p> },
        { label: 'Code', value: 'code', content: <pre className="text-sm font-mono">{'<Button variant="dither">Click</Button>'}</pre> },
        { label: 'API', value: 'api', content: <p>Props table and usage docs.</p> },
      ]}
      defaultValue="preview"
    />
  ),

  tooltip: () => (
    <div className="flex gap-6 items-center py-8">
      <Tooltip content="Top tooltip">
        <Button variant="outline">Hover me (top)</Button>
      </Tooltip>
      <Tooltip content="Bottom tooltip" position="bottom">
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
      <StreamingText
        text="This text streams in character by character, simulating real-time AI output with a typewriter effect."
        effect="typewriter"
        speed={40}
      />
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
    <p className="text-muted-fg text-sm italic">
      Voice session requires microphone access. See the component docs for integration details.
    </p>
  ),

  markdown: () => (
    <p className="text-muted-fg text-sm italic">
      The Markdown component renders markdown strings as styled HTML. Import and pass content as a prop.
    </p>
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
      <Grid cols={3}>
        <GridCell><div className="p-4 border border-border rounded text-center text-sm">1</div></GridCell>
        <GridCell><div className="p-4 border border-border rounded text-center text-sm">2</div></GridCell>
        <GridCell><div className="p-4 border border-border rounded text-center text-sm">3</div></GridCell>
      </Grid>
      <Stack direction="row" gap="sm">
        <div className="p-3 border border-border rounded text-sm">Stack item</div>
        <div className="p-3 border border-border rounded text-sm">Stack item</div>
        <div className="p-3 border border-border rounded text-sm">Stack item</div>
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
      <Glitch intensity="medium">
        <span className="text-lg font-mono">GLITCH</span>
      </Glitch>
    </div>
  ),
};

export function ComponentPreview({ slug }: { slug: string }) {
  const render = PREVIEWS[slug];

  if (!render) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-fg text-sm italic border border-dashed border-border rounded-lg">
        Preview not yet available for this component.
      </div>
    );
  }

  return (
    <div className="p-6 border border-border rounded-lg bg-background">
      {render()}
    </div>
  );
}
