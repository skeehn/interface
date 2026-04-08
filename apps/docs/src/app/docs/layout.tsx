import Link from "next/link";
import { Sidebar } from "@/components/docs/Sidebar";
import { Breadcrumb } from "@/components/docs/Breadcrumb";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh bg-neutral-950 text-neutral-100">
      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-mono font-medium tracking-wide text-white">
            <span className="text-neutral-600 mr-1">&gt;</span>
            skeehn
          </Link>
          <span className="text-neutral-700 text-xs hidden sm:inline">/</span>
          <span className="text-xs text-neutral-500 font-mono hidden sm:inline">docs</span>
        </div>
        <div className="flex items-center gap-6 text-xs font-mono text-neutral-500">
          <Link href="/docs" className="hover:text-white transition-colors">
            Docs
          </Link>
          <Link
            href="/docs/components"
            className="hover:text-white transition-colors"
          >
            Components
          </Link>
          <a
            href="https://github.com/skeehn/skeehn"
            className="hover:text-white transition-colors"
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
