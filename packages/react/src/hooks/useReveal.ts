import { useEffect, useRef, useState } from 'react';

/**
 * useReveal — IntersectionObserver-based scroll-reveal trigger.
 *
 * Returns a ref + a boolean. Attach the ref to the element you want to
 * watch; once it scrolls into view past `threshold` percent of its own
 * height, `inView` flips to true (once, by default). Pair with the
 * `.sk-reveal` CSS classes from engine/animation.css:
 *
 *   const { ref, inView } = useReveal();
 *   <section ref={ref} className={`sk-reveal ${inView ? 'is-in' : ''}`} />
 *
 * Zero dependencies, ~25 LOC. Respects prefers-reduced-motion by
 * setting `inView=true` immediately (so content is still readable).
 */
export interface UseRevealOptions {
  /** Visibility ratio that triggers reveal. 0..1, default 0.15 (15%). */
  threshold?: number;
  /** Margin around root used to start reveal earlier. CSS-style. Default '0px 0px -10% 0px'. */
  rootMargin?: string;
  /** Re-fire every time the element enters view. Default false (once). */
  repeat?: boolean;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOptions = {},
): { ref: React.RefObject<T | null>; inView: boolean } {
  const { threshold = 0.15, rootMargin = '0px 0px -10% 0px', repeat = false } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    // Respect users who don't want motion — show content immediately.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            if (!repeat) io.unobserve(e.target);
          } else if (repeat) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, repeat]);

  return { ref, inView };
}
