'use client';

/**
 * @module @skeehn/react/hooks — useChat
 *
 * Parts-based streaming chat (v2 contract). `messages` are structural
 * `UIMessage` (`../ai/types`) identical to the AI SDK v5 shape, so these
 * messages flow straight into `<Conversation>` / `<Message>` / `renderParts`.
 *
 * Supported streams: SSE frames (`data:` lines) with `[DONE]`, plain text,
 * OpenAI-compatible deltas, Anthropic `content_block_delta`, and generic
 * `text_delta` / `reasoning` / `tool_call` / `tool_result` JSON events.
 * Tool args arrive as JSON fragments → `input-streaming` until the payload
 * parses, then `input-available`.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type {
  DynamicToolUIPart,
  ReasoningUIPart,
  SourceDocumentUIPart,
  SourceUrlUIPart,
  ToolUIPart,
  UIMessage,
  UIMessagePart,
} from '../ai/types';

/** Chat lifecycle outside per-part state. */
export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';

/** A tool (typed or dynamic) with a resolvable approval lifecycle. */
export type AnyToolPart = ToolUIPart | DynamicToolUIPart;

/** Configuration for {@link useChat}. */
export interface UseChatOptions {
  /**
   * API endpoint accepting POST `{ messages, ...body }` returning an SSE
   * stream or streamed text.
   * @defaultValue `'/api/chat'`
   */
  api?: string;
  /** Seed the conversation with existing messages. */
  initialMessages?: UIMessage[];
  /** Extra JSON fields merged into every request body. */
  body?: Record<string, unknown>;
  /** Extra headers sent with every request. */
  headers?: Record<string, string>;
  /** Called when an assistant message stream finishes. */
  onFinish?: (message: UIMessage) => void;
  /** Called when a network or protocol error occurs. */
  onError?: (error: Error) => void;
  /** Called when a tool call arrives (including partial input). */
  onToolCall?: (part: AnyToolPart) => void;
  /**
   * Notifies the server when the user resolves a tool approval. Omit to use
   * the default: POST `{ type: 'tool-approval-response', toolCallId, approved }`
   * to `api`.
   */
  resolveApproval?: (p: {
    toolCallId: string;
    toolName: string;
    approved: boolean;
  }) => void | Promise<void>;
}

