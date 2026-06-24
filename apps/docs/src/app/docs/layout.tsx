import Link from "next/link";
import { Sidebar } from "@/components/docs/Sidebar";
import { Breadcrumb } from "@/components/docs/Breadcrumb";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b-2 border-foreground bg-background/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-mono font-bold tracking-wide flex items-center gap-2">
            <span className="text-accent">&#9624;</span>
            skeehn
          </Link>
          <span className="text-muted-fg text-xs hidden sm:inline">/</span>
          <span className="text-xs text-muted-fg font-mono uppercase tracking-[0.15em] hidden sm:inline">docs</span>
        </div>
        <div className="flex items-center gap-6 text-xs uppercase tracking-[0.15em] font-mono text-muted-fg">
          <Link href="/docs" className="hover:text-accent transition-colors">Docs</Link>
          <Link href="/docs/components" className="hover:text-accent transition-colors">Components</Link>
          <a
            href="https://github.com/skeehn/skeehn"
            className="hover:text-accent transition-colors"
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
          <div className="max-w-4xl mx-auto px-8 py-12">
            <Breadcrumb />
            <article>{children}</article>
          </div>
        </main>
      </div>
    </div>
  );
}
