/**
 * @module @skeehn/react/ai — renderParts
 *
 * Maps an AI SDK v5 `UIMessage.parts[]` array onto skeehn components:
 *
 *   text          → ChatBubble (+ optional markdown renderer)
 *   reasoning     → ThinkingBlock
 *   tool-* / dynamic-tool → ToolCard (input / output / error)
 *   source-url / source-document → CitationCard
 *   file          → <img> (images) or FileAttachment
 *   step-start    → Divider (between steps)
 *   data-*        → your renderData() (no default)
 */
import type { ReactNode } from 'react';
import { ChatBubble } from '../components/ChatBubble';
import { Markdown } from '../components/Markdown';
import { ThinkingBlock } from '../components/ThinkingBlock';
import { ToolCard, type ToolCardStatus } from '../components/ToolCard';
import { ToolApproval } from '../components/ToolApproval';
import { CitationCard } from '../components/CitationCard';
import { FileAttachment } from '../components/FileAttachment';
import { Divider } from '../components/Layout';
import type {
  RenderPartsOptions,
  TextUIPart,
  UIMessage,
  UIMessagePart,
  PartContext,
  ToolPartState,
} from './types';

/** AI SDK tool state → skeehn ToolCard status. */
function toolStatus(state: ToolPartState | undefined): ToolCardStatus {
  switch (state) {
    case 'output-available':
      return 'success';
    case 'output-error':
      return 'error';
    case 'input-streaming':
    case 'input-available':
      return 'running';
    default:
      return 'pending';
  }
}

/** Pretty-print a tool input/output value. */
function stringify(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/** Hostname for a URL, falling back to the raw string. */
function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Render a single `UIMessage` part. Returns `null` for parts with no visual
 * representation (e.g. an unknown future type, or `data-*` without a renderer).
 */
export function renderPart(
  part: UIMessagePart,
  index: number,
  options: RenderPartsOptions,
): ReactNode {
  const { role, components, renderMarkdown, renderData } = options;
  const ctx: PartContext = { role, index };
  const type = part.type;

  // ── text ──────────────────────────────────────────────────────────────
  if (type === 'text') {
    const p = part as Extract<UIMessagePart, { type: 'text' }>;
    if (components?.text) return components.text(p, ctx);
    const streaming = p.state === 'streaming';
    const body = renderMarkdown ? renderMarkdown(p.text) : p.text;
    return (
      <ChatBubble role={role} streaming={streaming}>
        {role === 'assistant' ? <Markdown>{body}</Markdown> : body}
      </ChatBubble>
    );
  }

  // ── reasoning ─────────────────────────────────────────────────────────
  if (type === 'reasoning') {
    const p = part as Extract<UIMessagePart, { type: 'reasoning' }>;
    if (components?.reasoning) return components.reasoning(p, ctx);
    const streaming = p.state === 'streaming';
    return (
      <ThinkingBlock
        state={streaming ? 'thinking' : 'done'}
        label={streaming ? 'Reasoning…' : 'Reasoned'}
        defaultExpanded={streaming}
      >
        {renderMarkdown ? renderMarkdown(p.text) : p.text}
      </ThinkingBlock>
    );
  }

  // ── tool calls (tool-${name} or dynamic-tool) ──────────────────────────
  if (type === 'dynamic-tool' || type.startsWith('tool-')) {
    const p = part as {
      type: string;
      toolName?: string;
      toolCallId?: string;
      state?: ToolPartState;
      input?: unknown;
      output?: unknown;
      errorText?: string;
    };
    if (components?.tool) return components.tool(p as never, ctx);
    const name = type === 'dynamic-tool' ? p.toolName ?? 'tool' : type.slice('tool-'.length);
    const status = toolStatus(p.state);
    // Human-in-the-loop: server-flagged or stopped-for-approval calls resolve
    // via ToolApproval (reads ToolApprovalProvider context), not a run card.
    if (p.state === 'awaiting-approval' || p.state === 'approval-approved' || p.state === 'approval-denied') {
      return (
        <ToolApproval
          toolCallId={p.toolCallId ?? name}
          toolName={name}
          input={p.input}
          state={p.state}
        />
      );
    }
    return (
      <ToolCard name={name} status={status}>
        {p.input != null && (
          <pre className="sk-ai-tool-io" data-io="input">{stringify(p.input)}</pre>
        )}
        {p.state === 'output-available' && p.output != null && (
          <pre className="sk-ai-tool-io" data-io="output">{stringify(p.output)}</pre>
        )}
        {p.state === 'output-error' && p.errorText && (
          <div className="sk-ai-tool-error" role="alert">{p.errorText}</div>
        )}
      </ToolCard>
    );
  }

  // ── sources ────────────────────────────────────────────────────────────
  if (type === 'source-url') {
    const p = part as Extract<UIMessagePart, { type: 'source-url' }>;
    if (components?.source) return components.source(p, ctx);
    return (
      <CitationCard variant="compact" source={p.title ?? hostname(p.url)} href={p.url} />
    );
  }
  if (type === 'source-document') {
    const p = part as Extract<UIMessagePart, { type: 'source-document' }>;
    if (components?.source) return components.source(p, ctx);
    return (
      <CitationCard
        variant="compact"
        source={p.title}
        meta={p.mediaType ? [p.mediaType] : undefined}
      />
    );
  }

  // ── files (images inline, everything else as an attachment) ────────────
  if (type === 'file') {
    const p = part as Extract<UIMessagePart, { type: 'file' }>;
    if (components?.file) return components.file(p, ctx);
    if (p.mediaType?.startsWith('image/')) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img className="sk-ai-image" src={p.url} alt={p.filename ?? ''} />;
    }
    return <FileAttachment name={p.filename ?? hostname(p.url)} state="done" />;
  }

  // ── step boundary ──────────────────────────────────────────────────────
  if (type === 'step-start') {
    return index === 0 ? null : <Divider className="sk-ai-step" />;
  }

  // ── custom data parts ──────────────────────────────────────────────────
  if (type.startsWith('data-')) {
    return renderData ? renderData(part as never, ctx) : null;
  }

  // Unknown / future part type → render nothing rather than crash.
  return null;
}

/** Render every part of a message, keyed by index. */
export function renderParts(
  parts: ReadonlyArray<UIMessagePart>,
  options: RenderPartsOptions,
): ReactNode[] {
  return parts.map((part, i) => {
    const node = renderPart(part, i, options);
    return node == null ? null : <div key={i} className="sk-ai-part" data-part={part.type}>{node}</div>;
  });
}

/** Flatten a message's text/reasoning parts to one plain-text string. */
export function messageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is TextUIPart => p.type === 'text')
    .map((p) => p.text)
    .join('');
}