/** State and controls returned by {@link useChat}. */
export interface UseChatReturn {
  messages: UIMessage[];
  setMessages: React.Dispatch<React.SetStateAction<UIMessage[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  /** Send text (string or `{ text }`) and stream the assistant reply. */
  sendMessage: (text: { text: string } | string) => Promise<void>;
  /** Deprecated v2 alias of {@link sendMessage}. */
  append: (text: { text: string } | string) => Promise<void>;
  status: ChatStatus;
  /** Deprecated v2 — use `status`. True while submitting or streaming. */
  isLoading: boolean;
  error: Error | null;
  /** Re-send the last user message. */
  reload: () => Promise<void>;
  /** Abort the in-flight stream. */
  stop: () => void;
  /**
   * Resolve a tool approval request: flips the part to
   * `approval-approved` / `approval-denied`, then notifies the server via
   * `resolveApproval` (default POST).
   */
  submitApproval: (toolCallId: string, approved: boolean) => Promise<void>;
}

let _counter = 0;
function uid(): string {
  _counter += 1;
  return `msg_${Date.now().toString(36)}_${(_counter).toString(36)}`;
}

/* ── stream event parsing ────────────────────────────────────────────────── */

export type StreamEvent =
  | { done: true }
  | { textDelta: string }
  | { reasoningDelta: string }
  | { sourceUrl: SourceUrlUIPart }
  | { sourceDocument: SourceDocumentUIPart }
  | { tool: ToolDelta };

export interface ToolDelta {
  /** Tool call id — used to fold fragments into one part. */
  id: string;
  /** Tool name — set `requiresApproval` to hold execution for a human. */
  name?: string;
  /** Raw JSON argument fragment (streamed). */
  argsFragment?: string;
  /** Arguments complete — flip `input-streaming` → `input-available`. */
  argsDone?: boolean;
  /** Execution result (paired by `id`). */
  result?: unknown;
  /** Execution error text (paired by `id`). */
  errorText?: string;
  /** Server flags this call as requiring human approval. */
  requiresApproval?: boolean;
}

/** Parse one SSE frame body into a normalized stream event.
 *  (Necessary: cross-provider stream protocols intersect here — OpenAI deltas,
 *  Anthropic blocks, AI-SDK-style JSON, and raw text land in one parser.) */
export function parseSSE(raw: string): StreamEvent | null {
  const trimmed = raw.trim();
  if (trimmed === '[DONE]') return { done: true };
  if (trimmed === '') return null;

  let json: unknown;
  try {
    json = JSON.parse(trimmed);
  } catch {
    return { textDelta: trimmed };
  }

  const j = json as Record<string, any>;

  // OpenAI-compatible
  const delta = j.choices?.[0]?.delta;
  if (typeof delta?.content === 'string') return { textDelta: delta.content };
  if (Array.isArray(delta?.tool_calls) && delta.tool_calls[0]) {
    const tc = delta.tool_calls[0];
    return {
      tool: {
        id: tc.id ?? '',
        name: tc.function?.name,
        argsFragment: tc.function?.arguments,
      },
    };
  }
  if (j.type === 'content_block_delta' && typeof j.delta?.text === 'string') {
    if (j.delta.type === 'thinking') return { reasoningDelta: j.delta.text };
    return { textDelta: j.delta.text };
  }
  if (typeof delta?.reasoning === 'string') return { reasoningDelta: delta.reasoning };

  // Generic / AI-SDK-style
  if (j.type === 'text_delta' || j.type === 'text')
    return { textDelta: (j.text ?? j.value ?? '') as string };
  if (j.type === 'reasoning' || j.type === 'thinking')
    return { reasoningDelta: (j.text ?? j.reasoning ?? '') as string };
  if (j.type === 'source-url')
    return { sourceUrl: { type: 'source-url', url: j.url, title: j.title, sourceId: j.sourceId } };
  if (j.type === 'source-document')
    return {
      sourceDocument: {
        type: 'source-document',
        title: j.title,
        filename: j.filename,
        mediaType: j.mediaType,
        sourceId: j.sourceId,
      },
    };

  if (j.type === 'tool_call' || j.type === 'tool_calls') {
    const args = j.args ?? j.arguments ?? j.function?.arguments;
    return {
      tool: {
        id: j.tool_call_id ?? j.id ?? uid(),
        name: j.tool_name ?? j.name ?? j.function?.name,
        argsFragment: typeof args === 'string' ? args : JSON.stringify(args ?? {}),
        argsDone: j.complete !== false ? true : false,
        result: j.result ?? j.output,
        errorText: j.error ?? j.errorText,
        requiresApproval: j.requiresApproval === true || j.needsApproval === true ? true : undefined,
      },
    };
  }
  if (j.type === 'tool_result' || j.type === 'tool-output')
    return {
      tool: {
        id: j.tool_call_id ?? j.id ?? uid(),
        result: j.result ?? j.output,
        errorText: j.error ?? j.errorText,
      },
    };

  if (typeof j.content === 'string') return { textDelta: j.content };
  if (typeof j.text === 'string') return { textDelta: j.text };
  return { textDelta: trimmed };
}

/* ── message accumulator ─────────────────────────────────────────────────── */

/**
 * Folds normalized stream events onto one assistant `UIMessage`. Exported for
 * testability and for custom transport integrations.
 */
export class MessageAccumulator {
  message: {
    id?: string;
    role: 'assistant';
    parts: UIMessagePart[];
    metadata?: unknown;
  };
  private toolParts = new Map<string, AnyToolPart>();

  constructor(id?: string) {
    this.message = { id: id ?? uid(), role: 'assistant', parts: [] };
  }

  apply(event: StreamEvent, hooks?: { onTool?: (part: AnyToolPart) => void }): void {
    if ('textDelta' in event) {
      appendTextLike(this.message.parts, 'text', event.textDelta);
      return;
    }
    if ('reasoningDelta' in event) {
      appendTextLike(this.message.parts, 'reasoning', event.reasoningDelta);
      return;
    }
    if ('sourceUrl' in event) {
      this.message.parts.push(event.sourceUrl);
      return;
    }
    if ('sourceDocument' in event) {
      this.message.parts.push(event.sourceDocument);
      return;
    }
    if ('tool' in event) {
      const part = this.applyToolDelta(event.tool);
      hooks?.onTool?.(part);
    }
  }

