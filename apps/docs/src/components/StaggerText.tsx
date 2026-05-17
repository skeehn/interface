"use client";

import { type CSSProperties, type ElementType, type ReactNode } from "react";

/* ───────────────────────────────────────────────────────────────────
 * StaggerText — splits a string into per-glyph spans so the
 * `.sk-stagger-chars` CSS animation can fade them in sequentially.
 *
 * Each child gets `--sk-i` set to its index so the keyframe delay
 * cascades. Whitespace is preserved.
 *
 *   <StaggerText as="h1" text="skeehn" />
 *
 * For multi-word headlines, splits on \n into separate lines.
 * ─────────────────────────────────────────────────────────────────── */

export interface StaggerTextProps {
  as?: ElementType;
  text: string;
  /** Delay between adjacent characters (ms). Default uses the CSS default (28ms). */
  step?: number;
  /** Offset applied to the whole stagger (ms). */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function StaggerText({
  as: Tag = "span",
  text,
  step,
  delay = 0,
  className,
  style,
}: StaggerTextProps) {
  const lines = text.split("\n");
  let glyphIndex = 0;
  return (
    <Tag
      className={`sk-stagger-chars ${className ?? ""}`.trim()}
      style={
        step != null
          ? ({ ...style, ["--sk-step" as never]: `${step}ms` } as CSSProperties)
          : style
      }
      aria-label={text}
    >
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden={false}>
          {Array.from(line).map((ch) => {
            const i = glyphIndex++;
            const totalDelay = delay + (step != null ? i * step : 0);
            const charStyle = {
              ["--sk-i" as never]: String(i),
              ...(totalDelay
                ? { animationDelay: `${totalDelay}ms` }
                : undefined),
            } as CSSProperties;
            return (
              <span key={i} style={charStyle}>
                {ch === " " ? " " : ch}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
