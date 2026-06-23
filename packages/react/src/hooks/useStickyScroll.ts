'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Configuration accepted by {@link useStickyScroll}. */
export interface UseStickyScrollOptions {
  /**
   * Distance from the bottom (in px) still treated as "pinned to bottom".
   * A small threshold avoids unpinning on sub-pixel scroll jitter.
   *
   * @defaultValue 64
   */
  threshold?: number;
}

/** Return value of {@link useStickyScroll}. */
export interface UseStickyScrollReturn<T extends HTMLElement = HTMLDivElement> {
  /** Attach to the scrollable container. */
  ref: React.RefObject<T | null>;
  /** `true` while the view is pinned to the bottom (following new content). */
  atBottom: boolean;
  /** Smoothly scroll to the latest content and re-pin. */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

/**
 * Sticky-scroll-with-break-on-scroll for streaming chat containers — the 2026
 * bar for "follow the stream, but get out of my way when I scroll up."
 *
 * While the user is pinned to the bottom, the container auto-follows new content
 * (tracked via the `watch` value). The moment the user scrolls up, it breaks the
 * pin and stops auto-scrolling; `atBottom` flips to `false` so the UI can show a
 * "jump to latest" affordance. Calling {@link UseStickyScrollReturn.scrollToBottom}
 * re-pins.
 *
 * ```tsx
 * const { ref, atBottom, scrollToBottom } = useStickyScroll(messages);
 * return (
 *   <div ref={ref} style={{ overflowY: 'auto' }}>
 *     {…messages}
 *     {!atBottom && <button onClick={() => scrollToBottom()}>▼ jump to latest</button>}
 *   </div>
 * );
 * ```
 *
 * @param watch - A value that changes when content grows (e.g. messages, or the
 *   streaming text). Auto-scroll fires on change only while pinned.
 * @param options - Behaviour configuration.
 */
export function useStickyScroll<T extends HTMLElement = HTMLDivElement>(
  watch: unknown,
  options: UseStickyScrollOptions = {},
): UseStickyScrollReturn<T> {
  const { threshold = 64 } = options;
  const ref = useRef<T | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const atBottomRef = useRef(true);

  const isNearBottom = useCallback(() => {
    const el = ref.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
  }, [threshold]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    atBottomRef.current = true;
    setAtBottom(true);
  }, []);

  // Track whether the user is pinned to the bottom.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const near = isNearBottom();
      if (near !== atBottomRef.current) {
        atBottomRef.current = near;
        setAtBottom(near);
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [isNearBottom]);

  // Auto-follow new content while pinned. Instant (no smooth) to stay glued
  // without animation jank during rapid streaming.
  useEffect(() => {
    if (!atBottomRef.current) return;
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [watch]);

  return { ref, atBottom, scrollToBottom };
}
