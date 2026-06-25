"use client";

import { usePathname } from "next/navigation";
import { Breadcrumb } from "./Breadcrumb";

/* Immersive, app-like demo pages fill the main area (beside the sidebar)
   instead of the centered prose column. */
const FULL_BLEED = ["/docs/engine", "/docs/themes", "/docs/ai-chat"];

export function DocsContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullBleed = FULL_BLEED.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (isFullBleed) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-14">
      <Breadcrumb />
      <article>{children}</article>
    </div>
  );
}
