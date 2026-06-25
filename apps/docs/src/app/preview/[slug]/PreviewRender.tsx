"use client";

import type { ReactNode } from "react";
import { PREVIEWS } from "@/components/docs/ComponentPreview";

/** Chrome-free render of a single component under a chosen theme, for visual QA. */
export function PreviewRender({ slug, theme }: { slug: string; theme: string }) {
  const render = PREVIEWS[slug] as (() => ReactNode) | undefined;
  return (
    <main
      data-theme={theme}
      data-preview-ready={render ? "true" : "missing"}
      style={{
        minHeight: "100vh",
        padding: "48px",
        background: "hsl(var(--sk-background))",
        color: "hsl(var(--sk-foreground))",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {render ? render() : <p style={{ opacity: 0.5 }}>No preview for &quot;{slug}&quot;.</p>}
      </div>
    </main>
  );
}
