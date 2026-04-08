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
    icon: "\u2591\u2592\u2593",
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
    <div className="flex flex-col min-h-dvh bg-black text-white">
      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <Link href="/" className="text-sm font-mono font-medium tracking-wide">
          <span className="text-white/40 mr-1">&gt;</span>
          skeehn
        </Link>
        <div className="flex items-center gap-6 text-xs text-white/50 font-mono">
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
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative flex items-center justify-center min-h-screen overflow-hidden">
        <DitherCanvas />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-10 border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-mono text-white/70">
            <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            v1.0 &mdash; Now available
          </div>

          {/* Title */}
          <h1 className="text-7xl md:text-8xl font-mono font-bold tracking-tighter text-white leading-none mb-6">
            skeehn
          </h1>
          <p className="text-3xl md:text-4xl font-mono font-light text-white/90 mb-4 leading-tight">
            Build AI interfaces that mean it.
          </p>
          <p className="text-lg text-white/50 max-w-xl mx-auto mb-16 leading-relaxed">
            32 components. 7 themes. Zero dependencies.
            <br />
            Every surface a canvas for ASCII texture.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center justify-center px-8 py-3 text-sm font-mono font-bold bg-white hover:bg-white/90 transition-colors"
              style={{ color: '#000' }}
            >
              Get Started &rarr;
            </Link>
            <Link
              href="/docs/components"
              className="inline-flex items-center justify-center px-8 py-3 text-sm font-mono font-medium border border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all"
            >
              Browse Components
            </Link>
            <a
              href="https://github.com/skeehn/skeehn"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-mono text-white/50 hover:text-white hover:underline underline-offset-4 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center p-6 border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <span className="text-4xl font-bold font-mono text-white mb-2">
                  {stat.value}
                </span>
                <span className="text-xs uppercase tracking-widest text-white/50">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-10"
          aria-hidden="true"
        />
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="relative py-32 md:py-40 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">
              Capabilities
            </p>
            <h2 className="text-4xl md:text-5xl font-mono font-bold text-white">
              Every pixel deliberate
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col p-8 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <span className="text-lg font-mono text-white/30 mb-4 group-hover:text-white/60 transition-colors">
                  {feature.icon}
                </span>
                <h3 className="text-base font-mono font-medium text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CODE PREVIEW ═══ */}
      <section className="py-32 md:py-40 px-6 bg-black">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">
              Developer Experience
            </p>
            <h2 className="text-4xl md:text-5xl font-mono font-bold text-white">
              Ship in minutes
            </h2>
            <p className="text-sm text-white/40 mt-4 max-w-md mx-auto leading-relaxed">
              Import the component. Wire up the hook. Done.
            </p>
          </div>

          <CodePreview />
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-16 px-6 border-t border-white/10 bg-black">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <p>
            Built by{" "}
            <span className="text-white font-mono font-medium">skeehn</span>.
            MIT License.
          </p>
          <div className="flex items-center gap-6 font-mono">
            <a
              href="https://github.com/skeehn/skeehn"
              className="hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/org/skeehn"
              className="hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              npm
            </a>
            <Link href="/docs" className="hover:text-white transition-colors">
              Docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
