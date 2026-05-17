"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────
 * IconRail
 *
 * A 56px-wide icon rail on the left, with section flyouts. Each section
 * icon opens a panel (240px) listing its items. Hover gives a peek;
 * click pins the panel open. Outside click closes it.
 *
 * Editorial-brutalist styling: hairline 1px borders, zero shadows or
 * glows, instant transitions. Active items use inverted color, not a
 * tint.
 * ───────────────────────────────────────────────────────────────────── */

interface NavItem {
  title: string;
  href: string;
}

interface NavGroup {
  id: string;
  title: string;
  /** Single glyph rendered in the rail. Kept ASCII / box-drawing to fit. */
  icon: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "start",
    title: "Getting Started",
    icon: "▤",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Quick Start", href: "/docs/getting-started" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Usage", href: "/docs/usage" },
      { title: "CLI", href: "/docs/cli" },
    ],
  },
  {
    id: "core",
    title: "Core Components",
    icon: "█",
    items: [
      { title: "Button", href: "/docs/components/button" },
      { title: "Card", href: "/docs/components/card" },
      { title: "Input", href: "/docs/components/input" },
      { title: "Badge", href: "/docs/components/badge" },
      { title: "Alert", href: "/docs/components/alert" },
      { title: "Dialog", href: "/docs/components/dialog" },
      { title: "Tabs", href: "/docs/components/tabs" },
      { title: "Toggle", href: "/docs/components/toggle" },
      { title: "Progress", href: "/docs/components/progress" },
      { title: "Avatar", href: "/docs/components/avatar" },
      { title: "Tooltip", href: "/docs/components/tooltip" },
      { title: "Dropdown", href: "/docs/components/dropdown" },
      { title: "Table", href: "/docs/components/table" },
      { title: "Accordion", href: "/docs/components/accordion" },
    ],
  },
  {
    id: "ai",
    title: "AI Components",
    icon: "▶",
    items: [
      { title: "Chat Bubble", href: "/docs/components/chat-bubble" },
      { title: "Chat Input", href: "/docs/components/chat-input" },
      { title: "Thinking Block", href: "/docs/components/thinking-block" },
      { title: "Reasoning Step", href: "/docs/components/reasoning-step" },
      { title: "Tool Card", href: "/docs/components/tool-card" },
      { title: "Streaming Text", href: "/docs/components/streaming-text" },
      { title: "Code Block", href: "/docs/components/code-block" },
      { title: "Agent Status", href: "/docs/components/agent-status" },
      { title: "Typing Indicator", href: "/docs/components/typing-indicator" },
      { title: "Markdown", href: "/docs/components/markdown" },
      { title: "Voice Session", href: "/docs/components/voice-session" },
      { title: "Prompt Suggestions", href: "/docs/components/prompt-suggestions" },
      { title: "File Attachment", href: "/docs/components/file-attachment" },
      { title: "Citation Card", href: "/docs/components/citation-card" },
      { title: "Terminal Panel", href: "/docs/components/terminal-panel" },
    ],
  },
  {
    id: "layout",
    title: "Layout · Viz · Motion",
    icon: "▦",
    items: [
      { title: "Layout", href: "/docs/components/layout" },
      { title: "Data Viz", href: "/docs/components/dataviz" },
      { title: "Motion", href: "/docs/components/motion" },
    ],
  },
  {
    id: "themes",
    title: "Themes",
    icon: "◐",
    items: [
      { title: "Overview", href: "/docs/themes" },
      { title: "Default", href: "/docs/themes/default" },
      { title: "Dark", href: "/docs/themes/dark" },
      { title: "Terminal", href: "/docs/themes/terminal" },
      { title: "Brutal", href: "/docs/themes/brutal" },
      { title: "Grain", href: "/docs/themes/grain" },
      { title: "Print", href: "/docs/themes/print" },
      { title: "Mardi Gras", href: "/docs/themes/mardi-gras" },
      { title: "Phosphor", href: "/docs/themes/phosphor" },
      { title: "Amber", href: "/docs/themes/amber" },
      { title: "Risograph", href: "/docs/themes/risograph" },
      { title: "Newsprint", href: "/docs/themes/newsprint" },
    ],
  },
  {
    id: "engine",
    title: "Engine",
    icon: "▣",
    items: [
      { title: "Playground", href: "/docs/engine" },
      { title: "Dither Overlay (WebGL)", href: "/docs/engine/dither-overlay" },
      { title: "Dither Patterns", href: "/docs/engine/dither" },
      { title: "Animations", href: "/docs/engine/animation" },
      { title: "Tokens", href: "/docs/engine/tokens" },
      { title: "Canvas API", href: "/docs/engine/canvas" },
    ],
  },
  {
    id: "demos",
    title: "Demos",
    icon: "▷",
    items: [{ title: "AI Chat", href: "/docs/ai-chat" }],
  },
];

