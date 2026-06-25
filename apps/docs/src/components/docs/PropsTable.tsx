export interface PropDef {
  attr: string;
  type: string;
  default: string;
  description: string;
}

const PROPS: Record<string, PropDef[]> = {
  button: [
    { attr: 'variant', type: "'solid' | 'dither' | 'outline' | 'ghost' | 'inverted' | 'ascii' | 'pixel'", default: '—', description: 'Visual style variant' },
    { attr: 'size', type: "'sm' | 'lg' | 'xl'", default: '—', description: 'Size preset' },
    { attr: 'loading', type: 'boolean', default: 'false', description: 'Show loading animation and disable interaction' },
    { attr: 'disabled', type: 'boolean', default: 'false', description: 'Disable interaction' },
    { attr: 'className', type: 'string', default: '—', description: 'Additional CSS class names' },
  ],
  card: [
    { attr: 'variant', type: "'solid' | 'dither' | 'outline' | 'ghost' | 'inverted' | 'pixel'", default: '—', description: 'Visual variant of the card surface' },
    { attr: 'className', type: 'string', default: '—', description: 'Additional CSS class names' },
  ],
  input: [
    { attr: 'dither', type: 'boolean', default: 'false', description: 'Apply dither pattern on focus' },
    { attr: 'state', type: "'error'", default: '—', description: 'Validation state' },
    { attr: 'className', type: 'string', default: '—', description: 'Additional CSS class names' },
  ],
  badge: [
    { attr: 'variant', type: "'solid' | 'dither' | 'outline' | 'ghost' | 'inverted' | 'pixel'", default: '—', description: 'Visual variant' },
    { attr: 'color', type: "'success' | 'warning' | 'destructive' | 'info'", default: '—', description: 'Semantic color override' },
    { attr: 'pulsing', type: 'boolean', default: 'false', description: 'Animate with a pulsing effect' },
  ],
  alert: [
    { attr: 'type', type: "'info' | 'success' | 'warning' | 'destructive'", default: "'info'", description: 'Alert semantic type' },
    { attr: 'variant', type: "'solid' | 'dither' | 'outline'", default: '—', description: 'Visual variant' },
  ],
  dialog: [
    { attr: 'open', type: 'boolean', default: 'false', description: 'Whether the dialog is visible' },
    { attr: 'onClose', type: '() => void', default: '—', description: 'Close callback' },
    { attr: 'variant', type: "'dither' | 'outline'", default: '—', description: 'Visual variant' },
  ],
  tabs: [
    { attr: 'items', type: 'TabItem[]', default: '[]', description: 'Array of tab definitions with label, value, and content' },
    { attr: 'defaultValue', type: 'string', default: '—', description: 'Initially active tab value' },
  ],
  toggle: [
    { attr: 'checked', type: 'boolean', default: 'false', description: 'Controlled checked state' },
    { attr: 'defaultChecked', type: 'boolean', default: 'false', description: 'Initial checked state' },
    { attr: 'onCheckedChange', type: '(checked: boolean) => void', default: '—', description: 'Callback when toggle state changes' },
  ],
  progress: [
    { attr: 'value', type: 'number', default: '0', description: 'Current value (0-100)' },
    { attr: 'max', type: 'number', default: '100', description: 'Maximum value' },
    { attr: 'variant', type: "'dither'", default: '—', description: 'Visual variant with dither fill' },
    { attr: 'state', type: "'loading'", default: '—', description: 'State that controls animations (indeterminate)' },
    { attr: 'label', type: 'string', default: '—', description: 'Label text displayed to the right' },
  ],
  avatar: [
    { attr: 'src', type: 'string', default: '—', description: 'Image source URL' },
    { attr: 'alt', type: 'string', default: '—', description: 'Alt text for the image' },
    { attr: 'fallback', type: 'string', default: '—', description: 'Fallback initials when image fails' },
    { attr: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Avatar size' },
  ],
  tooltip: [
    { attr: 'content', type: 'string', default: '—', description: 'Tooltip text content' },
    { attr: 'position', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", description: 'Tooltip position' },
  ],
  dropdown: [
    { attr: 'items', type: 'DropdownItem[]', default: '[]', description: 'Menu items array' },
    { attr: 'trigger', type: 'ReactNode', default: '—', description: 'Trigger element' },
  ],
  table: [
    { attr: 'className', type: 'string', default: '—', description: 'Additional CSS class names' },
  ],
  accordion: [
    { attr: 'items', type: 'AccordionItem[]', default: '[]', description: 'Array of sections with title, content, and optional defaultOpen' },
  ],
  'chat-bubble': [
    { attr: 'role', type: "'user' | 'assistant' | 'tool' | 'system'", default: '—', description: 'Message author role (required)' },
    { attr: 'streaming', type: 'boolean', default: 'false', description: 'Whether the message is currently streaming' },
  ],
  'chat-input': [
    { attr: 'placeholder', type: 'string', default: '—', description: 'Placeholder text' },
    { attr: 'state', type: "'idle' | 'streaming' | 'disabled'", default: "'idle'", description: 'Input state' },
    { attr: 'variant', type: "'default' | 'minimal'", default: "'default'", description: 'Visual variant' },
    { attr: 'onSubmit', type: '(value: string) => void', default: '—', description: 'Submit callback' },
  ],
  'reasoning-step': [
    { attr: 'status', type: "'pending' | 'active' | 'completed' | 'error'", default: '—', description: 'Current status (required)' },
    { attr: 'title', type: 'string', default: '—', description: 'Title text (required)' },
    { attr: 'defaultExpanded', type: 'boolean', default: 'false', description: 'Whether expanded by default' },
  ],
  'tool-card': [
    { attr: 'name', type: 'string', default: '—', description: 'Tool name displayed in header' },
    { attr: 'status', type: "'running' | 'success' | 'error'", default: '—', description: 'Execution status' },
  ],
  'citation-card': [
    { attr: 'title', type: 'string', default: '—', description: 'Citation title' },
    { attr: 'url', type: 'string', default: '—', description: 'Source URL' },
    { attr: 'variant', type: "'default' | 'compact'", default: "'default'", description: 'Visual variant' },
  ],
  'streaming-text': [
    { attr: 'text', type: 'string', default: '—', description: 'Text content to stream' },
    { attr: 'effect', type: "'typewriter' | 'fade' | 'reveal'", default: "'typewriter'", description: 'Streaming animation effect' },
    { attr: 'speed', type: 'number', default: '30', description: 'Characters per second' },
  ],
  'terminal-panel': [
    { attr: 'title', type: 'string', default: '—', description: 'Terminal window title' },
    { attr: 'theme', type: "'dark' | 'light'", default: "'dark'", description: 'Color theme' },
  ],
  'agent-status': [
    { attr: 'status', type: "'idle' | 'thinking' | 'acting' | 'done' | 'error'", default: '—', description: 'Current agent status (required)' },
    { attr: 'label', type: 'string', default: 'status name', description: 'Override label text' },
  ],
  layout: [
    { attr: 'Container: size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'lg'", description: 'Container max-width' },
    { attr: 'Grid: cols', type: "1 | 2 | 3 | 4 | 6 | 12", default: '—', description: 'Number of columns' },
    { attr: 'Stack: direction', type: "'row' | 'column'", default: "'column'", description: 'Stack direction' },
    { attr: 'Stack: gap', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Gap between items' },
  ],
  dataviz: [
    { attr: 'AsciiChart: data', type: 'AsciiChartDataPoint[]', default: '[]', description: 'Array of {x, y} data points' },
    { attr: 'Sparkline: data', type: 'number[]', default: '[]', description: 'Array of numeric values' },
    { attr: 'Meter: value', type: 'number', default: '0', description: 'Current value (0-100)' },
    { attr: 'Heatmap: data', type: 'number[][]', default: '[]', description: '2D numeric data grid' },
  ],
  motion: [
    { attr: 'DitherPulse: effect', type: "'pulse' | 'breathe' | 'wave'", default: "'pulse'", description: 'Animation effect type' },
    { attr: 'Glitch: intensity', type: "'low' | 'medium' | 'high'", default: "'medium'", description: 'Glitch intensity level' },
    { attr: 'AsciiRain: density', type: "'sparse' | 'normal' | 'dense'", default: "'normal'", description: 'Character density' },
  ],
  'code-block': [
    { attr: 'code', type: 'string', default: '—', description: 'Code content to display' },
    { attr: 'language', type: 'string', default: '—', description: 'Programming language for syntax hints' },
    { attr: 'showLineNumbers', type: 'boolean', default: 'false', description: 'Show line numbers' },
    { attr: 'copyable', type: 'boolean', default: 'true', description: 'Show copy button' },
  ],
  'typing-indicator': [
    { attr: 'variant', type: "'ascii' | 'dither'", default: '—', description: 'Visual variant' },
    { attr: 'size', type: "'compact'", default: '—', description: 'Size preset' },
    { attr: 'text', type: 'string', default: '—', description: 'Optional text label (e.g. "typing...")' },
  ],
  markdown: [
    { attr: 'content', type: 'string', default: '—', description: 'Markdown content string' },
  ],
  'voice-session': [
    { attr: 'status', type: "'idle' | 'connecting' | 'active' | 'error'", default: "'idle'", description: 'Session connection state' },
    { attr: 'transcript', type: 'VoiceTranscriptTurn[]', default: '[]', description: 'Conversation transcript entries' },
  ],
  'thinking-block': [
    { attr: 'state', type: "'thinking' | 'done' | 'error'", default: "'thinking'", description: 'Current thinking state' },
    { attr: 'label', type: 'string', default: "'Thinking...'", description: 'Header label text' },
    { attr: 'meta', type: 'string', default: '—', description: 'Metadata string (e.g. duration)' },
    { attr: 'expanded', type: 'boolean', default: '—', description: 'Controlled expanded state' },
    { attr: 'defaultExpanded', type: 'boolean', default: 'auto', description: 'Default expanded state' },
    { attr: 'onExpandedChange', type: '(expanded: boolean) => void', default: '—', description: 'Expanded state change callback' },
  ],
  'prompt-suggestions': [
    { attr: 'suggestions', type: 'PromptSuggestionItem[]', default: '—', description: 'Array of suggestion items (required)' },
    { attr: 'label', type: 'string', default: '—', description: 'Label text above the grid' },
    { attr: 'variant', type: "'chips'", default: '—', description: 'Visual variant' },
    { attr: 'onSelect', type: '(value: string) => void', default: '—', description: 'Selection callback' },
  ],
  'file-attachment': [
    { attr: 'name', type: 'string', default: '—', description: 'File name displayed' },
    { attr: 'size', type: 'string', default: '—', description: 'Human-readable file size' },
    { attr: 'state', type: "'uploading' | 'done' | 'error'", default: "'done'", description: 'Upload state' },
    { attr: 'progress', type: 'number', default: '—', description: 'Upload progress (0-100)' },
    { attr: 'onRemove', type: '() => void', default: '—', description: 'Remove callback' },
  ],
};

export function getProps(slug: string): PropDef[] {
  return PROPS[slug] ?? [];
}

export function PropsTable({ slug }: { slug: string }) {
  const props = getProps(slug);

  if (props.length === 0) {
    return (
      <p className="text-muted-fg text-sm italic">
        No documented props for this component yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="py-3 px-4 text-left text-xs uppercase tracking-wider text-muted-fg font-mono font-normal">
              Prop
            </th>
            <th className="py-3 px-4 text-left text-xs uppercase tracking-wider text-muted-fg font-mono font-normal">
              Type
            </th>
            <th className="py-3 px-4 text-left text-xs uppercase tracking-wider text-muted-fg font-mono font-normal">
              Default
            </th>
            <th className="py-3 px-4 text-left text-xs uppercase tracking-wider text-muted-fg font-mono font-normal">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.attr} className="border-b border-border last:border-0">
              <td className="py-3 px-4 font-mono text-sm text-foreground whitespace-nowrap">
                {p.attr}
              </td>
              <td className="py-3 px-4 font-mono text-sm text-accent whitespace-nowrap max-w-72 overflow-hidden text-ellipsis">
                {p.type}
              </td>
              <td className="py-3 px-4 font-mono text-sm text-[hsl(var(--sk-warning))] whitespace-nowrap">
                {p.default}
              </td>
              <td className="py-3 px-4 text-sm text-foreground">
                {p.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
