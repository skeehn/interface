import Link from "next/link";
import { Sidebar } from "@/components/docs/Sidebar";
import { Breadcrumb } from "@/components/docs/Breadcrumb";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium tracking-wide">
            <span className="text-muted-fg mr-1">&gt;</span>
            skeehn
          </Link>
          <span className="text-muted-fg/30 text-xs hidden sm:inline">/</span>
          <span className="text-xs text-muted-fg hidden sm:inline">docs</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-muted-fg">
          <Link href="/docs" className="hover:text-foreground transition-colors">
            Docs
          </Link>
          <Link
            href="/docs/components/button"
            className="hover:text-foreground transition-colors"
          >
            Components
          </Link>
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
        <main className="flex-1 min-w-0 lg:pl-0">
          <div className="max-w-3xl mx-auto px-6 py-10">
            <Breadcrumb />
            <article className="prose prose-sm max-w-none">{children}</article>
          </div>
        </main>
      </div>
    </div>
  );
}