  /** Fold a tool delta into the accumulator; returns the current part. */
  private applyToolDelta(d: ToolDelta): AnyToolPart {
    // id-less fragments (OpenAI streams args after naming the call) fold
    // onto the most recent undecided part.
    if (!d.id) {
      const last = [...this.toolParts.values()].findLast(
        (p) => p.state === 'input-streaming',
      );
      if (!last) return undefined as never as AnyToolPart;
      d = { ...d, id: (last.toolCallId ?? '') };
    }
    d = { ...d, id: d.id || uid() };

    let part: AnyToolPart =
      this.toolParts.get(d.id) ??
      (d.name
        ? { type: `tool-${d.name}`, toolCallId: d.id, state: 'input-streaming', input: '' }
        : { type: 'dynamic-tool', toolName: '', toolCallId: d.id, state: 'input-streaming', input: '' });
    if (d.name && part.type === 'dynamic-tool') {
      part = { ...part, type: `tool-${d.name}` } as ToolUIPart;
    }

    // 1. fold argument fragments
    if (typeof d.argsFragment === 'string' && d.argsFragment.length > 0) {
      const prev = typeof part.input === 'string' ? part.input : JSON.stringify(part.input ?? {});
      const combined = prev + d.argsFragment;
      if (isCompleteJSON(combined)) {
        part = { ...part, state: d.requiresApproval ? 'awaiting-approval' : 'input-available', input: JSON.parse(combined) };
      } else {
        part = { ...part, input: combined };
      }
    }

    // 2. frame-level completion of the argument stream
    if (d.argsDone && (part.state === 'input-streaming')) {
      part = {
        ...part,
        state: d.requiresApproval ? 'awaiting-approval' : 'input-available',
        input: typeof part.input === 'string' ? safePartialJSON(part.input) : part.input,
      };
    } else if (d.requiresApproval && part.state === 'input-available') {
      part = { ...part, state: 'awaiting-approval' };
    }

    // 3. execution outcome
    if (d.result !== undefined) {
      part = { ...part, state: 'output-available', output: d.result } as AnyToolPart;
    } else if (d.errorText !== undefined) {
      part = { ...part, state: 'output-error', errorText: d.errorText } as AnyToolPart;
    }

    this.toolParts.set(d.id, part);
    syncToolPart(this.message.parts, part);
    return part;
  }
}

function appendTextLike<T extends 'text' | 'reasoning'>(parts: UIMessagePart[], kind: T, delta: string): void {
  const last = parts[parts.length - 1];
  if (last && last.type === kind) {
    (last as { text: string }).text += delta;
    return;
  }
  parts.push({ type: kind, text: delta, state: 'streaming' } as UIMessagePart);
}

function syncToolPart(parts: UIMessagePart[], next: AnyToolPart): void {
  const idx = parts.findIndex(
    p =>
      (p.type.startsWith('tool-') || p.type === 'dynamic-tool') &&
      (p as AnyToolPart).toolCallId === next.toolCallId,
  );
  if (idx >= 0) parts[idx] = next;
  else parts.push(next);
}

/** True when `s` is parses as complete JSON. */
function isCompleteJSON(s: string): boolean {
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}

/** Best-effort salvage of a truncated JSON object for display. */
function safePartialJSON(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return { _partial: s };
  }
}

