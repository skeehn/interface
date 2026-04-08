import { useState, useRef, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single token with metadata for dither-fade rendering. */
export interface StreamToken {
  /** The character or token string. */
  value: string;
  /** Absolute character index in the full text. */
  index: number;
  /** Timestamp (ms since stream start) when this token was received. */
  receivedAt: number;
  /**
   * When `ditherFade` is enabled, this indicates whether the token has
   * completed its reveal animation. Components can use this to toggle the
   * `sk-ascii-reveal` CSS class.
   */
  revealed: boolean;
}

/** Reveal speed presets (delay in ms between reveal batches). */
const REVEAL_DELAYS: Record<string, number> = {
  instant: 0,
  fast: 12,
  normal: 30,
  dramatic: 70,
};

/** Configuration accepted by {@link useAsciiStream}. */
export interface UseAsciiStreamOptions {
  /**
   * A `ReadableStream<string>` to consume. When a new stream reference is
   * provided the hook resets and begins consuming from the new stream.
   * Pass `null` or `undefined` to idle without consuming.
   */
  stream: ReadableStream<string> | null | undefined;
  /**
   * When `true`, newly appended characters are initially marked as
   * `revealed: false` and transitioned to `revealed: true` in staggered
   * batches, enabling a dither fade-in effect via the `sk-ascii-reveal`
   * CSS class.
   *
   * @defaultValue `false`
   */
  ditherFade?: boolean;
  /**
   * Controls how fast tokens are revealed when `ditherFade` is enabled.
   *
   * @defaultValue `'normal'`
   */
  revealSpeed?: 'instant' | 'fast' | 'normal' | 'dramatic';
}

/** Return value of {@link useAsciiStream}. */
export interface UseAsciiStreamReturn {
  /** The full accumulated text received so far. */
  text: string;
  /** `true` while the stream is being consumed. */
  isStreaming: boolean;
  /**
   * Per-character token list with reveal state. Useful for rendering each
   * character with conditional CSS classes for the dither animation.
   */
  tokens: StreamToken[];
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Consume a `ReadableStream<string>` and expose per-token state for
 * skeehn's signature dither-fade reveal animation.
 *
 * When `ditherFade` is enabled, each newly arrived character starts with
 * `revealed: false`. The hook then transitions characters to `revealed: true`
 * in staggered batches according to `revealSpeed`. Components should apply
 * the `sk-ascii-reveal` CSS class to unrevealed tokens and let CSS handle
 * the visual transition (opacity, dither pattern, etc.).
 *
 * @example
 * ```tsx
 * import { useAsciiStream } from '@skeehn/react/hooks';
 *
 * function StreamOutput({ stream }: { stream: ReadableStream<string> }) {
 *   const { text, isStreaming, tokens } = useAsciiStream({
 *     stream,
 *     ditherFade: true,
 *     revealSpeed: 'fast',
 *   });
 *
 *   return (
 *     <pre className="sk-ascii-stream" data-streaming={isStreaming}>
 *       {tokens.map((t, i) => (
 *         <span
 *           key={i}
 *           className={t.revealed ? 'sk-ascii-revealed' : 'sk-ascii-reveal'}
 *         >
 *           {t.value}
 *         </span>
 *       ))}
 *     </pre>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Simple usage without dither fade — just accumulate text
 * function PlainStream({ stream }: { stream: ReadableStream<string> }) {
 *   const { text, isStreaming } = useAsciiStream({ stream });
 *   return <pre>{text}{isStreaming && '▌'}</pre>;
 * }
 * ```
 *
 * @param options - Hook configuration.
 * @returns Streaming text state and per-token metadata.
 */
export function useAsciiStream(options: UseAsciiStreamOptions): UseAsciiStreamReturn {
  const { stream, ditherFade = false, revealSpeed = 'normal' } = options;

  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokens, setTokens] = useState<StreamToken[]>([]);

  // Refs for mutable state accessed inside the async reader loop.
  const tokensRef = useRef<StreamToken[]>([]);
  const streamStartRef = useRef(0);
  const charIndexRef = useRef(0);
  const cancelRef = useRef<(() => void) | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reveal animation: walks through unrevealed tokens and flips them.
  const scheduleReveal = useCallback(() => {
    if (!ditherFade) return;

    const delay = REVEAL_DELAYS[revealSpeed] ?? REVEAL_DELAYS.normal;
    if (delay === 0) {
      // Instant — mark everything revealed immediately.
      tokensRef.current = tokensRef.current.map(t =>
        t.revealed ? t : { ...t, revealed: true },
      );
      setTokens([...tokensRef.current]);
      return;
    }

    // Batch-reveal: on each tick, reveal a chunk of unrevealed tokens.
    // Batch size scales inversely with delay so faster speeds reveal more at once.
    const batchSize = Math.max(1, Math.ceil(4 / (delay / 30)));

    const tick = () => {
      let revealed = 0;
      const updated = tokensRef.current.map(t => {
        if (t.revealed || revealed >= batchSize) return t;
        revealed += 1;
        return { ...t, revealed: true };
      });
      tokensRef.current = updated;
      setTokens([...updated]);

      // Continue if there are still unrevealed tokens.
      if (updated.some(t => !t.revealed)) {
        revealTimerRef.current = setTimeout(tick, delay);
      } else {
        revealTimerRef.current = null;
      }
    };

    // Only start a new timer if one isn't already running.
    if (!revealTimerRef.current) {
      revealTimerRef.current = setTimeout(tick, delay);
    }
  }, [ditherFade, revealSpeed]);

  // Main effect: consume the stream.
  useEffect(() => {
    // Cleanup previous stream.
    cancelRef.current?.();
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }

    if (!stream) {
      setIsStreaming(false);
      return;
    }

    // Reset state for new stream.
    setText('');
    setTokens([]);
    tokensRef.current = [];
    charIndexRef.current = 0;
    streamStartRef.current = Date.now();
    setIsStreaming(true);

    let cancelled = false;
    const reader = stream.getReader();

    cancelRef.current = () => {
      cancelled = true;
      reader.cancel().catch(() => { /* ignore */ });
    };

    (async () => {
      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;

          const now = Date.now() - streamStartRef.current;

          // Split the chunk into individual characters for per-token control.
          const chars = Array.from(value);
          const newTokens: StreamToken[] = chars.map(ch => ({
            value: ch,
            index: charIndexRef.current++,
            receivedAt: now,
            revealed: !ditherFade,
          }));

          tokensRef.current = [...tokensRef.current, ...newTokens];
          setTokens([...tokensRef.current]);
          setText(tokensRef.current.map(t => t.value).join(''));

          // Kick off the reveal animation for the new batch.
          if (ditherFade) {
            scheduleReveal();
          }
        }
      } catch (err: unknown) {
        // Stream was cancelled or errored — silently stop.
        if (cancelled) return;
        // In production you might surface this; for now we just stop streaming.
        console.error('[useAsciiStream] stream error:', err);
      } finally {
        if (!cancelled) {
          setIsStreaming(false);
          // Final reveal pass to ensure everything is shown.
          if (ditherFade) {
            scheduleReveal();
          }
        }
      }
    })();

    return () => {
      cancelRef.current?.();
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    };
  // The stream reference identity is the dependency — when a new stream
  // object is passed, we restart.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  return { text, isStreaming, tokens };
}
