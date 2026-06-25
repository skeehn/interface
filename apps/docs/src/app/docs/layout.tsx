import Link from "next/link";
import { Sidebar } from "@/components/docs/Sidebar";
import { DocsContent } from "@/components/docs/DocsContent";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="text-[0.95rem] font-semibold tracking-tight flex items-center gap-2">
            <span className="text-accent">&#9626;</span>
            skeehn
          </Link>
          <span className="text-border text-sm hidden sm:inline">/</span>
          <span className="text-sm text-muted-fg hidden sm:inline">Docs</span>
        </div>
        <div className="flex items-center gap-7 text-sm text-muted-fg">
          <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
          <Link href="/docs/components" className="hover:text-foreground transition-colors">Components</Link>
          <a
            href="https://github.com/skeehn/skeehn"
            className="hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <DocsContent>{children}</DocsContent>
        </main>
      </div>
    </div>
  );
}
