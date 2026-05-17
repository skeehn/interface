import Link from "next/link";
import DitherCanvas from "@/components/DitherCanvas";
import { CodePreview } from "@/components/CodePreview";

/* ───────────────────────────────────────────────────────────────────
 * skeehn marketing home — editorial brutalist
 *
 * Reference bar: rauno.se, vercel.com/design, paco.me
 * Rules followed:
 *  - One dither moment (a single 480px square on the right of the hero)
 *  - Massive type anchored on the grid, never centered for vanity
 *  - Hairline 1px borders, zero shadows / glows
 *  - 8px rhythm (Tailwind defaults already match this)
 *  - 10px uppercase meta labels carry all the secondary info
 * ─────────────────────────────────────────────────────────────────── */

const META_LABEL =
  "font-mono text-[10px] uppercase tracking-[0.22em] text-white/45";

const SECTIONS = [
  {
    n: "01",
    title: "Engine",
    body: "GPU dithering on the entire viewport, on cards, on images, on video. Bayer · Floyd-Steinberg · Atkinson · Blue-noise · Halftone · Crosshatch. One drop-in component.",
  },
  {
    n: "02",
    title: "Components",
    body: "32 primitives, 14 of them AI-shaped: ChatBubble, ChatInput, ThinkingBlock, ToolCard, StreamingText, CodeBlock, AgentStatus, VoiceSession. Built for chat surfaces from day one.",
  },
  {
    n: "03",
    title: "Themes",
    body: "11 presets — default, dark, brutal, terminal, print, grain, mardi-gras, phosphor, amber, risograph, newsprint. Switch via a single data attribute. Authored in OKLCH where it matters.",
  },
  {
    n: "04",
    title: "Ownership",
    body: "Like shadcn: the CLI copies source into your project. No runtime dependency on skeehn. You read every line, you change every line.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-dvh bg-black text-white selection:bg-white selection:text-black">
      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-10 h-14 border-b border-white/10 bg-black/85 backdrop-blur-md">
        <Link
          href="/"
          className="font-mono text-sm font-medium tracking-tight flex items-center gap-2"
        >
          <span className="text-white/35">›</span>
          skeehn
        </Link>
        <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
          <Link href="/docs" className="hover:text-white transition-colors">
            Docs
          </Link>
          <Link
            href="/docs/components/button"
            className="hover:text-white transition-colors"
          >
            Components
          </Link>
          <Link
            href="/docs/themes"
            className="hover:text-white transition-colors"
          >
            Themes
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
      <section className="sk-hero">
        {/* Top meta strip */}
        <div className="flex items-baseline justify-between mb-10 lg:mb-16">
          <span className={META_LABEL}>v1.0 · 2026.05</span>
          <span className={`${META_LABEL} hidden md:inline`}>
            32 components · 11 themes · 0 deps
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left: monumental wordmark + tagline + CTAs */}
          <div className="lg:col-span-7 min-w-0 flex flex-col gap-10 lg:gap-14">
            <div className="min-w-0">
              <h1 className="sk-hero-mark font-mono font-medium text-white">
                skeehn
              </h1>
              <p className="mt-6 max-w-xl font-sans text-xl md:text-2xl lg:text-3xl text-white/85 leading-[1.2] tracking-tight">
                Build AI interfaces that mean it.
                <br />
                <span className="text-white/45">
                  Dither engine, 32 components, every theme yours.
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/docs/getting-started"
                className="group inline-flex items-center gap-3 h-11 px-5 font-mono text-sm font-medium border border-white transition-colors"
                style={{ background: "#fff", color: "#000" }}
              >
                <span>Get started</span>
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/docs/components/button"
                className="inline-flex items-center h-11 px-5 border border-white/20 hover:border-white text-white font-mono text-sm transition-colors"
              >
                Browse components
              </Link>
              <a
                href="https://github.com/skeehn/skeehn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center h-11 px-3 text-white/55 hover:text-white font-mono text-sm transition-colors"
              >
                GitHub →
              </a>
            </div>
          </div>

          {/* Right: single dither moment, framed with whitespace */}
          <div className="lg:col-span-5 lg:pl-8">
            <div className="border border-white/15">
              <div className="relative aspect-square overflow-hidden bg-black">
                <DitherCanvas />
                {/* Bottom-left caption inside the frame */}
                <div className="absolute inset-0 flex items-end justify-start p-5">
                  <div className="flex flex-col gap-1">
                    <span className={META_LABEL}>Fig.01 — Bayer 4×4</span>
                    <span className="font-mono text-sm text-white">
                      Every surface, a canvas.
                    </span>
                  </div>
                </div>
              </div>
              {/* Frame footer — gives it printed/specimen feel */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/15">
                <span className={META_LABEL}>DitherWebGL · 60fps</span>
                <Link
                  href="/docs/engine/dither-overlay"
                  className="font-mono text-[11px] text-white/65 hover:text-white"
                >
                  open playground →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom marginalia */}
        <div className="mt-16 lg:mt-20 flex items-baseline justify-between border-t border-white/10 pt-5">
          <span className={META_LABEL}>Scroll for sections</span>
          <span className={META_LABEL}>↓ 01–04</span>
        </div>
      </section>

      {/* ═══ NUMBERED SECTIONS — editorial intro ═══ */}
      <section className="px-6 lg:px-10 py-24 lg:py-40 border-t border-white/10">
        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          <div className="col-span-12 lg:col-span-4">
            <span className={META_LABEL}>What it is</span>
            <h2 className="mt-3 font-mono font-medium text-5xl md:text-6xl text-white leading-[0.95] tracking-tight">
              A library
              <br />
              that owns
              <br />
              its surface.
            </h2>
          </div>
          <ol className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
            {SECTIONS.map((s) => (
              <li key={s.n} className="flex flex-col gap-3">
                <span className={`${META_LABEL}`}>{s.n}</span>
                <h3 className="font-mono font-medium text-xl text-white">
                  {s.title}
                </h3>
                <p className="text-[15px] text-white/65 leading-relaxed">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══ INSTALL / CODE PREVIEW ═══ */}
      <section className="px-6 lg:px-10 py-24 lg:py-40 border-t border-white/10">
        <div className="grid grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="col-span-12 lg:col-span-5">
            <span className={META_LABEL}>Install</span>
            <h2 className="mt-3 font-mono font-medium text-5xl md:text-6xl text-white leading-[0.95] tracking-tight">
              One line.
              <br />
              You own
              <br />
              the source.
            </h2>
            <p className="mt-6 text-[15px] text-white/65 leading-relaxed max-w-md">
              The CLI copies the component into your project. No runtime
              package. Edit the source. Delete what you don&apos;t use.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 border border-white/20 px-4 py-3 font-mono text-sm">
              <span className="text-white/45">$</span>
              <span className="text-white">npx skeehn add chat-bubble</span>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-7">
            <CodePreview />
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 lg:px-10 py-12 border-t border-white/10">
        <div className="grid grid-cols-12 gap-8 items-baseline">
          <div className="col-span-12 md:col-span-6 font-mono text-[12px] text-white/50">
            <span className="text-white">skeehn</span> · MIT · built by
            humans &amp; agents
          </div>
          <div className="col-span-12 md:col-span-6 flex flex-wrap items-baseline gap-6 md:justify-end font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
            <a
              href="https://github.com/skeehn/skeehn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/org/skeehn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              npm
            </a>
            <Link href="/docs" className="hover:text-white transition-colors">
              Docs
            </Link>
            <Link
              href="/docs/themes"
              className="hover:text-white transition-colors"
            >
              Themes
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
