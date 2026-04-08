const EXAMPLES: Record<string, string> = {
  button: `import { Button } from '@skeehn/react';

export function MyComponent() {
  return (
    <div className="flex gap-3">
      <Button variant="solid">Solid</Button>
      <Button variant="dither">Dither</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="pixel">Pixel</Button>
      <Button variant="dither" loading>Loading</Button>
    </div>
  );
}`,

  card: `import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@skeehn/react';

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Update</CardTitle>
      </CardHeader>
      <CardBody>
        <p>The dither surface adds a textured aesthetic.</p>
      </CardBody>
      <CardFooter>
        <Button variant="outline" size="sm">View Details</Button>
      </CardFooter>
    </Card>
  );
}`,

  badge: `import { Badge } from '@skeehn/react';

export function StatusBadges() {
  return (
    <div className="flex gap-2">
      <Badge variant="dither">Default</Badge>
      <Badge color="success">Active</Badge>
      <Badge color="warning">Pending</Badge>
      <Badge color="destructive">Error</Badge>
      <Badge color="success" pulsing>Live</Badge>
    </div>
  );
}`,

  input: `import { Input, InputGroup } from '@skeehn/react';

export function LoginForm() {
  return (
    <form className="flex flex-col gap-4">
      <InputGroup label="Email" hint="We'll never share your email">
        <Input type="email" placeholder="you@example.com" dither />
      </InputGroup>
      <InputGroup label="Password">
        <Input type="password" placeholder="Enter password" />
      </InputGroup>
    </form>
  );
}`,

  'chat-bubble': `import { ChatBubble } from '@skeehn/react';

export function ChatThread() {
  return (
    <div className="flex flex-col gap-3">
      <ChatBubble role="user">
        How do I set up dither rendering?
      </ChatBubble>
      <ChatBubble role="assistant">
        You can use the CSS dither engine included in skeehn...
      </ChatBubble>
      <ChatBubble role="assistant" streaming>
        Let me search for more details...
      </ChatBubble>
    </div>
  );
}`,

  'thinking-block': `import { ThinkingBlock } from '@skeehn/react';

export function AIThinking() {
  return (
    <ThinkingBlock
      state="thinking"
      label="Thinking..."
      meta="2.1s"
    >
      Analyzing the code structure and identifying potential
      performance improvements in the render pipeline...
    </ThinkingBlock>
  );
}`,

  'reasoning-step': `import { ReasoningStep } from '@skeehn/react';

export function ReasoningTrace() {
  return (
    <div className="flex flex-col gap-2">
      <ReasoningStep status="completed" title="Parse input">
        Identified 3 key entities in the query.
      </ReasoningStep>
      <ReasoningStep status="active" title="Generate plan">
        Creating execution strategy...
      </ReasoningStep>
      <ReasoningStep status="pending" title="Execute">
        Waiting for plan completion.
      </ReasoningStep>
    </div>
  );
}`,

  'agent-status': `import { AgentStatus } from '@skeehn/react';

export function AgentHeader() {
  return (
    <div className="flex items-center gap-4">
      <h2>Claude Agent</h2>
      <AgentStatus status="thinking" label="Analyzing code..." />
    </div>
  );
}`,

  progress: `import { Progress } from '@skeehn/react';

export function UploadProgress() {
  return (
    <div className="flex flex-col gap-4">
      <Progress value={75} label="75%" />
      <Progress value={50} variant="dither" label="50%" />
      <Progress state="loading" label="Processing..." />
    </div>
  );
}`,

  'typing-indicator': `import { TypingIndicator } from '@skeehn/react';

export function ChatFooter() {
  return (
    <div className="flex items-center gap-2">
      <TypingIndicator variant="dither" text="AI is typing..." />
    </div>
  );
}`,

  'prompt-suggestions': `import { PromptSuggestions } from '@skeehn/react';

export function EmptyChat() {
  return (
    <PromptSuggestions
      label="How can I help you?"
      suggestions={[
        { value: 'explain', text: 'Explain a concept', icon: '?' },
        { value: 'build', text: 'Build something', icon: '>' },
        { value: 'debug', text: 'Debug an issue', icon: '!' },
        { value: 'review', text: 'Review code', icon: '#' },
      ]}
      onSelect={(value) => console.log(value)}
    />
  );
}`,

  alert: `import { Alert } from '@skeehn/react';

export function Alerts() {
  return (
    <div className="flex flex-col gap-3">
      <Alert type="info">Check out the new features.</Alert>
      <Alert type="success">Changes saved successfully.</Alert>
      <Alert type="warning">Disk space running low.</Alert>
      <Alert type="destructive">Failed to save changes.</Alert>
    </div>
  );
}`,

  dialog: `import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '@skeehn/react';
import { Button } from '@skeehn/react';
import { useState } from 'react';

export function ConfirmDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogContent>
          <DialogHeader>Confirm Action</DialogHeader>
          <DialogBody>Are you sure you want to proceed?</DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="solid" onClick={() => setOpen(false)}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}`,

  tabs: `import { Tabs } from '@skeehn/react';

export function ContentTabs() {
  return (
    <Tabs
      items={[
        { label: 'Preview', value: 'preview', content: <p>Live preview</p> },
        { label: 'Code', value: 'code', content: <pre>Code here</pre> },
      ]}
      defaultValue="preview"
    />
  );
}`,

  toggle: `import { Toggle } from '@skeehn/react';

export function Settings() {
  return (
    <label className="flex items-center gap-3">
      <Toggle defaultChecked />
      <span>Enable notifications</span>
    </label>
  );
}`,

  avatar: `import { Avatar } from '@skeehn/react';

export function UserList() {
  return (
    <div className="flex gap-2">
      <Avatar fallback="SK" size="sm" />
      <Avatar fallback="AI" size="md" />
      <Avatar src="/photo.jpg" alt="User" size="lg" />
    </div>
  );
}`,

  tooltip: `import { Tooltip } from '@skeehn/react';

export function Actions() {
  return (
    <Tooltip content="Save your changes">
      <button>Save</button>
    </Tooltip>
  );
}`,

  dropdown: `import { Dropdown } from '@skeehn/react';

export function FileMenu() {
  return (
    <Dropdown
      trigger={<button>File</button>}
      items={[
        { label: 'New', value: 'new' },
        { label: 'Open', value: 'open' },
        { label: 'Save', value: 'save' },
      ]}
    />
  );
}`,

  table: `import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@skeehn/react';

export function DataTable() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Button</TableCell>
          <TableCell>Stable</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}`,

  accordion: `import { Accordion } from '@skeehn/react';

export function FAQ() {
  return (
    <Accordion
      items={[
        { title: 'What is skeehn?', content: 'An ASCII/dither UI library.' },
        { title: 'Is it free?', content: 'Yes, MIT licensed.' },
      ]}
    />
  );
}`,

  'code-block': `import { CodeBlock } from '@skeehn/react';

export function Example() {
  return (
    <CodeBlock
      code="const x = 42;"
      language="javascript"
      showLineNumbers
      copyable
    />
  );
}`,

  'tool-card': `import { ToolCard } from '@skeehn/react';

export function ToolResult() {
  return (
    <ToolCard name="search_docs" status="success">
      Found 3 matching documents.
    </ToolCard>
  );
}`,

  'citation-card': `import { CitationCard } from '@skeehn/react';

export function Sources() {
  return (
    <CitationCard
      title="CSS Dither Patterns"
      url="https://example.com/dither"
    >
      A guide to halftone CSS techniques.
    </CitationCard>
  );
}`,

  'streaming-text': `import { StreamingText } from '@skeehn/react';

export function AIOutput() {
  return (
    <StreamingText
      text="This text streams in character by character."
      effect="typewriter"
      speed={40}
    />
  );
}`,

  'terminal-panel': `import { TerminalPanel } from '@skeehn/react';

export function Terminal() {
  return (
    <TerminalPanel title="shell">
      <pre>$ npm run build\\n> Build complete</pre>
    </TerminalPanel>
  );
}`,

  'voice-session': `import { VoiceSession } from '@skeehn/react';

export function Voice() {
  return (
    <VoiceSession
      status="idle"
      transcript={[]}
      onStart={() => {}}
      onStop={() => {}}
    />
  );
}`,

  markdown: `import { Markdown } from '@skeehn/react';

export function Content() {
  return (
    <Markdown content="# Hello\\n\\nThis is **markdown** content." />
  );
}`,

  'chat-input': `import { ChatInput } from '@skeehn/react';

export function PromptBar() {
  return (
    <ChatInput
      placeholder="Ask me anything..."
      onSubmit={(value) => console.log(value)}
    />
  );
}`,

  'file-attachment': `import { FileAttachment, FileAttachments } from '@skeehn/react';

export function Attachments() {
  return (
    <FileAttachments>
      <FileAttachment name="report.pdf" size="2.4 MB" state="done" />
      <FileAttachment name="data.csv" size="800 KB" state="uploading" progress={65} />
    </FileAttachments>
  );
}`,

  layout: `import { Container, Grid, GridCell, Stack, Divider, Skeleton } from '@skeehn/react';

export function PageLayout() {
  return (
    <Container size="lg">
      <Grid cols={3}>
        <GridCell>Column 1</GridCell>
        <GridCell>Column 2</GridCell>
        <GridCell>Column 3</GridCell>
      </Grid>
      <Divider />
      <Stack direction="row" gap="md">
        <Skeleton shape="circle" style={{ width: 40, height: 40 }} />
        <Skeleton style={{ height: 16, width: '60%' }} />
      </Stack>
    </Container>
  );
}`,

  dataviz: `import { Sparkline, Meter, Heatmap } from '@skeehn/react';

export function Dashboard() {
  return (
    <>
      <Sparkline data={[2, 5, 3, 8, 4, 7, 6, 9]} />
      <Meter value={72} />
    </>
  );
}`,

  motion: `import { DitherPulse, Glitch, AsciiRain } from '@skeehn/react';

export function Effects() {
  return (
    <>
      <DitherPulse effect="pulse" style={{ width: 100, height: 100 }} />
      <Glitch intensity="medium">
        <span>Glitch Text</span>
      </Glitch>
    </>
  );
}`,
};

export function getCodeExample(slug: string): string {
  return EXAMPLES[slug] ?? `import { /* Component */ } from '@skeehn/react';\n\n// Usage example coming soon.`;
}
