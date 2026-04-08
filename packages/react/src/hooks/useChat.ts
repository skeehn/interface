import { useState, useRef, useCallback, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single tool invocation attached to an assistant message. */
export interface ToolInvocation {
  /** Tool call identifier returned by the model. */
  toolCallId: string;
  /** Name of the tool that was invoked. */
  toolName: string;
  /** Arguments passed to the tool (parsed JSON). */
  args: Record<string, unknown>;
  /** Tool result, populated once execution completes. */
  result?: unknown;
  /** Current lifecycle state of the invocation. */
  state: 'partial-call' | 'call' | 'result';
}

/** A chat message. */
export interface Message {
  /** Unique identifier (nanoid-style, generated client-side). */
  id: string;
  /** Message author. */
  role: 'user' | 'assistant' | 'system' | 'tool';
  /** Textual content of the message. */
  content: string;
  /** Optional tool invocations associated with the message. */
  toolInvocations?: ToolInvocation[];
  /** Optional chain-of-thought / reasoning text. */
  reasoning?: string;
  /** Timestamp when the message was created. */
  createdAt: Date;
}

/** Configuration accepted by {@link useChat}. */
export interface UseChatOptions {
  /**
   * API endpoint that accepts a POST with `{ messages, ...body }` and returns
   * an SSE stream (`text/event-stream`) or a plain text stream.
   *
   * @defaultValue `'/api/chat'`
   */
  api?: string;
  /** Seed the conversation with existing messages. */
  initialMessages?: Message[];
  /** Extra JSON fields merged into every request body. */
  body?: Record<string, unknown>;
  /** Extra headers sent with every request. */
  headers?: Record<string, string>;
  /** Called when the assistant message stream finishes. */
  onFinish?: (message: Message) => void;
  /** Called when a network or parsing error occurs. */
  onError?: (error: Error) => void;
  /** Called when a tool-call event is parsed from the stream. */
  onToolCall?: (toolCall: ToolInvocation) => void;
}

/** Return value of {@link useChat}. */
export interface UseChatReturn {
  /** Full ordered list of messages in the conversation. */
  messages: Message[];
  /** Replace the message list imperatively. */
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  /** Current value of the text input. */
  input: string;
  /** Controlled setter for the text input. */
  setInput: React.Dispatch<React.SetStateAction<string>>;
  /**
   * Append a message and trigger a completion request.
   * If the message role is `'user'` (or omitted), it is added to the list and
   * a stream is opened against the API.
   */
  append: (message: Omit<Message, 'id' | 'createdAt'> | string) => Promise<void>;
  /** `true` while a stream is in-flight. */
  isLoading: boolean;
  /** The most recent error, or `null`. */
  error: Error | null;
  /** Re-send the last user message (useful for retry flows). */
  reload: () => Promise<void>;
  /** Abort the current stream. */
  stop: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _counter = 0;
/** Lightweight unique-id generator (no external deps). */
function uid(): string {
  _counter += 1;
  return `msg_${Date.now().toString(36)}_${(_counter).toString(36)}`;
}

/**
 * Parse a single SSE frame's `data:` value.
 *
 * Handles the common AI streaming conventions:
 * - `data: [DONE]`           -> signals stream end
 * - `data: {"type":"text_delta", ...}` -> text chunk
 * - `data: {"type":"tool_call", ...}`  -> tool invocation
 * - plain text                -> appended verbatim
 */
function parseSSEValue(
  raw: string,
): { done: true } | { text: string } | { toolCall: ToolInvocation } | { reasoning: string } | null {
  const trimmed = raw.trim();
  if (trimmed === '[DONE]') return { done: true };
  if (trimmed === '') return null;

  // Attempt JSON parse — many providers send structured events.
  try {
    const json = JSON.parse(trimmed);

    // OpenAI-compatible format
    if (json.choices?.[0]?.delta?.content != null) {
      return { text: json.choices[0].delta.content as string };
    }

    // Anthropic-compatible format
    if (json.type === 'content_block_delta' && json.delta?.text != null) {
      return { text: json.delta.text as string };
    }

    // Generic text delta
    if (json.type === 'text_delta' || json.type === 'text') {
      return { text: (json.text ?? json.value ?? '') as string };
    }

    // Reasoning / thinking
    if (json.type === 'reasoning' || json.type === 'thinking') {
      return { reasoning: (json.text ?? json.reasoning ?? '') as string };
    }

    // Tool calls
    if (json.type === 'tool_call' || json.type === 'tool_calls') {
      const tc: ToolInvocation = {
        toolCallId: json.tool_call_id ?? json.id ?? uid(),
        toolName: json.tool_name ?? json.name ?? json.function?.name ?? '',
        args: json.args ?? json.arguments ?? json.function?.arguments ?? {},
        state: 'call',
      };
      if (typeof tc.args === 'string') {
        try { tc.args = JSON.parse(tc.args); } catch { /* keep as-is */ }
      }
      return { toolCall: tc };
    }

    // If JSON but unrecognised structure, treat content/text field as text
    if (typeof json.content === 'string') return { text: json.content };
    if (typeof json.text === 'string') return { text: json.text };
    // eslint-disable-next-line no-empty
  } catch {
    // Not JSON — treat as plain text chunk.
  }

  return { text: trimmed };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Provider-agnostic chat hook with SSE streaming support.
 *
 * Works with any backend that returns `text/event-stream` (SSE) **or**
 * `text/plain` streamed responses. Parses `data:` frames for text deltas,
 * tool calls, reasoning tokens, and the `[DONE]` sentinel.
 *
 * @example
 * ```tsx
 * import { useChat } from '@skeehn/react/hooks';
 *
 * function Chat() {
 *   const { messages, input, setInput, append, isLoading, stop } = useChat({
 *     api: '/api/chat',
 *     onFinish(msg) { console.log('done', msg); },
 *   });
 *
 *   return (
 *     <div>
 *       {messages.map(m => (
 *         <div key={m.id} data-role={m.role}>{m.content}</div>
 *       ))}
 *       <form onSubmit={e => { e.preventDefault(); append(input); setInput(''); }}>
 *         <input value={input} onChange={e => setInput(e.target.value)} />
 *         <button type="submit" disabled={isLoading}>Send</button>
 *         {isLoading && <button type="button" onClick={stop}>Stop</button>}
 *       </form>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param options - Hook configuration.
 * @returns Chat state and control functions.
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
  } = options;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Keep latest callbacks in refs so the streaming closure always sees them.
  const onFinishRef = useRef(onFinish);
  const onErrorRef = useRef(onError);
  const onToolCallRef = useRef(onToolCall);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onToolCallRef.current = onToolCall; }, [onToolCall]);

  // Abort on unmount.
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  /**
   * Stream a completion from the API for the given message list.
   * Mutates `messages` state as tokens arrive.
   */
  const triggerStream = useCallback(
    async (msgs: Message[]) => {
      // Cancel any in-flight request.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);

      const assistantId = uid();
      const assistantMsg: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      };

      // Optimistically append the empty assistant message.
      setMessages(prev => [...prev, assistantMsg]);

      let accContent = '';
      let accReasoning = '';
      const accToolCalls: ToolInvocation[] = [];

      try {
        const response = await fetch(api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            ...headers,
          },
          body: JSON.stringify({
            messages: msgs.map(({ role, content }) => ({ role, content })),
            ...body,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Chat request failed: ${response.status} ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body is not readable');

        const decoder = new TextDecoder();
        let buffer = '';

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Split on double-newline (SSE frame boundary) or single newline for
          // `text/plain` streams that send one chunk per line.
          const contentType = response.headers.get('content-type') ?? '';
          const isSSE = contentType.includes('text/event-stream');

          const lines = buffer.split('\n');
          // Keep the last (possibly incomplete) line in the buffer.
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine === '') continue;

            // SSE: strip `data: ` prefix. Non-SSE: use verbatim.
            let payload: string;
            if (isSSE) {
              if (trimmedLine.startsWith('data:')) {
                payload = trimmedLine.slice(5).trim();
              } else if (trimmedLine.startsWith('event:') || trimmedLine.startsWith(':')) {
                // SSE comment or event-type line — skip.
                continue;
              } else {
                payload = trimmedLine;
              }
            } else {
              // Plain text stream — each line is a payload.
              // Still support `data:` prefix in case the server sends it.
              payload = trimmedLine.startsWith('data:')
                ? trimmedLine.slice(5).trim()
                : trimmedLine;
            }

            const parsed = parseSSEValue(payload);
            if (!parsed) continue;
            if ('done' in parsed) break;

            if ('text' in parsed) {
              accContent += parsed.text;
            } else if ('reasoning' in parsed) {
              accReasoning += parsed.reasoning;
            } else if ('toolCall' in parsed) {
              accToolCalls.push(parsed.toolCall);
              onToolCallRef.current?.(parsed.toolCall);
            }

            // Update the assistant message in-place.
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: accContent,
                      reasoning: accReasoning || undefined,
                      toolInvocations: accToolCalls.length > 0 ? [...accToolCalls] : undefined,
                    }
                  : m,
              ),
            );
          }
        }

        // Process any remaining buffer content.
        if (buffer.trim()) {
          const payload = buffer.trim().startsWith('data:')
            ? buffer.trim().slice(5).trim()
            : buffer.trim();
          const parsed = parseSSEValue(payload);
          if (parsed && !('done' in parsed) && 'text' in parsed) {
            accContent += parsed.text;
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId ? { ...m, content: accContent } : m,
              ),
            );
          }
        }

        const finalMsg: Message = {
          id: assistantId,
          role: 'assistant',
          content: accContent,
          reasoning: accReasoning || undefined,
          toolInvocations: accToolCalls.length > 0 ? accToolCalls : undefined,
          createdAt: assistantMsg.createdAt,
        };
        onFinishRef.current?.(finalMsg);
      } catch (err: unknown) {
        if ((err as DOMException)?.name === 'AbortError') return;
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onErrorRef.current?.(error);
      } finally {
        setIsLoading(false);
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [api, body, headers],
  );

  const append = useCallback(
    async (message: Omit<Message, 'id' | 'createdAt'> | string) => {
      const userMsg: Message =
        typeof message === 'string'
          ? { id: uid(), role: 'user', content: message, createdAt: new Date() }
          : { ...message, id: uid(), createdAt: new Date() };

      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);

      if (userMsg.role === 'user') {
        await triggerStream(nextMessages);
      }
    },
    [messages, triggerStream],
  );

  const reload = useCallback(async () => {
    // Find the last user message and re-send from that point.
    const lastUserIdx = messages.findLastIndex(m => m.role === 'user');
    if (lastUserIdx === -1) return;
    // Remove the assistant reply that followed (if any).
    const truncated = messages.slice(0, lastUserIdx + 1);
    setMessages(truncated);
    await triggerStream(truncated);
  }, [messages, triggerStream]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  }, []);

  return {
    messages,
    setMessages,
    input,
    setInput,
    append,
    isLoading,
    error,
    reload,
    stop,
  };
}
