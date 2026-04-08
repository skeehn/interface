"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function segmentToTitle(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;
    const title = segmentToTitle(segment);

    return { href, title, isLast };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-muted-fg mb-6"
    >
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          {i > 0 && (
            <span className="text-muted-fg/40" aria-hidden="true">
              /
            </span>
          )}
          {crumb.isLast ? (
            <span className="text-foreground font-medium">{crumb.title}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.title}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
