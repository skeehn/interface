"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";

interface NavItem {
  title: string;
  href: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Quick Start", href: "/docs/getting-started" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Usage", href: "/docs/usage" },
      { title: "CLI", href: "/docs/cli" },
    ],
  },
  {
    title: "Components (Core)",
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
    title: "Components (AI)",
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
    title: "Components (Layout / Viz / Motion)",
    items: [
      { title: "Layout", href: "/docs/components/layout" },
      { title: "Data Viz", href: "/docs/components/dataviz" },
      { title: "Motion", href: "/docs/components/motion" },
    ],
  },
  {
    title: "Themes",
    items: [
      { title: "Overview", href: "/docs/themes" },
      { title: "Default", href: "/docs/themes/default" },
      { title: "Dark", href: "/docs/themes/dark" },
      { title: "Terminal", href: "/docs/themes/terminal" },
      { title: "Brutal", href: "/docs/themes/brutal" },
      { title: "Grain", href: "/docs/themes/grain" },
      { title: "Print", href: "/docs/themes/print" },
      { title: "Mardi Gras", href: "/docs/themes/mardi-gras" },
    ],
  },
  {
    title: "Engine",
    items: [
      { title: "Playground", href: "/docs/engine" },
      { title: "Dither Patterns", href: "/docs/engine/dither" },
      { title: "Animations", href: "/docs/engine/animation" },
      { title: "Tokens", href: "/docs/engine/tokens" },
      { title: "Canvas API", href: "/docs/engine/canvas" },
    ],
  },
  {
    title: "Interactive Demos",
    items: [
      { title: "AI Chat", href: "/docs/ai-chat" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const sidebarContent = (
    <nav className="flex flex-col gap-8 py-6 px-4" aria-label="Documentation">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <h4 className="text-[0.7rem] uppercase tracking-[0.12em] text-muted-fg px-3 mb-2 font-semibold">
            {group.title}
          </h4>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobile}
                    className={`block px-3 py-1.5 text-[0.86rem] rounded-md transition-colors ${
                      isActive
                        ? "text-foreground font-medium bg-muted"
                        : "text-muted-fg hover:text-foreground hover:bg-muted/60"
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
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={toggleMobile}
        className="fixed top-3.5 left-16 z-50 lg:hidden p-1.5 text-muted-fg hover:text-accent transition-colors"
        aria-label="Toggle navigation"
        aria-expanded={mobileOpen}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
        >
          {mobileOpen ? (
            <>
              <line x1="4" y1="4" x2="14" y2="14" />
              <line x1="14" y1="4" x2="4" y2="14" />
            </>
          ) : (
            <>
              <line x1="2" y1="5" x2="16" y2="5" />
              <line x1="2" y1="9" x2="16" y2="9" />
              <line x1="2" y1="13" x2="16" y2="13" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar -- desktop: static, mobile: slide-in */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-40 w-64 bg-background border-r border-border overflow-y-auto transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:sticky lg:top-14 lg:h-[calc(100dvh-3.5rem)]`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
