'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Configuration accepted by {@link useCompletion}. */
export interface UseCompletionOptions {
  /**
   * API endpoint that accepts a POST with `{ prompt, ...body }` and returns
   * a streamed response (`text/event-stream` or `text/plain`).
   *
   * @defaultValue `'/api/completion'`
   */
  api?: string;
  /** Extra JSON fields merged into every request body. */
  body?: Record<string, unknown>;
  /** Extra headers sent with every request. */
  headers?: Record<string, string>;
  /** Called when the completion stream finishes. */
  onFinish?: (completion: string) => void;
  /** Called when a network or parsing error occurs. */
  onError?: (error: Error) => void;
}

/** Return value of {@link useCompletion}. */
export interface UseCompletionReturn {
  /** The accumulated completion text. */
  completion: string;
  /** Current value of the text input. */
  input: string;
  /** Controlled setter for the text input. */
  setInput: React.Dispatch<React.SetStateAction<string>>;
  /**
   * Send a prompt (or the current `input` value) and stream the completion.
   * Returns the final completed text.
   */
  complete: (prompt?: string) => Promise<string | undefined>;
  /** `true` while a stream is in-flight. */
  isLoading: boolean;
  /** The most recent error, or `null`. */
  error: Error | null;
  /** Abort the current stream. */
  stop: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Single-turn text completion hook with streaming support.
 *
 * Sends a prompt to the configured API endpoint and streams the response
 * token-by-token. Supports both `text/event-stream` (SSE) and `text/plain`
 * streamed responses.
 *
 * @example
 * ```tsx
 * import { useCompletion } from '@skeehn/react/hooks';
 *
 * function Autocomplete() {
 *   const { completion, input, setInput, complete, isLoading } = useCompletion({
 *     api: '/api/completion',
 *   });
 *
 *   return (
 *     <div>
 *       <textarea value={input} onChange={e => setInput(e.target.value)} />
 *       <button onClick={() => complete()} disabled={isLoading}>Complete</button>
 *       <pre>{completion}</pre>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param options - Hook configuration.
 * @returns Completion state and control functions.
 */
export function useCompletion(options: UseCompletionOptions = {}): UseCompletionReturn {
  const {
    api = '/api/completion',
    body,
    headers,
    onFinish,
    onError,
  } = options;

  const [completion, setCompletion] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const onFinishRef = useRef(onFinish);
  const onErrorRef = useRef(onError);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  // Abort on unmount.
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  }, []);

  const complete = useCallback(
    async (prompt?: string): Promise<string | undefined> => {
      const text = prompt ?? input;
      if (!text) return undefined;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      setCompletion('');

      let acc = '';

      try {
        const response = await fetch(api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            ...headers,
          },
          body: JSON.stringify({ prompt: text, ...body }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Completion request failed: ${response.status} ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body is not readable');

        const decoder = new TextDecoder();
        let buffer = '';
        const contentType = response.headers.get('content-type') ?? '';
        const isSSE = contentType.includes('text/event-stream');

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine === '') continue;

            let payload: string;
            if (isSSE) {
              if (trimmedLine.startsWith('data:')) {
                payload = trimmedLine.slice(5).trim();
              } else if (trimmedLine.startsWith('event:') || trimmedLine.startsWith(':')) {
                continue;
              } else {
                payload = trimmedLine;
              }
            } else {
              payload = trimmedLine.startsWith('data:')
                ? trimmedLine.slice(5).trim()
                : trimmedLine;
            }

            if (payload === '[DONE]') break;
            if (payload === '') continue;

            // Attempt JSON parse for structured responses.
            let chunk = '';
            try {
              const json = JSON.parse(payload);
              if (json.choices?.[0]?.delta?.content != null) {
                chunk = json.choices[0].delta.content as string;
              } else if (json.choices?.[0]?.text != null) {
                chunk = json.choices[0].text as string;
              } else if (json.delta?.text != null) {
                chunk = json.delta.text as string;
              } else if (typeof json.text === 'string') {
                chunk = json.text;
              } else if (typeof json.content === 'string') {
                chunk = json.content;
              } else if (typeof json.completion === 'string') {
                chunk = json.completion;
              }
            } catch {
              // Plain text
              chunk = payload;
            }

            if (chunk) {
              acc += chunk;
              setCompletion(acc);
            }
          }
        }

        // Flush remaining buffer.
        if (buffer.trim()) {
          const payload = buffer.trim().startsWith('data:')
            ? buffer.trim().slice(5).trim()
            : buffer.trim();
          if (payload && payload !== '[DONE]') {
            let chunk = '';
            try {
              const json = JSON.parse(payload);
              chunk = (json.choices?.[0]?.delta?.content ?? json.text ?? json.content ?? '') as string;
            } catch {
              chunk = payload;
            }
            if (chunk) {
              acc += chunk;
              setCompletion(acc);
            }
          }
        }

        onFinishRef.current?.(acc);
        return acc;
      } catch (err: unknown) {
        if ((err as DOMException)?.name === 'AbortError') return undefined;
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        onErrorRef.current?.(e);
        return undefined;
      } finally {
        setIsLoading(false);
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [api, body, headers, input],
  );

  return {
    completion,
    input,
    setInput,
    complete,
    isLoading,
    error,
    stop,
  };
}
