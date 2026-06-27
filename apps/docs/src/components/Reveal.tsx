"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal wrapper — fades + rises its children into view once, the first
 * time they enter the viewport. Respects prefers-reduced-motion (the CSS no-ops
 * the animation). `delay` staggers siblings.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`sk-reveal ${className}`}
      data-shown={shown}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
