"use client";

import {
  type CSSProperties,
  type ElementType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

/* ───────────────────────────────────────────────────────────────────
 * Reveal — wraps a section in scroll-driven fade/slide-in.
 *
 * Mirrors the `.sk-reveal` CSS class from engine/animation.css. Sets
 * `.is-in` when the element first enters view (or any time it does, if
 * repeat=true). Respects prefers-reduced-motion by revealing instantly.
 *
 * Variant maps to a CSS modifier:
 *   up     → translateY(20px) → 0
 *   down   → translateY(-20px) → 0
 *   left   → translateX(-30px) → 0
 *   right  → translateX(30px) → 0
 *   scale  → scale(0.94) → 1
 * ─────────────────────────────────────────────────────────────────── */

export type RevealVariant = "up" | "down" | "left" | "right" | "scale";

export interface RevealProps {
  as?: ElementType;
  variant?: RevealVariant;
  /** Visible ratio that triggers reveal. Default 0.12. */
  threshold?: number;
  /** Re-fire when the element re-enters view. Default false. */
  repeat?: boolean;
  /** Delay applied to the transition (ms). Useful for cascading. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function Reveal({
  as: Tag = "div",
  variant = "up",
  threshold = 0.12,
  repeat = false,
  delay,
  className,
  style,
  children,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, repeat]);

  const variantClass = `sk-reveal--${variant === "up" ? "up" : variant}`;
  const cls = `sk-reveal ${variant !== "up" ? variantClass : ""} ${inView ? "is-in" : ""} ${className ?? ""}`.trim();
  const mergedStyle: CSSProperties =
    delay != null ? { ...style, transitionDelay: `${delay}ms` } : style ?? {};

  return (
    <Tag ref={ref as never} className={cls} style={mergedStyle}>
      {children}
    </Tag>
  );
}
