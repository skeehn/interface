import Link from "next/link";
import { IconRail } from "@/components/docs/IconRail";
import { Breadcrumb } from "@/components/docs/Breadcrumb";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh bg-black text-white">
      <header className="sticky top-0 z-50 flex items-center justify-between h-14 border-b border-white/10 bg-black/85 backdrop-blur-md sk-docs-header">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-mono text-sm font-medium tracking-tight text-white flex items-center gap-2"
          >
            <img src="/icon.svg" alt="" width="22" height="22" />
            skeehn
          </Link>
          <span className="hidden sm:inline text-white/15 font-mono">/</span>
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            docs
          </span>
        </div>
        <div className="flex items-center gap-5 pr-6 font-mono text-[11px] uppercase tracking-[0.15em] text-white/40">
          <Link href="/docs" className="hover:text-white transition-colors">
            Docs
          </Link>
          <Link href="/docs/components/button" className="hover:text-white transition-colors">
            Components
          </Link>
          <a
            href="https://github.com/skeehn/skeehn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      <div className="flex-1">
        <IconRail />
        <main className="min-w-0 sk-docs-main">
          <div className="max-w-5xl mx-auto py-12">
            <Breadcrumb />
            <article>{children}</article>
          </div>
        </main>
      </div>

    </div>
  );
}
