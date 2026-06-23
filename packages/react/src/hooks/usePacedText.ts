'use client';

import { useEffect, useRef, useState } from 'react';

/** Configuration accepted by {@link usePacedText}. */
export interface UsePacedTextOptions {
  /**
   * Characters revealed per second while the display is catching up to the
   * target. Higher = faster reveal.
   *
   * @defaultValue 160
   */
  cps?: number;
  /**
   * When `false`, pacing is disabled and `target` is shown immediately. Set
   * this to the streaming state so the text only paces while a response is
   * in-flight, then snaps to complete.
   *
   * @defaultValue `true`
   */
  enabled?: boolean;
}

/** Return value of {@link usePacedText}. */
export interface UsePacedTextReturn {
  /** The portion of `target` revealed so far (all of it when disabled). */
  text: string;
  /** `true` while the revealed text is still catching up to `target`. */
  isCatchingUp: boolean;
}

/**
 * Smoothly reveal a growing `target` string at a steady cadence, decoupling the
 * visual reveal from bursty network chunks — the core of "world-class" streaming
 * text. As `target` grows (e.g. accumulating chat content), the displayed slice
 * advances toward it at ~`cps` characters/second via `requestAnimationFrame`,
 * so fast bursts don't dump and slow gaps don't stall. When `target` is replaced
 * by an unrelated string (a new message), the reveal restarts cleanly.
 *
 * Pairs with `useChat` / `useCompletion`, which expose raw (bursty) content:
 * ```tsx
 * const { messages, isLoading } = useChat();
 * const last = messages.at(-1);
 * const streaming = isLoading && last?.role === 'assistant';
 * const { text, isCatchingUp } = usePacedText(last?.content ?? '', { enabled: streaming });
 * return <StreamingText caret={isCatchingUp ? 'block' : false}>{text}</StreamingText>;
 * ```
 *
 * @param target - The full (possibly still-growing) text to reveal.
 * @param options - Pacing configuration.
 * @returns The paced text slice and whether it is still catching up.
 */
export function usePacedText(
  target: string,
  options: UsePacedTextOptions = {},
): UsePacedTextReturn {
  const { cps = 160, enabled = true } = options;

  const [shown, setShown] = useState(enabled ? '' : target);
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    if (!enabled) {
      setShown(targetRef.current);
      return;
    }
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      if (!last) last = now;
      const dt = now - last;
      last = now;

      const tgt = targetRef.current;
      let cur = shownRef.current;
      // Target diverged from what we've shown → a new message; restart.
      if (!tgt.startsWith(cur)) cur = '';

      if (cur.length < tgt.length) {
        const advance = Math.max(1, Math.round((cps * dt) / 1000));
        cur = tgt.slice(0, cur.length + advance);
        shownRef.current = cur;
        setShown(cur);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, cps]);

  return {
    text: enabled ? shown : target,
    isCatchingUp: enabled && shown.length < target.length,
  };
}