/**
 * Provider-agnostic, parts-based chat hook.
 *
 * ```tsx
 * const { messages, sendMessage, status, submitApproval } = useChat();
 * ```
 * Messages are structural `UIMessage` — render with `<Conversation>` or map
 * `m.parts` yourself. Tool parts that reach `awaiting-approval` carry request
 * semantics; call `submitApproval(toolCallId, boolean)` from a `<ToolApproval>`.
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    api = '/api/chat',
    initialMessages = [],
    body,
    headers,
    onFinish,
    onError,
    onToolCall,
    resolveApproval,
  } = options;

  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ChatStatus>('ready');
  const [error, setError] = useState<Error | null>(null);

  const messagesRef = useRef<UIMessage[]>(initialMessages);
  const applySet = useCallback((next: UIMessage[]) => {
    messagesRef.current = next;
    setMessages(next);
  }, []);

  const abortRef = useRef<AbortController | null>(null);
  const lastUserText = useRef<string | null>(null);
  const sendMessageRef = useRef<(arg: { text: string } | string) => Promise<void>>(async () => undefined);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      abortRef.current = null;
    },
    [],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('ready');
  }, []);

  const reload = useCallback(async (): Promise<void> => {
    if (lastUserText.current == null) return;
    await sendMessageRef.current(lastUserText.current);
  }, []);

  sendMessageRef.current = async (arg) => {
    const text = typeof arg === 'string' ? arg : (arg?.text ?? '');
    if (!text) return;
    lastUserText.current = text;

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setStatus('submitted');
    setError(null);

    const userMsg: UIMessage = { id: uid(), role: 'user', parts: [{ type: 'text', text }] };
    const assistant = new MessageAccumulator();

    try {
      const res = await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
        body: JSON.stringify({ messages: [...messagesRef.current, userMsg], ...body }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      setStatus('streaming');
      applySet([...messagesRef.current, userMsg, assistant.message]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (!line.startsWith('data:')) continue;
          const event = parseSSE(line.slice(5).trim());
          if (!event) continue;
          if ('done' in event) {
            finishStream(assistant);
            setStatus('ready');
            abortRef.current = null;
            onFinish?.(assistant.message);
            return;
          }
          assistant.apply(event, { onTool: onToolCall });
          applySet([...messagesRef.current.slice(0, -1), assistant.message]);
        }
      }
      finishStream(assistant);
      setStatus('ready');
      onFinish?.(assistant.message);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      if (e.name === 'AbortError') {
        applySet([...messagesRef.current.slice(0, -1), finalizeRecord(assistant.message)]);
        setStatus('ready');
        return;
      }
      setError(e);
      setStatus('error');
      onError?.(e);
    } finally {
      abortRef.current = null;
    }
  };

  const sendMessage = useCallback(
    (arg: { text: string } | string) => sendMessageRef.current(arg),
    [],
  );

  const submitApproval = useCallback(
    async (toolCallId: string, approved: boolean) => {
      const current = messagesRef.current;
      const idxMsg = current.findIndex((m) =>
        m.parts.some((p) => isTool(p) && p.toolCallId === toolCallId),
      );
      if (idxMsg < 0) return;
      const msg = current[idxMsg];
      const nextMsg: UIMessage = {
        ...msg,
        parts: msg.parts.map((p) => {
          if (!isTool(p) || p.toolCallId !== toolCallId) return p;
          const t = p as AnyToolPart;
          return {
            ...t,
            state: (approved ? 'approval-approved' : 'approval-denied') as ToolPartState,
            input: typeof t.input === 'string' ? safePartialJSON(t.input) : t.input,
          };
        }),
      };
      applySet(current.map((m, i) => (i === idxMsg ? nextMsg : m)));

      const toolPart = msg.parts.find(isTool) as AnyToolPart | undefined;
      const toolName =
        toolPart?.type === 'dynamic-tool' ? (toolPart as DynamicToolUIPart).toolName : (toolPart?.type as string).slice(5);
      if (resolveApproval) {
        await resolveApproval({ toolCallId, toolName: toolName ?? 'tool', approved });
      } else {
        void fetch(api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
          body: JSON.stringify({ type: 'tool-approval-response', toolCallId, approved, ...body }),
        }).catch(() => undefined);
      }
    },
    [applySet, api, body, headers, resolveApproval],
  );

  return {
    messages,
    setMessages,
    input,
    setInput,
    sendMessage,
    append: sendMessage,
    status,
    isLoading: status === 'submitted' || status === 'streaming',
    error,
    reload,
    stop,
    submitApproval,
  };
}

function isTool(p: UIMessagePart): p is UIMessagePart & { type: string; toolCallId: string } {
  return (p.type.startsWith('tool-') || p.type === 'dynamic-tool') && 'toolCallId' in p;
}

/** Freeze in-flight parts once a stream ends. Mutates the given message. */
export function finalizeMessage(msg: UIMessage): UIMessage {
  for (const p of msg.parts) {
    if ((p.type === 'text' || p.type === 'reasoning') && p.state === 'streaming') p.state = 'done';
    if (isTool(p)) {
      const t = p as AnyToolPart;
      if (t.state === 'input-streaming') {
        t.state = 'input-available';
        if (typeof t.input === 'string') t.input = safePartialJSON(t.input);
      }
    }
  }
  return msg;
}

function finishStream(assistant: MessageAccumulator): void {
  finalizeMessage(assistant.message);
}

function finalizeRecord(msg: UIMessage): UIMessage {
  return finalizeMessage({ ...msg, parts: msg.parts.map((p) => ({ ...(p as object) } as UIMessagePart)) });
}

// `ToolPartState` widened in ../ai/types for the approval lifecycle.
type ToolPartState = import('../ai/types').ToolPartState;
