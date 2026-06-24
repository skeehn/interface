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
      "15 purpose-built components for chat, streaming, reasoning traces, tool calls, and citations.",
    icon: ">_",
  },
  {
    title: "One Core, Many Skins",
    description:
      "A complete token contract. Swap ~30 variables and the same components become a different product.",
    icon: "[#]",
  },
  {
    title: "Copy-Paste Ownership",
    description:
      "Like shadcn — the CLI copies source into your project. You own every line. Zero lock-in.",
    icon: "cp/",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 border-b-2 border-foreground bg-background/90 backdrop-blur-md">
        <Link href="/" className="text-sm font-mono font-bold tracking-wide flex items-center gap-2">
          <span className="text-accent">&#9624;</span>
          skeehn
        </Link>
        <div className="flex items-center gap-6 text-xs uppercase tracking-[0.15em] text-muted-fg font-mono">
          <Link href="/docs" className="hover:text-accent transition-colors">Docs</Link>
          <Link href="/docs/components" className="hover:text-accent transition-colors">Components</Link>
          <a href="https://github.com/skeehn/skeehn" className="hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative flex items-center justify-center min-h-screen overflow-hidden border-b-2 border-foreground">
        <DitherCanvas />
        {/* Vignette: fade the dither so the hero content reads cleanly */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{ background: "radial-gradient(ellipse 85% 70% at 50% 42%, transparent 0%, hsl(var(--sk-background) / 0.5) 52%, hsl(var(--sk-background)) 100%)" }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
          <span className="sk-badge mb-10" data-variant="solid" style={{ background: "hsl(var(--sk-accent))", color: "hsl(var(--sk-accent-foreground))" }}>
            v1.0 &mdash; now on npm
          </span>

          <h1 className="font-mono font-extrabold tracking-tighter leading-none text-foreground" style={{ fontSize: "clamp(3.5rem, 17vw, 11rem)" }}>
            skeehn
          </h1>
          <p className="mt-4 text-2xl md:text-4xl font-mono font-light text-foreground/90 leading-tight">
            AI components that don&rsquo;t look<br />like every other chatbot.
          </p>
          <p className="mt-6 text-base md:text-lg text-muted-fg max-w-xl leading-relaxed">
            32 components. 7 themes. Zero dependencies. Every surface a canvas for ASCII texture.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-12 mb-16">
            <Link href="/docs/getting-started" className="sk-btn" data-variant="solid" data-size="lg">
              Get Started &rarr;
            </Link>
            <Link href="/docs/components" className="sk-btn" data-variant="outline" data-size="lg">
              Browse Components
            </Link>
          </div>

          {/* Stats — hard-bordered brutalist grid (gap shows the 2px rule) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-[2px] w-full max-w-2xl border-2 border-foreground bg-foreground">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center p-6 bg-background">
                <span className="text-4xl font-bold font-mono text-accent mb-1">{stat.value}</span>
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-fg">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="relative py-28 md:py-36 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4 font-mono">// Capabilities</p>
            <h2 className="font-mono font-extrabold tracking-tight text-foreground" style={{ fontSize: "clamp(2rem, 6vw, 3.75rem)" }}>
              Every pixel deliberate
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group flex flex-col p-7 border-2 border-foreground bg-surface transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:border-accent"
                style={{ boxShadow: "5px 5px 0 #1b1b1b" }}
              >
                <span className="text-xl font-mono text-accent mb-5">{feature.icon}</span>
                <h3 className="text-base font-mono font-bold uppercase tracking-wide text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-fg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CODE PREVIEW ═══ */}
      <section className="py-28 md:py-36 px-6 bg-background border-t-2 border-foreground">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4 font-mono">// Developer experience</p>
            <h2 className="font-mono font-extrabold tracking-tight text-foreground" style={{ fontSize: "clamp(2rem, 6vw, 3.75rem)" }}>
              Ship in minutes
            </h2>
            <p className="text-sm text-muted-fg mt-4 max-w-md leading-relaxed">
              Import the component. Wire the hook. Done. Or <code className="sk-code-inline">npx shadcn add</code> the source into your repo.
            </p>
          </div>
          <CodePreview />
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-12 px-6 border-t-2 border-foreground bg-background">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-fg font-mono">
          <p>
            Built by <span className="text-foreground font-bold">skeehn</span>. MIT License.
          </p>
          <div className="flex items-center gap-6 uppercase tracking-[0.15em] text-xs">
            <a href="https://github.com/skeehn/skeehn" className="hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.npmjs.com/org/skeehn" className="hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">npm</a>
            <Link href="/docs" className="hover:text-accent transition-colors">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
