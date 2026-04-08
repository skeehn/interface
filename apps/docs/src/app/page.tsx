import Link from "next/link";
import DitherCanvas from "@/components/DitherCanvas";
import { CodePreview } from "@/components/CodePreview";

const STATS = [
  { value: "32", label: "Components" },
  { value: "7", label: "Themes" },
  { value: "0", label: "Dependencies" },
  { value: "AI", label: "Native" },
] as const;

const FEATURES = [
  {
    title: "ASCII Dither Engine",
    description:
      "Real-time Bayer, Floyd-Steinberg, and Atkinson dithering on images, video, and backgrounds.",
    icon: "░▒▓",
  },
  {
    title: "AI Chat Components",
    description:
      "14 purpose-built components for chat interfaces, streaming, reasoning traces, and tool calls.",
    icon: ">>>",
  },
  {
    title: "Copy-Paste Ownership",
    description:
      "Like shadcn \u2014 CLI copies source into your project. You own every line.",
    icon: "cp/",
  },
  {
    title: "CRT / Retro Effects",
    description:
      "Scanlines, phosphor glow, flicker, terminal themes. Not decoration \u2014 identity.",
    icon: "CRT",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 border-b border-border bg-background/80 backdrop-blur-sm">
        <Link href="/" className="text-sm font-medium tracking-wide">
          <span className="text-muted-fg mr-1">&gt;</span>
          skeehn
        </Link>
        <div className="flex items-center gap-6 text-xs text-muted-fg">
          <Link href="/docs" className="hover:text-foreground transition-colors">
            Docs
          </Link>
          <Link
            href="/docs/components"
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
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative flex items-center justify-center min-h-screen overflow-hidden">
        <DitherCanvas />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 border border-white/10 bg-white/5 backdrop-blur-sm text-xs text-white/70">
            <span className="inline-block w-1.5 h-1.5 bg-green-400 sk-pulse-dot" />
            v1.0 &mdash; Now available
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-semibold tracking-tight text-white leading-none mb-6">
            skeehn
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-light text-white/90 mb-4 leading-tight">
            Build AI interfaces that mean it.
          </p>
          <p className="text-sm sm:text-base text-white/50 max-w-xl mb-12 leading-relaxed">
            32 components. 7 themes. Zero dependencies.
            <br />
            Every surface a canvas for ASCII texture.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-16">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors"
            >
              Get Started &rarr;
            </Link>
            <Link
              href="/docs/components"
              className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              Browse Components
            </Link>
            <a
              href="https://github.com/skeehn/skeehn"
              className="inline-flex items-center justify-center h-10 px-6 text-sm text-white/50 hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 w-full max-w-2xl">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center py-5 px-4 bg-black/40 backdrop-blur-sm"
              >
                <span className="text-2xl sm:text-3xl font-semibold text-white mb-1">
                  {stat.value}
                </span>
                <span className="text-xs text-white/40 uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom dither fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10"
          aria-hidden="true"
        />
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="relative py-24 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-muted-fg uppercase tracking-widest mb-3">
              Capabilities
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Every pixel deliberate
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col p-8 bg-background group"
              >
                <span className="text-lg font-mono text-muted-fg mb-4 opacity-40 group-hover:opacity-100 transition-opacity">
                  {feature.icon}
                </span>
                <h3 className="text-base font-medium text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-fg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CODE PREVIEW ═══ */}
      <section className="py-24 px-6 bg-surface border-y border-border">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-muted-fg uppercase tracking-widest mb-3">
              Developer Experience
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Ship in minutes
            </h2>
            <p className="text-sm text-muted-fg mt-3 max-w-md mx-auto">
              Import the component. Wire up the hook. Done.
            </p>
          </div>

          <CodePreview />
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-12 px-6 border-t border-border bg-background">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-fg">
          <p>
            Built by{" "}
            <span className="text-foreground font-medium">skeehn</span>.
            MIT License.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/skeehn/skeehn"
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/org/skeehn"
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              npm
            </a>
            <Link href="/docs" className="hover:text-foreground transition-colors">
              Docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