function findActiveGroupId(pathname: string): string | undefined {
  for (const group of NAV_GROUPS) {
    if (group.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"))) {
      return group.id;
    }
  }
  return undefined;
}

export function IconRail() {
  const pathname = usePathname();
  const activeGroupId = findActiveGroupId(pathname);
  const [openId, setOpenId] = useState<string | undefined>(undefined);
  const [mobileOpen, setMobileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close flyout on route change
  useEffect(() => {
    setOpenId(undefined);
    setMobileOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    if (!openId) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenId(undefined);
      }
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [openId]);

  // Escape to close
  useEffect(() => {
    if (!openId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenId(undefined);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  const togglePanel = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? undefined : id));
  }, []);

  const openGroup = openId ? NAV_GROUPS.find((g) => g.id === openId) : undefined;

  return (
    <div ref={containerRef} className="contents">
      {/* Mobile hamburger (top-left of viewport, sits above rail when open) */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="fixed top-3 left-3 z-[60] lg:hidden h-9 w-9 flex items-center justify-center border border-white/15 bg-black text-white/70 font-mono text-sm hover:text-white hover:border-white/40"
        aria-label="Toggle navigation"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? "×" : "≡"}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* The rail */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-50 w-14 border-r border-white/10 bg-black/95 backdrop-blur-sm flex flex-col items-stretch ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform`}
        aria-label="Section navigation"
      >
        <nav className="flex flex-col flex-1 py-2">
          {NAV_GROUPS.map((group) => {
            const isActive = activeGroupId === group.id;
            const isOpen = openId === group.id;
            return (
              <button
                key={group.id}
                onClick={() => togglePanel(group.id)}
                onMouseEnter={() => {
                  if (!openId) setOpenId(group.id);
                }}
                className={`relative h-12 flex items-center justify-center font-mono text-base border-l-2 transition-colors ${
                  isOpen
                    ? "border-white text-white bg-white/5"
                    : isActive
                      ? "border-white/40 text-white"
                      : "border-transparent text-white/45 hover:text-white"
                }`}
                aria-label={group.title}
                aria-expanded={isOpen}
                aria-controls={`rail-panel-${group.id}`}
                title={group.title}
              >
                <span aria-hidden>{group.icon}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom utilities — search, github */}
        <div className="border-t border-white/10 flex flex-col">
          <a
            href="https://github.com/skeehn/skeehn"
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 flex items-center justify-center font-mono text-base text-white/45 hover:text-white border-l-2 border-transparent"
            aria-label="GitHub"
            title="GitHub"
          >
            ⌥
          </a>
        </div>
      </aside>

      {/* Flyout panel */}
      {openGroup && (
        <div
          id={`rail-panel-${openGroup.id}`}
          className="hidden lg:flex fixed top-14 bottom-0 left-14 z-40 w-60 flex-col border-r border-white/10 bg-black/95 backdrop-blur-sm"
          onMouseLeave={() => {
            // Only auto-close on hover-out if NOT pinned via click; we treat
            // mouseLeave as a "lost interest" hint and close after a tiny grace.
            // Click on the icon toggles open/closed explicitly above.
          }}
        >
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
              {openGroup.title}
            </span>
            <button
              onClick={() => setOpenId(undefined)}
              className="text-white/30 hover:text-white text-xs font-mono"
              aria-label="Close panel"
            >
              esc
            </button>
          </div>
          <ul className="flex-1 overflow-y-auto py-1">
            {openGroup.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-4 py-1.5 text-[13px] font-mono transition-colors ${
                      isActive
                        ? "bg-white text-black"
                        : "text-white/65 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Mobile: flat sidebar render */}
      {mobileOpen && (
        <aside
          className="fixed top-14 bottom-0 left-14 z-50 right-0 max-w-xs bg-black border-r border-white/10 overflow-y-auto lg:hidden"
          aria-label="Documentation"
        >
          <nav className="py-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.id} className="mb-6">
                <div className="px-4 mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                  {group.icon}  {group.title}
                </div>
                <ul>
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`block px-4 py-1.5 text-[13px] font-mono ${
                            isActive
                              ? "bg-white text-black"
                              : "text-white/65 hover:text-white"
                          }`}
                        >
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
      )}
    </div>
  );
}
